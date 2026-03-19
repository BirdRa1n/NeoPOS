export type SettingsTab = 'info' | 'appearance' | 'catalog' | 'whatsapp' | 'team' | 'license';
export type WhatsappStatus = 'disconnected' | 'connecting' | 'connected';

export interface ColorPreset {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
}

export const COLOR_PRESETS: ColorPreset[] = [
  { name: 'Índigo',   primary: '#6366F1', secondary: '#8B5CF6', accent: '#10B981' },
  { name: 'Rosa',     primary: '#EC4899', secondary: '#F43F5E', accent: '#F59E0B' },
  { name: 'Azul',     primary: '#3B82F6', secondary: '#6366F1', accent: '#10B981' },
  { name: 'Verde',    primary: '#10B981', secondary: '#059669', accent: '#6366F1' },
  { name: 'Laranja',  primary: '#F59E0B', secondary: '#EF4444', accent: '#8B5CF6' },
  { name: 'Roxo',     primary: '#8B5CF6', secondary: '#A855F7', accent: '#EC4899' },
  { name: 'Ciano',    primary: '#06B6D4', secondary: '#0891B2', accent: '#F59E0B' },
  { name: 'Lima',     primary: '#84CC16', secondary: '#65A30D', accent: '#EF4444' },
];

export interface StoreInfo {
  name: string;
  nickname: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  logo_url: string;
  cover_url: string;
  is_open: boolean;
}

export interface StoreTheme {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  surface_color: string;
  text_color: string;
  font_family: string;
  border_radius: string;
  card_style: string;
  header_style: string;
  show_cover: boolean;
  show_stock_quantity: boolean;
}

export interface WhatsappConfig {
  api_key: string;
  instance_name: string;
  evolution_url: string;
  send_on_confirmed: boolean;
  send_on_preparing: boolean;
  send_on_out_for_delivery: boolean;
  send_on_delivered: boolean;
  send_on_cancelled: boolean;
}

export const DEFAULT_STORE_INFO: StoreInfo = {
  name: '', nickname: '', description: '', phone: '', email: '',
  address: '', city: '', state: '', zip_code: '',
  logo_url: '', cover_url: '', is_open: true,
};

export const DEFAULT_THEME: StoreTheme = {
  primary_color: '#6366F1', secondary_color: '#8B5CF6', accent_color: '#10B981',
  background_color: '#FFFFFF', surface_color: '#F9FAFB', text_color: '#111827',
  font_family: 'Inter', border_radius: 'rounded', card_style: 'shadow',
  header_style: 'cover', show_cover: true, show_stock_quantity: false,
};

export const DEFAULT_WHATSAPP: WhatsappConfig = {
  api_key: '', instance_name: '', evolution_url: '',
  send_on_confirmed: true, send_on_preparing: true,
  send_on_out_for_delivery: true, send_on_delivered: true, send_on_cancelled: true,
};
