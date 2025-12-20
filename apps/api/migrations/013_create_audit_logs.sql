-- Migration: 013_create_audit_logs
-- Description: Create audit_logs table
-- Created: 2024

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    user_type VARCHAR(50) CHECK (user_type IN ('USER', 'PARTNER_USER')),
    merchant_id UUID REFERENCES merchants(id) ON DELETE SET NULL,
    partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id UUID,
    ip_address INET,
    user_agent TEXT,
    changes JSONB,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_merchant_id ON audit_logs(merchant_id);
CREATE INDEX idx_audit_logs_partner_id ON audit_logs(partner_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_merchant_date ON audit_logs(merchant_id, created_at);
CREATE INDEX idx_audit_logs_partner_date ON audit_logs(partner_id, created_at);

COMMENT ON TABLE audit_logs IS 'Audit trail for all system actions';
COMMENT ON COLUMN audit_logs.user_id IS 'ID of the user who performed the action (can be from users or partner_users)';
COMMENT ON COLUMN audit_logs.user_type IS 'Type of user: USER (merchant user) or PARTNER_USER';
COMMENT ON COLUMN audit_logs.merchant_id IS 'Merchant context for the action';
COMMENT ON COLUMN audit_logs.partner_id IS 'Partner context for the action';
COMMENT ON COLUMN audit_logs.action IS 'Action performed (e.g., CREATE, UPDATE, DELETE, LOGIN)';
COMMENT ON COLUMN audit_logs.resource_type IS 'Type of resource affected (e.g., TRANSACTION, AGREEMENT)';
COMMENT ON COLUMN audit_logs.resource_id IS 'ID of the resource affected';
COMMENT ON COLUMN audit_logs.changes IS 'JSON object describing what changed';
COMMENT ON COLUMN audit_logs.metadata IS 'Additional audit metadata as JSON';

