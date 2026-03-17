export interface Store {
  id: string; name: string; slug: string; cnpj?: string; phone?: string
  address?: string; logo_url?: string; is_open: boolean; owner_id: string; created_at: string
}
export interface Customer {
  id: string; store_id: string; name: string; phone?: string; email?: string
  address?: string; created_at: string
}
export interface Category {
  id: string; store_id: string; name: string; description?: string
  image_url?: string; sort_order: number; is_active: boolean; created_at: string
}
export interface Product {
  id: string; store_id: string; category_id?: string; name: string
  description?: string; price: number; promotional_price?: number; image_url?: string
  is_active: boolean; serves?: number; preparation_time?: number; sort_order: number
  created_at: string; category?: Category
}
export interface Addon { id: string; group_id: string; name: string; price: number; is_active: boolean; sort_order: number }
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled'
export type OrderType = 'delivery' | 'pickup' | 'table'
export type PaymentMethod = 'cash' | 'credit_card' | 'debit_card' | 'pix' | 'voucher'
export interface Order {
  id: string; store_id: string; customer_id?: string; order_number: number
  status: OrderStatus; order_type: OrderType; table_number?: string
  subtotal: number; discount: number; delivery_fee: number; total: number
  payment_method?: PaymentMethod; payment_status: string; notes?: string
  created_at: string; updated_at: string; customer?: Customer; items?: OrderItem[]
}
export interface OrderItem {
  id: string; order_id: string; product_id: string; quantity: number
  unit_price: number; total_price: number; notes?: string; product?: Product
}
export interface Supply {
  id: string; store_id: string; name: string; unit: string
  current_stock: number; min_stock: number; cost_per_unit: number; created_at: string
}
export interface DailySummary {
  id: string; store_id: string; date: string; total_orders: number
  total_revenue: number; total_discount: number; total_delivery_fees: number
  cash_revenue: number; card_revenue: number; pix_revenue: number; created_at: string
}
export interface DashboardStats {
  today_orders: number; today_revenue: number; pending_orders: number; avg_ticket: number
}

export interface StaffMember {
  id: string;
  display_name: string | null;
  user: { email: string; raw_user_meta_data: { name?: string } } | null;
}