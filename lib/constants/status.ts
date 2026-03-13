// ─── Order Status Configuration ───────────────────────────────────────────────
export const STATUS_MAP: Record<string, { 
  label: string; 
  dot: string; 
  bgD: string; 
  bgL: string; 
  txD: string; 
  txL: string;
}> = {
  pending: { 
    label: 'Pendente', 
    dot: '#F59E0B', 
    bgD: 'rgba(245,158,11,0.15)', 
    bgL: 'rgba(245,158,11,0.1)', 
    txD: '#FCD34D', 
    txL: '#92400E' 
  },
  confirmed: { 
    label: 'Confirmado', 
    dot: '#3B82F6', 
    bgD: 'rgba(59,130,246,0.15)', 
    bgL: 'rgba(59,130,246,0.1)', 
    txD: '#93C5FD', 
    txL: '#1E40AF' 
  },
  preparing: { 
    label: 'Preparando', 
    dot: '#8B5CF6', 
    bgD: 'rgba(139,92,246,0.15)', 
    bgL: 'rgba(139,92,246,0.1)', 
    txD: '#C4B5FD', 
    txL: '#5B21B6' 
  },
  ready: { 
    label: 'Pronto', 
    dot: '#10B981', 
    bgD: 'rgba(16,185,129,0.15)', 
    bgL: 'rgba(16,185,129,0.1)', 
    txD: '#6EE7B7', 
    txL: '#065F46' 
  },
  delivering: { 
    label: 'Em entrega', 
    dot: '#6366F1', 
    bgD: 'rgba(99,102,241,0.15)', 
    bgL: 'rgba(99,102,241,0.1)', 
    txD: '#A5B4FC', 
    txL: '#3730A3' 
  },
  delivered: { 
    label: 'Entregue', 
    dot: '#10B981', 
    bgD: 'rgba(16,185,129,0.15)', 
    bgL: 'rgba(16,185,129,0.1)', 
    txD: '#6EE7B7', 
    txL: '#065F46' 
  },
  cancelled: { 
    label: 'Cancelado', 
    dot: '#EF4444', 
    bgD: 'rgba(239,68,68,0.15)', 
    bgL: 'rgba(239,68,68,0.1)', 
    txD: '#FCA5A5', 
    txL: '#991B1B' 
  },
  out_for_delivery: { 
    label: 'Saiu', 
    dot: '#6366F1', 
    bgD: 'rgba(99,102,241,0.15)', 
    bgL: 'rgba(99,102,241,0.1)', 
    txD: '#A5B4FC', 
    txL: '#3730A3' 
  },
};
