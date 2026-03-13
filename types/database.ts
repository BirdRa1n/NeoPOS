export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
export type OrderType = 'delivery' | 'pickup' | 'table';
export type PaymentMethod = 'cash' | 'credit_card' | 'debit_card' | 'pix' | 'meal_voucher' | 'other';
export type StockMovementType = 'purchase' | 'manual_out' | 'adjustment' | 'order';
export type Unit = 'unit' | 'kg' | 'g' | 'liter' | 'ml' | 'portion';
export type PaymentStatus = 'unpaid' | 'paid';


export interface Store {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  logo_url?: string;
  phone?: string;
  email?: string;
  address_street?: string;
  address_number?: string;
  address_complement?: string;
  address_neighborhood?: string;
  address_city?: string;
  address_state?: string;
  address_zip?: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at: string;
  is_open: boolean;
}

export interface Customer {
  id: string;
  store_id: string;
  name: string;
  phone?: string;
  email?: string;
  address_street?: string;
  address_number?: string;
  address_complement?: string;
  address_neighborhood?: string;
  address_city?: string;
  address_state?: string;
  address_zip?: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at: string;
}

export interface DeliveryDriver {
  id: string;
  store_id: string;
  name: string;
  phone?: string;
  vehicle_type?: string;
  vehicle_plate?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DeliveryZone {
  id: string;
  store_id: string;
  neighborhood: string;
  city: string;
  state: string;
  delivery_fee: number;
  estimated_time_min: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  store_id: string;
  name: string;
  sort_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  store_id: string;
  category_id: string;
  name: string;
  description?: string;
  price: number;
  promotional_price?: number;
  available: boolean;
  featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  product_images?: ProductImage[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  storage_path: string;
  url: string;
  alt_text?: string;
  is_primary: boolean;
  sort_order: number;
  created_at: string;
}

export interface AddonGroup {
  id: string;
  product_id: string;
  name: string;
  required: boolean;
  min_choices: number;
  max_choices: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Addon {
  id: string;
  addon_group_id: string;
  name: string;
  price: number;
  available: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  store_id: string;
  customer_id?: string;
  delivery_driver_id?: string;
  order_type: OrderType;
  status: OrderStatus;
  payment_method?: PaymentMethod;
  subtotal: number;
  discount: number;
  delivery_fee: number;
  total: number;
  notes?: string;
  delivery_address_street?: string;
  delivery_address_number?: string;
  delivery_address_complement?: string;
  delivery_address_neighborhood?: string;
  delivery_address_city?: string;
  delivery_address_state?: string;
  delivery_address_zip?: string;
  delivery_zone_id?: string;
  delivery_zone_snapshot?: string;
  delivery_latitude?: number;
  delivery_longitude?: number;
  created_at: string;
  updated_at: string;
  zone?: DeliveryZone;
  driver?: DeliveryDriver;
  customer?: Customer;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  notes?: string;
  created_at: string;
}

export interface OrderItemAddon {
  id: string;
  order_item_id: string;
  addon_id: string;
  addon_name: string;
  price: number;
  created_at: string;
}

export interface Supply {
  id: string;
  store_id: string;
  name: string;
  unit: Unit;
  unit_cost: number;
  current_quantity: number;
  minimum_quantity: number;
  created_at: string;
  updated_at: string;
}

export interface ProductSupply {
  id: string;
  product_id: string;
  supply_id: string;
  quantity_used: number;
  created_at: string;
  updated_at: string;
}

export interface StockMovement {
  id: string;
  store_id: string;
  supply_id: string;
  movement_type: StockMovementType;
  quantity: number;
  unit_cost?: number;
  reference_id?: string;
  notes?: string;
  created_at: string;
}

export interface DailySummary {
  id: string;
  store_id: string;
  date: string;
  total_orders: number;
  gross_revenue: number;
  total_discounts: number;
  total_delivery_fees: number;
  net_revenue: number;
  created_at: string;
  updated_at: string;
}

export type ProductMovementType = 'entrada' | 'saida_manual' | 'ajuste';

export interface ProductStockItem {
  id: string;
  product_id: string;
  store_id: string;
  name: string;
  category: string | null;
  current_quantity: number;
  minimum_quantity: number;
  unit_cost: number;
  stock_value: number;
  below_minimum: boolean;
  active: boolean;
}
