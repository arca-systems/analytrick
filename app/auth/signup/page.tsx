'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function SignupPage() {
  const supabase = createClient()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('As senhas não coincidem.'); return }
    if (password.length < 6) { setError('A senha precisa ter pelo menos 6 caracteres.'); return }
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })
    if (error) { setError(error.message); setLoading(false) }
    else setSuccess(true)
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
            <div style={{ fontSize: 10, color: '#6b7280' }}>Criar conta</div>
          </div>
        </div>

        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📧</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#f9fafb', marginBottom: 8 }}>
              Confirme seu e-mail
            </div>
            <div style={{ fontSize: 12, color: '#9ca3af', lineHeight: 1.6, marginBottom: 24 }}>
              Enviamos um link de confirmação para <strong style={{ color: '#f9fafb' }}>{email}</strong>.
              Acesse seu e-mail e clique no link para ativar sua conta.
            </div>
            <Link href="/auth/login" style={{
              display: 'block', background: '#2563eb', borderRadius: 8,
              color: '#fff', fontSize: 13, fontWeight: 700, padding: '12px',
              textAlign: 'center', textDecoration: 'none',
            }}>
              Ir para o login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#9ca3af', marginBottom: 6 }}>NOME</label>
              <input
                type="text" required value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Seu nome"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                onBlur={e => e.target.style.borderColor = '#374151'}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#9ca3af', marginBottom: 6 }}>E-MAIL</label>
              <input
                type="email" required value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                onBlur={e => e.target.style.borderColor = '#374151'}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#9ca3af', marginBottom: 6 }}>SENHA</label>
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
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#9ca3af', marginBottom: 6 }}>CONFIRMAR SENHA</label>
              <input
                type="password" required value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Repita a senha"
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
                opacity: loading ? 0.7 : 1, marginTop: 4,
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
              {loading ? 'Criando conta...' : 'Criar conta'}
            </button>

            <div style={{ textAlign: 'center', fontSize: 12, color: '#6b7280' }}>
              Já tem conta?{' '}
              <Link href="/auth/login" style={{ color: '#60a5fa', textDecoration: 'none', fontWeight: 600 }}>
                Entrar
              </Link>
            </div>
          </form>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
