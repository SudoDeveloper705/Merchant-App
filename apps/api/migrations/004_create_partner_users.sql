-- Migration: 004_create_partner_users
-- Description: Create partner_users table
-- Created: 2024

CREATE TABLE partner_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'STAFF',
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_partner_email UNIQUE (partner_id, email)
);

CREATE INDEX idx_partner_users_partner_id ON partner_users(partner_id);
CREATE INDEX idx_partner_users_email ON partner_users(email);
CREATE INDEX idx_partner_users_role ON partner_users(role);
CREATE INDEX idx_partner_users_is_active ON partner_users(is_active);

COMMENT ON TABLE partner_users IS 'Users belonging to partners';
COMMENT ON COLUMN partner_users.partner_id IS 'Foreign key to partners table';
COMMENT ON COLUMN partner_users.role IS 'User role: SUPER_ADMIN, ADMIN, MERCHANT, STAFF, VIEWER';
COMMENT ON COLUMN partner_users.password_hash IS 'Bcrypt hashed password';

