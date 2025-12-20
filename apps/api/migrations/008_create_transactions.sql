-- Migration: 008_create_transactions
-- Description: Create transactions table
-- Created: 2024

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    external_id VARCHAR(255),
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('PAYMENT', 'REFUND', 'CHARGEBACK')),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED')),
    subtotal_cents BIGINT NOT NULL CHECK (subtotal_cents >= 0),
    sales_tax_cents BIGINT NOT NULL DEFAULT 0 CHECK (sales_tax_cents >= 0),
    total_cents BIGINT NOT NULL CHECK (total_cents >= 0),
    fees_cents BIGINT NOT NULL DEFAULT 0 CHECK (fees_cents >= 0),
    net_cents BIGINT NOT NULL CHECK (net_cents >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    description TEXT,
    metadata JSONB,
    transaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_merchant_id ON transactions(merchant_id);
CREATE INDEX idx_transactions_client_id ON transactions(client_id);
CREATE INDEX idx_transactions_external_id ON transactions(external_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_type ON transactions(transaction_type);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_merchant_date ON transactions(merchant_id, transaction_date);

COMMENT ON TABLE transactions IS 'Financial transactions for merchants';
COMMENT ON COLUMN transactions.merchant_id IS 'Foreign key to merchants table';
COMMENT ON COLUMN transactions.client_id IS 'Optional foreign key to clients table';
COMMENT ON COLUMN transactions.external_id IS 'External transaction ID (e.g., from payment processor)';
COMMENT ON COLUMN transactions.subtotal_cents IS 'Subtotal amount in cents (before tax)';
COMMENT ON COLUMN transactions.sales_tax_cents IS 'Sales tax amount in cents';
COMMENT ON COLUMN transactions.total_cents IS 'Total amount in cents (subtotal + tax)';
COMMENT ON COLUMN transactions.fees_cents IS 'Processing fees in cents';
COMMENT ON COLUMN transactions.net_cents IS 'Net amount in cents (total - fees)';
COMMENT ON COLUMN transactions.metadata IS 'Additional transaction metadata as JSON';

