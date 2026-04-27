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
  if (score <= 1) return { score, color: '#ef4444', label: 'Fraca' }
  if (score === 2) return { score, color: '#f97316', label: 'Razoável' }
  if (score === 3) return { score, color: '#eab308', label: 'Boa' }
  return { score, color: '#07e6d4', label: 'Forte' }
}

// ─── Validar cupom e retornar afiliado vinculado ─────────────────────────────
async function checkCoupon(
  supabase: ReturnType<typeof createClient>,
  code: string
): Promise<{ valid: boolean; affiliateCode: string | null }> {
  const { data, error } = await supabase
    .from('coupons')
    .select('code, active, affiliate_code')
    .eq('code', code.toUpperCase())
    .single()
  if (error || !data || !data.active) return { valid: false, affiliateCode: null }
  return { valid: true, affiliateCode: data.affiliate_code ?? null }
}

// ─── Buscar cupom do afiliado ─────────────────────────────────────────────────
async function fetchAffiliateCoupon(
  supabase: ReturnType<typeof createClient>,
  affiliateCode: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from('coupons')
    .select('code')
    .eq('affiliate_code', affiliateCode.toUpperCase())
    .eq('active', true)
    .single()
  if (error || !data) return null
  return data.code
}

// ─── Features lado esquerdo ───────────────────────────────────────────────────
const FEATURES = [
  {
    icon: '📊',
    title: 'Análise de Anúncios',
    desc: 'Monitore performance, preço e posicionamento dos seus anúncios no Mercado Livre em tempo real.',
  },
  {
    icon: '🏷️',
    title: 'Pesquisa de Categorias',
    desc: 'Descubra as melhores categorias com maior volume de vendas e menor concorrência.',
  },
  {
    icon: '📈',
    title: 'Tendências de Mercado',
    desc: 'Identifique produtos em alta antes da concorrência e aproveite as oportunidades.',
  },
  {
    icon: '🏆',
    title: 'Análise de Marcas',
    desc: 'Veja quais marcas dominam cada categoria e encontre oportunidades de posicionamento.',
  },
]

// ─── Wrapper Suspense ─────────────────────────────────────────────────────────
export default function SignupPage() {
  return (
    <Suspense fallback={
      <div style={pageStyle}>
        <div style={{ color: '#07e6d4', fontSize: 13 }}>Carregando...</div>
      </div>
    }>
      <SignupLayout />
    </Suspense>
  )
}

// ─── Layout two-column ────────────────────────────────────────────────────────
function SignupLayout() {
  return (
    <div style={pageStyle}>
      <div style={containerStyle}>

        {/* ── Coluna esquerda ── */}
        <div style={leftColStyle}>
          <div style={{ marginBottom: 40 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Analytrick" style={{ height: 36, width: 'auto', objectFit: 'contain' }} />
          </div>

          <div style={{ marginBottom: 36 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#f0fffe', lineHeight: 1.25, margin: '0 0 12px' }}>
              Comece agora o seu{' '}
              <span style={{ color: '#07e6d4', textShadow: '0 0 20px rgba(7,230,212,.35)' }}>
                teste grátis
              </span>
            </h1>
            <p style={{ fontSize: 13, color: '#4a8888', lineHeight: 1.7, margin: 0 }}>
              Com o Analytrick você toma decisões mais inteligentes no ecommerce, com dados reais do Mercado Livre.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{
                  width: 38, height: 38, minWidth: 38,
                  background: 'rgba(7,230,212,.08)',
                  border: '1px solid rgba(7,230,212,.15)',
                  borderRadius: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 17,
                }}>
                  {f.icon}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#f0fffe', marginBottom: 3 }}>{f.title}</div>
                  <div style={{ fontSize: 12, color: '#2d5555', lineHeight: 1.6 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 'auto', paddingTop: 40, borderTop: '1px solid #0d2525' }}>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {['Sem cartão de crédito', '30 dias grátis', 'Cancele quando quiser'].map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#2d5555' }}>
                  <span style={{ color: '#07e6d4', fontSize: 10 }}>✓</span> {t}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Divisor ── */}
        <div style={{
          width: 1, flexShrink: 0,
          background: 'linear-gradient(to bottom, transparent, #1e3a3a 20%, #1e3a3a 80%, transparent)',
        }} />

        {/* ── Coluna direita ── */}
        <div style={rightColStyle}>
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f0fffe', margin: '0 0 4px' }}>
              Crie sua conta
            </h2>
            <p style={{ fontSize: 12, color: '#2d5555', margin: 0 }}>
              Já tem conta?{' '}
              <Link href="/auth/login" style={{ color: '#07e6d4', textDecoration: 'none', fontWeight: 600 }}>
                Entrar
              </Link>
            </p>
          </div>
          <SignupForm />
        </div>
      </div>
      <Styles />
    </div>
  )
}

// ─── Formulário ───────────────────────────────────────────────────────────────
function SignupForm() {
  const supabase     = createClient()
  const searchParams = useSearchParams()

  // ?afiliado=PARTNER01 — único parâmetro de URL possível
  const afiliadoUrl = searchParams.get('afiliado') ?? ''

  const [name,         setName]         = useState('')
  const [email,        setEmail]        = useState('')
  const [whatsapp,     setWhatsapp]     = useState('')
  const [cnpjCpf,      setCnpjCpf]     = useState('')   // CNPJ se PJ, CPF se PF
  const [cpf,          setCpf]          = useState('')   // CPF adicional quando PJ
  const [docType,      setDocType]      = useState<'PJ' | 'PF'>('PJ')
  const [companyRole,  setCompanyRole]  = useState<'admin' | 'employee' | 'contractor' | ''>('')
  const [checkingCnpj, setCheckingCnpj] = useState(false)
  const [cnpjExists,   setCnpjExists]   = useState<boolean | null>(null)
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
  const [checkingCpn,  setCheckingCpn]  = useState(false)
  // fromAffiliate = veio via ?afiliado= na URL (trava cupom e afiliado)
  const [fromAffiliate, setFromAffiliate] = useState(false)

  // Cenário 1: veio com ?afiliado= na URL
  // → preenche afiliado, busca cupom do afiliado no banco e trava tudo
  useEffect(() => {
    if (!afiliadoUrl) return
    setAfiliado(afiliadoUrl.toUpperCase())
    setFromAffiliate(true)
    fetchAffiliateCoupon(supabase, afiliadoUrl).then(code => {
      if (code) { setCoupon(code); setCouponValid(true) }
    })
  }, [afiliadoUrl, supabase])

  // Cenário 2: pessoa digita cupom manualmente
  // → valida no banco e preenche afiliado automaticamente
  const handleCouponChange = useCallback(async (val: string) => {
    setCoupon(val)
    if (!val) { setCouponValid(null); setAfiliado(''); return }
    setCheckingCpn(true)
    const result = await checkCoupon(supabase, val)
    setCouponValid(result.valid)
    setAfiliado(result.affiliateCode ?? '')
    setCheckingCpn(false)
  }, [supabase])

  // Debounce na digitação do cupom
  const couponDebounceRef = useCallback(
    (() => {
      let t: ReturnType<typeof setTimeout>
      return (val: string) => {
        clearTimeout(t)
        t = setTimeout(() => handleCouponChange(val), 600)
      }
    })(),
    [handleCouponChange]
  )

  function maskPhone(v: string) {
    const n = v.replace(/\D/g, '').slice(0, 11)
    if (n.length <= 2)  return `(${n}`
    if (n.length <= 7)  return `(${n.slice(0,2)}) ${n.slice(2)}`
    return `(${n.slice(0,2)}) ${n.slice(2,7)}-${n.slice(7)}`
  }

  function maskDoc(v: string, type: 'CNPJ' | 'CPF') {
    const n = v.replace(/\D/g, '')
    if (type === 'CPF') {
      const s = n.slice(0,11)
      if (s.length <= 3) return s
      if (s.length <= 6) return `${s.slice(0,3)}.${s.slice(3)}`
      if (s.length <= 9) return `${s.slice(0,3)}.${s.slice(3,6)}.${s.slice(6)}`
      return `${s.slice(0,3)}.${s.slice(3,6)}.${s.slice(6,9)}-${s.slice(9)}`
    }
    const s = n.slice(0,14)
    if (s.length <= 2)  return s
    if (s.length <= 5)  return `${s.slice(0,2)}.${s.slice(2)}`
    if (s.length <= 8)  return `${s.slice(0,2)}.${s.slice(2,5)}.${s.slice(5)}`
    if (s.length <= 12) return `${s.slice(0,2)}.${s.slice(2,5)}.${s.slice(5,8)}/${s.slice(8)}`
    return `${s.slice(0,2)}.${s.slice(2,5)}.${s.slice(5,8)}/${s.slice(8,12)}-${s.slice(12)}`
  }

  function isValidCPF(cpf: string) {
    const n = cpf.replace(/\D/g, '')
    if (n.length !== 11 || /^(\d)+$/.test(n)) return false
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

  function isValidCNPJ(cnpj: string) {
    const n = cnpj.replace(/\D/g, '')
    if (n.length !== 14 || /^(\d)+$/.test(n)) return false
    const calc = (s: string, w: number[]) => {
      let sum = 0
      for (let i = 0; i < w.length; i++) sum += parseInt(s[i]) * w[i]
      const r = sum % 11
      return r < 2 ? 0 : 11 - r
    }
    const w1 = [5,4,3,2,9,8,7,6,5,4,3,2]
    const w2 = [6,5,4,3,2,9,8,7,6,5,4,3,2]
    return calc(n, w1) === parseInt(n[12]) && calc(n, w2) === parseInt(n[13])
  }

  function isDocValid() {
    if (!cnpjCpf) return null
    const n = cnpjCpf.replace(/[^0-9]/g, '')
    if (docType === 'PF'  && n.length === 11) return isValidCPF(cnpjCpf)
    if (docType === 'PJ'  && n.length === 14) return isValidCNPJ(cnpjCpf)
    return null // ainda digitando
  }

  const docValid = isDocValid()

  const pwChecks = validatePassword(password)
  const pwAll    = Object.values(pwChecks).every(Boolean)
  const strength = passwordStrength(password)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (docType === 'PF' && docValid === false) { setError('CPF inválido. Verifique os dígitos.'); return }
    if (docType === 'PJ' && docValid === false) { setError('CNPJ inválido. Verifique os dígitos.'); return }
    if (docType === 'PJ' && !isValidCPF(cpf))  { setError('CPF inválido. Verifique os dígitos.'); return }
    if (docType === 'PJ' && !companyRole)       { setError('Selecione sua função na empresa.'); return }
    if (!pwAll)               { setError('A senha não atende todos os requisitos.'); return }
    if (password !== confirm) { setError('As senhas não coincidem.'); return }
    if (!terms)               { setError('Você precisa aceitar os termos de uso.'); return }
    if (coupon && couponValid === false) { setError('Cupom inválido ou inativo.'); return }
    setLoading(true)
    const { error: err } = await supabase.auth.signUp({
      email, password,
      options: {
        data: {
          full_name:            name,
          whatsapp,
          tax_id:               docType === 'PF' ? cnpjCpf : cpf,
          company_registration: docType === 'PJ' ? cnpjCpf : null,
          company_role:         docType === 'PJ' ? companyRole : null,
          afiliado:             afiliado || null,
          cupom:                coupon   || null,
        },
      },
    })
    if (err) { setError(err.message); setLoading(false) }
    else setSuccess(true)
  }

  if (success) return (
    <div style={{ textAlign: 'center', padding: '20px 0' }}>
      <div style={{ fontSize: 44, marginBottom: 16 }}>📧</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#f0fffe', marginBottom: 8 }}>
        Confirme seu e-mail
      </div>
      <p style={{ fontSize: 12, color: '#4a8888', lineHeight: 1.7, marginBottom: 28 }}>
        Enviamos um link de ativação para{' '}
        <strong style={{ color: '#07e6d4' }}>{email}</strong>.
        <br />Clique no link para ativar sua conta.
      </p>
      <Link href="/auth/login" style={{
        display: 'block', background: 'linear-gradient(135deg,#07e6d4,#0891b2)',
        borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 700,
        padding: '12px', textAlign: 'center', textDecoration: 'none',
      }}>
        Ir para o login
      </Link>
    </div>
  )

  return (
    <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      <Field label="NOME COMPLETO / RAZÃO SOCIAL">
        <Input value={name} onChange={setName} placeholder="Ex: João Silva ou Empresa XYZ Ltda" required />
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Field label="E-MAIL">
          <Input type="email" value={email} onChange={setEmail} placeholder="seu@email.com" required />
        </Field>
        <Field label="WHATSAPP">
          <Input type="tel" value={whatsapp} onChange={v => setWhatsapp(maskPhone(v))} placeholder="(00) 00000-0000" required />
        </Field>
      </div>

      {/* Tipo de pessoa */}
      <Field label="TIPO DE CADASTRO">
        <div style={{ display: 'flex', gap: 8 }}>
          {([['PJ', 'Pessoa Jurídica'], ['PF', 'Pessoa Física']] as const).map(([val, label]) => (
            <button key={val} type="button"
              onClick={() => { setDocType(val); setCnpjCpf(''); setCpf(''); setCompanyRole(''); setCnpjExists(null) }}
              style={{
                flex: 1,
                background: docType === val ? 'rgba(7,230,212,.15)' : 'transparent',
                border: `1px solid ${docType === val ? '#07e6d4' : '#1e3a3a'}`,
                borderRadius: 6, color: docType === val ? '#07e6d4' : '#4a8888',
                fontSize: 11, fontWeight: 700, padding: '9px 14px',
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s',
              }}
            >{label}</button>
          ))}
        </div>
      </Field>

      {/* CNPJ — só para PJ */}
      {docType === 'PJ' && (
        <Field label="CNPJ">
          <div style={{ position: 'relative' }}>
            <Input
              value={cnpjCpf}
              onChange={v => {
                const masked = maskDoc(v, 'CNPJ')
                setCnpjCpf(masked)
                const digits = masked.replace(/\D/g, '')
                if (digits.length === 14) {
                  if (!isValidCNPJ(masked)) { setCnpjExists(null); return }
                  setCheckingCnpj(true)
                  supabase.from('companies').select('company_registration')
                    .eq('company_registration', digits).single()
                    .then(({ data }) => { setCnpjExists(!!data); setCheckingCnpj(false) })
                } else { setCnpjExists(null) }
              }}
              placeholder="00.000.000/0001-00"
              required
              style={{
                paddingRight: 32,
                borderColor: docValid === false ? '#ef4444' : docValid === true ? '#07e6d4' : undefined,
              }}
            />
            {checkingCnpj && <span style={iconPos}><span className="spin-sm" /></span>}
            {!checkingCnpj && docValid === true  && <span style={{ ...iconPos, color: '#07e6d4', fontSize: 12 }}>✓</span>}
            {!checkingCnpj && docValid === false && cnpjCpf && <span style={{ ...iconPos, color: '#ef4444', fontSize: 12 }}>✕</span>}
          </div>
          {docValid === false && cnpjCpf && <p style={{ fontSize: 10, color: '#ef4444', margin: '4px 0 0' }}>CNPJ inválido</p>}
          {cnpjExists === true  && <p style={{ fontSize: 10, color: '#07e6d4', margin: '4px 0 0' }}>✓ Empresa já cadastrada — você será vinculado</p>}
          {cnpjExists === false && docValid === true && <p style={{ fontSize: 10, color: '#4a8888', margin: '4px 0 0' }}>Nova empresa — será cadastrada automaticamente</p>}
        </Field>
      )}

      {/* CPF — para PF e também para PJ (sócio precisa informar CPF) */}
      <Field label={docType === 'PJ' ? 'SEU CPF' : 'CPF'}>
        <div style={{ position: 'relative' }}>
          <Input
            value={docType === 'PJ' ? cpf : cnpjCpf}
            onChange={v => docType === 'PJ' ? setCpf(maskDoc(v, 'CPF')) : setCnpjCpf(maskDoc(v, 'CPF'))}
            placeholder="000.000.000-00"
            required
            style={{
              paddingRight: 32,
              borderColor: docType === 'PF' && docValid === false ? '#ef4444'
                         : docType === 'PF' && docValid === true  ? '#07e6d4'
                         : docType === 'PJ' && cpf.replace(/\D/g,'').length === 11 && !isValidCPF(cpf) ? '#ef4444'
                         : docType === 'PJ' && isValidCPF(cpf) ? '#07e6d4'
                         : undefined,
            }}
          />
          {docType === 'PF' && docValid === true  && <span style={{ ...iconPos, color: '#07e6d4', fontSize: 12 }}>✓</span>}
          {docType === 'PF' && docValid === false && cnpjCpf && <span style={{ ...iconPos, color: '#ef4444', fontSize: 12 }}>✕</span>}
          {docType === 'PJ' && isValidCPF(cpf)   && <span style={{ ...iconPos, color: '#07e6d4', fontSize: 12 }}>✓</span>}
          {docType === 'PJ' && cpf.replace(/\D/g,'').length === 11 && !isValidCPF(cpf) && <span style={{ ...iconPos, color: '#ef4444', fontSize: 12 }}>✕</span>}
        </div>
        {docType === 'PF' && docValid === false && cnpjCpf && <p style={{ fontSize: 10, color: '#ef4444', margin: '4px 0 0' }}>CPF inválido</p>}
      </Field>

      {/* Função na empresa — só para PJ */}
      {docType === 'PJ' && (
        <Field label="FUNÇÃO NA EMPRESA">
          <div style={{ display: 'flex', gap: 8 }}>
            {([['admin', 'Sócio / Admin'], ['employee', 'Colaborador'], ['contractor', 'Consultor / Prestador']] as const).map(([val, label]) => (
              <button key={val} type="button"
                onClick={() => setCompanyRole(val)}
                style={{
                  flex: 1,
                  background: companyRole === val ? 'rgba(7,230,212,.15)' : 'transparent',
                  border: `1px solid ${companyRole === val ? '#07e6d4' : '#1e3a3a'}`,
                  borderRadius: 6, color: companyRole === val ? '#07e6d4' : '#4a8888',
                  fontSize: 10, fontWeight: 700, padding: '8px 6px',
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s', textAlign: 'center',
                }}
              >{label}</button>
            ))}
          </div>
        </Field>
      )}

      <Field label="SENHA (mín. 12 caracteres, maiúscula, número e especial)">
        <div style={{ position: 'relative' }}>
          <Input
            type={showPw ? 'text' : 'password'}
            value={password} onChange={setPassword}
            placeholder="Mínimo 12 caracteres" required
            style={{ paddingRight: 40 }}
          />
          <EyeBtn show={showPw} toggle={() => setShowPw(v => !v)} />
        </div>
        {password && (
          <div style={{ marginTop: 8 }}>
            <div style={{ display: 'flex', gap: 3, marginBottom: 6 }}>
              {[1,2,3,4].map(i => (
                <div key={i} style={{
                  flex: 1, height: 2.5, borderRadius: 2,
                  background: i <= strength.score ? strength.color : '#0d2525',
                  transition: 'background .3s',
                }} />
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

      <Field label="CONFIRMAR SENHA">
        <div style={{ position: 'relative' }}>
          <Input
            type={showConf ? 'text' : 'password'}
            value={confirm} onChange={setConfirm}
            placeholder="Repita a senha" required
            style={{
              paddingRight: 40,
              borderColor: confirm && confirm !== password ? '#ef4444' : undefined,
            }}
          />
          <EyeBtn show={showConf} toggle={() => setShowConf(v => !v)} />
        </div>
        {confirm && confirm !== password && (
          <p style={{ fontSize: 10, color: '#ef4444', margin: '4px 0 0' }}>As senhas não coincidem</p>
        )}
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Field label="CUPOM DE DESCONTO">
          <div style={{ position: 'relative' }}>
            <Input
              value={coupon}
              onChange={v => { setCoupon(v); couponDebounceRef(v) }}
              placeholder="CUPOM123"
              disabled={fromAffiliate}
              style={{
                paddingRight: 32,
                borderColor: couponValid === false ? '#ef4444' : couponValid === true ? '#07e6d4' : undefined,
                opacity: fromAffiliate ? .5 : 1,
              }}
            />
            {checkingCpn && <span style={iconPos}><span className="spin-sm" /></span>}
            {!checkingCpn && couponValid === true  && <span style={{ ...iconPos, color: '#07e6d4', fontSize: 12 }}>✓</span>}
            {!checkingCpn && couponValid === false && coupon && <span style={{ ...iconPos, color: '#ef4444', fontSize: 12 }}>✕</span>}
          </div>
          {couponValid === false && coupon && <p style={{ fontSize: 10, color: '#ef4444', margin: '4px 0 0' }}>Cupom inválido</p>}
          {couponValid === true  && <p style={{ fontSize: 10, color: '#07e6d4', margin: '4px 0 0' }}>✓ Cupom válido!</p>}
        </Field>

        <Field label="CÓDIGO DE PARCEIRO">
          <Input
            value={afiliado} onChange={() => {}}
            placeholder="Preenchido automaticamente"
            disabled={true}
            style={{ opacity: afiliado ? 1 : .4, cursor: 'not-allowed' }}
          />
        </Field>
      </div>

      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
        <div
          onClick={() => setTerms(v => !v)}
          style={{
            width: 17, height: 17, minWidth: 17,
            background: terms ? 'rgba(7,230,212,.2)' : 'transparent',
            border: `1.5px solid ${terms ? '#07e6d4' : '#1e3a3a'}`,
            borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginTop: 1, transition: 'all .2s',
          }}
        >
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
        <div style={{
          background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)',
          borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#fca5a5',
        }}>
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
        {loading ? 'Criando conta...' : 'Criar conta'}
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
      input::placeholder { color: #1e3a3a; }
      input:disabled { cursor: not-allowed; }
      ::-webkit-scrollbar { width: 5px; }
      ::-webkit-scrollbar-thumb { background: #1e3a3a; border-radius: 3px; }
      @media (max-width: 800px) {
        .signup-left     { display: none !important; }
        .signup-divider  { display: none !important; }
        .signup-right    { padding: 32px 24px !important; }
      }
    `}</style>
  )
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const iconPos: React.CSSProperties = {
  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
}

const pageStyle: React.CSSProperties = {
  position: 'fixed', inset: 0,
  background: '#060d14',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontFamily: "'Inter', system-ui, sans-serif",
  padding: 16, overflowY: 'auto',
}

const containerStyle: React.CSSProperties = {
  display: 'flex',
  width: '100%',
  maxWidth: 960,
  minHeight: 580,
  background: '#0a0f1a',
  border: '1px solid #1e3a3a',
  borderRadius: 20,
  boxShadow: '0 16px 60px rgba(0,0,0,.8)',
  overflow: 'hidden',
}

const leftColStyle: React.CSSProperties = {
  flex: '1 1 0',
  padding: '48px 44px',
  display: 'flex',
  flexDirection: 'column',
  background: 'linear-gradient(160deg, #0a1520 0%, #060d14 100%)',
  borderRight: '1px solid #0d2525',
}

const rightColStyle: React.CSSProperties = {
  flex: '1 1 0',
  padding: '48px 44px',
  overflowY: 'auto',
}
