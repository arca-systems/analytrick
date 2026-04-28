// ============================================================
// ANALYTRICK | lib/colDefs.ts
// Definição de colunas por módulo
// ============================================================

export interface ColDef {
  key: string
  label: string
  w: string          // largura mínima — sempre >= comprimento do label * ~8px
  sortable: boolean
  visible: boolean
  fixed?: boolean    // col fixa (não pode ocultar)
  filterable?: boolean  // false = sem filtro (ex: thumbnail, title)
  numeric?: boolean  // true = sort/filtro numérico
}

// ── Anúncios ML ─────────────────────────────────────────────
// Regra de largura: w >= (label.length * 8) + 24px de padding
// Regra filterable: thumbnail=false, title=false
// Regra numeric: preços, quantidades, percentuais, health, visits
export const AN_COLS: ColDef[] = [
  // FIXAS
  { key: 'thumbnail',             label: 'IMAGEM',              w: '70px',  sortable: false, filterable: false, visible: true,  fixed: true  },
  { key: 'title',                 label: 'TÍTULO',              w: '280px', sortable: true,  filterable: false, visible: true,  fixed: true  },
  // VISÍVEIS POR PADRÃO
  { key: 'price',                 label: 'PREÇO',               w: '90px',  sortable: true,  numeric: true,  visible: true  },
  { key: 'original_price',        label: 'PREÇO REAL',          w: '105px', sortable: true,  numeric: true,  visible: true  },
  { key: 'sold_quantity',         label: 'VENDAS',              w: '80px',  sortable: true,  numeric: true,  visible: true  },
  { key: 'receita',               label: 'RECEITA',             w: '100px', sortable: true,  numeric: true,  visible: true  },
  { key: 'listing',               label: 'ANUNCIO',             w: '120px', sortable: true,  visible: true  },
  { key: 'listing_type',          label: 'TIPO DE ANUNCIO',     w: '130px', sortable: true,  visible: true  },
  { key: 'shipping_free_shipping',label: 'FRETE',               w: '75px',  sortable: true,  visible: true  },
  { key: 'shipping_logistic_type',label: 'LOGÍSTICA',           w: '90px',  sortable: true,  visible: true  },
  { key: 'attributes_brand',      label: 'MARCA',               w: '100px', sortable: true,  visible: true  },
  { key: 'official_store',        label: 'LOJA OFICIAL',        w: '110px', sortable: true,  visible: true  },
  { key: 'item_condition',        label: 'CONDIÇÃO',            w: '90px',  sortable: true,  visible: true  },
  { key: 'status',                label: 'STATUS',              w: '80px',  sortable: true,  visible: true  },
  // OCULTAS POR PADRÃO
  { key: 'discount',              label: 'DESCONTO',            w: '95px',  sortable: false, visible: false },
  { key: 'attributes_model',      label: 'MODELO',              w: '90px',  sortable: true,  visible: false },
  { key: 'attributes_line',       label: 'LINHA',               w: '80px',  sortable: true,  visible: false },
  { key: 'sku',                   label: 'SKU',                 w: '90px',  sortable: true,  visible: false },
  { key: 'gtin',                  label: 'GTIN',                w: '80px',  sortable: true,  visible: false },
  { key: 'avaiable_quantity',     label: 'ESTOQUE',             w: '85px',  sortable: true,  numeric: true, visible: false },
  { key: 'item_sold_quantity',    label: 'VENDAS ITEM',         w: '105px', sortable: true,  numeric: true, visible: false },
  { key: 'receita_item',          label: 'RECEITA ITEM',        w: '115px', sortable: true,  numeric: true, visible: false },
  { key: 'vendas_dia',            label: 'VENDAS / DIA',        w: '100px', sortable: true,  numeric: true, visible: false },
  { key: 'health',                label: 'SAÚDE',               w: '75px',  sortable: true,  numeric: true, visible: false },
  { key: 'visits',                label: 'VISITAS',             w: '80px',  sortable: true,  numeric: true, visible: false },
  { key: 'conversao',             label: 'CONVERSÃO',           w: '95px',  sortable: true,  numeric: true, visible: false },
  { key: 'rate',                  label: 'AVALIAÇÕES',          w: '100px', sortable: true,  numeric: true, visible: false },
  { key: 'rate_stars',            label: 'NOTA',                w: '75px',  sortable: true,  numeric: true, visible: false },
  { key: 'shipping_mode',         label: 'MODO',                w: '75px',  sortable: true,  visible: false },
  { key: 'shipping_tags',         label: 'TAGS ENVIO',          w: '115px', sortable: false, filterable: false, visible: false },
  { key: 'reputation_level',      label: 'REPUTAÇÃO',           w: '100px', sortable: true,  visible: false },
  { key: 'power_seller_status',   label: 'MEDALHA',             w: '90px',  sortable: true,  visible: false },
  { key: 'seller_name',           label: 'APELIDO',             w: '90px',  sortable: true,  visible: false },
  { key: 'user_type',             label: 'TIPO DE USUÁRIO',     w: '130px', sortable: true,  visible: false },
  { key: 'address_state',         label: 'ESTADO',              w: '80px',  sortable: true,  visible: false },
  { key: 'address_city',          label: 'CIDADE',              w: '90px',  sortable: true,  visible: false },
  { key: 'gold_special_fee',      label: 'TAXA CLÁSSICO',       w: '120px', sortable: true,  numeric: true, visible: false },
  { key: 'gold_pro_fee',          label: 'TAXA PREMIUM',        w: '120px', sortable: true,  numeric: true, visible: false },
  { key: 'billable_weight',       label: 'PESO COBRADO',        w: '120px', sortable: true,  numeric: true, visible: false },
  { key: 'item_created_at',       label: 'CRIADO EM',           w: '105px', sortable: true,  visible: false },
  { key: 'item_updated_at',       label: 'ATUALIZADO EM',       w: '130px', sortable: true,  visible: false },
  { key: 'catalog_product_days',  label: 'DIAS CATÁLOGO',       w: '125px', sortable: true,  numeric: true, visible: false },
  { key: 'user_product_days',     label: 'DIAS PRODUTO',        w: '120px', sortable: true,  numeric: true, visible: false },
  { key: 'item_updated_days',     label: 'ITEM DIAS',           w: '95px',  sortable: true,  numeric: true, visible: false },
  { key: 'category_parent',       label: 'CATEGORIA PAI',       w: '130px', sortable: true,  visible: false },
  { key: 'category_name',         label: 'CATEGORIA',           w: '110px', sortable: true,  visible: false },
  { key: 'permalink',             label: 'URL ANUNCIO',         w: '115px', sortable: false, filterable: false, visible: false },
  { key: 'seller_id',             label: 'ID USUÁRIO',          w: '105px', sortable: true,  visible: false },
  { key: 'category_id',           label: 'ID CATEGORIA',        w: '120px', sortable: true,  visible: false },
  { key: 'listing_type_id',       label: 'ID TIPO DE ANUNCIO',  w: '155px', sortable: true,  visible: false },
  { key: 'item_id',               label: 'ID ITEM',             w: '90px',  sortable: true,  visible: false },
]

// ── Categorias ML ────────────────────────────────────────────
export const CAT_COLS: ColDef[] = [
  { key: 'category_parent', label: 'CATEGORIA PAI', w: '180px', sortable: true,  visible: true,  fixed: true  },
  { key: 'category_tree',   label: 'CATEGORIA',     w: '300px', sortable: true,  visible: true,  fixed: true  },
  { key: 'category_name',   label: 'NOME',          w: '90px',  sortable: true,  visible: true  },
  { key: 'items',           label: 'ITENS',         w: '75px',  sortable: true,  numeric: true, visible: true  },
  { key: 'vertical',        label: 'VERTICAL',      w: '90px',  sortable: true,  visible: true  },
  { key: 'subvertical',     label: 'SUBVERTICAL',   w: '110px', sortable: true,  visible: true  },
  { key: 'subdomain',       label: 'SUBDOMÍNIO',    w: '105px', sortable: true,  visible: true  },
  { key: 'listing_allowed', label: 'ANUNCIÁVEL',    w: '105px', sortable: true,  visible: true  },
  { key: 'date_created',    label: 'CRIAÇÃO',       w: '90px',  sortable: true,  visible: true  },
  { key: 'gold_special_fee',label: 'TAXA CLÁSSICO', w: '120px', sortable: true,  numeric: true, visible: true  },
  { key: 'gold_pro_fee',    label: 'TAXA PREMIUM',  w: '120px', sortable: true,  numeric: true, visible: true  },
  { key: 'category_tags',   label: 'TAGS',          w: '75px',  sortable: false, visible: false },
  { key: 'category_id',     label: 'ID CATEGORIA',  w: '120px', sortable: true,  visible: false },
  { key: 'catalog_domain',  label: 'ID DOMÍNIO',    w: '105px', sortable: false, visible: false },
  { key: 'permalink',       label: 'URL',           w: '65px',  sortable: false, filterable: false, visible: false },
]

// ── Marcas ML ────────────────────────────────────────────────
export const ML_BRAND_COLS: ColDef[] = [
  { key: 'brand',             label: 'MARCA',            w: '160px', sortable: true,  visible: true,  fixed: true },
  { key: 'results',           label: 'RESULTADOS',       w: '115px', sortable: true,  numeric: true, visible: true  },
  { key: 'brand_listing_url', label: 'URL ANÚNCIOS',     w: '120px', sortable: false, filterable: false, visible: true  },
  { key: 'oficial_store_url', label: 'URL LOJA OFICIAL', w: '145px', sortable: false, filterable: false, visible: false },
  { key: 'store_url',         label: 'URL LOJA',         w: '100px', sortable: false, filterable: false, visible: false },
]

// ── Tendências ML ────────────────────────────────────────────
export const TREND_COLS: ColDef[] = [
  { key: 'trends_rank', label: 'RANK',          w: '75px',  sortable: true,  numeric: true, visible: true, fixed: true },
  { key: 'keyword',     label: 'PALAVRA-CHAVE', w: '140px', sortable: true,  visible: true  },
  { key: 'trends_type', label: 'TIPO',          w: '75px',  sortable: true,  visible: true  },
  { key: 'category_id', label: 'CATEGORIA',     w: '110px', sortable: true,  visible: true  },
  { key: 'results',     label: 'RESULTADOS',    w: '115px', sortable: true,  numeric: true, visible: true  },
  { key: 'created_at',  label: 'ATUALIZADO',    w: '110px', sortable: true,  visible: true  },
]

// ── Vendedores ML ────────────────────────────────────────────
export const USER_COLS: ColDef[] = [
  { key: 'nickname',                              label: 'APELIDO',    w: '160px', sortable: true, visible: true, fixed: true },
  { key: 'seller_reputation_level_id',            label: 'REPUTAÇÃO',  w: '105px', sortable: true, visible: true  },
  { key: 'seller_reputation_power_seller_status', label: 'MEDALHA',    w: '95px',  sortable: true, visible: true  },
  { key: 'seller_reputation_transactions_total',  label: 'TRANSAÇÕES', w: '115px', sortable: true, numeric: true, visible: true  },
  { key: 'country_id',                            label: 'PAÍS',       w: '65px',  sortable: true, visible: true  },
  { key: 'address_state',                         label: 'ESTADO',     w: '80px',  sortable: true, visible: true  },
  { key: 'address_city',                          label: 'CIDADE',     w: '90px',  sortable: true, visible: true  },
  { key: 'user_type',                             label: 'TIPO',       w: '75px',  sortable: true, visible: true  },
  { key: 'status_site_status',                    label: 'STATUS',     w: '80px',  sortable: true, visible: true  },
  { key: 'user_id',                               label: 'ID',         w: '65px',  sortable: true, visible: false },
  { key: 'created_at',                            label: 'CADASTRO',   w: '105px', sortable: true, visible: false },
]

// ── TOP100 ────────────────────────────────────────────────────
export const TOP100_COLS: ColDef[] = [
  { key: 'ranking',                               label: 'POS',          w: '60px',  sortable: true,  numeric: true, visible: true, fixed: true },
  { key: 'previous_ranking',                      label: 'POS ANT',      w: '90px',  sortable: true,  numeric: true, visible: true  },
  { key: 'thumbnail',                             label: 'IMG',          w: '60px',  sortable: false, filterable: false, visible: true  },
  { key: 'seller_reputation_level_id',            label: 'REP',          w: '60px',  sortable: true,  visible: true  },
  { key: 'title',                                 label: 'TÍTULO',       w: '260px', sortable: true,  filterable: false, visible: true  },
  { key: 'seller_alias',                          label: 'VENDEDOR',     w: '95px',  sortable: true,  visible: true  },
  { key: 'seller_reputation_power_seller_status', label: 'MEDALHA',      w: '90px',  sortable: true,  visible: true  },
  { key: 'official_store',                        label: 'LOJA OFICIAL', w: '130px', sortable: true,  visible: false },
  { key: 'variation_01',                          label: 'VAR 1',        w: '75px',  sortable: true,  visible: true  },
  { key: 'price',                                 label: 'PREÇO',        w: '80px',  sortable: true,  numeric: true, visible: true  },
  { key: 'sold_quantity',                         label: 'VENDAS',       w: '80px',  sortable: true,  numeric: true, visible: true  },
  { key: 'sold_unity',                            label: 'UNIDADES',     w: '95px',  sortable: true,  numeric: true, visible: true  },
  { key: 'logistic_type',                         label: 'LOGÍSTICA',    w: '100px', sortable: true,  visible: true  },
  { key: 'shipping_free_shipping',                label: 'FRETE GRÁTIS', w: '115px', sortable: true,  visible: true  },
  { key: 'ads_type',                              label: 'ADS',          w: '65px',  sortable: true,  visible: true  },
  { key: 'listing_health',                        label: 'HEALTH',       w: '80px',  sortable: true,  numeric: true, visible: true  },
  { key: 'purchase_experience',                   label: 'EXPERIÊNCIA',  w: '115px', sortable: true,  numeric: true, visible: true  },
  { key: 'category_id',                           label: 'ID CATEGORIA', w: '125px', sortable: true,  visible: false },
  { key: 'item_id',                               label: 'ITEM ID',      w: '90px',  sortable: false, visible: false },
  { key: 'created_at',                            label: 'ATUALIZADO',   w: '110px', sortable: true,  visible: false },
]

// ── Home: Categorias ─────────────────────────────────────────
export const HOME_CAT_COLS: ColDef[] = [
  { key: 'category',                label: 'CATEGORIA',        w: '200px', sortable: true, visible: true, fixed: true },
  { key: 'mercadolibre_category_id',label: 'ID MERCADO LIVRE', w: '160px', sortable: true, visible: true  },
  { key: 'shopee_category_id',      label: 'ID SHOPEE',        w: '115px', sortable: true, visible: true  },
  { key: 'amazon_category_id',      label: 'ID AMAZON',        w: '115px', sortable: true, visible: true  },
  { key: 'magazineluiza_category_id',label:'ID MAGALU',         w: '110px', sortable: true, visible: true  },
]

// ── Home: Marcas ─────────────────────────────────────────────
export const BRAND_COLS: ColDef[] = [
  { key: 'brand',          label: 'MARCA',     w: '160px', sortable: true, visible: true, fixed: true },
  { key: 'country',        label: 'PAÍS',      w: '65px',  sortable: true, visible: true  },
  { key: 'brand_url',      label: 'SITE',      w: '65px',  sortable: false, filterable: false, visible: true  },
  { key: 'brand_instagram',label: 'INSTAGRAM', w: '110px', sortable: true, visible: true  },
  { key: 'brand_facebook', label: 'FACEBOOK',  w: '100px', sortable: true, visible: false },
  { key: 'brand_youtube',  label: 'YOUTUBE',   w: '95px',  sortable: true, visible: false },
  { key: 'brand_tiktok',   label: 'TIKTOK',    w: '90px',  sortable: true, visible: false },
]

// ── Home: Produtos ───────────────────────────────────────────
export const PRODUTO_COLS: ColDef[] = [
  { key: 'brand',               label: 'MARCA',      w: '130px', sortable: true, visible: true, fixed: true },
  { key: 'category',            label: 'CATEGORIA',  w: '110px', sortable: true, visible: true  },
  { key: 'model',               label: 'MODELO',     w: '90px',  sortable: true, visible: true  },
  { key: 'sku',                 label: 'SKU',        w: '75px',  sortable: true, visible: true  },
  { key: 'variations',          label: 'VARIAÇÕES',  w: '100px', sortable: false, filterable: false, visible: true  },
  { key: 'attributes',          label: 'ATRIBUTOS',  w: '110px', sortable: false, filterable: false, visible: true  },
  { key: 'line',                label: 'LINHA',      w: '80px',  sortable: true, visible: false },
  { key: 'version',             label: 'VERSÃO',     w: '80px',  sortable: true, visible: false },
  { key: 'serie',               label: 'SÉRIE',      w: '75px',  sortable: true, visible: false },
  { key: 'origin',              label: 'ORIGEM',     w: '80px',  sortable: true, visible: false },
  { key: 'gtin',                label: 'GTIN',       w: '75px',  sortable: true, visible: false },
  { key: 'spu',                 label: 'SPU',        w: '65px',  sortable: true, visible: false },
  { key: 'skc',                 label: 'SKC',        w: '65px',  sortable: true, visible: false },
  { key: 'alphanumeric_model',  label: 'MOD. ALFA',  w: '105px', sortable: true, visible: false },
  { key: 'mpn',                 label: 'MPN',        w: '65px',  sortable: true, visible: false },
  { key: 'oem',                 label: 'OEM',        w: '65px',  sortable: true, visible: false },
]

// ── Home: Fornecedores ───────────────────────────────────────
export const FORNECEDOR_COLS: ColDef[] = [
  { key: 'supplier',   label: 'FORNECEDOR', w: '200px', sortable: true, visible: true, fixed: true },
  { key: 'id',         label: 'ID',         w: '65px',  sortable: true, visible: false },
  { key: 'created_at', label: 'CADASTRO',   w: '105px', sortable: true, visible: false },
]

// ── Home: Tendências ─────────────────────────────────────────
export const HOME_TREND_COLS: ColDef[] = [
  { key: 'id',         label: 'ID',       w: '65px',  sortable: true, visible: true },
  { key: 'created_at', label: 'CRIADO EM',w: '105px', sortable: true, visible: true },
]

// ── Helper: retorna colDefs correto por canal + módulo ───────
export function INIT_COLS(channel: string | null, tab: string): ColDef[] {
  if (!channel || channel === 'none') {
    switch (tab) {
      case 'categorias':   return HOME_CAT_COLS
      case 'marcas':       return BRAND_COLS
      case 'produtos':     return PRODUTO_COLS
      case 'fornecedores': return FORNECEDOR_COLS
      case 'tendencias':   return HOME_TREND_COLS
      default:             return []
    }
  }
  // Canal ML
  switch (tab) {
    case 'anuncios':    return AN_COLS
    case 'categorias':  return CAT_COLS
    case 'marcas':      return ML_BRAND_COLS
    case 'vendedores':  return USER_COLS
    case 'tendencias':  return TREND_COLS
    default:            return []
  }
}
