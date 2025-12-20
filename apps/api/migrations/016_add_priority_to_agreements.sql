-- Migration: 016_add_priority_to_agreements
-- Description: Add priority field to agreements for matching rules
-- Created: 2024

ALTER TABLE agreements 
ADD COLUMN IF NOT EXISTS priority INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_agreements_priority ON agreements(priority);
CREATE INDEX IF NOT EXISTS idx_agreements_merchant_priority ON agreements(merchant_id, priority);

COMMENT ON COLUMN agreements.priority IS 'Priority for agreement matching (higher = more priority). Client-specific agreements should have higher priority than global ones.';

