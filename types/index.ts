export type Channel = 'ml' | 'shopee' | 'amazon' | 'magalu' | 'shein' | null

export interface ChannelOption {
  id: Channel
  label: string
  color: string
  itemsTable: string | null
  usersTable: string | null
  categoriesTable: string
  brandsTable: string
  trendsTable: string | null
}

export const CHANNELS: ChannelOption[] = [
  {
    id: 'ml',
    label: 'Mercado Livre',
    color: '#ffe600',
    itemsTable: 'mercadolibre_items',
    usersTable: 'mercadolibre_users',
    categoriesTable: 'mercadolibre_categories',
    brandsTable: 'mercadolibre_brands',
    trendsTable: 'mercadolibre_trends',
  },
  {
    id: 'shopee',
    label: 'Shopee',
    color: '#ee4d2d',
    itemsTable: 'shopee_items',
    usersTable: 'shopee_users',
    categoriesTable: 'shopee_categories',
    brandsTable: 'shopee_brands',
    trendsTable: 'shopee_trends',
  },
  {
    id: 'amazon',
    label: 'Amazon',
    color: '#e47911',
    itemsTable: 'amazon_items',
    usersTable: 'amazon_users',
    categoriesTable: 'amazon_categories',
    brandsTable: 'amazon_brands',
    trendsTable: 'amazon_trends',
  },
  {
    id: 'magalu',
    label: 'Magazine Luiza',
    color: '#0086ff',
    itemsTable: 'magalu_items',
    usersTable: 'magalu_users',
    categoriesTable: 'magalu_categories',
    brandsTable: 'magalu_brands',
    trendsTable: 'magalu_trends',
  },
  {
    id: 'shein',
    label: 'Shein',
    color: '#fe3b92',
    itemsTable: 'shein_items',
    usersTable: null,
    categoriesTable: 'shein_categories',
    brandsTable: 'shein_brands',
    trendsTable: null,
  },
  {
    id: null,
    label: 'Sem canal',
    color: '#6b7280',
    itemsTable: null,
    usersTable: null,
    categoriesTable: 'categories',
    brandsTable: 'brands',
    trendsTable: 'trends',
  },
]

export type TabId =
  | 'anuncios'
  | 'categorias'
  | 'marcas'
  | 'vendedores'
  | 'tendencias'
  | 'produtos'
  | 'fornecedores'

export interface TabDef {
  id: TabId
  label: string
  requiresChannel: boolean // false = disponível sem canal
}

// Tabs com canal (qualquer canal selecionado)
export const TABS_WITH_CHANNEL: TabDef[] = [
  { id: 'anuncios',   label: 'ANÚNCIOS',   requiresChannel: true },
  { id: 'categorias', label: 'CATEGORIAS', requiresChannel: true },
  { id: 'marcas',     label: 'MARCAS',     requiresChannel: true },
  { id: 'vendedores', label: 'VENDEDORES', requiresChannel: true },
  { id: 'tendencias', label: 'TENDÊNCIAS', requiresChannel: true },
]

// Tabs sem canal
export const TABS_NO_CHANNEL: TabDef[] = [
  { id: 'produtos',     label: 'PRODUTOS',     requiresChannel: false },
  { id: 'categorias',   label: 'CATEGORIAS',   requiresChannel: false },
  { id: 'marcas',       label: 'MARCAS',       requiresChannel: false },
  { id: 'fornecedores', label: 'FORNECEDORES', requiresChannel: false },
  { id: 'tendencias',   label: 'TENDÊNCIAS',   requiresChannel: false },
]

export interface ColDef {
  key: string
  label: string
  w: string
  sortable: boolean
  visible: boolean
  fixed?: boolean
}
