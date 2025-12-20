-- Migration: 007_create_agreements
-- Description: Create agreements table
-- Created: 2024

CREATE TABLE agreements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    agreement_type VARCHAR(50) NOT NULL CHECK (agreement_type IN ('PERCENTAGE', 'MINIMUM_GUARANTEE', 'HYBRID')),
    percentage_rate DECIMAL(5, 4) CHECK (percentage_rate >= 0 AND percentage_rate <= 1),
    minimum_guarantee_cents BIGINT CHECK (minimum_guarantee_cents >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_agreements_merchant_id ON agreements(merchant_id);
CREATE INDEX idx_agreements_partner_id ON agreements(partner_id);
CREATE INDEX idx_agreements_client_id ON agreements(client_id);
CREATE INDEX idx_agreements_is_active ON agreements(is_active);
CREATE INDEX idx_agreements_dates ON agreements(start_date, end_date);

COMMENT ON TABLE agreements IS 'Agreements between merchants and partners';
COMMENT ON COLUMN agreements.merchant_id IS 'Foreign key to merchants table';
COMMENT ON COLUMN agreements.partner_id IS 'Foreign key to partners table';
COMMENT ON COLUMN agreements.client_id IS 'Optional foreign key to clients table';
COMMENT ON COLUMN agreements.agreement_type IS 'Type: PERCENTAGE, MINIMUM_GUARANTEE, or HYBRID';
COMMENT ON COLUMN agreements.percentage_rate IS 'Percentage rate (0.0000 to 1.0000, e.g., 0.1500 = 15%)';
COMMENT ON COLUMN agreements.minimum_guarantee_cents IS 'Minimum guarantee amount in cents';
COMMENT ON COLUMN agreements.currency IS 'ISO 4217 currency code (e.g., USD, EUR)';

