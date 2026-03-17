export type InventoryTab = 'supplies' | 'products';
export type InventoryModal = 'supply-create' | 'supply-edit' | 'movement' | 'product-movement' | 'product-edit' | null;
export type SortKey = 'name' | 'current_quantity' | 'stock_value';

export const UNITS = ['unit', 'kg', 'g', 'liter', 'ml', 'portion'] as const;
export type UnitType = typeof UNITS[number];

export const UNIT_LABELS: Record<UnitType, string> = {
  unit: 'Unidade', kg: 'Quilograma', g: 'Grama',
  liter: 'Litro', ml: 'Mililitro', portion: 'Porção',
};

export const MOVEMENT_TYPES = ['purchase', 'manual_out', 'adjustment'] as const;
export type SupplyMovementType = typeof MOVEMENT_TYPES[number];
export const MOVEMENT_LABELS: Record<SupplyMovementType, string> = {
  purchase: 'Compra', manual_out: 'Saída Manual', adjustment: 'Ajuste',
};

export const PRODUCT_MOVEMENT_TYPES = ['entrada', 'saida_manual', 'ajuste'] as const;
export const PRODUCT_MOVEMENT_LABELS: Record<string, string> = {
  entrada: 'Entrada (compra/reposição)',
  saida_manual: 'Saída Manual (perda/uso)',
  ajuste: 'Ajuste de Inventário',
};
