import { createClient } from '@/lib/supabase/server'

export const revalidate = 300

export default async function DashboardPage() {
  const supabase = createClient()

  // KPIs em paralelo
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
    { label: 'Anúncios',    value: totalItems?.toLocaleString('pt-BR') ?? '—',   color: '#60a5fa' },
    { label: 'Vendedores',  value: totalSellers?.toLocaleString('pt-BR') ?? '—', color: '#a78bfa' },
    { label: 'Categorias',  value: totalCategories?.toLocaleString('pt-BR') ?? '—', color: '#4ade80' },
  ]

  return (
    <div className="p-6 space-y-6 animate-in">
      <div>
        <h1 className="text-xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-text-secondary mt-0.5">Visão geral do banco de dados</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        {kpis.map(k => (
          <div key={k.label}
               className="bg-surface-raised border border-surface-border rounded-xl p-5">
            <p className="text-xs text-text-secondary font-600 uppercase tracking-wide">{k.label}</p>
            <p className="text-3xl font-800 mt-1" style={{ color: k.color }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Top 5 mais vendidos */}
      <div className="bg-surface-raised border border-surface-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-surface-border">
          <h2 className="text-sm font-700 text-white">Top 5 Mais Vendidos</h2>
        </div>
        <table className="at-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Título</th>
              <th>Marca</th>
              <th>Preço</th>
              <th>Vendas</th>
              <th>Receita</th>
            </tr>
          </thead>
          <tbody>
            {topItems?.map((item, i) => (
              <tr key={item.item_id}>
                <td className="text-text-muted font-mono text-xs">{i + 1}</td>
                <td className="text-white max-w-[300px] truncate">{item.title}</td>
                <td>{item.attributes_brand ?? '—'}</td>
                <td className="text-white">R$ {item.price?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td className="text-accent-orange font-700">{item.sold_quantity?.toLocaleString('pt-BR')}</td>
                <td className="text-accent-green font-700">
                  {item.receita ? 'R$ ' + item.receita.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
