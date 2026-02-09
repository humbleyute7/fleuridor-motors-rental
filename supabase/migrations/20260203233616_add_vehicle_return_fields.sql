/*
  # Add Vehicle Return Process Fields

  ## Overview
  Extends the rental_sessions table to support comprehensive vehicle return processing,
  including return assessments, damage tracking, automated fee calculations, and financial reconciliation.

  ## New Columns Added

  ### Return Assessment Data
  - `return_odometer` (integer) - Mileage at return
  - `return_fuel_level` (numeric) - Fuel percentage at return
  - `return_timestamp` (timestamptz) - Actual return date and time
  - `new_damage` (boolean) - Whether new damage was detected
  - `damage_notes` (text) - Description of any damage
  - `damage_locations` (jsonb) - JSON array of damage points on vehicle diagram
  - `excessive_cleaning` (boolean) - Whether excessive cleaning is required
  - `return_photos` (jsonb) - JSON array of return inspection photo URLs
  - `return_signature_data` (text) - Customer signature at return

  ### Rental Terms & Pricing
  - `allowed_mileage` (integer) - Included mileage allowance
  - `rate_per_mile` (numeric) - Cost per mile over allowance (default 0.25)
  - `refuel_price_per_gallon` (numeric) - Agency fuel price per gallon (default 5.00)
  - `tank_capacity_gallons` (numeric) - Vehicle tank capacity (default 15)
  - `hourly_late_fee` (numeric) - Late return fee per hour (default 25.00)
  - `daily_late_fee` (numeric) - Late return fee per day (default 150.00)
  - `cleaning_fee` (numeric) - Excessive cleaning fee (default 75.00)

  ### Calculated Fees
  - `late_fee_amount` (numeric) - Calculated late return charges
  - `mileage_fee_amount` (numeric) - Calculated mileage overage charges
  - `fuel_fee_amount` (numeric) - Calculated fuel deficit charges
  - `damage_fee_amount` (numeric) - Assessed damage repair costs
  - `cleaning_fee_amount` (numeric) - Cleaning charges if applicable
  - `subtotal_fees` (numeric) - Sum of all additional fees
  - `final_total` (numeric) - Grand total including base rental + fees
  - `deposit_refund_amount` (numeric) - Amount to refund from deposit

  ## Notes
  - All fee fields default to 0
  - Return fields are nullable until return is processed
  - Damage locations stored as JSON for flexibility
  - Return photos stored as JSON array of URLs
*/

-- Add return assessment fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rental_sessions' AND column_name = 'return_odometer'
  ) THEN
    ALTER TABLE rental_sessions ADD COLUMN return_odometer integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rental_sessions' AND column_name = 'return_fuel_level'
  ) THEN
    ALTER TABLE rental_sessions ADD COLUMN return_fuel_level numeric;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rental_sessions' AND column_name = 'return_timestamp'
  ) THEN
    ALTER TABLE rental_sessions ADD COLUMN return_timestamp timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rental_sessions' AND column_name = 'new_damage'
  ) THEN
    ALTER TABLE rental_sessions ADD COLUMN new_damage boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rental_sessions' AND column_name = 'damage_notes'
  ) THEN
    ALTER TABLE rental_sessions ADD COLUMN damage_notes text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rental_sessions' AND column_name = 'damage_locations'
  ) THEN
    ALTER TABLE rental_sessions ADD COLUMN damage_locations jsonb DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rental_sessions' AND column_name = 'excessive_cleaning'
  ) THEN
    ALTER TABLE rental_sessions ADD COLUMN excessive_cleaning boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rental_sessions' AND column_name = 'return_photos'
  ) THEN
    ALTER TABLE rental_sessions ADD COLUMN return_photos jsonb DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rental_sessions' AND column_name = 'return_signature_data'
  ) THEN
    ALTER TABLE rental_sessions ADD COLUMN return_signature_data text;
  END IF;

  -- Rental terms & pricing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rental_sessions' AND column_name = 'allowed_mileage'
  ) THEN
    ALTER TABLE rental_sessions ADD COLUMN allowed_mileage integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rental_sessions' AND column_name = 'rate_per_mile'
  ) THEN
    ALTER TABLE rental_sessions ADD COLUMN rate_per_mile numeric DEFAULT 0.25;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rental_sessions' AND column_name = 'refuel_price_per_gallon'
  ) THEN
    ALTER TABLE rental_sessions ADD COLUMN refuel_price_per_gallon numeric DEFAULT 5.00;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rental_sessions' AND column_name = 'tank_capacity_gallons'
  ) THEN
    ALTER TABLE rental_sessions ADD COLUMN tank_capacity_gallons numeric DEFAULT 15;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rental_sessions' AND column_name = 'hourly_late_fee'
  ) THEN
    ALTER TABLE rental_sessions ADD COLUMN hourly_late_fee numeric DEFAULT 25.00;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rental_sessions' AND column_name = 'daily_late_fee'
  ) THEN
    ALTER TABLE rental_sessions ADD COLUMN daily_late_fee numeric DEFAULT 150.00;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rental_sessions' AND column_name = 'cleaning_fee'
  ) THEN
    ALTER TABLE rental_sessions ADD COLUMN cleaning_fee numeric DEFAULT 75.00;
  END IF;

  -- Calculated fees
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rental_sessions' AND column_name = 'late_fee_amount'
  ) THEN
    ALTER TABLE rental_sessions ADD COLUMN late_fee_amount numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rental_sessions' AND column_name = 'mileage_fee_amount'
  ) THEN
    ALTER TABLE rental_sessions ADD COLUMN mileage_fee_amount numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rental_sessions' AND column_name = 'fuel_fee_amount'
  ) THEN
    ALTER TABLE rental_sessions ADD COLUMN fuel_fee_amount numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rental_sessions' AND column_name = 'damage_fee_amount'
  ) THEN
    ALTER TABLE rental_sessions ADD COLUMN damage_fee_amount numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rental_sessions' AND column_name = 'cleaning_fee_amount'
  ) THEN
    ALTER TABLE rental_sessions ADD COLUMN cleaning_fee_amount numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rental_sessions' AND column_name = 'subtotal_fees'
  ) THEN
    ALTER TABLE rental_sessions ADD COLUMN subtotal_fees numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rental_sessions' AND column_name = 'final_total'
  ) THEN
    ALTER TABLE rental_sessions ADD COLUMN final_total numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rental_sessions' AND column_name = 'deposit_refund_amount'
  ) THEN
    ALTER TABLE rental_sessions ADD COLUMN deposit_refund_amount numeric DEFAULT 0;
  END IF;
END $$;