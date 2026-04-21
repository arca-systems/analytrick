'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    const { error: e2 } = await supabase.auth.signInWithPassword({ email, password })
    if (e2) { setError(e2.message); setLoading(false) }
    else router.push('/')
  }

  const inp: React.CSSProperties = {
    width:'100%', background:'#060d14', border:'1px solid #1e3a3a',
    borderRadius:8, color:'#f0fffe', fontSize:13, padding:'10px 14px',
    fontFamily:'inherit', outline:'none', boxSizing:'border-box',
  }

  return (
    <div style={{position:'fixed',inset:0,background:'#060d14',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Inter',system-ui,sans-serif"}}>
      <div style={{background:'#0a0f1a',border:'1px solid #1e3a3a',borderRadius:16,padding:'36px 40px',width:400,boxShadow:'0 8px 40px rgba(0,0,0,.8)'}}>

        {/* Logo */}
        <div style={{display:'flex',justifyContent:'center',marginBottom:32}}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Analytrick" style={{height:40,width:'auto',objectFit:'contain'}} />
        </div>

        <form onSubmit={handleLogin} style={{display:'flex',flexDirection:'column',gap:16}}>
          <div>
            <label style={{display:'block',fontSize:11,fontWeight:600,color:'#4a8888',marginBottom:6}}>E-MAIL</label>
            <input type="email" required value={email} onChange={e=>setEmail(e.target.value)}
              placeholder="seu@email.com" style={inp}
              onFocus={e=>e.target.style.borderColor='#07e6d4'}
              onBlur={e=>e.target.style.borderColor='#1e3a3a'} />
          </div>
          <div>
            <label style={{display:'block',fontSize:11,fontWeight:600,color:'#4a8888',marginBottom:6}}>SENHA</label>
            <div style={{position:'relative'}}>
              <input type={showPw?'text':'password'} required value={password} onChange={e=>setPassword(e.target.value)}
                placeholder="Sua senha" style={{...inp,paddingRight:40}}
                onFocus={e=>e.target.style.borderColor='#07e6d4'}
                onBlur={e=>e.target.style.borderColor='#1e3a3a'} />
              <button type="button" onClick={()=>setShowPw(v=>!v)}
                style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#4a8888',fontSize:16,padding:0}}>
                {showPw?'🙈':'👁'}
              </button>
            </div>
          </div>

          {error && (
            <div style={{background:'rgba(239,68,68,.1)',border:'1px solid rgba(239,68,68,.3)',borderRadius:8,padding:'10px 14px',fontSize:12,color:'#fca5a5'}}>{error}</div>
          )}

          <button type="submit" disabled={loading} style={{
            background:'linear-gradient(135deg,#07e6d4,#0891b2)',
            border:'none',borderRadius:8,color:'#fff',fontSize:13,
            fontWeight:700,padding:'12px',cursor:loading?'not-allowed':'pointer',
            fontFamily:'inherit',opacity:loading?.7:1,
            display:'flex',alignItems:'center',justifyContent:'center',gap:8,
          }}>
            {loading && <div style={{width:14,height:14,border:'2px solid rgba(255,255,255,.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin .7s linear infinite'}}/>}
            {loading?'Entrando...':'Entrar'}
          </button>

          <div style={{textAlign:'center'}}>
            <a href="/auth/forgot-password" style={{fontSize:12,color:'#07e6d4',textDecoration:'none'}}>
              Esqueceu a senha?
            </a>
          </div>

          <div style={{textAlign:'center',fontSize:11,color:'#2d5555',marginTop:8}}>
            Problemas para acessar?{' '}
            <a href="https://wa.me/5512974059088" target="_blank" rel="noopener noreferrer"
              style={{color:'#07e6d4',textDecoration:'none',fontWeight:600}}>
              Fale conosco
            </a>
          </div>
        </form>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
