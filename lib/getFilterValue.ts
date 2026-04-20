// ============================================================
// ANALYTRICK | lib/getFilterValue.ts
// Retorna o valor que deve aparecer no dropdown de filtro.
// Para colunas traduzidas (listing, frete, logística, etc.)
// retorna o texto traduzido, não o valor bruto do banco.
// Para colunas numéricas retorna o número parseado (para
// sort numérico correto no filtro).
// ============================================================

function listingTypeLabel(id: string | null | undefined): string {
  if (!id) return '—'
  if (id === 'gold_pro') return 'Premium'
  if (id === 'gold_special') return 'Clássico'
  if (id === 'free') return 'Grátis'
  return id
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getFilterValue(row: Record<string, any>, key: string): string | number {
  const v = row[key]

  switch (key) {
    // ── ANUNCIO: traduz catalog/user/tradicional ────────────
    case 'listing': {
      const l = row.catalog_product_id ? 'PRODUTO CATÁLOGO'
              : row.user_product_id    ? 'PRODUTO USUÁRIO'
              : (v as string) || 'TRADICIONAL'
      return l
    }

    // ── TIPO DE ANUNCIO: gold_pro → Premium, etc ───────────
    case 'listing_type': {
      let lt = listingTypeLabel(row.listing_type_id)
      if (!lt || lt === '—') lt = String(v || '')
      return lt || '—'
    }

    // ── FRETE: boolean → GRÁTIS / Pago ────────────────────
    case 'shipping_free_shipping': {
      const fs = v ?? false
      return fs ? 'GRÁTIS' : 'Pago'
    }

    // ── LOGÍSTICA: traduz fulfillment, cross_docking, etc ──
    case 'shipping_logistic_type': {
      const lt = String(v || '')
      if (!lt) return '—'
      if (lt === 'fulfillment')  return 'ME FULL'
      if (lt === 'cross_docking') return 'ME COLETA'
      if (lt === 'xd_drop_off')  return 'ME PLACES'
      if (lt === 'drop_off')     return 'MERCADO ENVIOS'
      if (lt === 'not_specified') return 'N/A'
      if (lt === 'FULL')         return 'ME FULL'
      return lt
    }

    // ── MODO: me1/me2 → ME1/ME2 ────────────────────────────
    case 'shipping_mode': {
      const sm = String(v || '')
      if (!sm) return '—'
      if (sm === 'me1' || sm === 'ME1') return 'ME1'
      if (sm === 'me2' || sm === 'ME2') return 'ME2'
      return sm.toUpperCase()
    }

    // ── REPUTAÇÃO: mantém value, valor já é o nome ─────────
    case 'reputation_level':
    case 'seller_reputation_level_id':
      return v ? String(v) : '—'

    // ── MEDALHA: gold → Gold, etc ──────────────────────────
    case 'power_seller_status':
    case 'seller_reputation_power_seller_status': {
      const medals: Record<string, string> = { gold: 'Gold', silver: 'Silver', platinum: 'Platinum' }
      return v ? (medals[String(v)] || String(v)) : '—'
    }

    // ── CONDIÇÃO ───────────────────────────────────────────
    case 'item_condition': {
      if (!v) return '—'
      const isUsed = /usado|recondicionado|seminovo/i.test(String(v))
      return isUsed ? String(v) : 'Novo'
    }

    // ── STATUS: active → active (já é texto curto) ─────────
    case 'status':
    case 'status_site_status':
      return v ? String(v) : '—'

    // ── ANUNCIÁVEL: boolean → Sim / Não ───────────────────
    case 'listing_allowed':
      return (v === true || v === 'true') ? 'Sim' : 'Não'

    // ── NUMÉRICOS: retorna number para sort correto ────────
    case 'price':
    case 'original_price':
    case 'sold_quantity':
    case 'receita':
    case 'item_sold_quantity':
    case 'avaiable_quantity':
    case 'available_quantity':
    case 'health':
    case 'visits':
    case 'rate':
    case 'rate_stars':
    case 'billable_weight':
    case 'gold_special_fee':
    case 'gold_pro_fee':
    case 'results':
    case 'items':
    case 'sold_unity':
    case 'ranking':
    case 'previous_ranking':
    case 'listing_health':
    case 'purchase_experience':
    case 'seller_reputation_transactions_total':
    case 'trends_rank': {
      const n = parseFloat(String(v ?? ''))
      return isNaN(n) ? '—' : n
    }

    // ── DATAS: formata dd/mm/aaaa ──────────────────────────
    case 'item_created_at':
    case 'item_updated_at':
    case 'catalog_product_created_at':
    case 'catalog_product_updated_at':
    case 'user_product_created_at':
    case 'user_product_updated_at':
    case 'date_created':
    case 'created_at': {
      if (!v) return '—'
      const raw = String(v).substring(0, 10)
      const parts = raw.split('-')
      return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : raw
    }

    // ── PERCENTUAIS (taxas): retorna "XX.X%" ───────────────
    case 'gold_special_fee_pct':
    case 'gold_pro_fee_pct': {
      const n = parseFloat(String(v ?? ''))
      return isNaN(n) ? '—' : `${(n * 100).toFixed(1)}%`
    }

    // ── DEFAULT: string normal ─────────────────────────────
    default:
      return v != null && v !== '' ? String(v) : '—'
  }
}
