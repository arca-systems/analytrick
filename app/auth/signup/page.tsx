'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

// ─── Validação de senha ───────────────────────────────────────────────────────
function validatePassword(pw: string) {
  return {
    length:  pw.length >= 12,
    upper:   /[A-Z]/.test(pw),
    number:  /[0-9]/.test(pw),
    special: /[^A-Za-z0-9]/.test(pw),
  }
}
function passwordStrength(pw: string) {
  const score = Object.values(validatePassword(pw)).filter(Boolean).length
  if (score <= 1) return { score, color: '#ef4444' }
  if (score === 2) return { score, color: '#f97316' }
  if (score === 3) return { score, color: '#eab308' }
  return { score, color: '#07e6d4' }
}

// ─── Validação CPF ────────────────────────────────────────────────────────────
function isValidCPF(cpf: string) {
  const n = cpf.replace(/[^0-9]/g, '')
  if (n.length !== 11 || /^(\d)\1+$/.test(n)) return false
  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(n[i]) * (10 - i)
  let r = (sum * 10) % 11
  if (r === 10 || r === 11) r = 0
  if (r !== parseInt(n[9])) return false
  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(n[i]) * (11 - i)
  r = (sum * 10) % 11
  if (r === 10 || r === 11) r = 0
  return r === parseInt(n[10])
}

// ─── Validação CNPJ ───────────────────────────────────────────────────────────
function isValidCNPJ(cnpj: string) {
  const n = cnpj.replace(/[^0-9]/g, '')
  if (n.length !== 14 || /^(\d)\1+$/.test(n)) return false
  const calc = (s: string, w: number[]) => {
    let sum = 0
    for (let i = 0; i < w.length; i++) sum += parseInt(s[i]) * w[i]
    const r = sum % 11
    return r < 2 ? 0 : 11 - r
  }
  return (
    calc(n, [5,4,3,2,9,8,7,6,5,4,3,2]) === parseInt(n[12]) &&
    calc(n, [6,5,4,3,2,9,8,7,6,5,4,3,2]) === parseInt(n[13])
  )
}

// ─── Máscaras ─────────────────────────────────────────────────────────────────
function maskPhone(v: string) {
  const n = v.replace(/[^0-9]/g, '').slice(0, 11)
  if (n.length <= 2)  return `(${n}`
  if (n.length <= 7)  return `(${n.slice(0,2)}) ${n.slice(2)}`
  return `(${n.slice(0,2)}) ${n.slice(2,7)}-${n.slice(7)}`
}

function maskCPF(v: string) {
  const n = v.replace(/[^0-9]/g, '').slice(0,11)
  if (n.length <= 3) return n
  if (n.length <= 6) return `${n.slice(0,3)}.${n.slice(3)}`
  if (n.length <= 9) return `${n.slice(0,3)}.${n.slice(3,6)}.${n.slice(6)}`
  return `${n.slice(0,3)}.${n.slice(3,6)}.${n.slice(6,9)}-${n.slice(9)}`
}

function maskCNPJ(v: string) {
  const n = v.replace(/[^0-9]/g, '').slice(0,14)
  if (n.length <= 2)  return n
  if (n.length <= 5)  return `${n.slice(0,2)}.${n.slice(2)}`
  if (n.length <= 8)  return `${n.slice(0,2)}.${n.slice(2,5)}.${n.slice(5)}`
  if (n.length <= 12) return `${n.slice(0,2)}.${n.slice(2,5)}.${n.slice(5,8)}/${n.slice(8)}`
  return `${n.slice(0,2)}.${n.slice(2,5)}.${n.slice(5,8)}/${n.slice(8,12)}-${n.slice(12)}`
}

// ─── Features lado esquerdo ───────────────────────────────────────────────────
const FEATURES = [
  { icon: '📊', title: 'Análise de Anúncios',     desc: 'Monitore performance, preço e posicionamento dos seus anúncios nos marketplaces em tempo real.' },
  { icon: '🏷️', title: 'Pesquisa de Categorias',  desc: 'Descubra as melhores categorias com maior volume de vendas e menor concorrência.' },
  { icon: '📈', title: 'Tendências de Mercado',    desc: 'Identifique produtos em alta antes da concorrência e aproveite as oportunidades.' },
  { icon: '🏆', title: 'Análise de Marcas',        desc: 'Veja quais marcas dominam cada categoria e encontre oportunidades de posicionamento.' },
]

const BASE_PRICE = 97

// ─── Wrapper Suspense ─────────────────────────────────────────────────────────
export default function SignupPage() {
  return (
    <Suspense fallback={<div style={pageStyle}><div style={{ color: '#07e6d4' }}>Carregando...</div></div>}>
      <SignupLayout />
    </Suspense>
  )
}

// ─── Layout two-column ────────────────────────────────────────────────────────
function SignupLayout() {
  const [couponValid,    setCouponValid]    = useState<boolean | null>(null)
  const [couponDiscount, setCouponDiscount] = useState<number>(0)

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        {/* ── Coluna esquerda ── */}
        <div style={leftColStyle}>
          <div style={{ marginBottom: 40 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Analytrick" style={{ height: 36, objectFit: 'contain' }} />
          </div>

          <div style={{ marginBottom: 36 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#f0fffe', lineHeight: 1.25, margin: '0 0 12px' }}>
              Comece agora o seu{' '}
              <span style={{ color: '#07e6d4', textShadow: '0 0 20px rgba(7,230,212,.35)' }}>
                teste grátis
              </span>
            </h1>
            <p style={{ fontSize: 13, color: '#7aabab', lineHeight: 1.7, margin: 0 }}>
              Com o Analytrick você toma decisões mais inteligentes no ecommerce, com dados reais dos marketplaces.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{
                  width: 38, height: 38, minWidth: 38,
                  background: 'rgba(7,230,212,.08)', border: '1px solid rgba(7,230,212,.15)',
                  borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17,
                }}>
                  {f.icon}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#f0fffe', marginBottom: 3 }}>{f.title}</div>
                  <div style={{ fontSize: 12, color: '#7aabab', lineHeight: 1.6 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Bloco de preço */}
          <div style={{
            background: 'rgba(7,230,212,.06)', border: '1px solid rgba(7,230,212,.15)',
            borderRadius: 12, padding: '20px 24px', marginTop: 32,
          }}>
            <div style={{ fontSize: 11, color: '#4a8888', fontWeight: 600, letterSpacing: '.5px', marginBottom: 10 }}>
              APÓS OS 7 DIAS GRÁTIS
            </div>

            {couponValid && couponDiscount > 0 ? (
              <>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: '#07e6d4' }}>R$</span>
                  <span style={{ fontSize: 36, fontWeight: 800, color: '#07e6d4', lineHeight: 1 }}>
                    {(BASE_PRICE * (1 - couponDiscount / 100)).toFixed(2).replace('.', ',')}
                  </span>
                  <span style={{ fontSize: 12, color: '#4a8888' }}>/mês</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 11, color: '#7aabab', textDecoration: 'line-through' }}>R$ {BASE_PRICE},00</span>
                  <span style={{ fontSize: 10, background: 'rgba(7,230,212,.15)', color: '#07e6d4', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                    -{couponDiscount}% OFF
                  </span>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 10 }}>
                <span style={{ fontSize: 11, color: '#4a8888' }}>R$</span>
                <span style={{ fontSize: 36, fontWeight: 800, color: '#f0fffe', lineHeight: 1 }}>97</span>
                <span style={{ fontSize: 12, color: '#4a8888' }}>/mês</span>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {['Extensão para Chrome', 'Web App completo', 'Cancele quando quiser'].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#7aabab' }}>
                  <span style={{ color: '#07e6d4', fontSize: 10 }}>✓</span> {item}
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 'auto', paddingTop: 32, borderTop: '1px solid #0d2525' }}>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {['Sem cartão de crédito', '7 dias grátis', 'Cancele quando quiser'].map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#4a8888' }}>
                  <span style={{ color: '#07e6d4', fontSize: 10 }}>✓</span> {t}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Divisor ── */}
        <div style={{ width: 1, flexShrink: 0, background: 'linear-gradient(to bottom, transparent, #1e3a3a 20%, #1e3a3a 80%, transparent)' }} />

        {/* ── Coluna direita ── */}
        <div style={rightColStyle}>
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f0fffe', margin: '0 0 4px' }}>Crie sua conta</h2>
            <p style={{ fontSize: 12, color: '#4a8888', margin: 0 }}>
              Já tem conta?{' '}
              <Link href="/auth/login" style={{ color: '#07e6d4', textDecoration: 'none', fontWeight: 600 }}>Entrar</Link>
            </p>
          </div>
          <SignupForm onCouponChange={(valid, discount) => {
            setCouponValid(valid)
            setCouponDiscount(discount)
          }} />
        </div>
      </div>
      <Styles />
    </div>
  )
}

// ─── Formulário ───────────────────────────────────────────────────────────────
function SignupForm({ onCouponChange }: {
  onCouponChange: (valid: boolean | null, discount: number) => void
}) {
  const supabase     = createClient()
  const searchParams = useSearchParams()
  const afiliadoUrl  = searchParams.get('afiliado') ?? ''

  const [name,         setName]         = useState('')
  const [email,        setEmail]        = useState('')
  const [whatsapp,     setWhatsapp]     = useState('')
  const [cpf,          setCpf]          = useState('')
  const [cnpj,         setCnpj]         = useState('')
  const [password,     setPassword]     = useState('')
  const [confirm,      setConfirm]      = useState('')
  const [showPw,       setShowPw]       = useState(false)
  const [showConf,     setShowConf]     = useState(false)
  const [coupon,       setCoupon]       = useState('')
  const [afiliado,     setAfiliado]     = useState('')
  const [terms,        setTerms]        = useState(false)
  const [error,        setError]        = useState('')
  const [success,      setSuccess]      = useState(false)
  const [loading,      setLoading]      = useState(false)
  const [couponValid,  setCouponValid]  = useState<boolean | null>(null)
  const [couponDiscount, setCouponDiscount] = useState<number>(0)
  const [checkingCpn,  setCheckingCpn]  = useState(false)
  const [cnpjExists,   setCnpjExists]   = useState<boolean | null>(null)
  const [checkingCnpj, setCheckingCnpj] = useState(false)
  const [fromAffiliate, setFromAffiliate] = useState(false)

  // Carregar afiliado da URL
  useEffect(() => {
    if (!afiliadoUrl) return
    setAfiliado(afiliadoUrl.toUpperCase())
    setFromAffiliate(true)
    supabase
      .from('coupons')
      .select('code, discount_pct')
      .eq('affiliate_code', afiliadoUrl.toUpperCase())
      .eq('active', true)
      .single()
      .then(({ data }) => {
        if (data) {
          setCoupon(data.code)
          setCouponValid(true)
          const disc = Number(data.discount_pct) || 0
          setCouponDiscount(disc)
          onCouponChange(true, disc)
        }
      })
  }, [afiliadoUrl]) // eslint-disable-line

  // Validar cupom digitado
  const handleCouponChange = useCallback(async (val: string) => {
    setCoupon(val)
    if (!val) {
      setCouponValid(null)
      setCouponDiscount(0)
      setAfiliado('')
      onCouponChange(null, 0)
      return
    }
    setCheckingCpn(true)
    const { data, error } = await supabase
      .from('coupons')
      .select('code, active, affiliate_code, discount_pct')
      .eq('code', val.toUpperCase())
      .single()

    if (error || !data || !data.active) {
      setCouponValid(false)
      setCouponDiscount(0)
      setAfiliado('')
      onCouponChange(false, 0)
    } else {
      const disc = Number(data.discount_pct) || 0
      setCouponValid(true)
      setCouponDiscount(disc)
      setAfiliado(data.affiliate_code ?? '')
      onCouponChange(true, disc)
    }
    setCheckingCpn(false)
  }, [supabase, onCouponChange])

  // Debounce cupom
  const debounceRef = useCallback(
    (() => {
      let t: ReturnType<typeof setTimeout>
      return (val: string) => { clearTimeout(t); t = setTimeout(() => handleCouponChange(val), 600) }
    })(),
    [handleCouponChange]
  )

  const pwChecks = validatePassword(password)
  const pwAll    = Object.values(pwChecks).every(Boolean)
  const strength = passwordStrength(password)
  const cpfValid = cpf.replace(/[^0-9]/g,'').length === 11 ? isValidCPF(cpf) : null
  const cnpjValid = cnpj.replace(/[^0-9]/g,'').length === 14 ? isValidCNPJ(cnpj) : null

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (cpfValid === false)  { setError('CPF inválido. Verifique os dígitos.'); return }
    if (cpfValid === null)   { setError('Informe seu CPF.'); return }
    if (cnpj && cnpjValid === false) { setError('CNPJ inválido. Verifique os dígitos.'); return }
    if (!pwAll)              { setError('A senha não atende todos os requisitos.'); return }
    if (password !== confirm){ setError('As senhas não coincidem.'); return }
    if (!terms)              { setError('Você precisa aceitar os termos de uso.'); return }
    if (coupon && couponValid === false) { setError('Cupom inválido ou inativo.'); return }

    setLoading(true)
    const { error: err } = await supabase.auth.signUp({
      email, password,
      options: {
        data: {
          full_name:            name,
          whatsapp,
          tax_id:               cpf,
          company_registration: cnpj || null,
          afiliado:             afiliado || null,
          cupom:                coupon        || null,
          discount_pct:         couponDiscount || 0,
          final_price:          couponDiscount > 0 ? Number((BASE_PRICE * (1 - couponDiscount / 100)).toFixed(2)) : BASE_PRICE,
        },
      },
    })
    if (err) { setError(err.message); setLoading(false) }
    else setSuccess(true)
  }

  if (success) return (
    <div style={{ textAlign: 'center', padding: '20px 0' }}>
      <div style={{ fontSize: 44, marginBottom: 16 }}>📧</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#f0fffe', marginBottom: 8 }}>Confirme seu e-mail</div>
      <p style={{ fontSize: 12, color: '#4a8888', lineHeight: 1.7, marginBottom: 28 }}>
        Enviamos um link de ativação para <strong style={{ color: '#07e6d4' }}>{email}</strong>.
        <br />Clique no link para ativar sua conta.
      </p>
      <Link href="/auth/login" style={{
        display: 'block', background: 'linear-gradient(135deg,#07e6d4,#0891b2)',
        borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 700,
        padding: '12px', textAlign: 'center', textDecoration: 'none',
      }}>Ir para o login</Link>
    </div>
  )

  return (
    <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      <Field label="NOME COMPLETO">
        <Input value={name} onChange={setName} placeholder="Ex: João Silva" required />
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Field label="E-MAIL">
          <Input type="email" value={email} onChange={setEmail} placeholder="seu@email.com" required />
        </Field>
        <Field label="WHATSAPP">
          <Input type="tel" value={whatsapp} onChange={v => setWhatsapp(maskPhone(v))} placeholder="(00) 00000-0000" required />
        </Field>
      </div>

      {/* CPF obrigatório */}
      <Field label="CPF">
        <div style={{ position: 'relative' }}>
          <Input
            value={cpf} onChange={v => setCpf(maskCPF(v))}
            placeholder="000.000.000-00" required
            style={{
              paddingRight: 32,
              borderColor: cpfValid === true ? '#07e6d4' : cpfValid === false ? '#ef4444' : undefined,
            }}
          />
          {cpfValid === true  && <IcoStatus ok={true} />}
          {cpfValid === false && <IcoStatus ok={false} />}
        </div>
        {cpfValid === false && <p style={errTxt}>CPF inválido</p>}
      </Field>

      {/* CNPJ opcional */}
      <Field label="CNPJ (opcional)">
        <div style={{ position: 'relative' }}>
          <Input
            value={cnpj}
            onChange={v => {
              const masked = maskCNPJ(v)
              setCnpj(masked)
              const digits = masked.replace(/[^0-9]/g, '')
              if (digits.length === 14 && isValidCNPJ(masked)) {
                setCheckingCnpj(true)
                supabase.from('companies').select('company_registration')
                  .eq('company_registration', digits).single()
                  .then(({ data }) => { setCnpjExists(!!data); setCheckingCnpj(false) })
              } else { setCnpjExists(null) }
            }}
            placeholder="00.000.000/0001-00"
            style={{
              paddingRight: 32,
              borderColor: cnpjValid === true ? '#07e6d4' : cnpjValid === false ? '#ef4444' : undefined,
            }}
          />
          {checkingCnpj && <span style={iconPos}><span className="spin-sm" /></span>}
          {!checkingCnpj && cnpjValid === true  && <IcoStatus ok={true} />}
          {!checkingCnpj && cnpjValid === false && <IcoStatus ok={false} />}
        </div>
        {cnpjValid === false && <p style={errTxt}>CNPJ inválido</p>}
        {cnpjExists === true  && <p style={{ ...errTxt, color: '#07e6d4' }}>✓ Empresa já cadastrada — você será vinculado</p>}
        {cnpjExists === false && cnpjValid === true && <p style={{ ...errTxt, color: '#7aabab' }}>Nova empresa — será cadastrada automaticamente</p>}
        <p style={{ fontSize: 10, color: '#4a8888', margin: '6px 0 0', lineHeight: 1.5 }}>
          💡 Informar o CNPJ desbloqueia funcionalidades exclusivas para empresas
        </p>
      </Field>

      {/* Senha */}
      <Field label="SENHA (mín. 12 caracteres, maiúscula, número e especial)">
        <div style={{ position: 'relative' }}>
          <Input type={showPw ? 'text' : 'password'} value={password} onChange={setPassword}
            placeholder="Mínimo 12 caracteres" required style={{ paddingRight: 40 }} />
          <EyeBtn show={showPw} toggle={() => setShowPw(v => !v)} />
        </div>
        {password && (
          <div style={{ marginTop: 8 }}>
            <div style={{ display: 'flex', gap: 3, marginBottom: 6 }}>
              {[1,2,3,4].map(i => (
                <div key={i} style={{ flex: 1, height: 2.5, borderRadius: 2, background: i <= strength.score ? strength.color : '#0d2525', transition: 'background .3s' }} />
              ))}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 10px' }}>
              <Chk ok={pwChecks.length}  text="12+ caracteres" />
              <Chk ok={pwChecks.upper}   text="Letra maiúscula" />
              <Chk ok={pwChecks.number}  text="1 número" />
              <Chk ok={pwChecks.special} text="1 caractere especial" />
            </div>
          </div>
        )}
      </Field>

      {/* Confirmar senha */}
      <Field label="CONFIRMAR SENHA">
        <div style={{ position: 'relative' }}>
          <Input type={showConf ? 'text' : 'password'} value={confirm} onChange={setConfirm}
            placeholder="Repita a senha" required
            style={{ paddingRight: 40, borderColor: confirm && confirm !== password ? '#ef4444' : undefined }} />
          <EyeBtn show={showConf} toggle={() => setShowConf(v => !v)} />
        </div>
        {confirm && confirm !== password && <p style={errTxt}>As senhas não coincidem</p>}
      </Field>

      {/* Cupom + Afiliado */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Field label="CUPOM DE DESCONTO">
          <div style={{ position: 'relative' }}>
            <Input
              value={coupon}
              onChange={v => { setCoupon(v); debounceRef(v) }}
              placeholder="CUPOM123"
              disabled={fromAffiliate}
              style={{
                paddingRight: 32,
                borderColor: couponValid === true ? '#07e6d4' : couponValid === false ? '#ef4444' : undefined,
                opacity: fromAffiliate ? .5 : 1,
              }}
            />
            {checkingCpn && <span style={iconPos}><span className="spin-sm" /></span>}
            {!checkingCpn && couponValid === true  && <IcoStatus ok={true} />}
            {!checkingCpn && couponValid === false && coupon && <IcoStatus ok={false} />}
          </div>
          {couponValid === false && coupon && <p style={errTxt}>Cupom inválido</p>}
          {couponValid === true  && <p style={{ ...errTxt, color: '#07e6d4' }}>✓ Desconto aplicado!</p>}
        </Field>

        <Field label="CÓDIGO DE PARCEIRO">
          <Input value={afiliado} onChange={() => {}} placeholder="Automático"
            disabled style={{ opacity: afiliado ? 1 : .4 }} />
        </Field>
      </div>

      {/* Resumo desconto */}
      {couponValid === true && couponDiscount > 0 && (
        <div style={{
          background: 'rgba(7,230,212,.06)', border: '1px solid rgba(7,230,212,.2)',
          borderRadius: 8, padding: '12px 14px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: 10, color: '#4a8888', marginBottom: 2 }}>APÓS OS 7 DIAS GRÁTIS</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: '#07e6d4' }}>
                R$ {(BASE_PRICE * (1 - couponDiscount / 100)).toFixed(2).replace('.', ',')}
              </span>
              <span style={{ fontSize: 11, color: '#4a8888' }}>/mês</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: 11, color: '#7aabab', textDecoration: 'line-through' }}>R$ {BASE_PRICE},00</span>
            <div style={{ fontSize: 10, background: 'rgba(7,230,212,.15)', color: '#07e6d4', padding: '2px 8px', borderRadius: 4, fontWeight: 700, marginTop: 4 }}>
              -{couponDiscount}% OFF
            </div>
          </div>
        </div>
      )}

      {/* Termos */}
      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
        <div onClick={() => setTerms(v => !v)} style={{
          width: 17, height: 17, minWidth: 17,
          background: terms ? 'rgba(7,230,212,.2)' : 'transparent',
          border: `1.5px solid ${terms ? '#07e6d4' : '#1e3a3a'}`,
          borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginTop: 1, transition: 'all .2s',
        }}>
          {terms && <span style={{ color: '#07e6d4', fontSize: 10, lineHeight: 1 }}>✓</span>}
        </div>
        <span style={{ fontSize: 11, color: '#4a8888', lineHeight: 1.5 }}>
          Declaro ter lido e aceito os{' '}
          <a href="https://analytrick.com.br/termos" target="_blank" rel="noopener noreferrer"
            style={{ color: '#07e6d4', textDecoration: 'none' }}>
            termos e políticas de serviço
          </a>
        </span>
      </label>

      {error && (
        <div style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#fca5a5' }}>
          {error}
        </div>
      )}

      <button type="submit" disabled={loading} style={{
        background: 'linear-gradient(135deg,#07e6d4,#0891b2)',
        border: 'none', borderRadius: 8, color: '#fff',
        fontSize: 13, fontWeight: 700, padding: '13px',
        cursor: loading ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit', opacity: loading ? .7 : 1, marginTop: 2,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        transition: 'opacity .2s',
      }}>
        {loading && <span className="spinner" />}
        {loading ? 'Criando conta...' : 'Criar conta grátis'}
      </button>
    </form>
  )
}

// ─── Auxiliares ───────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#4a8888', marginBottom: 5, letterSpacing: '.6px' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

function Input({ value, onChange, type = 'text', placeholder, required, disabled, style }: {
  value: string; onChange: (v: string) => void
  type?: string; placeholder?: string; required?: boolean; disabled?: boolean
  style?: React.CSSProperties
}) {
  const [focused, setFocused] = useState(false)
  return (
    <input
      type={type} value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} required={required} disabled={disabled}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      style={{
        width: '100%', background: '#060d14',
        border: `1px solid ${focused ? '#07e6d4' : '#1e3a3a'}`,
        borderRadius: 8, color: '#f0fffe', fontSize: 13,
        padding: '9px 14px', fontFamily: 'inherit', outline: 'none',
        boxSizing: 'border-box', transition: 'border-color .2s',
        ...style,
      }}
    />
  )
}

function EyeBtn({ show, toggle }: { show: boolean; toggle: () => void }) {
  return (
    <button type="button" onClick={toggle} style={{
      position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)',
      background: 'none', border: 'none', cursor: 'pointer', color: '#4a8888', fontSize: 14, padding: 0,
    }}>
      {show ? '🙈' : '👁'}
    </button>
  )
}

function IcoStatus({ ok }: { ok: boolean }) {
  return (
    <span style={{ ...iconPos, color: ok ? '#07e6d4' : '#ef4444', fontSize: 12 }}>
      {ok ? '✓' : '✕'}
    </span>
  )
}

function Chk({ ok, text }: { ok: boolean; text: string }) {
  return (
    <span style={{ fontSize: 10, color: ok ? '#07e6d4' : '#1e3a3a', display: 'flex', alignItems: 'center', gap: 3 }}>
      <span style={{ fontSize: 9 }}>{ok ? '✓' : '○'}</span>{text}
    </span>
  )
}

function Styles() {
  return (
    <style>{`
      @keyframes spin { to { transform: rotate(360deg); } }
      .spinner { width:14px;height:14px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;display:inline-block; }
      .spin-sm  { width:11px;height:11px;border:1.5px solid rgba(7,230,212,.3);border-top-color:#07e6d4;border-radius:50%;animation:spin .7s linear infinite;display:inline-block; }
      input::placeholder { color: #2d5555; }
      input:disabled { cursor: not-allowed; }
      ::-webkit-scrollbar { width: 5px; }
      ::-webkit-scrollbar-thumb { background: #1e3a3a; border-radius: 3px; }
    `}</style>
  )
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const iconPos: React.CSSProperties = { position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }
const errTxt: React.CSSProperties  = { fontSize: 10, color: '#ef4444', margin: '4px 0 0' }

const pageStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, background: '#060d14',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontFamily: "'Inter', system-ui, sans-serif",
  padding: 16, overflowY: 'auto',
}

const containerStyle: React.CSSProperties = {
  display: 'flex', width: '100%', maxWidth: 960, minHeight: 580,
  background: '#0a0f1a', border: '1px solid #1e3a3a',
  borderRadius: 20, boxShadow: '0 16px 60px rgba(0,0,0,.8)', overflow: 'hidden',
}

const leftColStyle: React.CSSProperties = {
  flex: '1 1 0', padding: '48px 44px', display: 'flex', flexDirection: 'column',
  background: 'linear-gradient(160deg, #0a1520 0%, #060d14 100%)',
  borderRight: '1px solid #0d2525',
}

const rightColStyle: React.CSSProperties = {
  flex: '1 1 0', padding: '48px 44px', overflowY: 'auto',
}
