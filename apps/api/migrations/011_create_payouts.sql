-- Migration: 011_create_payouts
-- Description: Create payouts table
-- Created: 2024

CREATE TABLE payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID REFERENCES merchants(id) ON DELETE SET NULL,
    partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
    amount_cents BIGINT NOT NULL CHECK (amount_cents >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED')),
    payout_method VARCHAR(50) NOT NULL CHECK (payout_method IN ('BANK_TRANSFER', 'STRIPE', 'PAYPAL', 'WIRE')),
    payout_reference VARCHAR(255),
    description TEXT,
    scheduled_date DATE,
    processed_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_payout_recipient CHECK (
        (merchant_id IS NOT NULL AND partner_id IS NULL) OR
        (merchant_id IS NULL AND partner_id IS NOT NULL)
    )
);

CREATE INDEX idx_payouts_merchant_id ON payouts(merchant_id);
CREATE INDEX idx_payouts_partner_id ON payouts(partner_id);
CREATE INDEX idx_payouts_status ON payouts(status);
CREATE INDEX idx_payouts_scheduled_date ON payouts(scheduled_date);
CREATE INDEX idx_payouts_merchant_date ON payouts(merchant_id, scheduled_date);
CREATE INDEX idx_payouts_partner_date ON payouts(partner_id, scheduled_date);

COMMENT ON TABLE payouts IS 'Payouts to merchants or partners';
COMMENT ON COLUMN payouts.merchant_id IS 'Foreign key to merchants table (if payout is to merchant)';
COMMENT ON COLUMN payouts.partner_id IS 'Foreign key to partners table (if payout is to partner)';
COMMENT ON COLUMN payouts.amount_cents IS 'Payout amount in cents';
COMMENT ON COLUMN payouts.status IS 'Payout status';
COMMENT ON COLUMN payouts.payout_method IS 'Method used for payout';
COMMENT ON COLUMN payouts.payout_reference IS 'External reference ID (e.g., bank transfer ID, Stripe payout ID)';

