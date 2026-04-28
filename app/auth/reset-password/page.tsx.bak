'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const supabase = createClient()
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)

  // Supabase redireciona com token na URL — precisa esperar a sessão ser estabelecida
  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
  }, [])

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('As senhas não coincidem.'); return }
    if (password.length < 6) { setError('A senha precisa ter pelo menos 6 caracteres.'); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setError(error.message); setLoading(false) }
    else {
      setSuccess(true)
      setTimeout(() => router.push('/app'), 2000)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', background: '#0f172a', border: '1px solid #374151',
    borderRadius: 8, color: '#f9fafb', fontSize: 13, padding: '10px 14px',
    fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#111827',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <div style={{
        background: '#1f2937', border: '1px solid #374151',
        borderRadius: 16, padding: '36px 40px', width: 400,
        boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <div style={{
            background: '#ffe600', borderRadius: 8, width: 36, height: 36,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
          }}>📊</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#ffe600', letterSpacing: '.6px' }}>ANALYTRICK</div>
            <div style={{ fontSize: 10, color: '#6b7280' }}>Nova senha</div>
          </div>
        </div>

        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>✅</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#4ade80', marginBottom: 8 }}>
              Senha alterada com sucesso!
            </div>
            <div style={{ fontSize: 12, color: '#9ca3af' }}>
              Redirecionando...
            </div>
          </div>
        ) : !ready ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{
              width: 28, height: 28, border: '3px solid #374151',
              borderTopColor: '#3b82f6', borderRadius: '50%',
              animation: 'spin 0.7s linear infinite', margin: '0 auto 12px',
            }} />
            <div style={{ fontSize: 12, color: '#6b7280' }}>Verificando link...</div>
          </div>
        ) : (
          <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#9ca3af', marginBottom: 6 }}>
                NOVA SENHA
              </label>
              <input
                type="password" required value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                onBlur={e => e.target.style.borderColor = '#374151'}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#9ca3af', marginBottom: 6 }}>
                CONFIRMAR NOVA SENHA
              </label>
              <input
                type="password" required value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Repita a nova senha"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                onBlur={e => e.target.style.borderColor = '#374151'}
              />
            </div>

            {error && (
              <div style={{
                background: '#7f1d1d', border: '1px solid #991b1b',
                borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#fca5a5',
              }}>
                {error}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              style={{
                background: '#2563eb', border: 'none', borderRadius: 8,
                color: '#fff', fontSize: 13, fontWeight: 700, padding: '12px',
                cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                opacity: loading ? 0.7 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              {loading && (
                <div style={{
                  width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff', borderRadius: '50%',
                  animation: 'spin 0.7s linear infinite',
                }} />
              )}
              {loading ? 'Salvando...' : 'Salvar nova senha'}
            </button>
          </form>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
