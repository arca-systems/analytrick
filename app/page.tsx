import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AnalytrickApp from '@/components/AnalytrickApp'

export const dynamic = 'force-dynamic'

export default async function RootPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  return <AnalytrickApp />
}
