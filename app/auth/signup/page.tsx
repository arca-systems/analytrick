'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

// ─── Validação de senha ──────────────────────────────────────────────────────
function validatePassword(pw: string) {
  return {
    length:    pw.length >= 12,
    upper:     /[A-Z]/.test(pw),
    number:    /[0-9]/.test(pw),
    special:   /[^A-Za-z0-9]/.test(pw),
  }
}

function passwordStrength(pw: string): { score: number; label: string; color: string } {
  const v = validatePassword(pw)
  const score = Object.values(v).filter(Boolean).length
  if (score <= 1) return { score, label: 'Fraca',  color: '#ef4444' }
  if (score === 2) return { score, label: 'Razoável', color: '#f97316' }
  if (score === 3) return { score, label: 'Boa',    color: '#eab308' }
  return { score, label: 'Forte',  color: '#07e6d4' }
}

// ─── Verificar cupom no Supabase ─────────────────────────────────────────────
async function checkCoupon(supabase: ReturnType<typeof createClient>, code: string) {
  const { data, error } = await supabase
    .from('cupons')
    .select('codigo, ativo')
    .eq('codigo', code.toUpperCase())
    .single()
  if (error || !data) return false
  return data.ativo === true
}

// ─── Wrapper com Suspense (obrigatório pelo Next.js para useSearchParams) ─────
export default function SignupPage() {
  return (
    <Suspense fallback={<div style={page}><div style={card}><Logo /></div></div>}>
      <SignupForm />
    </Suspense>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────
function SignupForm() {
  const supabase      = createClient()
  const searchParams  = useSearchParams()

  // Afiliado e cupom vindos da URL (?afiliado=XXXX&cupom=YYYY)
  const afiliadoUrl   = searchParams.get('afiliado') ?? ''
  const cupomUrl      = searchParams.get('cupom') ?? ''

  const [name,        setName]        = useState('')
  const [email,       setEmail]       = useState('')
  const [whatsapp,    setWhatsapp]    = useState('')
  const [cnpjCpf,     setCnpjCpf]    = useState('')
  const [docType,     setDocType]     = useState<'CNPJ' | 'CPF'>('CNPJ')
  const [password,    setPassword]    = useState('')
  const [confirm,     setConfirm]     = useState('')
  const [showPw,      setShowPw]      = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [coupon,      setCoupon]      = useState(cupomUrl)
  const [afiliado,    setAfiliado]    = useState(afiliadoUrl)
  const [terms,       setTerms]       = useState(false)
  const [error,       setError]       = useState('')
  const [success,     setSuccess]     = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [couponValid, setCouponValid] = useState<boolean | null>(null)
  const [checkingCoupon, setCheckingCoupon] = useState(false)

  // Pré-preencher afiliado e cupom da URL e travar
  useEffect(() => {
    if (afiliadoUrl) setAfiliado(afiliadoUrl)
    if (cupomUrl)    setCoupon(cupomUrl)
  }, [afiliadoUrl, cupomUrl])

  // Validar cupom ao digitar (debounced)
  const validateCoupon = useCallback(async (val: string) => {
    if (!val) { setCouponValid(null); return }
    setCheckingCoupon(true)
    const ok = await checkCoupon(supabase, val)
    setCouponValid(ok)
    setCheckingCoupon(false)
  }, [supabase])

  useEffect(() => {
    if (cupomUrl) return // se veio da URL, não re-valida no onChange
    const t = setTimeout(() => validateCoupon(coupon), 600)
    return () => clearTimeout(t)
  }, [coupon, cupomUrl, validateCoupon])

  // Máscara simples WhatsApp
  function maskPhone(v: string) {
    const n = v.replace(/\D/g, '').slice(0, 11)
    if (n.length <= 2)  return `(${n}`
    if (n.length <= 7)  return `(${n.slice(0,2)}) ${n.slice(2)}`
    if (n.length <= 11) return `(${n.slice(0,2)}) ${n.slice(2,7)}-${n.slice(7)}`
    return v
  }

  // Máscara CNPJ / CPF
  function maskDoc(v: string, type: 'CNPJ' | 'CPF') {
    const n = v.replace(/\D/g, '')
    if (type === 'CPF') {
      const s = n.slice(0,11)
      if (s.length <= 3)  return s
      if (s.length <= 6)  return `${s.slice(0,3)}.${s.slice(3)}`
      if (s.length <= 9)  return `${s.slice(0,3)}.${s.slice(3,6)}.${s.slice(6)}`
      return `${s.slice(0,3)}.${s.slice(3,6)}.${s.slice(6,9)}-${s.slice(9)}`
    }
    const s = n.slice(0,14)
    if (s.length <= 2)  return s
    if (s.length <= 5)  return `${s.slice(0,2)}.${s.slice(2)}`
    if (s.length <= 8)  return `${s.slice(0,2)}.${s.slice(2,5)}.${s.slice(5)}`
    if (s.length <= 12) return `${s.slice(0,2)}.${s.slice(2,5)}.${s.slice(5,8)}/${s.slice(8)}`
    return `${s.slice(0,2)}.${s.slice(2,5)}.${s.slice(5,8)}/${s.slice(8,12)}-${s.slice(12)}`
  }

  const pwChecks  = validatePassword(password)
  const pwAll     = Object.values(pwChecks).every(Boolean)
  const strength  = passwordStrength(password)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!pwAll) { setError('A senha não atende todos os requisitos.'); return }
    if (password !== confirm) { setError('As senhas não coincidem.'); return }
    if (!terms) { setError('Você precisa aceitar os termos de uso.'); return }
    if (coupon && couponValid === false) { setError('Cupom inválido ou inativo.'); return }

    setLoading(true)
    const { error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name:   name,
          whatsapp:    whatsapp,
          cnpj_cpf:    cnpjCpf,
          doc_type:    docType,
          afiliado:    afiliado || null,
          cupom:       coupon   || null,
        },
      },
    })

    if (signupError) { setError(signupError.message); setLoading(false) }
    else setSuccess(true)
  }

  // ─── Estilos base ─────────────────────────────────────────────────────────
  const inp = (focused = false): React.CSSProperties => ({
    width: '100%',
    background: '#060d14',
    border: `1px solid ${focused ? '#07e6d4' : '#1e3a3a'}`,
    borderRadius: 8,
    color: '#f0fffe',
    fontSize: 13,
    padding: '10px 14px',
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color .2s',
  })

  const label: React.CSSProperties = {
    display: 'block',
    fontSize: 10,
    fontWeight: 700,
    color: '#4a8888',
    marginBottom: 6,
    letterSpacing: '.6px',
  }

  // ─── Tela de sucesso ──────────────────────────────────────────────────────
  if (success) return (
    <div style={page}>
      <div style={card}>
        <Logo />
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#f0fffe', marginBottom: 8 }}>
            Confirme seu e-mail
          </div>
          <p style={{ fontSize: 12, color: '#4a8888', lineHeight: 1.7, marginBottom: 28 }}>
            Enviamos um link de ativação para{' '}
            <strong style={{ color: '#07e6d4' }}>{email}</strong>.
            <br />Acesse seu e-mail e clique no link para ativar sua conta.
          </p>
          <Link href="/auth/login" style={{
            display: 'block',
            background: 'linear-gradient(135deg,#07e6d4,#0891b2)',
            borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 700,
            padding: '12px', textAlign: 'center', textDecoration: 'none',
          }}>
            Ir para o login
          </Link>
        </div>
      </div>
      <Style />
    </div>
  )

  // ─── Formulário ──────────────────────────────────────────────────────────
  return (
    <div style={page}>
      <div style={{ ...card, width: 480, maxHeight: '92vh', overflowY: 'auto' }}>
        <Logo subtitle="Criar conta" />

        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Nome */}
          <Field label="NOME COMPLETO / RAZÃO SOCIAL">
            <InputText
              value={name} onChange={setName}
              placeholder="Ex: João Silva ou Empresa XYZ Ltda"
              required
            />
          </Field>

          {/* Email + WhatsApp */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="E-MAIL">
              <InputText
                type="email" value={email} onChange={setEmail}
                placeholder="seu@email.com" required
              />
            </Field>
            <Field label="WHATSAPP">
              <InputText
                type="tel" value={whatsapp}
                onChange={v => setWhatsapp(maskPhone(v))}
                placeholder="(00) 00000-0000" required
              />
            </Field>
          </div>

          {/* CPF/CNPJ */}
          <Field label="DOCUMENTO">
            <div style={{ display: 'flex', gap: 8 }}>
              {(['CNPJ', 'CPF'] as const).map(t => (
                <button
                  key={t} type="button"
                  onClick={() => { setDocType(t); setCnpjCpf('') }}
                  style={{
                    background: docType === t ? 'rgba(7,230,212,.15)' : 'transparent',
                    border: `1px solid ${docType === t ? '#07e6d4' : '#1e3a3a'}`,
                    borderRadius: 6, color: docType === t ? '#07e6d4' : '#4a8888',
                    fontSize: 11, fontWeight: 700, padding: '8px 14px',
                    cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s',
                  }}
                >
                  {t}
                </button>
              ))}
              <InputText
                value={cnpjCpf}
                onChange={v => setCnpjCpf(maskDoc(v, docType))}
                placeholder={docType === 'CNPJ' ? '00.000.000/0001-00' : '000.000.000-00'}
                required
                style={{ flex: 1 }}
              />
            </div>
          </Field>

          {/* Senha */}
          <Field label="SENHA">
            <div style={{ position: 'relative' }}>
              <InputText
                type={showPw ? 'text' : 'password'}
                value={password} onChange={setPassword}
                placeholder="Mínimo 12 caracteres"
                required
                style={{ paddingRight: 40 }}
              />
              <EyeBtn show={showPw} toggle={() => setShowPw(v => !v)} />
            </div>
            {/* Barra de força */}
            {password && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} style={{
                      flex: 1, height: 3, borderRadius: 2,
                      background: i <= strength.score ? strength.color : '#1e3a3a',
                      transition: 'background .3s',
                    }} />
                  ))}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px' }}>
                  <Check ok={pwChecks.length}  text="12+ caracteres" />
                  <Check ok={pwChecks.upper}   text="Letra maiúscula" />
                  <Check ok={pwChecks.number}  text="Número" />
                  <Check ok={pwChecks.special} text="Caractere especial" />
                </div>
              </div>
            )}
          </Field>

          {/* Confirmar senha */}
          <Field label="CONFIRMAR SENHA">
            <div style={{ position: 'relative' }}>
              <InputText
                type={showConfirm ? 'text' : 'password'}
                value={confirm} onChange={setConfirm}
                placeholder="Repita a senha"
                required
                style={{
                  paddingRight: 40,
                  borderColor: confirm && confirm !== password ? '#ef4444' : undefined,
                }}
              />
              <EyeBtn show={showConfirm} toggle={() => setShowConfirm(v => !v)} />
            </div>
            {confirm && confirm !== password && (
              <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>As senhas não coincidem</p>
            )}
          </Field>

          {/* Cupom + Afiliado */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="CUPOM DE DESCONTO">
              <div style={{ position: 'relative' }}>
                <InputText
                  value={coupon}
                  onChange={setCoupon}
                  placeholder="CUPOM123"
                  disabled={!!cupomUrl}
                  style={{
                    paddingRight: 32,
                    borderColor: couponValid === false ? '#ef4444'
                               : couponValid === true  ? '#07e6d4'
                               : undefined,
                    opacity: cupomUrl ? .6 : 1,
                    cursor: cupomUrl ? 'not-allowed' : 'text',
                  }}
                />
                {checkingCoupon && (
                  <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12 }}>
                    <div className="spin-sm" />
                  </span>
                )}
                {!checkingCoupon && couponValid === true  && <StatusIcon ok={true} />}
                {!checkingCoupon && couponValid === false && coupon && <StatusIcon ok={false} />}
              </div>
              {couponValid === false && coupon && (
                <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>Cupom inválido</p>
              )}
              {couponValid === true && (
                <p style={{ fontSize: 11, color: '#07e6d4', marginTop: 4 }}>✓ Cupom válido!</p>
              )}
            </Field>

            <Field label="CÓDIGO DE PARCEIRO">
              <InputText
                value={afiliado}
                onChange={setAfiliado}
                placeholder="PARCEIRO"
                disabled={!!afiliadoUrl}
                style={{
                  opacity: afiliadoUrl ? .6 : 1,
                  cursor: afiliadoUrl ? 'not-allowed' : 'text',
                }}
              />
            </Field>
          </div>

          {/* Termos */}
          <label style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            cursor: 'pointer', userSelect: 'none',
          }}>
            <div
              onClick={() => setTerms(v => !v)}
              style={{
                width: 18, height: 18, minWidth: 18,
                background: terms ? 'rgba(7,230,212,.2)' : 'transparent',
                border: `1.5px solid ${terms ? '#07e6d4' : '#1e3a3a'}`,
                borderRadius: 4, display: 'flex', alignItems: 'center',
                justifyContent: 'center', marginTop: 1, transition: 'all .2s',
              }}
            >
              {terms && <span style={{ color: '#07e6d4', fontSize: 11, lineHeight: 1 }}>✓</span>}
            </div>
            <span style={{ fontSize: 12, color: '#4a8888', lineHeight: 1.5 }}>
              Declaro ter lido e aceito os{' '}
              <a
                href="https://analytrick.com.br/termos"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#07e6d4', textDecoration: 'none' }}
              >
                termos e políticas de serviço
              </a>
            </span>
          </label>

          {/* Erro */}
          {error && (
            <div style={{
              background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)',
              borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#fca5a5',
            }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit" disabled={loading}
            style={{
              background: 'linear-gradient(135deg,#07e6d4,#0891b2)',
              border: 'none', borderRadius: 8, color: '#fff',
              fontSize: 13, fontWeight: 700, padding: '13px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', opacity: loading ? .7 : 1, marginTop: 4,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'opacity .2s',
            }}
          >
            {loading && <div className="spinner" />}
            {loading ? 'Criando conta...' : 'Criar conta'}
          </button>

          <div style={{ textAlign: 'center', fontSize: 12, color: '#2d5555' }}>
            Já tem conta?{' '}
            <Link href="/auth/login" style={{ color: '#07e6d4', textDecoration: 'none', fontWeight: 600 }}>
              Entrar
            </Link>
          </div>
        </form>
      </div>
      <Style />
    </div>
  )
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function Logo({ subtitle = 'Criar conta' }: { subtitle?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28, flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="Analytrick" style={{ height: 38, width: 'auto', objectFit: 'contain' }} />
      <span style={{ fontSize: 11, color: '#2d5555', letterSpacing: '.8px', fontWeight: 600 }}>
        {subtitle.toUpperCase()}
      </span>
    </div>
  )
}

function Field({ label: lbl, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{
        display: 'block', fontSize: 10, fontWeight: 700,
        color: '#4a8888', marginBottom: 6, letterSpacing: '.6px',
      }}>
        {lbl}
      </label>
      {children}
    </div>
  )
}

function InputText({
  value, onChange, type = 'text', placeholder, required, disabled, style,
}: {
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  style?: React.CSSProperties
}) {
  const [focused, setFocused] = useState(false)
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width: '100%',
        background: '#060d14',
        border: `1px solid ${focused ? '#07e6d4' : '#1e3a3a'}`,
        borderRadius: 8,
        color: '#f0fffe',
        fontSize: 13,
        padding: '10px 14px',
        fontFamily: 'inherit',
        outline: 'none',
        boxSizing: 'border-box',
        transition: 'border-color .2s',
        ...style,
      }}
    />
  )
}

function EyeBtn({ show, toggle }: { show: boolean; toggle: () => void }) {
  return (
    <button
      type="button" onClick={toggle}
      style={{
        position: 'absolute', right: 12, top: '50%',
        transform: 'translateY(-50%)', background: 'none',
        border: 'none', cursor: 'pointer', color: '#4a8888',
        fontSize: 15, padding: 0,
      }}
    >
      {show ? '🙈' : '👁'}
    </button>
  )
}

function Check({ ok, text }: { ok: boolean; text: string }) {
  return (
    <span style={{ fontSize: 10, color: ok ? '#07e6d4' : '#2d5555', display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{ fontSize: 9 }}>{ok ? '✓' : '○'}</span> {text}
    </span>
  )
}

function StatusIcon({ ok }: { ok: boolean }) {
  return (
    <span style={{
      position: 'absolute', right: 10, top: '50%',
      transform: 'translateY(-50%)', fontSize: 13,
      color: ok ? '#07e6d4' : '#ef4444',
    }}>
      {ok ? '✓' : '✕'}
    </span>
  )
}

function Style() {
  return (
    <style>{`
      @keyframes spin { to { transform: rotate(360deg); } }
      .spinner {
        width: 14px; height: 14px;
        border: 2px solid rgba(255,255,255,.3);
        border-top-color: #fff;
        border-radius: 50%;
        animation: spin .7s linear infinite;
      }
      .spin-sm {
        width: 11px; height: 11px;
        border: 1.5px solid rgba(7,230,212,.3);
        border-top-color: #07e6d4;
        border-radius: 50%;
        animation: spin .7s linear infinite;
        display: inline-block;
      }
      ::-webkit-scrollbar { width: 5px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: #1e3a3a; border-radius: 3px; }
      input::placeholder { color: #2d5555; }
      input:disabled { cursor: not-allowed; }
    `}</style>
  )
}

// ─── Estilos de layout ────────────────────────────────────────────────────────
const page: React.CSSProperties = {
  position: 'fixed', inset: 0,
  background: '#060d14',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontFamily: "'Inter', system-ui, sans-serif",
  padding: '16px',
}

const card: React.CSSProperties = {
  background: '#0a0f1a',
  border: '1px solid #1e3a3a',
  borderRadius: 16,
  padding: '36px 40px',
  width: 480,
  boxShadow: '0 8px 40px rgba(0,0,0,.8)',
}
