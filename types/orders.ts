import {
  Truck, Package, UtensilsCrossed,
  Banknote, CreditCard, Smartphone, Wallet, DollarSign, CheckSquare,
} from 'lucide-react';
import type { OrderStatus } from '@/types';

export const ORDER_TYPE_ICON: Record<string, React.FC<any>> = {
  delivery: Truck,
  pickup: Package,
  table: UtensilsCrossed,
};

export const ORDER_TYPE_LABELS: Record<string, string> = {
  delivery: 'Delivery',
  pickup: 'Retirada',
  table: 'No local',
};

export interface StatusConfig {
  label: string;
  dot: string;
  bgD: string;
  bgL: string;
  txD: string;
  txL: string;
}

export const STATUS_CFG: Record<string, StatusConfig> = {
  pending:          { label: 'Pendente',        dot: '#F59E0B', bgD: 'rgba(245,158,11,0.15)',  bgL: 'rgba(245,158,11,0.1)',  txD: '#FCD34D', txL: '#92400E' },
  confirmed:        { label: 'Confirmado',       dot: '#3B82F6', bgD: 'rgba(59,130,246,0.15)',  bgL: 'rgba(59,130,246,0.1)',  txD: '#93C5FD', txL: '#1E40AF' },
  preparing:        { label: 'Preparando',       dot: '#8B5CF6', bgD: 'rgba(139,92,246,0.15)', bgL: 'rgba(139,92,246,0.1)', txD: '#C4B5FD', txL: '#5B21B6' },
  out_for_delivery: { label: 'Saiu p/ entrega',  dot: '#6366F1', bgD: 'rgba(99,102,241,0.15)', bgL: 'rgba(99,102,241,0.1)', txD: '#A5B4FC', txL: '#3730A3' },
  delivered:        { label: 'Entregue',         dot: '#10B981', bgD: 'rgba(16,185,129,0.15)', bgL: 'rgba(16,185,129,0.1)', txD: '#6EE7B7', txL: '#065F46' },
  finished:         { label: 'Finalizado',       dot: '#10B981', bgD: 'rgba(16,185,129,0.15)', bgL: 'rgba(16,185,129,0.1)', txD: '#6EE7B7', txL: '#065F46' },
  cancelled:        { label: 'Cancelado',        dot: '#EF4444', bgD: 'rgba(239,68,68,0.15)',  bgL: 'rgba(239,68,68,0.1)',  txD: '#FCA5A5', txL: '#991B1B' },
};

export const STATUS_TABS: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all',              label: 'Todos' },
  { value: 'pending',          label: 'Pendentes' },
  { value: 'confirmed',        label: 'Confirmados' },
  { value: 'preparing',        label: 'Preparando' },
  { value: 'out_for_delivery', label: 'Em entrega' },
  { value: 'delivered',        label: 'Entregues' },
  { value: 'cancelled',        label: 'Cancelados' },
];

export const PAYMENT_LABELS: Record<string, string> = {
  cash:         'Dinheiro',
  credit_card:  'Cartão Crédito',
  debit_card:   'Cartão Débito',
  pix:          'PIX',
  meal_voucher: 'Vale Refeição',
  other:        'Outro',
};

export const PAYMENT_ICONS: Record<string, React.FC<any>> = {
  cash:         Banknote,
  credit_card:  CreditCard,
  debit_card:   Wallet,
  pix:          Smartphone,
  meal_voucher: CreditCard,
  other:        DollarSign,
};

export const PAYMENT_OPTIONS = [
  { value: 'cash',         label: 'Dinheiro',  Icon: Banknote },
  { value: 'pix',          label: 'PIX',       Icon: Smartphone },
  { value: 'credit_card',  label: 'Crédito',   Icon: CreditCard },
  { value: 'debit_card',   label: 'Débito',    Icon: Wallet },
  { value: 'meal_voucher', label: 'Vale',      Icon: CheckSquare },
  { value: 'other',        label: 'Outro',     Icon: DollarSign },
];
