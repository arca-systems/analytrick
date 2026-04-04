import { ColDef } from '@/types'

// ── Anúncios (ML items) ──────────────────────────────────────
// Exclui pos/pg/ps/offers (exclusivos da navegação)
export const AN_COLS: ColDef[] = [
  { key: 'thumbnail',              label: 'IMAGEM',                  w: '90px',  sortable: false, visible: true,  fixed: true  },
  { key: 'title',                  label: 'TITULO',                  w: '260px', sortable: true,  visible: true,  fixed: true  },
  { key: 'attributes_brand',       label: 'MARCA',                   w: '115px', sortable: true,  visible: true  },
  { key: 'original_price',         label: 'PREÇO REAL',              w: '105px', sortable: true,  visible: true  },
  { key: 'discount',               label: 'DESCONTO',                w: '90px',  sortable: true,  visible: true  },
  { key: 'price',                  label: 'PREÇO',                   w: '105px', sortable: true,  visible: true  },
  { key: 'sold_quantity',          label: 'VENDAS',                  w: '90px',  sortable: true,  visible: true  },
  { key: 'receita',                label: 'RECEITA',                 w: '130px', sortable: true,  visible: true  },
  { key: 'listing_type',           label: 'TIPO DE ANUNCIO',         w: '100px', sortable: true,  visible: true  },
  { key: 'shipping_free_shipping', label: 'FRETE',                   w: '65px',  sortable: true,  visible: true  },
  { key: 'shipping_logistic_type', label: 'LOGÍSTICA',               w: '100px', sortable: true,  visible: true  },
  { key: 'official_store',         label: 'LOJA OFICIAL',            w: '110px', sortable: true,  visible: true  },
  { key: 'item_condition',         label: 'CONDIÇÃO',                w: '75px',  sortable: true,  visible: true  },
  { key: 'status',                 label: 'STATUS',                  w: '80px',  sortable: true,  visible: true  },
  // Ocultas por padrão
  { key: 'attributes_model',       label: 'MODELO',                  w: '90px',  sortable: true,  visible: false },
  { key: 'attributes_line',        label: 'LINHA',                   w: '90px',  sortable: true,  visible: false },
  { key: 'sku',                    label: 'SKU',                     w: '90px',  sortable: true,  visible: false },
  { key: 'gtin',                   label: 'GTIN',                    w: '90px',  sortable: true,  visible: false },
  { key: 'avaiable_quantity',      label: 'ESTOQUE',                 w: '80px',  sortable: true,  visible: false },
  { key: 'item_sold_quantity',     label: 'VENDAS ITEM',             w: '90px',  sortable: true,  visible: false },
  { key: 'health',                 label: 'SAÚDE',                   w: '70px',  sortable: true,  visible: false },
  { key: 'visits',                 label: 'VISITAS',                 w: '80px',  sortable: true,  visible: false },
  { key: 'conversao',              label: 'CONVERSÃO',               w: '80px',  sortable: true,  visible: false },
  { key: 'shipping_mode',          label: 'MODO',                    w: '70px',  sortable: true,  visible: false },
  { key: 'shipping_tags',          label: 'TAGS ENVIO',              w: '160px', sortable: false, visible: false },
  { key: 'reputation_level',       label: 'REPUTAÇÃO',               w: '100px', sortable: true,  visible: false },
  { key: 'power_seller_status',    label: 'MEDALHA',                 w: '80px',  sortable: true,  visible: false },
  { key: 'seller_name',            label: 'APELIDO',                 w: '110px', sortable: true,  visible: false },
  { key: 'seller_id',              label: 'ID USUÁRIO',              w: '120px', sortable: true,  visible: false },
  { key: 'category_id',            label: 'ID CATEGORIA',            w: '120px', sortable: true,  visible: false },
  { key: 'listing_type_id',        label: 'ID TIPO DE ANUNCIO',      w: '130px', sortable: true,  visible: false },
  { key: 'gold_special_fee',       label: 'TAXA CLÁSSICO',           w: '110px', sortable: true,  visible: false },
  { key: 'gold_pro_fee',           label: 'TAXA PREMIUM',            w: '110px', sortable: true,  visible: false },
  { key: 'item_created_at',        label: 'CRIADO EM',               w: '110px', sortable: true,  visible: false },
  { key: 'item_updated_at',        label: 'ATUALIZADO EM',           w: '110px', sortable: true,  visible: false },
  { key: 'permalink',              label: 'URL ANUNCIO',             w: '200px', sortable: false, visible: false },
  { key: 'item_id',                label: 'ID ITEM',                 w: '130px', sortable: true,  visible: false },
]

// ── Categorias ───────────────────────────────────────────────
export const CAT_COLS: ColDef[] = [
  { key: 'category_parent', label: 'CATEGORIA PAI',  w: '180px', sortable: true,  visible: true,  fixed: true  },
  { key: 'category_tree',   label: 'CATEGORIA',      w: '300px', sortable: true,  visible: true,  fixed: true  },
  { key: 'category_name',   label: 'NOME',           w: '160px', sortable: true,  visible: true  },
  { key: 'items',           label: 'ITENS',          w: '90px',  sortable: true,  visible: true  },
  { key: 'vertical',        label: 'VERTICAL',       w: '90px',  sortable: true,  visible: true  },
  { key: 'subvertical',     label: 'SUBVERTICAL',    w: '100px', sortable: true,  visible: true  },
  { key: 'subdomain',       label: 'SUBDOMÍNIO',     w: '100px', sortable: true,  visible: true  },
  { key: 'listing_allowed', label: 'ANUNCIÁVEL',     w: '90px',  sortable: true,  visible: true  },
  { key: 'date_created',    label: 'CRIAÇÃO',        w: '100px', sortable: true,  visible: true  },
  { key: 'gold_special_fee',label: 'TAXA CLÁSSICO',  w: '110px', sortable: true,  visible: true  },
  { key: 'gold_pro_fee',    label: 'TAXA PREMIUM',   w: '110px', sortable: true,  visible: true  },
  { key: 'category_tags',   label: 'TAGS',           w: '140px', sortable: false, visible: false },
  { key: 'category_id',     label: 'ID CATEGORIA',   w: '110px', sortable: true,  visible: false },
  { key: 'catalog_domain',  label: 'ID DOMÍNIO',     w: '130px', sortable: false, visible: false },
  { key: 'permalink',       label: 'URL',            w: '100px', sortable: false, visible: false },
]

// ── Marcas ───────────────────────────────────────────────────
export const BRAND_COLS: ColDef[] = [
  { key: 'brand',               label: 'MARCA',            w: '160px', sortable: true,  visible: true,  fixed: true },
  { key: 'results',             label: 'RESULTADOS',       w: '110px', sortable: true,  visible: true  },
  { key: 'brand_listing_url',   label: 'URL ANÚNCIOS',     w: '200px', sortable: false, visible: true  },
  { key: 'oficial_store_url',   label: 'URL LOJA OFICIAL', w: '200px', sortable: false, visible: false },
  { key: 'store_url',           label: 'URL LOJA',         w: '200px', sortable: false, visible: false },
  { key: 'store_listing_url',   label: 'URL ANÚNCIOS LOJA',w: '200px', sortable: false, visible: false },
  { key: 'page_url',            label: 'URL PÁGINA',       w: '200px', sortable: false, visible: false },
  { key: 'page_listing_url',    label: 'URL ANÚNCIOS PG',  w: '200px', sortable: false, visible: false },
]

// ── Tendências ───────────────────────────────────────────────
export const TREND_COLS: ColDef[] = [
  { key: 'trends_rank',  label: 'RANK',         w: '60px',  sortable: true,  visible: true,  fixed: true },
  { key: 'keyword',      label: 'PALAVRA-CHAVE', w: '260px', sortable: true,  visible: true  },
  { key: 'trends_type',  label: 'TIPO',         w: '120px', sortable: true,  visible: true  },
  { key: 'category_id',  label: 'CATEGORIA',    w: '180px', sortable: true,  visible: true  },
  { key: 'results',      label: 'RESULTADOS',   w: '110px', sortable: true,  visible: true  },
  { key: 'created_at',   label: 'ATUALIZADO',   w: '100px', sortable: true,  visible: true  },
]

// ── Vendedores ───────────────────────────────────────────────
export const USER_COLS: ColDef[] = [
  { key: 'nickname',                              label: 'APELIDO',    w: '160px', sortable: true,  visible: true,  fixed: true },
  { key: 'seller_reputation_level_id',            label: 'REPUTAÇÃO',  w: '110px', sortable: true,  visible: true  },
  { key: 'seller_reputation_power_seller_status', label: 'MEDALHA',   w: '90px',  sortable: true,  visible: true  },
  { key: 'seller_reputation_transactions_total',  label: 'TRANSAÇÕES', w: '110px', sortable: true,  visible: true  },
  { key: 'country_id',                            label: 'PAÍS',       w: '60px',  sortable: true,  visible: true  },
  { key: 'address_state',                         label: 'ESTADO',     w: '130px', sortable: true,  visible: true  },
  { key: 'address_city',                          label: 'CIDADE',     w: '120px', sortable: true,  visible: true  },
  { key: 'user_type',                             label: 'TIPO',       w: '90px',  sortable: true,  visible: true  },
  { key: 'status_site_status',                    label: 'STATUS',     w: '80px',  sortable: true,  visible: true  },
  { key: 'user_id',                               label: 'ID',         w: '90px',  sortable: true,  visible: false },
  { key: 'created_at',                            label: 'CADASTRO',   w: '100px', sortable: true,  visible: false },
]

// ── TOP100 ───────────────────────────────────────────────────
export const TOP100_COLS: ColDef[] = [
  { key: 'ranking',                              label: 'POS',           w: '60px',  sortable: true,  visible: true,  fixed: true },
  { key: 'previous_ranking',                     label: 'POS ANT',       w: '70px',  sortable: true,  visible: true  },
  { key: 'thumbnail',                            label: 'IMG',           w: '60px',  sortable: false, visible: true  },
  { key: 'seller_reputation_level_id',           label: 'REP',           w: '80px',  sortable: true,  visible: true  },
  { key: 'title',                                label: 'TÍTULO',        w: '260px', sortable: true,  visible: true  },
  { key: 'seller_alias',                         label: 'VENDEDOR',      w: '140px', sortable: true,  visible: true  },
  { key: 'seller_reputation_power_seller_status',label: 'MEDALHA',       w: '130px', sortable: true,  visible: true  },
  { key: 'official_store',                       label: 'LOJA OFICIAL',  w: '130px', sortable: true,  visible: false },
  { key: 'variation_01',                         label: 'VAR 1',         w: '100px', sortable: true,  visible: true  },
  { key: 'price',                                label: 'PREÇO',         w: '90px',  sortable: true,  visible: true  },
  { key: 'sold_quantity',                        label: 'VENDAS',        w: '80px',  sortable: true,  visible: true  },
  { key: 'sold_unity',                           label: 'UNIDADES',      w: '80px',  sortable: true,  visible: true  },
  { key: 'logistic_type',                        label: 'LOGÍSTICA',     w: '100px', sortable: true,  visible: true  },
  { key: 'shipping_free_shipping',               label: 'FRETE GRÁTIS',  w: '90px',  sortable: true,  visible: true  },
  { key: 'ads_type',                             label: 'ADS',           w: '80px',  sortable: true,  visible: true  },
  { key: 'listing_health',                       label: 'HEALTH',        w: '80px',  sortable: true,  visible: true  },
  { key: 'purchase_experience',                  label: 'EXPERIÊNCIA',   w: '100px', sortable: true,  visible: true  },
  { key: 'category_id',                          label: 'ID CATEGORIA',  w: '110px', sortable: true,  visible: false },
  { key: 'item_id',                              label: 'ITEM ID',       w: '130px', sortable: false, visible: false },
  { key: 'created_at',                           label: 'ATUALIZADO',    w: '110px', sortable: true,  visible: false },
]

// ── Destaques (mesmas colunas de Anúncios sem variation) ─────
export const HL_COLS: ColDef[] = AN_COLS.filter(c =>
  !['variation_01','variation_02','variation_03','variation_04','product'].includes(c.key)
)

// ── Produtos (sem canal) ─────────────────────────────────────
export const PRODUTO_COLS: ColDef[] = [
  { key: 'thumbnail',        label: 'IMAGEM',      w: '90px',  sortable: false, visible: true,  fixed: true },
  { key: 'title',            label: 'TÍTULO',      w: '260px', sortable: true,  visible: true,  fixed: true },
  { key: 'brand',            label: 'MARCA',       w: '120px', sortable: true,  visible: true  },
  { key: 'category',         label: 'CATEGORIA',   w: '150px', sortable: true,  visible: true  },
  { key: 'price',            label: 'PREÇO',       w: '100px', sortable: true,  visible: true  },
  { key: 'sku',              label: 'SKU',         w: '90px',  sortable: true,  visible: true  },
  { key: 'gtin',             label: 'GTIN',        w: '90px',  sortable: false, visible: false },
  { key: 'status',           label: 'STATUS',      w: '80px',  sortable: true,  visible: true  },
  { key: 'created_at',       label: 'CRIADO EM',   w: '110px', sortable: true,  visible: false },
]

// ── Fornecedores (sem canal) ─────────────────────────────────
export const FORNECEDOR_COLS: ColDef[] = [
  { key: 'name',             label: 'NOME',        w: '200px', sortable: true,  visible: true,  fixed: true },
  { key: 'email',            label: 'E-MAIL',      w: '180px', sortable: true,  visible: true  },
  { key: 'phone',            label: 'TELEFONE',    w: '120px', sortable: false, visible: true  },
  { key: 'country',          label: 'PAÍS',        w: '90px',  sortable: true,  visible: true  },
  { key: 'status',           label: 'STATUS',      w: '80px',  sortable: true,  visible: true  },
  { key: 'created_at',       label: 'CADASTRO',    w: '100px', sortable: true,  visible: false },
]
