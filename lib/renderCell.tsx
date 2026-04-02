// Porta fiel do renderCell da extensão
// Retorna JSX em vez de HTML string

import React from 'react'

function fmtR(v: number | null | undefined): string {
  if (v == null) return '—'
  return 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmtN(v: number | null | undefined): string {
  if (v == null) return '—'
  return v.toLocaleString('pt-BR')
}

function daysSince(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return null
  return Math.floor((Date.now() - d.getTime()) / 86400000)
}

function listingTypeLabel(id: string | null | undefined): string {
  if (!id) return '—'
  if (id === 'gold_pro') return 'Premium'
  if (id === 'gold_special') return 'Clássico'
  if (id === 'free') return 'Grátis'
  return id
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function renderCell(row: Record<string, any>, key: string): React.ReactNode {
  const v = row[key]

  switch (key) {
    case 'thumbnail':
      return v
        ? <img src={v} alt="" className="cell-thumb" loading="lazy" />
        : <span className="text-txt-vd">—</span>

    case 'title':
      return (
        <div className="max-w-[260px] overflow-hidden text-ellipsis whitespace-nowrap">
          <a
            href={row.permalink || row.item_id ? `https://www.mercadolivre.com.br/p/${row.item_id}` : '#'}
            target="_blank"
            rel="noopener noreferrer"
            title={row.title}
            className="text-white hover:text-blue-400 no-underline text-[11px]"
          >
            {row.title || '—'}
          </a>
        </div>
      )

    case 'price':
      return <span className="cell-price">{fmtR(v)}</span>

    case 'original_price':
      return v ? <span className="text-gray-400 line-through text-[11px]">{fmtR(v)}</span> : <span>—</span>

    case 'discount':
      return v
        ? <span className="cell-badge badge-red text-[10px]">{String(v)}</span>
        : <span>—</span>

    case 'sold_quantity':
      return v ? <span className="cell-sales">{fmtN(v)}</span> : <span>—</span>

    case 'item_sold_quantity':
      return v ? <span style={{ color: '#fb923c', fontWeight: 700 }}>{fmtN(v)}</span> : <span>—</span>

    case 'receita':
    case 'receita_item': {
      const r = key === 'receita' ? v : (row.price || 0) * (row.item_sold_quantity || 0)
      return r ? <span className="cell-receita">{fmtR(r)}</span> : <span>—</span>
    }

    case 'available_quantity':
    case 'avaiable_quantity': {
      const q = v ?? row.available_quantity
      if (q == null) return <span>—</span>
      return <span style={{ color: q < 5 ? '#ef4444' : '#4ade80', fontWeight: 600 }}>{fmtN(q)}</span>
    }

    case 'health': {
      if (v == null) return <span>—</span>
      const pct = (v * 100).toFixed(0) + '%'
      const cls = v >= 0.8 ? 'cell-health-good' : v >= 0.5 ? 'cell-health-mid' : 'cell-health-bad'
      return <span className={cls}>{pct}</span>
    }

    case 'visits':
      return v
        ? <span style={{ color: '#38bdf8', fontWeight: 600 }}>{fmtN(v)}</span>
        : <span>—</span>

    case 'rate':
    case 'rate_stars':
      return v != null && v > 0
        ? <span style={{ color: '#fbbf24', fontWeight: 700 }}>★ {Number(v).toFixed(1)}</span>
        : <span>—</span>

    case 'listing_type': {
      let lt = listingTypeLabel(row.listing_type_id)
      if (!lt || lt === '—') lt = v
      if (!lt || lt === '—') return <span>—</span>
      const ltc = lt === 'Premium' ? '#ffe600' : '#60a5fa'
      return <span style={{ fontSize: 11, color: ltc, fontWeight: 700 }}>{lt}</span>
    }

    case 'listing': {
      const l = row.catalog_product_id ? 'PRODUTO CATÁLOGO'
              : row.user_product_id    ? 'PRODUTO USUÁRIO'
              : v || 'TRADICIONAL'
      const lc = l === 'PRODUTO CATÁLOGO' ? '#60a5fa' : l === 'PRODUTO USUÁRIO' ? '#a78bfa' : '#9ca3af'
      return <div style={{ fontSize: 10, color: lc, fontWeight: 600, lineHeight: 1.4 }}>{l}</div>
    }

    case 'shipping_free_shipping': {
      const fs = v ?? false
      return fs
        ? <span className="cell-badge badge-green">GRÁTIS</span>
        : <span style={{ fontSize: 11, color: '#6b7280' }}>Pago</span>
    }

    case 'shipping_logistic_type': {
      const lt = v
      if (!lt) return <span>—</span>
      const label = lt === 'fulfillment'   ? 'ME FULL'
        : lt === 'cross_docking'           ? 'ME COLETA'
        : lt === 'xd_drop_off'             ? 'ME PLACES'
        : lt === 'drop_off'                ? 'MERCADO ENVIOS'
        : lt === 'not_specified'           ? 'N/A'
        : lt
      return <span className="cell-badge badge-blue" style={{ whiteSpace: 'normal', lineHeight: 1.3, textAlign: 'center' }}>{label}</span>
    }

    case 'shipping_mode': {
      const sm = v
      if (!sm) return <span>—</span>
      const lbl = sm === 'me1' || sm === 'ME1' ? 'ME1' : sm === 'me2' || sm === 'ME2' ? 'ME2' : sm.toUpperCase()
      return <span className="cell-badge badge-gray">{lbl}</span>
    }

    case 'reputation_level': {
      if (!v) return <span>—</span>
      const repColors: Record<string, string> = {
        green: '#4ade80', light_green: '#86efac', yellow: '#fbbf24', orange: '#fb923c', red: '#ef4444',
      }
      const rc = repColors[v] || '#9ca3af'
      return <span style={{ color: rc, fontWeight: 700, fontSize: 10 }}>● {v}</span>
    }

    case 'power_seller_status': {
      if (!v) return <span>—</span>
      const medals: Record<string, string> = { gold: '🥇 Gold', silver: '🥈 Silver', platinum: '💎 Platinum' }
      return <span className="cell-badge badge-gray">{medals[v] || v}</span>
    }

    case 'status': {
      if (!v) return <span>—</span>
      const sc = v === 'active' ? '#4ade80' : '#ef4444'
      return <span style={{ fontSize: 10, color: sc, fontWeight: 600 }}>{v}</span>
    }

    case 'attributes_brand':
      return v
        ? <div style={{ whiteSpace: 'normal', lineHeight: 1.3, wordBreak: 'break-word', fontSize: 11 }}>{String(v)}</div>
        : <span>—</span>

    case 'attributes_model':
    case 'attributes_line':
      return v
        ? <span className="atk-trunc" style={{ fontSize: 11, color: '#9ca3af' }}>{String(v)}</span>
        : <span>—</span>

    case 'official_store':
      return v
        ? <span style={{ fontSize: 10, color: '#9ca3af', whiteSpace: 'normal', lineHeight: 1.3, display: 'block' }}>{String(v).substring(0, 40)}</span>
        : <span>—</span>

    case 'seller_name':
      return v
        ? <span className="atk-trunc" style={{ fontSize: 11, color: '#9ca3af' }}>{String(v)}</span>
        : <span>—</span>

    case 'tags': {
      if (!v) return <span>—</span>
      const tv = String(v)
      let bg = '#374151', color = '#d1d5db'
      if (/mais\s+vendido/i.test(tv))    { bg = '#fb923c'; color = '#fff' }
      if (/oferta\s+imperd/i.test(tv))   { bg = '#1d4ed8'; color = '#fff' }
      if (/oferta\s+do\s+dia/i.test(tv)) { bg = '#0891b2'; color = '#fff' }
      if (/recomendado/i.test(tv))       { bg = '#000'; color = '#fff' }
      return <span style={{ display: 'inline-block', background: bg, color, borderRadius: 4, padding: '2px 7px', fontSize: 9, fontWeight: 700, whiteSpace: 'normal', lineHeight: 1.5 }}>{tv.substring(0, 60)}</span>
    }

    case 'shipping_tags': {
      if (!v) return <span>—</span>
      const stags = String(v)
      if (stags.includes('self_service_in')) {
        return <span className="cell-badge badge-blue">ME FLEX</span>
      }
      return <span style={{ fontSize: 9, color: '#6b7280' }}>{stags.substring(0, 60)}</span>
    }

    case 'item_condition': {
      const cond = v ?? row.condition
      if (!cond) return <span>—</span>
      const isUsed = /usado|recondicionado|seminovo/i.test(String(cond))
      return <span style={{ fontSize: 11, color: isUsed ? '#fbbf24' : '#9ca3af' }}>{isUsed ? String(cond) : 'Novo'}</span>
    }

    case 'permalink':
      return v
        ? <a href={String(v)} target="_blank" rel="noopener noreferrer" style={{ fontSize: 9, color: '#60a5fa' }}>🔗 link</a>
        : <span>—</span>

    case 'item_created_at':
    case 'item_updated_at':
    case 'catalog_product_created_at':
    case 'catalog_product_updated_at':
    case 'user_product_created_at':
    case 'user_product_updated_at': {
      if (!v) return <span>—</span>
      const raw = String(v).substring(0, 10)
      const parts = raw.split('-')
      const fmt = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : raw
      return <span style={{ color: '#9ca3af', fontSize: 10 }}>{fmt}</span>
    }

    case 'catalog_product_days': {
      const d = daysSince(row.catalog_product_created_at)
      return d != null ? <span style={{ color: '#a78bfa', fontWeight: 600 }}>{d}d</span> : <span>—</span>
    }

    case 'user_product_days': {
      const d = daysSince(row.user_product_created_at)
      return d != null ? <span style={{ color: '#a78bfa', fontWeight: 600 }}>{d}d</span> : <span>—</span>
    }

    case 'item_updated_days': {
      const d = daysSince(row.item_updated_at ?? row.item_created_at)
      return d != null ? <span style={{ color: '#64748b', fontWeight: 600 }}>{d}d</span> : <span>—</span>
    }

    case 'vendas_dia': {
      const dateStr = row.item_created_at
      const dias = daysSince(dateStr)
      const d = dias && dias > 0 && row.sold_quantity ? (row.sold_quantity / dias) : null
      return d != null ? <span style={{ color: '#60a5fa', fontWeight: 600 }}>{d.toFixed(1)}</span> : <span>—</span>
    }

    case 'conversao': {
      if (!row.visits || !row.sold_quantity) return <span>—</span>
      const conv = (row.sold_quantity / row.visits) * 100
      return <span style={{ color: '#a78bfa', fontWeight: 600 }}>{conv.toFixed(2)}%</span>
    }

    // Colunas de ID
    case 'item_id':
    case 'seller_id':
    case 'category_id':
    case 'catalog_product_id':
    case 'user_product_id':
    case 'official_store_id':
    case 'domain_id':
    case 'inventory_id':
    case 'brand_id':
    case 'listing_type_id':
      return v ? <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#6b7280' }}>{String(v)}</span> : <span>—</span>

    // TOP100 específicos
    case 'ranking':
      return <span style={{ fontWeight: 800, color: '#ffe600', fontSize: 13 }}>{v ?? '—'}</span>

    case 'previous_ranking':
      return v != null
        ? <span style={{ color: '#6b7280', fontSize: 11 }}>{v}</span>
        : <span>—</span>

    case 'listing_health':
    case 'purchase_experience': {
      if (v == null) return <span>—</span>
      const pct = (Number(v) * 100).toFixed(0) + '%'
      const cls = Number(v) >= 0.8 ? 'cell-health-good' : Number(v) >= 0.5 ? 'cell-health-mid' : 'cell-health-bad'
      return <span className={cls}>{pct}</span>
    }

    case 'seller_alias':
    case 'seller_nickname':
      return v
        ? <span className="atk-trunc" style={{ fontSize: 11, color: '#9ca3af' }}>{String(v)}</span>
        : <span>—</span>

    // Categorias específicos
    case 'category_tree':
    case 'category_parent':
    case 'category_name':
      return v
        ? <span style={{ fontSize: 11, whiteSpace: 'normal', lineHeight: 1.4, display: 'block', color: '#e5e7eb' }}>{String(v)}</span>
        : <span>—</span>

    case 'listing_allowed':
      return v === true || v === 'true'
        ? <span className="cell-badge badge-green">Sim</span>
        : <span className="cell-badge badge-red">Não</span>

    case 'date_created': {
      if (!v) return <span>—</span>
      const raw = String(v).substring(0, 10)
      const parts = raw.split('-')
      const fmt = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : raw
      return <span style={{ color: '#9ca3af', fontSize: 10 }}>{fmt}</span>
    }

    case 'gold_special_fee':
    case 'gold_pro_fee':
      return v != null
        ? <span style={{ color: '#fbbf24', fontWeight: 600 }}>{(Number(v) * 100).toFixed(1)}%</span>
        : <span>—</span>

    case 'items':
    case 'results':
    case 'sold_unity':
      return v != null
        ? <span style={{ color: '#60a5fa', fontWeight: 600 }}>{fmtN(Number(v))}</span>
        : <span>—</span>

    // Trends
    case 'trends_rank':
      return <span style={{ fontWeight: 700, color: '#ffe600' }}>{v ?? '—'}</span>

    case 'keyword':
      return v
        ? <span style={{ color: '#f9fafb', fontWeight: 500 }}>{String(v)}</span>
        : <span>—</span>

    case 'trends_type':
      return v
        ? <span className="cell-badge badge-purple">{String(v)}</span>
        : <span>—</span>

    case 'created_at': {
      if (!v) return <span>—</span>
      const raw = String(v).substring(0, 10)
      const parts = raw.split('-')
      const fmt = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : raw
      return <span style={{ color: '#9ca3af', fontSize: 10 }}>{fmt}</span>
    }

    // Vendedores
    case 'nickname':
      return v
        ? <span style={{ color: '#f9fafb', fontWeight: 600 }}>{String(v)}</span>
        : <span>—</span>

    case 'seller_reputation_level_id': {
      if (!v) return <span>—</span>
      const repColors: Record<string, string> = {
        green: '#4ade80', light_green: '#86efac', yellow: '#fbbf24', orange: '#fb923c', red: '#ef4444',
      }
      const rc = repColors[String(v)] || '#9ca3af'
      return <span style={{ color: rc, fontWeight: 700, fontSize: 10 }}>● {String(v)}</span>
    }

    case 'seller_reputation_power_seller_status': {
      if (!v) return <span>—</span>
      const medals: Record<string, string> = { gold: '🥇 Gold', silver: '🥈 Silver', platinum: '💎 Platinum' }
      return <span className="cell-badge badge-gray">{medals[String(v)] || String(v)}</span>
    }

    case 'seller_reputation_transactions_total':
      return v != null
        ? <span style={{ color: '#60a5fa', fontWeight: 600 }}>{fmtN(Number(v))}</span>
        : <span>—</span>

    case 'status_site_status': {
      if (!v) return <span>—</span>
      const sc = String(v) === 'active' ? '#4ade80' : '#ef4444'
      return <span style={{ fontSize: 10, color: sc, fontWeight: 600 }}>{String(v)}</span>
    }

    case 'address_state':
    case 'address_city':
      return v
        ? <span style={{ fontSize: 11 }}>{String(v)}</span>
        : <span>—</span>

    case 'user_type':
      return v
        ? <span className="cell-badge badge-gray">{String(v)}</span>
        : <span>—</span>

    case 'country_id':
      return v
        ? <span style={{ fontSize: 11 }}>🌎 {String(v)}</span>
        : <span>—</span>

    default: {
      if (v == null || v === '') return <span>—</span>
      return <span style={{ fontSize: 11 }}>{String(v)}</span>
    }
  }
}
