-- Migration: 009_create_transaction_agreement_links
-- Description: Create transaction_agreement_links table
-- Created: 2024

CREATE TABLE transaction_agreement_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    agreement_id UUID NOT NULL REFERENCES agreements(id) ON DELETE CASCADE,
    partner_share_cents BIGINT NOT NULL CHECK (partner_share_cents >= 0),
    merchant_share_cents BIGINT NOT NULL CHECK (merchant_share_cents >= 0),
    calculation_method VARCHAR(50) NOT NULL CHECK (calculation_method IN ('PERCENTAGE', 'MINIMUM_GUARANTEE', 'HYBRID')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_transaction_agreement UNIQUE (transaction_id, agreement_id)
);

CREATE INDEX idx_transaction_agreement_links_transaction_id ON transaction_agreement_links(transaction_id);
CREATE INDEX idx_transaction_agreement_links_agreement_id ON transaction_agreement_links(agreement_id);

COMMENT ON TABLE transaction_agreement_links IS 'Links transactions to agreements with computed share amounts';
COMMENT ON COLUMN transaction_agreement_links.transaction_id IS 'Foreign key to transactions table';
COMMENT ON COLUMN transaction_agreement_links.agreement_id IS 'Foreign key to agreements table';
COMMENT ON COLUMN transaction_agreement_links.partner_share_cents IS 'Computed partner share in cents';
COMMENT ON COLUMN transaction_agreement_links.merchant_share_cents IS 'Computed merchant share in cents';
COMMENT ON COLUMN transaction_agreement_links.calculation_method IS 'Method used to calculate shares';

