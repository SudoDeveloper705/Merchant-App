-- Migration: 005_create_merchant_partner_links
-- Description: Create merchant_partner_links table
-- Created: 2024

CREATE TABLE merchant_partner_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_merchant_partner UNIQUE (merchant_id, partner_id)
);

CREATE INDEX idx_merchant_partner_links_merchant_id ON merchant_partner_links(merchant_id);
CREATE INDEX idx_merchant_partner_links_partner_id ON merchant_partner_links(partner_id);
CREATE INDEX idx_merchant_partner_links_is_active ON merchant_partner_links(is_active);

COMMENT ON TABLE merchant_partner_links IS 'Links merchants and partners - partner_users can only access linked merchants';
COMMENT ON COLUMN merchant_partner_links.merchant_id IS 'Foreign key to merchants table';
COMMENT ON COLUMN merchant_partner_links.partner_id IS 'Foreign key to partners table';
COMMENT ON COLUMN merchant_partner_links.is_active IS 'Whether the link is currently active';

