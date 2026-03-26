import { createClient } from '@/lib/supabase/server'
import { AnunciosTable } from './AnunciosTable'

export const revalidate = 300 // revalida a cada 5 minutos

export default async function AnunciosPage() {
  const supabase = createClient()

  const { data: items } = await supabase
    .from('mercadolibre_items')
    .select(`
      item_id, title, price, original_price,
      sold_quantity, item_sold_quantity, available_quantity,
      listing_type_id, listing_type, category_id,
      seller_id, seller_name, reputation_level, power_seller_status,
      official_store, shipping_mode, shipping_logistic_type, shipping_tags,
      attributes_brand, attributes_model, thumbnail, permalink,
      gold_pro_fee, gold_special_fee, billable_weight,
      health, visits, item_created_at, receita, status
    `)
    .eq('status', 'active')
    .order('sold_quantity', { ascending: false })
    .limit(500)

  const { count } = await supabase
    .from('mercadolibre_items')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4
                      border-b border-surface-border bg-surface-raised flex-shrink-0">
        <div>
          <h1 className="text-lg font-bold text-white">Anúncios</h1>
          <p className="text-xs text-text-secondary mt-0.5">
            {count?.toLocaleString('pt-BR') ?? '—'} anúncios no banco
          </p>
        </div>
      </div>

      {/* Tabela */}
      <div className="flex-1 overflow-hidden">
        <AnunciosTable items={items ?? []} />
      </div>
    </div>
  )
}
