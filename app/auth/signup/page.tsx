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

// ─── Validar cupom ────────────────────────────────────────────────────────────
async function checkCoupon(supabase: ReturnType<typeof createClient>, code: string) {
  const { data, error } = await supabase
    .from('cupons')
    .select('codigo, ativo')
    .eq('codigo', code.toUpperCase())
    .single()
  if (error || !data) return false
  return data.ativo === true
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
    icon: '🏭',
    title: 'Gestão de Fornecedores',
    desc: 'Organize sua cadeia de fornecedores e compare custos para maximizar sua margem.',
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

  const afiliadoUrl = searchParams.get('afiliado') ?? ''
  const cupomUrl    = searchParams.get('cupom')    ?? ''

  const [name,        setName]        = useState('')
  const [email,       setEmail]       = useState('')
  const [whatsapp,    setWhatsapp]    = useState('')
  const [cnpjCpf,     setCnpjCpf]    = useState('')
  const [docType,     setDocType]     = useState<'CNPJ' | 'CPF'>('CNPJ')
  const [password,    setPassword]    = useState('')
  const [confirm,     setConfirm]     = useState('')
  const [showPw,      setShowPw]      = useState(false)
  const [showConf,    setShowConf]    = useState(false)
  const [coupon,      setCoupon]      = useState(cupomUrl)
  const [afiliado,    setAfiliado]    = useState(afiliadoUrl)
  const [terms,       setTerms]       = useState(false)
  const [error,       setError]       = useState('')
  const [success,     setSuccess]     = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [couponValid, setCouponValid] = useState<boolean | null>(null)
  const [checkingCpn, setCheckingCpn] = useState(false)

  useEffect(() => {
    if (afiliadoUrl) setAfiliado(afiliadoUrl)
    if (cupomUrl)    setCoupon(cupomUrl)
  }, [afiliadoUrl, cupomUrl])

  const validateCoupon = useCallback(async (val: string) => {
    if (!val) { setCouponValid(null); return }
    setCheckingCpn(true)
    const ok = await checkCoupon(supabase, val)
    setCouponValid(ok)
    setCheckingCpn(false)
  }, [supabase])

  useEffect(() => {
    if (cupomUrl) return
    const t = setTimeout(() => validateCoupon(coupon), 600)
    return () => clearTimeout(t)
  }, [coupon, cupomUrl, validateCoupon])

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

  const pwChecks = validatePassword(password)
  const pwAll    = Object.values(pwChecks).every(Boolean)
  const strength = passwordStrength(password)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!pwAll)               { setError('A senha não atende todos os requisitos.'); return }
    if (password !== confirm) { setError('As senhas não coincidem.'); return }
    if (!terms)               { setError('Você precisa aceitar os termos de uso.'); return }
    if (coupon && couponValid === false) { setError('Cupom inválido ou inativo.'); return }
    setLoading(true)
    const { error: err } = await supabase.auth.signUp({
      email, password,
      options: {
        data: {
          full_name: name,
          whatsapp,
          cnpj_cpf:  cnpjCpf,
          doc_type:  docType,
          afiliado:  afiliado || null,
          cupom:     coupon   || null,
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

      <Field label="DOCUMENTO">
        <div style={{ display: 'flex', gap: 8 }}>
          {(['CNPJ', 'CPF'] as const).map(t => (
            <button key={t} type="button"
              onClick={() => { setDocType(t); setCnpjCpf('') }}
              style={{
                background: docType === t ? 'rgba(7,230,212,.15)' : 'transparent',
                border: `1px solid ${docType === t ? '#07e6d4' : '#1e3a3a'}`,
                borderRadius: 6, color: docType === t ? '#07e6d4' : '#4a8888',
                fontSize: 11, fontWeight: 700, padding: '9px 14px',
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s', whiteSpace: 'nowrap',
              }}
            >{t}</button>
          ))}
          <Input
            value={cnpjCpf}
            onChange={v => setCnpjCpf(maskDoc(v, docType))}
            placeholder={docType === 'CNPJ' ? '00.000.000/0001-00' : '000.000.000-00'}
            required style={{ flex: 1 }}
          />
        </div>
      </Field>

      <Field label="SENHA">
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
              <Chk ok={pwChecks.length}  text="12+ chars" />
              <Chk ok={pwChecks.upper}   text="Maiúscula" />
              <Chk ok={pwChecks.number}  text="Número" />
              <Chk ok={pwChecks.special} text="Especial" />
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
              value={coupon} onChange={setCoupon}
              placeholder="CUPOM123"
              disabled={!!cupomUrl}
              style={{
                paddingRight: 32,
                borderColor: couponValid === false ? '#ef4444' : couponValid === true ? '#07e6d4' : undefined,
                opacity: cupomUrl ? .5 : 1,
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
            value={afiliado} onChange={setAfiliado}
            placeholder="PARCEIRO"
            disabled={!!afiliadoUrl}
            style={{ opacity: afiliadoUrl ? .5 : 1 }}
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
