// app/(app)/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server'

export const revalidate = 300

export default async function DashboardPage() {
  const supabase = await createClient()

  const [
    { count: totalItems },
    { count: totalSellers },
    { count: totalCategories },
    { data: topItems },
  ] = await Promise.all([
    supabase.from('mercadolibre_items').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('mercadolibre_users').select('*', { count: 'exact', head: true }),
    supabase.from('mercadolibre_categories').select('*', { count: 'exact', head: true }),
    supabase.from('mercadolibre_items')
      .select('item_id, title, price, sold_quantity, receita, attributes_brand')
      .eq('status', 'active')
      .order('sold_quantity', { ascending: false })
      .limit(5),
  ])

  const kpis = [
    { label: 'Anúncios',   value: totalItems?.toLocaleString('pt-BR') ?? '—',      color: '#60a5fa' },
    { label: 'Vendedores', value: totalSellers?.toLocaleString('pt-BR') ?? '—',    color: '#a78bfa' },
    { label: 'Categorias', value: totalCategories?.toLocaleString('pt-BR') ?? '—', color: '#4ade80' },
  ]

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ color: '#fff', marginBottom: 24 }}>Dashboard</h1>
      <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
        {kpis.map(k => (
          <div key={k.label} style={{
            background: '#161b25', border: '1px solid #1e2535',
            borderRadius: 12, padding: '20px 24px', flex: 1
          }}>
            <p style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', margin: 0 }}>{k.label}</p>
            <p style={{ color: k.color, fontSize: 32, fontWeight: 800, margin: '4px 0 0' }}>{k.value}</p>
          </div>
        ))}
      </div>
      <div style={{ background: '#161b25', border: '1px solid #1e2535', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e2535' }}>
          <h2 style={{ color: '#fff', margin: 0, fontSize: 14 }}>Top 5 Mais Vendidos</h2>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: '#1e3a8a' }}>
              {['#','Título','Marca','Preço','Vendas','Receita'].map(h => (
                <th key={h} style={{ color: '#fff', padding: '9px 12px', textAlign: 'left', fontWeight: 700, fontSize: 10 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {topItems?.map((item, i) => (
              <tr key={item.item_id} style={{ borderBottom: '1px solid #1e2535' }}>
                <td style={{ padding: '8px 12px', color: '#64748b' }}>{i + 1}</td>
                <td style={{ padding: '8px 12px', color: '#fff', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</td>
                <td style={{ padding: '8px 12px', color: '#94a3b8' }}>{(item as any).attributes_brand ?? '—'}</td>
                <td style={{ padding: '8px 12px', color: '#fff' }}>R$ {item.price?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td style={{ padding: '8px 12px', color: '#fb923c', fontWeight: 700 }}>{item.sold_quantity?.toLocaleString('pt-BR')}</td>
                <td style={{ padding: '8px 12px', color: '#4ade80', fontWeight: 700 }}>
                  {item.receita ? 'R$ ' + (item.receita as number).toLocaleString('pt-BR', { maximumFractionDigits: 0 }) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
