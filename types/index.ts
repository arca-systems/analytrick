// Canais disponíveis
export type Channel = 'ml' | null  // null = sem canal

export interface ChannelOption {
  id: Channel
  label: string
  color: string
  tables: {
    items?: string
    users?: string
    categories?: string
    brands?: string
    trends?: string
    top100?: string
  }
}

export const CHANNELS: ChannelOption[] = [
  {
    id: null,
    label: 'Sem canal',
    color: '#6b7280',
    tables: {
      categories: 'mercadolibre_categories',
      brands: 'mercadolibre_brands',
    },
  },
  {
    id: 'ml',
    label: 'Mercado Livre',
    color: '#ffe600',
    tables: {
      items: 'mercadolibre_items',
      users: 'mercadolibre_users',
      categories: 'mercadolibre_categories',
      brands: 'mercadolibre_brands',
      trends: 'mercadolibre_trends',
      top100: 'mercadolibre_top100',
    },
  },
]

// Tabs disponíveis por canal
export type TabId =
  | 'anuncios'
  | 'categorias'
  | 'marcas'
  | 'tendencias'
  | 'vendedores'
  | 'top100'
  | 'destaques'

export interface TabDef {
  id: TabId
  label: string
  icon: string
  channels: Array<Channel>  // null = disponível sem canal
}

export const TABS: TabDef[] = [
  { id: 'anuncios',   label: 'ANÚNCIOS',   icon: '📋', channels: ['ml'] },
  { id: 'categorias', label: 'CATEGORIAS', icon: '🗂',  channels: [null, 'ml'] },
  { id: 'marcas',     label: 'MARCAS',     icon: '◈',  channels: [null, 'ml'] },
  { id: 'tendencias', label: 'TENDÊNCIAS', icon: '📈', channels: ['ml'] },
  { id: 'vendedores', label: 'VENDEDORES', icon: '👤', channels: ['ml'] },
  { id: 'top100',     label: 'TOP100',     icon: '🏆', channels: ['ml'] },
  { id: 'destaques',  label: 'DESTAQUES',  icon: '⭐', channels: ['ml'] },
]

// ColDef genérica
export interface ColDef {
  key: string
  label: string
  w: string
  sortable: boolean
  visible: boolean
  fixed?: boolean
}

// Produto (anúncio ML)
export interface MLItem {
  item_id: string
  title: string
  price: number | null
  original_price: number | null
  sold_quantity: number | null
  item_sold_quantity: number | null
  available_quantity: number | null
  listing_type_id: string | null
  listing_type: string | null
  category_id: string | null
  seller_id: string | null
  seller_name: string | null
  reputation_level: string | null
  power_seller_status: string | null
  official_store: string | null
  shipping_mode: string | null
  shipping_logistic_type: string | null
  shipping_free_shipping: boolean | null
  shipping_tags: string | null
  attributes_brand: string | null
  attributes_model: string | null
  thumbnail: string | null
  permalink: string | null
  gold_pro_fee: number | null
  gold_special_fee: number | null
  billable_weight: number | null
  health: number | null
  visits: number | null
  item_created_at: string | null
  status: string | null
  receita?: number | null
  [key: string]: unknown
}

export interface MLUser {
  user_id: string
  nickname: string
  seller_reputation_level_id: string | null
  seller_reputation_power_seller_status: string | null
  seller_reputation_transactions_total: number | null
  country_id: string | null
  address_state: string | null
  address_city: string | null
  user_type: string | null
  status_site_status: string | null
  created_at: string | null
  [key: string]: unknown
}

export interface MLCategory {
  category_id: string
  category_name: string | null
  category_parent: string | null
  category_tree: string | null
  items: number | null
  vertical: string | null
  subvertical: string | null
  subdomain: string | null
  listing_allowed: boolean | null
  date_created: string | null
  gold_special_fee: number | null
  gold_pro_fee: number | null
  [key: string]: unknown
}

export interface MLBrand {
  brand: string
  results: number | null
  brand_listing_url: string | null
  oficial_store_url: string | null
  store_url: string | null
  [key: string]: unknown
}

export interface MLTrend {
  trends_rank: number
  keyword: string
  trends_type: string | null
  category_id: string | null
  results: number | null
  created_at: string | null
}

export interface MLTop100 {
  ranking: number
  previous_ranking: number | null
  thumbnail: string | null
  title: string | null
  seller_alias: string | null
  seller_reputation_level_id: string | null
  seller_reputation_power_seller_status: string | null
  official_store: string | null
  variation_01: string | null
  price: number | null
  sold_quantity: number | null
  sold_unity: number | null
  logistic_type: string | null
  shipping_free_shipping: boolean | null
  ads_type: string | null
  listing_health: number | null
  purchase_experience: number | null
  category_id: string | null
  item_id: string | null
  created_at: string | null
  [key: string]: unknown
}
