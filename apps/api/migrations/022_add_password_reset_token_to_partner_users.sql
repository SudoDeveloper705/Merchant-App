-- Migration: 022_add_password_reset_token_to_partner_users
-- Description: Add password_reset_token column to partner_users table for invitation flow
-- Created: 2024

ALTER TABLE partner_users
ADD COLUMN password_reset_token VARCHAR(255) NULL,
ADD COLUMN password_reset_token_expires_at TIMESTAMP WITH TIME ZONE NULL;

CREATE INDEX idx_partner_users_password_reset_token ON partner_users(password_reset_token);

COMMENT ON COLUMN partner_users.password_reset_token IS 'Temporary token for password reset/invitation';
COMMENT ON COLUMN partner_users.password_reset_token_expires_at IS 'Expiration timestamp for password reset token';

