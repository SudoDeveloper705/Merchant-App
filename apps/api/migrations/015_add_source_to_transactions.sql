-- Migration: 015_add_source_to_transactions
-- Description: Add source column to transactions table for tracking payment processor
-- Created: 2024

ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'MANUAL';

CREATE INDEX IF NOT EXISTS idx_transactions_source ON transactions(source);
CREATE INDEX IF NOT EXISTS idx_transactions_source_merchant ON transactions(merchant_id, source);

COMMENT ON COLUMN transactions.source IS 'Source of transaction: MANUAL, STRIPE, PAYPAL, etc.';

-- Update existing transactions to have source in metadata if not present
UPDATE transactions 
SET metadata = jsonb_set(
  COALESCE(metadata, '{}'::jsonb),
  '{source}',
  to_jsonb(COALESCE(source, 'MANUAL'))
)
WHERE metadata->>'source' IS NULL;

