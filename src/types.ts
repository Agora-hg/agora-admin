export type User = { id: number; name: string; email: string }

export type Supplier = {
  id: number
  commercial_name: string
  legal_name: string | null
  inn: string
  legal_address: string | null
  logo_url: string | null
  contact_person: string | null
  phone: string | null
  email: string | null
  website: string | null
  telegram: string | null
  telegram_status?: 'none' | 'waiting' | 'linked'
  telegram_linked_at?: string | null
  telegram_first_name?: string | null
  is_active: boolean
  shipping_cities: string[]
}

export type CategoryField = {
  key: string
  label: string
  type: 'string' | 'number' | 'enum' | 'boolean'
  dictionary?: string
  unit?: string
  min?: number
  max?: number
  required?: boolean
  version?: 'v1' | 'v1_optional' | 'v2' | string
  hint?: string
  filter?: boolean
}


export type Category = {
  id: number
  slug: string
  name: string
  priority: string
  sort_order: number
  fields: CategoryField[]
}

export type Offer = {
  id: number
  offer_title: string
  sku?: string | null
  supplier_product_code?: string | null
  supplier_id: number
  supplier?: {
    id: number
    commercial_name: string
    logo_url?: string | null
    inn?: string | null
  }
  category_id: number
  category?: { id: number; slug: string; name: string }
  price_value: number
  price_hidden?: boolean
  currency: string
  price_basis: string
  moq_value: number
  order_step?: number
  stock_status: string
  production_lead_days: number | null
  delivery_lead_days: number | null
  delivery_regions: string[]
  pickup_available: boolean
  payment_terms: string
  vat_rate: string
  branding_available: boolean
  custom_manufacturing?: boolean
  photo_url: string | null
  description_short: string | null
  specs: Record<string, string | number | boolean>
  is_active: boolean
}


export type Paginated<T> = {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export type RfqRecipient = {
  id: number
  supplier_id: number
  status: string
  error: string | null
  sent_at: string | null
  supplier: {
    id: number
    commercial_name: string
    telegram: string | null
    telegram_status: string
  } | null
}

export type Rfq = {
  id: number
  public_id: string
  status: 'new' | 'confirmed' | 'cancelled' | string
  source: string
  buyer_name: string
  buyer_phone: string | null
  buyer_email: string | null
  buyer_company: string | null
  buyer_city: string | null
  comment: string | null
  items: Array<{ title?: string; offer_title?: string; qty?: number; offer_id?: number }>
  recipients?: RfqRecipient[]
  confirmed_at: string | null
  created_at: string | null
}

export type Dictionaries = {
  currencies: string[]
  dictionaries: Record<string, string[]>
}
