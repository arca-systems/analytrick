// Espelha as tabelas do Supabase — mesma estrutura da extensão

export interface MLItem {
  item_id:               string
  title:                 string
  price:                 number
  original_price?:       number
  sold_quantity?:        number
  item_sold_quantity?:   number
  available_quantity?:   number
  listing_type_id?:      string
  listing_type?:         string
  category_id?:          string
  seller_id?:            number
  seller_name?:          string
  reputation_level?:     string
  power_seller_status?:  string
  official_store?:       string
  shipping_mode?:        string
  shipping_logistic_type?: string
  shipping_tags?:        string
  free_shipping?:        boolean
  attributes_brand?:     string
  attributes_model?:     string
  attributes?:           string
  thumbnail?:            string
  permalink?:            string
  gold_pro_fee?:         number
  gold_special_fee?:     number
  billable_weight?:      number
  health?:               number
  visits?:               number
  item_created_at?:      string
  item_updated_at?:      string
  catalog_product_id?:   string
  receita?:              number
  status?:               string
}

export interface MLCategory {
  category_id:     string
  category_name:   string
  category_parent: string
  category_tree:   string
  gold_pro_fee?:   number
  gold_special_fee?: number
}

export interface MLUser {
  user_id:              number
  seller_name?:         string
  reputation_level?:    string
  power_seller_status?: string
  official_store?:      string
  address_state?:       string
  address_city?:        string
}

export interface User {
  id:               number
  name:             string
  email:            string
  role:             'admin' | 'tester' | 'user'
  status:           string
  plan?:            string
  plan_status?:     string
  expires_at?:      string
  searches_used?:   number
  searches_limit?:  number
}

// Filtros e ordenação
export type SortDir = 'asc' | 'desc'

export interface TableFilter {
  [key: string]: Set<string>
}

export interface PaginationState {
  page:     number
  pageSize: number
  total:    number
}
