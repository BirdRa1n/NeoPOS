export interface StoreData {
  id: string;
  name: string;
  nickname: string;
  description: string | null;
  logo_url: string | null;
  cover_url: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  is_open: boolean;
}

export interface CatalogTheme {
  primary_color: string;
  secondary_color: string;
  background_color: string;
  surface_color: string;
  text_color: string;
  font_family: string;
  border_radius: string;
  show_cover: boolean;
  show_stock_quantity: boolean;
}

export interface Category { id: string; name: string; sort_order: number }

export interface Product {
  id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  promotional_price: number | null;
  available: boolean;
  current_quantity: number | null;
  product_images: { url: string; is_primary: boolean }[];
}

export interface CartItem { product: Product; qty: number }
export interface DeliveryZone { id: string; neighborhood: string; delivery_fee: number }

export type CatalogStep = 'catalog' | 'checkout' | 'success';
export type CheckoutSub = 'type' | 'info' | 'address' | 'payment' | 'confirm';
export type PaymentMethod = 'cash' | 'credit_card' | 'debit_card' | 'pix';
export type OrderType = 'delivery' | 'pickup';

export const DEFAULT_CATALOG_THEME: CatalogTheme = {
  primary_color: '#FF6B35',
  secondary_color: '#FF8C61',
  background_color: '#FFFFFF',
  surface_color: '#F8F7F4',
  text_color: '#1A1A1A',
  font_family: 'DM Sans',
  border_radius: 'rounded',
  show_cover: true,
  show_stock_quantity: false,
};

export const CHECKOUT_STEPS: CheckoutSub[] = ['type', 'info', 'address', 'payment', 'confirm'];
export const STEP_LABELS: Record<CheckoutSub, string> = {
  type: 'Tipo', info: 'Dados', address: 'Endereço', payment: 'Pagamento', confirm: 'Resumo',
};

export const fmt = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
