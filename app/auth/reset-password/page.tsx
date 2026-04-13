'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

function checkPassword(pw: string) {
  return {
    length:   pw.length >= 8,
    upper:    /[A-Z]/.test(pw),
    number:   /[0-9]/.test(pw),
    special:  /[^A-Za-z0-9]/.test(pw),
  }
}

export default function ResetPasswordPage() {
  const supabase = createClient()
  const router   = useRouter()
  const [password,  setPassword]  = useState('')
  const [confirm,   setConfirm]   = useState('')
  const [showPw,    setShowPw]    = useState(false)
  const [showConf,  setShowConf]  = useState(false)
  const [error,     setError]     = useState('')
  const [success,   setSuccess]   = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [ready,     setReady]     = useState(false)
  const [initErr,   setInitErr]   = useState('')

  const checks = checkPassword(password)
  const isValid = Object.values(checks).every(Boolean)

  useEffect(() => {
    async function init() {
      const params = new URLSearchParams(window.location.search)
      const code   = params.get('code')

      if (code) {
        const { error: e } = await supabase.auth.exchangeCodeForSession(code)
        if (!e) { setReady(true); return }
        setInitErr('Link inválido ou expirado. Solicite um novo.')
        return
      }

      // Hash legado — #type=recovery
      if (window.location.hash.includes('type=recovery')) {
        const sub = supabase.auth.onAuthStateChange((event) => {
          if (event === 'PASSWORD_RECOVERY') {
            setReady(true)
            sub.data.subscription.unsubscribe()
          }
        })
        return
      }

      // Sessão já ativa
      const { data } = await supabase.auth.getSession()
      if (data.session) { setReady(true); return }

      setInitErr('Link inválido ou expirado. Solicite um novo.')
    }
    init()
  }, [])

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!isValid)           { setError('A senha não atende todos os requisitos.'); return }
    if (password !== confirm) { setError('As senhas não coincidem.'); return }
    setLoading(true)
    const { error: e } = await supabase.auth.updateUser({ password })
    if (e) { setError(e.message); setLoading(false) }
    else   { setSuccess(true); setTimeout(() => router.push('/'), 2500) }
  }

  const inp = (show: boolean): React.CSSProperties => ({
    flex: 1, background: '#0f172a', border: '1px solid #374151',
    borderRadius: 8, color: '#f9fafb', fontSize: 13, padding: '10px 14px',
    fontFamily: 'inherit', outline: 'none', width: '100%', boxSizing: 'border-box',
  })

  const Req = ({ ok, label }: { ok: boolean; label: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
      <span style={{ color: ok ? '#4ade80' : '#6b7280', fontSize: 13 }}>{ok ? '✓' : '○'}</span>
      <span style={{ color: ok ? '#4ade80' : '#6b7280' }}>{label}</span>
    </div>
  )

  const EyeBtn = ({ show, toggle }: { show: boolean; toggle: () => void }) => (
    <button type="button" onClick={toggle} style={{
      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
      background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280',
      fontSize: 16, padding: 0, lineHeight: 1,
    }} tabIndex={-1}>
      {show ? '🙈' : '👁'}
    </button>
  )

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 16, padding: '36px 40px', width: 420, boxShadow: '0 8px 40px rgba(0,0,0,0.6)' }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <div style={{ background: '#ffe600', borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📊</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#ffe600', letterSpacing: '.6px' }}>ANALYTRICK</div>
            <div style={{ fontSize: 10, color: '#6b7280' }}>Redefinir senha</div>
          </div>
        </div>

        {/* Sucesso */}
        {success && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>✅</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#4ade80', marginBottom: 8 }}>Senha alterada com sucesso!</div>
            <div style={{ fontSize: 12, color: '#9ca3af' }}>Redirecionando...</div>
          </div>
        )}

        {/* Erro de init (link inválido) */}
        {!success && !ready && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            {initErr ? (
              <>
                <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
                <div style={{ fontSize: 13, color: '#fca5a5', marginBottom: 16 }}>{initErr}</div>
                <a href="/auth/forgot-password" style={{ color: '#60a5fa', fontSize: 12, textDecoration: 'none', fontWeight: 600 }}>
                  Solicitar novo link →
                </a>
              </>
            ) : (
              <>
                <div style={{ width: 28, height: 28, border: '3px solid #374151', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 12px' }} />
                <div style={{ fontSize: 12, color: '#6b7280' }}>Verificando link...</div>
              </>
            )}
          </div>
        )}

        {/* Formulário */}
        {!success && ready && (
          <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Nova senha */}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#9ca3af', marginBottom: 6 }}>NOVA SENHA</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showPw ? 'text' : 'password'} required
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  style={{ ...inp(showPw), paddingRight: 40 }}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'}
                  onBlur={e  => e.target.style.borderColor = '#374151'}
                />
                <EyeBtn show={showPw} toggle={() => setShowPw(v => !v)} />
              </div>
            </div>

            {/* Requisitos */}
            {password.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, padding: '10px 12px', background: '#111827', borderRadius: 8 }}>
                <Req ok={checks.length}  label="Mínimo 8 caracteres" />
                <Req ok={checks.upper}   label="1 letra maiúscula" />
                <Req ok={checks.number}  label="1 número" />
                <Req ok={checks.special} label="1 caractere especial" />
              </div>
            )}

            {/* Confirmar senha */}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#9ca3af', marginBottom: 6 }}>CONFIRMAR NOVA SENHA</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showConf ? 'text' : 'password'} required
                  value={confirm} onChange={e => setConfirm(e.target.value)}
                  placeholder="Repita a nova senha"
                  style={{
                    ...inp(showConf), paddingRight: 40,
                    borderColor: confirm && confirm !== password ? '#ef4444' : '#374151',
                  }}
                  onFocus={e => e.target.style.borderColor = confirm !== password ? '#ef4444' : '#3b82f6'}
                  onBlur={e  => e.target.style.borderColor = confirm !== password ? '#ef4444' : '#374151'}
                />
                <EyeBtn show={showConf} toggle={() => setShowConf(v => !v)} />
              </div>
              {confirm && confirm !== password && (
                <div style={{ fontSize: 11, color: '#f87171', marginTop: 4 }}>As senhas não coincidem</div>
              )}
            </div>

            {error && (
              <div style={{ background: '#7f1d1d', border: '1px solid #991b1b', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#fca5a5' }}>{error}</div>
            )}

            <button type="submit" disabled={loading || !isValid || password !== confirm} style={{
              background: isValid && password === confirm ? '#2563eb' : '#374151',
              border: 'none', borderRadius: 8, color: '#fff', fontSize: 13,
              fontWeight: 700, padding: '12px', cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', opacity: loading ? 0.7 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'background .2s',
            }}>
              {loading && <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />}
              {loading ? 'Salvando...' : 'Salvar nova senha'}
            </button>
          </form>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
