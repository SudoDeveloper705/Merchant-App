-- Migration: 003_create_users
-- Description: Create users table (merchant users)
-- Created: 2024

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'STAFF',
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_merchant_email UNIQUE (merchant_id, email)
);

CREATE INDEX idx_users_merchant_id ON users(merchant_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

COMMENT ON TABLE users IS 'Users belonging to merchants';
COMMENT ON COLUMN users.merchant_id IS 'Foreign key to merchants table';
COMMENT ON COLUMN users.role IS 'User role: SUPER_ADMIN, ADMIN, MERCHANT, STAFF, VIEWER';
COMMENT ON COLUMN users.password_hash IS 'Bcrypt hashed password';

