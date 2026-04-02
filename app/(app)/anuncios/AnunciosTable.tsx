'use client'
import { useState, useMemo } from 'react'
import type { MLItem } from '@/types'

const fmtR = (v?: number) => v != null
  ? 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  : '—'

const fmtN = (v?: number) => v != null ? v.toLocaleString('pt-BR') : '—'

function LogisticaBadge({ lt }: { lt?: string }) {
  if (!lt) return <span className="text-text-muted">—</span>
  const map: Record<string, [string, string]> = {
    fulfillment:   ['ME FULL',          'badge-full'],
    cross_docking: ['ME PLACES',        'badge-full'],
    xd_drop_off:   ['ME COLETA',        'badge-full'],
    drop_off:      ['MERCADO ENVIOS',   'badge-trad'],
    FULL:          ['ME FULL',          'badge-full'],
  }
  const [label, cls] = map[lt] ?? [lt, 'badge-trad']
  return <span className={`badge ${cls}`}>{label}</span>
}

const COLS = [
  { key: 'title',                  label: 'TÍTULO',        w: 260 },
  { key: 'attributes_brand',       label: 'MARCA',         w: 100 },
  { key: 'price',                  label: 'PREÇO',         w: 90  },
  { key: 'sold_quantity',          label: 'VENDAS',        w: 80  },
  { key: 'item_sold_quantity',     label: 'VENDAS ITEM',   w: 90  },
  { key: 'receita',                label: 'RECEITA',       w: 110 },
  { key: 'listing_type',           label: 'TIPO',          w: 80  },
  { key: 'shipping_logistic_type', label: 'LOGÍSTICA',     w: 110 },
  { key: 'seller_name',            label: 'VENDEDOR',      w: 130 },
  { key: 'reputation_level',       label: 'REPUTAÇÃO',     w: 90  },
  { key: 'category_id',            label: 'CATEGORIA',     w: 90  },
  { key: 'health',                 label: 'HEALTH',        w: 70  },
  { key: 'visits',                 label: 'VISITAS',       w: 80  },
]

export function AnunciosTable({ items }: { items: MLItem[] }) {
  const [sortCol, setSortCol]   = useState<string>('sold_quantity')
  const [sortDir, setSortDir]   = useState<1 | -1>(-1)
  const [search, setSearch]     = useState('')
  const [page, setPage]         = useState(1)
  const PAGE_SIZE = 100

  const sorted = useMemo(() => {
    let list = items
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(p =>
        p.title?.toLowerCase().includes(q) ||
        p.attributes_brand?.toLowerCase().includes(q) ||
        p.seller_name?.toLowerCase().includes(q)
      )
    }
    return [...list].sort((a, b) => {
      const av = (a as any)[sortCol] ?? 0
      const bv = (b as any)[sortCol] ?? 0
      if (typeof av === 'number') return (av - bv) * sortDir
      return String(av).localeCompare(String(bv), 'pt-BR') * sortDir
    })
  }, [items, sortCol, sortDir, search])

  const paged    = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const pages    = Math.ceil(sorted.length / PAGE_SIZE)

  const handleSort = (key: string) => {
    if (sortCol === key) setSortDir(d => d === 1 ? -1 : 1)
    else { setSortCol(key); setSortDir(-1) }
    setPage(1)
  }

  function renderCell(item: MLItem, key: string) {
    switch (key) {
      case 'title':
        return (
          <a href={item.permalink || '#'} target="_blank" rel="noopener"
             className="text-white hover:text-blue-300 transition-colors truncate block max-w-[260px]">
            {item.title}
          </a>
        )
      case 'price':
        return <span className="text-white font-600">{fmtR(item.price)}</span>
      case 'sold_quantity':
        return <span className="text-accent-orange font-700">{fmtN(item.sold_quantity)}</span>
      case 'item_sold_quantity':
        return <span className="text-accent-purple font-700">{fmtN(item.item_sold_quantity)}</span>
      case 'receita':
        return <span className="text-accent-green font-700">{fmtR(item.receita)}</span>
      case 'listing_type':
        return item.listing_type_id === 'gold_pro'
          ? <span className="badge badge-full">Premium</span>
          : <span className="badge badge-trad">Clássico</span>
      case 'shipping_logistic_type':
        return <LogisticaBadge lt={item.shipping_logistic_type} />
      case 'reputation_level': {
        const map: Record<string, string> = {
          '5_green': '🟢', '4_light_green': '🟡', '3_yellow': '🟠',
          '2_orange': '🔴', '1_red': '⚫',
        }
        return <span>{map[item.reputation_level ?? ''] ?? item.reputation_level ?? '—'}</span>
      }
      case 'health':
        return item.health != null
          ? <span className={item.health > 0.7 ? 'text-accent-green' : item.health > 0.4 ? 'text-accent-orange' : 'text-accent-red'}>
              {(item.health * 100).toFixed(0)}%
            </span>
          : <span className="text-text-muted">—</span>
      default:
        return <span>{(item as any)[key] ?? '—'}</span>
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-surface-border flex-shrink-0">
        <input
          type="text"
          placeholder="🔍 Buscar título, marca, vendedor..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          className="flex-1 max-w-xs px-3 py-1.5 rounded-lg bg-surface border border-surface-border
                     text-sm text-white outline-none focus:border-blue-500 transition-colors"
        />
        <span className="text-xs text-text-secondary ml-auto">
          {sorted.length.toLocaleString('pt-BR')} anúncios
        </span>
      </div>

      {/* Tabela */}
      <div className="flex-1 overflow-auto">
        <table className="at-table">
          <thead>
            <tr>
              {COLS.map(c => (
                <th key={c.key}
                    style={{ width: c.w, minWidth: c.w }}
                    onClick={() => handleSort(c.key)}>
                  {c.label}
                  <span className="ml-1 opacity-40 text-[9px]">
                    {sortCol === c.key ? (sortDir === 1 ? '↑' : '↓') : '↕'}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map(item => (
              <tr key={item.item_id}>
                {COLS.map(c => (
                  <td key={c.key} style={{ maxWidth: c.w }}>
                    {renderCell(item, c.key)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 px-4 py-3
                        border-t border-surface-border flex-shrink-0">
          <button onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 rounded text-xs bg-surface-raised border border-surface-border
                             text-text-secondary disabled:opacity-30 hover:text-white transition-colors">
            ← Anterior
          </button>
          <span className="text-xs text-text-secondary">
            Página {page} de {pages}
          </span>
          <button onClick={() => setPage(p => Math.min(pages, p + 1))}
                  disabled={page === pages}
                  className="px-3 py-1 rounded text-xs bg-surface-raised border border-surface-border
                             text-text-secondary disabled:opacity-30 hover:text-white transition-colors">
            Próxima →
          </button>
        </div>
      )}
    </div>
  )
}
