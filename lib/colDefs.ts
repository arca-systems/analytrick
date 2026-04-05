import { ColDef } from '@/types'

// ── Anúncios — porta fiel da extensão (sem pos/pg/ps/offers) ─
export const AN_COLS: ColDef[] = [
  // Fixas
  { key:'thumbnail',              label:'IMAGEM',                          w:'90px',  sortable:false, visible:true,  fixed:true },
  { key:'title',                  label:'TITULO',                          w:'260px', sortable:true,  visible:true,  fixed:true },
  // Padrão visível
  { key:'attributes_brand',       label:'MARCA',                           w:'115px', sortable:true,  visible:true  },
  { key:'original_price',         label:'PREÇO REAL',                      w:'105px', sortable:true,  visible:true  },
  { key:'discount',               label:'DESCONTO',                        w:'90px',  sortable:true,  visible:true  },
  { key:'price',                  label:'PREÇO',                           w:'105px', sortable:true,  visible:true  },
  { key:'sold_quantity',          label:'VENDAS',                          w:'90px',  sortable:true,  visible:true  },
  { key:'receita',                label:'RECEITA',                         w:'130px', sortable:true,  visible:true  },
  { key:'rate_stars',             label:'NOTA',                            w:'65px',  sortable:true,  visible:true  },
  { key:'rate',                   label:'AVALIAÇÕES',                      w:'80px',  sortable:true,  visible:true  },
  { key:'listing',                label:'ANUNCIO',                         w:'130px', sortable:true,  visible:true  },
  { key:'listing_type',           label:'TIPO DE ANUNCIO',                 w:'100px', sortable:true,  visible:true  },
  { key:'installments',           label:'PARCELAMENTO',                    w:'140px', sortable:false, visible:true  },
  { key:'shipping_free_shipping', label:'FRETE',                           w:'65px',  sortable:true,  visible:true  },
  { key:'shipping_logistic_type', label:'LOGÍSTICA',                       w:'100px', sortable:true,  visible:true  },
  { key:'official_store',         label:'LOJA OFICIAL',                    w:'110px', sortable:true,  visible:true  },
  { key:'origin',                 label:'ORIGEM',                          w:'110px', sortable:true,  visible:true  },
  { key:'country',                label:'PAIS',                            w:'60px',  sortable:true,  visible:true  },
  { key:'item_condition',         label:'CONDIÇÃO',                        w:'75px',  sortable:true,  visible:true  },
  { key:'tags',                   label:'TAGS',                            w:'120px', sortable:true,  visible:true  },
  { key:'ads_type',               label:'TIPO DE ADS',                     w:'90px',  sortable:true,  visible:true  },
  // Ocultas por padrão — exatamente como a extensão
  { key:'product',                label:'PRODUTO',                         w:'90px',  sortable:true,  visible:false },
  { key:'variation_01',           label:'VAR 01',                          w:'90px',  sortable:true,  visible:false },
  { key:'variation_02',           label:'VAR 02',                          w:'90px',  sortable:true,  visible:false },
  { key:'variation_03',           label:'VAR 03',                          w:'90px',  sortable:true,  visible:false },
  { key:'variation_04',           label:'VAR 04',                          w:'90px',  sortable:true,  visible:false },
  { key:'attributes_model',       label:'MODELO',                          w:'90px',  sortable:true,  visible:false },
  { key:'attributes_line',        label:'LINHA',                           w:'90px',  sortable:true,  visible:false },
  { key:'attributes',             label:'ATRIBUTOS',                       w:'180px', sortable:false, visible:false },
  { key:'sku',                    label:'SKU',                             w:'90px',  sortable:true,  visible:false },
  { key:'gtin',                   label:'GTIN',                            w:'90px',  sortable:true,  visible:false },
  { key:'product_description',    label:'DESCRIÇÃO PRODUTO',               w:'200px', sortable:false, visible:false },
  { key:'item_description',       label:'DESCRIÇÃO ITEM',                  w:'200px', sortable:false, visible:false },
  { key:'taxa_venda',             label:'TAXA SOBRE VENDA',                w:'90px',  sortable:true,  visible:false },
  { key:'shipping_cost',          label:'FRETE SOBRE VENDA',               w:'90px',  sortable:true,  visible:false },
  { key:'impostos',               label:'IMPOSTO SOBRE VENDA',             w:'90px',  sortable:true,  visible:false },
  { key:'receita_liquida',        label:'RECEITA LÍQUIDA',                 w:'110px', sortable:true,  visible:false },
  { key:'preco_custo',            label:'PREÇO DE CUSTO',                  w:'110px', sortable:true,  visible:false },
  { key:'lucro_bruto',            label:'LUCRO BRUTO',                     w:'110px', sortable:true,  visible:false },
  { key:'pct_lb',                 label:'LB / PC',                         w:'75px',  sortable:true,  visible:false },
  { key:'pct_lb_pv',              label:'LB / PV',                         w:'75px',  sortable:true,  visible:false },
  { key:'avaiable_quantity',      label:'ESTOQUE',                         w:'80px',  sortable:true,  visible:false },
  { key:'item_sold_quantity',     label:'VENDAS ITEM',                     w:'90px',  sortable:true,  visible:false },
  { key:'receita_item',           label:'RECEITA ITEM',                    w:'120px', sortable:true,  visible:false },
  { key:'vendas_dia',             label:'VENDAS / DIA',                    w:'90px',  sortable:true,  visible:false },
  { key:'vendas_item_dia',        label:'VENDAS ITEM / DIA',               w:'100px', sortable:true,  visible:false },
  { key:'health',                 label:'SAÚDE',                           w:'70px',  sortable:true,  visible:false },
  { key:'visits',                 label:'VISITAS',                         w:'80px',  sortable:true,  visible:false },
  { key:'conversao',              label:'CONVERSÃO',                       w:'80px',  sortable:true,  visible:false },
  { key:'shipping_mode',          label:'MODO',                            w:'70px',  sortable:true,  visible:false },
  { key:'seller_name',            label:'APELIDO',                         w:'110px', sortable:true,  visible:false },
  { key:'user_type',              label:'TIPO DE USUÁRIO',                 w:'100px', sortable:true,  visible:false },
  { key:'address_state',          label:'ESTADO',                          w:'80px',  sortable:true,  visible:false },
  { key:'address_city',           label:'CIDADE',                          w:'100px', sortable:true,  visible:false },
  { key:'reputation_level',       label:'REPUTAÇÃO',                       w:'100px', sortable:true,  visible:false },
  { key:'power_seller_status',    label:'MEDALHA',                         w:'80px',  sortable:true,  visible:false },
  { key:'catalog_product_created_at', label:'PRODUTO CATÁLOGO CRIADO EM', w:'130px', sortable:true,  visible:false },
  { key:'catalog_product_updated_at', label:'PRODUTO CATÁLOGO ATUALIZADO', w:'130px', sortable:true,  visible:false },
  { key:'user_product_created_at',    label:'PRODUTO USUÁRIO CRIADO EM',  w:'130px', sortable:true,  visible:false },
  { key:'user_product_updated_at',    label:'PRODUTO USUÁRIO ATUALIZADO', w:'130px', sortable:true,  visible:false },
  { key:'item_created_at',            label:'ITEM CRIADO EM',             w:'110px', sortable:true,  visible:false },
  { key:'item_updated_at',            label:'ITEM ATUALIZADO EM',         w:'110px', sortable:true,  visible:false },
  { key:'catalog_product_days',       label:'PRODUTO CATÁLOGO DIAS',      w:'100px', sortable:true,  visible:false },
  { key:'user_product_days',          label:'PRODUTO USUÁRIO DIAS',       w:'100px', sortable:true,  visible:false },
  { key:'item_updated_days',          label:'ITEM DIAS',                  w:'80px',  sortable:true,  visible:false },
  { key:'category_parent',        label:'CATEGORIA PAI',                   w:'180px', sortable:true,  visible:false },
  { key:'category_name',          label:'CATEGORIA',                       w:'220px', sortable:true,  visible:false },
  { key:'item_tags',              label:'TAGS ITEM',                       w:'160px', sortable:false, visible:false },
  { key:'shipping_tags',          label:'TAGS ENVIO',                      w:'160px', sortable:false, visible:false },
  { key:'permalink',              label:'URL ANUNCIO',                     w:'200px', sortable:false, visible:false },
  { key:'status',                 label:'STATUS',                          w:'80px',  sortable:true,  visible:false },
  { key:'domain_id',              label:'ID DOMINIO',                      w:'120px', sortable:true,  visible:false },
  { key:'category_id',            label:'ID CATEGORIA',                    w:'120px', sortable:true,  visible:false },
  { key:'catalog_product_id',     label:'ID PRODUTO CATÁLOGO',             w:'130px', sortable:true,  visible:false },
  { key:'user_product_id',        label:'ID PRODUTO USUÁRIO',              w:'130px', sortable:true,  visible:false },
  { key:'item_id',                label:'ID ITEM',                         w:'120px', sortable:true,  visible:false },
  { key:'seller_id',              label:'ID USUÁRIO',                      w:'120px', sortable:true,  visible:false },
  { key:'official_store_id',      label:'ID LOJA OFICIAL',                 w:'130px', sortable:true,  visible:false },
  { key:'inventory_id',           label:'ID INVENTÁRIO',                   w:'120px', sortable:true,  visible:false },
  { key:'brand_id',               label:'ID MARCA',                        w:'110px', sortable:true,  visible:false },
  { key:'listing_type_id',        label:'ID TIPO DE ANUNCIO',              w:'130px', sortable:true,  visible:false },
]

// ── Categorias (ML) — tabela: mercadolibre_categories ───────
export const CAT_COLS: ColDef[] = [
  { key:'category_parent', label:'CATEGORIA PAI',  w:'180px', sortable:true,  visible:true,  fixed:true },
  { key:'category_tree',   label:'CATEGORIA',      w:'300px', sortable:true,  visible:true,  fixed:true },
  { key:'category_name',   label:'NOME',           w:'160px', sortable:true,  visible:true  },
  { key:'items',           label:'ITENS',          w:'90px',  sortable:true,  visible:true  },
  { key:'vertical',        label:'VERTICAL',       w:'90px',  sortable:true,  visible:true  },
  { key:'subvertical',     label:'SUBVERTICAL',    w:'100px', sortable:true,  visible:true  },
  { key:'subdomain',       label:'SUBDOMÍNIO',     w:'100px', sortable:true,  visible:true  },
  { key:'listing_allowed', label:'ANUNCIÁVEL',     w:'90px',  sortable:true,  visible:true  },
  { key:'date_created',    label:'CRIAÇÃO',        w:'100px', sortable:true,  visible:true  },
  { key:'gold_special_fee',label:'TAXA CLÁSSICO',  w:'110px', sortable:true,  visible:true  },
  { key:'gold_pro_fee',    label:'TAXA PREMIUM',   w:'110px', sortable:true,  visible:true  },
  { key:'category_tags',   label:'TAGS',           w:'140px', sortable:false, visible:false },
  { key:'category_id',     label:'ID CATEGORIA',   w:'110px', sortable:true,  visible:false },
  { key:'catalog_domain',  label:'ID DOMÍNIO',     w:'130px', sortable:false, visible:false },
  { key:'permalink',       label:'URL',            w:'100px', sortable:false, visible:false },
]

// ── Categorias (Home) — tabela: categories ───────────────────
export const HOME_CAT_COLS: ColDef[] = [
  { key:'category',                label:'CATEGORIA',          w:'220px', sortable:true,  visible:true,  fixed:true },
  { key:'mercadolibre_category_id',label:'ID MERCADO LIVRE',   w:'160px', sortable:true,  visible:true  },
  { key:'shopee_category_id',      label:'ID SHOPEE',          w:'130px', sortable:true,  visible:true  },
  { key:'amazon_category_id',      label:'ID AMAZON',          w:'130px', sortable:true,  visible:true  },
  { key:'magazineluiza_category_id',label:'ID MAGALU',         w:'130px', sortable:true,  visible:true  },
  { key:'created_at',              label:'CRIADO EM',          w:'110px', sortable:true,  visible:false },
]

// ── Marcas (sem canal) — tabela: brands ─────────────────────
export const BRAND_COLS: ColDef[] = [
  { key:'brand',           label:'MARCA',      w:'200px', sortable:true,  visible:true,  fixed:true },
  { key:'country',         label:'PAÍS',       w:'90px',  sortable:true,  visible:true  },
  { key:'brand_url',       label:'SITE',       w:'200px', sortable:false, visible:true  },
  { key:'brand_instagram', label:'INSTAGRAM',  w:'160px', sortable:false, visible:true  },
  { key:'brand_facebook',  label:'FACEBOOK',   w:'160px', sortable:false, visible:false },
  { key:'brand_youtube',   label:'YOUTUBE',    w:'160px', sortable:false, visible:false },
  { key:'brand_tiktok',    label:'TIKTOK',     w:'160px', sortable:false, visible:false },
  { key:'created_at',      label:'CRIADO EM',  w:'110px', sortable:true,  visible:false },
]

// ── Tendências (ML) — tabela: mercadolibre_trends ───────────
export const TREND_COLS: ColDef[] = [
  { key:'trends_rank', label:'RANK',          w:'60px',  sortable:true,  visible:true,  fixed:true },
  { key:'keyword',     label:'PALAVRA-CHAVE', w:'260px', sortable:true,  visible:true  },
  { key:'trends_type', label:'TIPO',          w:'120px', sortable:true,  visible:true  },
  { key:'category_id', label:'CATEGORIA',     w:'180px', sortable:true,  visible:true  },
  { key:'results',     label:'RESULTADOS',    w:'110px', sortable:true,  visible:true  },
  { key:'created_at',  label:'ATUALIZADO',    w:'100px', sortable:true,  visible:true  },
]

// ── Tendências (Home) — tabela: trends ───────────────────────
export const HOME_TREND_COLS: ColDef[] = [
  { key:'id',         label:'ID',         w:'80px',  sortable:true, visible:true, fixed:true },
  { key:'created_at', label:'CRIADO EM',  w:'160px', sortable:true, visible:true },
]

// ── Vendedores ───────────────────────────────────────────────
export const USER_COLS: ColDef[] = [
  { key:'nickname',                              label:'APELIDO',    w:'160px', sortable:true,  visible:true,  fixed:true },
  { key:'seller_reputation_level_id',            label:'REPUTAÇÃO',  w:'110px', sortable:true,  visible:true  },
  { key:'seller_reputation_power_seller_status', label:'MEDALHA',    w:'90px',  sortable:true,  visible:true  },
  { key:'seller_reputation_transactions_total',  label:'TRANSAÇÕES', w:'110px', sortable:true,  visible:true  },
  { key:'country_id',                            label:'PAÍS',       w:'60px',  sortable:true,  visible:true  },
  { key:'address_state',                         label:'ESTADO',     w:'130px', sortable:true,  visible:true  },
  { key:'address_city',                          label:'CIDADE',     w:'120px', sortable:true,  visible:true  },
  { key:'user_type',                             label:'TIPO',       w:'90px',  sortable:true,  visible:true  },
  { key:'status_site_status',                    label:'STATUS',     w:'80px',  sortable:true,  visible:true  },
  { key:'user_id',                               label:'ID',         w:'90px',  sortable:true,  visible:false },
  { key:'created_at',                            label:'CADASTRO',   w:'100px', sortable:true,  visible:false },
]

// ── TOP100 ───────────────────────────────────────────────────
export const TOP100_COLS: ColDef[] = [
  { key:'ranking',                               label:'POS',          w:'60px',  sortable:true,  visible:true,  fixed:true },
  { key:'previous_ranking',                      label:'POS ANT',      w:'70px',  sortable:true,  visible:true  },
  { key:'thumbnail',                             label:'IMG',          w:'60px',  sortable:false, visible:true  },
  { key:'seller_reputation_level_id',            label:'REP',          w:'80px',  sortable:true,  visible:true  },
  { key:'title',                                 label:'TÍTULO',       w:'260px', sortable:true,  visible:true  },
  { key:'seller_alias',                          label:'VENDEDOR',     w:'140px', sortable:true,  visible:true  },
  { key:'seller_reputation_power_seller_status', label:'MEDALHA',      w:'130px', sortable:true,  visible:true  },
  { key:'official_store',                        label:'LOJA OFICIAL', w:'130px', sortable:true,  visible:false },
  { key:'variation_01',                          label:'VAR 1',        w:'100px', sortable:true,  visible:true  },
  { key:'price',                                 label:'PREÇO',        w:'90px',  sortable:true,  visible:true  },
  { key:'sold_quantity',                         label:'VENDAS',       w:'80px',  sortable:true,  visible:true  },
  { key:'sold_unity',                            label:'UNIDADES',     w:'80px',  sortable:true,  visible:true  },
  { key:'logistic_type',                         label:'LOGÍSTICA',    w:'100px', sortable:true,  visible:true  },
  { key:'shipping_free_shipping',                label:'FRETE GRÁTIS', w:'90px',  sortable:true,  visible:true  },
  { key:'ads_type',                              label:'ADS',          w:'80px',  sortable:true,  visible:true  },
  { key:'listing_health',                        label:'HEALTH',       w:'80px',  sortable:true,  visible:true  },
  { key:'purchase_experience',                   label:'EXPERIÊNCIA',  w:'100px', sortable:true,  visible:true  },
  { key:'category_id',                           label:'ID CATEGORIA', w:'110px', sortable:true,  visible:false },
  { key:'item_id',                               label:'ITEM ID',      w:'130px', sortable:false, visible:false },
  { key:'created_at',                            label:'ATUALIZADO',   w:'110px', sortable:true,  visible:false },
]

// ── Produtos (sem canal) — tabela: products ──────────────────
export const PRODUTO_COLS: ColDef[] = [
  { key:'brand',            label:'MARCA',       w:'130px', sortable:true,  visible:true,  fixed:true },
  { key:'category',         label:'CATEGORIA',   w:'150px', sortable:true,  visible:true  },
  { key:'model',            label:'MODELO',      w:'160px', sortable:true,  visible:true  },
  { key:'line',             label:'LINHA',        w:'120px', sortable:true,  visible:true  },
  { key:'version',          label:'VERSÃO',       w:'100px', sortable:true,  visible:true  },
  { key:'serie',            label:'SÉRIE',        w:'100px', sortable:true,  visible:true  },
  { key:'origin',           label:'ORIGEM',       w:'100px', sortable:true,  visible:true  },
  { key:'sku',              label:'SKU',          w:'110px', sortable:true,  visible:true  },
  { key:'gtin',             label:'GTIN',         w:'130px', sortable:true,  visible:true  },
  { key:'spu',              label:'SPU',          w:'110px', sortable:true,  visible:false },
  { key:'skc',              label:'SKC',          w:'110px', sortable:true,  visible:false },
  { key:'mpn',              label:'MPN',          w:'110px', sortable:true,  visible:false },
  { key:'oem',              label:'OEM',          w:'110px', sortable:true,  visible:false },
  { key:'pn',               label:'PN',           w:'90px',  sortable:true,  visible:false },
  { key:'sn',               label:'SN',           w:'90px',  sortable:true,  visible:false },
  { key:'alphanumeric_model',label:'MOD. ALFA',   w:'120px', sortable:true,  visible:false },
  { key:'attributes',       label:'ATRIBUTOS',    w:'180px', sortable:false, visible:false },
  { key:'variations',       label:'VARIAÇÕES',    w:'180px', sortable:false, visible:false },
]

// ── Fornecedores (sem canal) — tabela: suppliers ─────────────
// Tabela ainda sem estrutura definida — colunas genéricas
export const FORNECEDOR_COLS: ColDef[] = [
  { key:'name',       label:'NOME',     w:'200px', sortable:true,  visible:true,  fixed:true },
  { key:'email',      label:'E-MAIL',   w:'180px', sortable:true,  visible:true  },
  { key:'phone',      label:'TELEFONE', w:'120px', sortable:false, visible:true  },
  { key:'country',    label:'PAÍS',     w:'90px',  sortable:true,  visible:true  },
  { key:'status',     label:'STATUS',   w:'80px',  sortable:true,  visible:true  },
  { key:'created_at', label:'CADASTRO', w:'100px', sortable:true,  visible:false },
]

// ── Destaques (mesmas de anúncios sem variation) ─────────────
export const HL_COLS: ColDef[] = AN_COLS.filter(c =>
  !['variation_01','variation_02','variation_03','variation_04','product'].includes(c.key)
)
