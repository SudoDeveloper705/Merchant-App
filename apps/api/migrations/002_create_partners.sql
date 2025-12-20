-- Migration: 002_create_partners
-- Description: Create partners table
-- Created: 2024

CREATE TABLE partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    tax_id VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_partners_email ON partners(email);
CREATE INDEX idx_partners_is_active ON partners(is_active);

COMMENT ON TABLE partners IS 'Partner businesses that work with merchants';
COMMENT ON COLUMN partners.id IS 'Unique partner identifier (UUID)';
COMMENT ON COLUMN partners.is_active IS 'Whether the partner account is active';

