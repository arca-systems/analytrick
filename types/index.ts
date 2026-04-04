export type Channel = 'ml' | null

export interface ChannelOption {
  id: Channel
  label: string
  color: string
}

export const CHANNELS: ChannelOption[] = [
  { id: 'ml',   label: 'Mercado Livre', color: '#ffe600' },
  { id: null,   label: 'Sem canal',     color: '#6b7280' },
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
}

export const TABS_ML: TabDef[] = [
  { id: 'anuncios',    label: 'ANÚNCIOS'    },
  { id: 'categorias',  label: 'CATEGORIAS'  },
  { id: 'marcas',      label: 'MARCAS'      },
  { id: 'vendedores',  label: 'VENDEDORES'  },
  { id: 'tendencias',  label: 'TENDÊNCIAS'  },
]

export const TABS_NONE: TabDef[] = [
  { id: 'produtos',     label: 'PRODUTOS'     },
  { id: 'categorias',   label: 'CATEGORIAS'   },
  { id: 'marcas',       label: 'MARCAS'       },
  { id: 'fornecedores', label: 'FORNECEDORES' },
  { id: 'tendencias',   label: 'TENDÊNCIAS'   },
]

export interface ColDef {
  key: string
  label: string
  w: string
  sortable: boolean
  visible: boolean
  fixed?: boolean
}
