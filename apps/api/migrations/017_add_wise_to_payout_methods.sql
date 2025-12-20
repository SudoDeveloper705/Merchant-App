-- Migration: 017_add_wise_to_payout_methods
-- Description: Add WISE to payout_method enum
-- Created: 2024

-- Drop and recreate the constraint with WISE added
ALTER TABLE payouts 
DROP CONSTRAINT IF EXISTS payouts_payout_method_check;

ALTER TABLE payouts 
ADD CONSTRAINT payouts_payout_method_check 
CHECK (payout_method IN ('BANK_TRANSFER', 'STRIPE', 'PAYPAL', 'WIRE', 'WISE'));

COMMENT ON COLUMN payouts.payout_method IS 'Method used for payout: BANK_TRANSFER, STRIPE, PAYPAL, WIRE, WISE';

