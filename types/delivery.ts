export interface DriverStats {
  driver_id: string;
  name: string;
  phone: string | null;
  vehicle: string | null;
  plate: string | null;
  active: boolean;
  staff_member_id: string | null;
  deliveries_today: number;
  fee_today: number;
  deliveries_week: number;
  fee_week: number;
  deliveries_month: number;
  fee_month: number;
  deliveries_year: number;
  fee_year: number;
  last_delivery_at: string | null;
}

export interface DeliveryZone {
  id: string;
  store_id: string;
  neighborhood: string;
  city: string;
  state: string;
  delivery_fee: number;
  estimated_time_min: number | null;
  active: boolean;
}
