import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

type CookieToSet = { name: string; value: string; options?: Record<string, unknown> }

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as never)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  const publicPaths = [
    '/auth/login',
    '/auth/signup',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/callback',
    '/assinar',
  ]
  const isPublic = publicPaths.some(p => pathname.startsWith(p))

  // Não autenticado → login
  if (!user && !isPublic) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Já logado tentando acessar login → home
  if (user && pathname === '/auth/login') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Verificar trial/assinatura para usuários logados
  if (user && !isPublic) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_status, trial_ends_at')
      .eq('id', user.id)
      .single()

    if (profile) {
      const now        = new Date()
      const trialEnded = profile.trial_ends_at && new Date(profile.trial_ends_at) < now
      const isActive   = profile.subscription_status === 'active'
      const isTrial    = profile.subscription_status === 'trial' && !trialEnded

      // Trial expirou e sem assinatura → página de assinar
      // TODO: habilitar quando página /assinar estiver criada
      // if (!isActive && !isTrial && pathname !== '/assinar') {
      //   return NextResponse.redirect(new URL('/assinar', request.url))
      // }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}