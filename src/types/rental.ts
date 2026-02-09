export interface DamageLocation {
  x: number;
  y: number;
  label: string;
}

export interface RentalSession {
  id?: string;
  session_status: 'pickup' | 'return' | 'completed' | 'closed';
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  customer_address: string;
  passport_url?: string;
  license_url?: string;
  vehicle_plate: string;
  vehicle_type: string;
  photo_front?: string;
  photo_rear?: string;
  photo_left?: string;
  photo_right?: string;
  odometer: number;
  fuel_level: number;
  pickup_date: string;
  return_date: string;
  daily_rate: number;
  deposit: number;
  total_amount: number;
  signature_data?: string;

  return_odometer?: number;
  return_fuel_level?: number;
  return_timestamp?: string;
  new_damage?: boolean;
  damage_notes?: string;
  damage_locations?: DamageLocation[];
  excessive_cleaning?: boolean;
  return_photos?: string[];
  return_signature_data?: string;

  allowed_mileage?: number;
  rate_per_mile?: number;
  refuel_price_per_gallon?: number;
  tank_capacity_gallons?: number;
  hourly_late_fee?: number;
  daily_late_fee?: number;
  cleaning_fee?: number;

  late_fee_amount?: number;
  mileage_fee_amount?: number;
  fuel_fee_amount?: number;
  damage_fee_amount?: number;
  cleaning_fee_amount?: number;
  subtotal_fees?: number;
  final_total?: number;
  deposit_refund_amount?: number;

  created_at?: string;
  updated_at?: string;
}

export const emptySession: RentalSession = {
  session_status: 'pickup',
  customer_name: '',
  customer_phone: '',
  customer_email: '',
  customer_address: '',
  vehicle_plate: '',
  vehicle_type: '',
  odometer: 0,
  fuel_level: 100,
  pickup_date: new Date().toISOString().split('T')[0],
  return_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
  daily_rate: 0,
  deposit: 0,
  total_amount: 0,

  allowed_mileage: 200,
  rate_per_mile: 0.25,
  refuel_price_per_gallon: 5.00,
  tank_capacity_gallons: 15,
  hourly_late_fee: 25.00,
  daily_late_fee: 150.00,
  cleaning_fee: 75.00,

  new_damage: false,
  excessive_cleaning: false,
  damage_locations: [],
  return_photos: [],

  late_fee_amount: 0,
  mileage_fee_amount: 0,
  fuel_fee_amount: 0,
  damage_fee_amount: 0,
  cleaning_fee_amount: 0,
  subtotal_fees: 0,
  final_total: 0,
  deposit_refund_amount: 0,
};
