// app/(app)/anuncios/page.tsx
import { createClient } from '@/lib/supabase/server'
import { AnunciosTable } from './AnunciosTable'

export const revalidate = 300

export default async function AnunciosPage() {
  const supabase = await createClient()

  const { data: items } = await supabase
    .from('mercadolibre_items')
    .select('item_id, title, price, original_price, sold_quantity, item_sold_quantity, available_quantity, listing_type_id, listing_type, category_id, seller_id, seller_name, reputation_level, power_seller_status, official_store, shipping_mode, shipping_logistic_type, shipping_tags, attributes_brand, attributes_model, thumbnail, permalink, gold_pro_fee, gold_special_fee, billable_weight, health, visits, item_created_at, receita, status')
    .eq('status', 'active')
    .order('sold_quantity', { ascending: false })
    .limit(500)

  const { count } = await supabase
    .from('mercadolibre_items')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #1e2535', background: '#161b25' }}>
        <h1 style={{ color: '#fff', margin: 0, fontSize: 18, fontWeight: 700 }}>Anúncios</h1>
        <p style={{ color: '#94a3b8', margin: '4px 0 0', fontSize: 12 }}>
          {count?.toLocaleString('pt-BR') ?? '—'} anúncios no banco
        </p>
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <AnunciosTable items={items ?? []} />
      </div>
    </div>
  )
}
