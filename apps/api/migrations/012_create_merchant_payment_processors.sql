-- Migration: 012_create_merchant_payment_processors
-- Description: Create merchant_payment_processors table
-- Created: 2024

CREATE TABLE merchant_payment_processors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    processor_type VARCHAR(50) NOT NULL CHECK (processor_type IN ('STRIPE', 'PAYPAL', 'SQUARE', 'OTHER')),
    processor_account_id VARCHAR(255) NOT NULL,
    api_key_encrypted TEXT,
    webhook_secret_encrypted TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_default BOOLEAN NOT NULL DEFAULT false,
    metadata JSONB,
    connected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_merchant_processor_account UNIQUE (merchant_id, processor_type, processor_account_id)
);

CREATE INDEX idx_merchant_payment_processors_merchant_id ON merchant_payment_processors(merchant_id);
CREATE INDEX idx_merchant_payment_processors_type ON merchant_payment_processors(processor_type);
CREATE INDEX idx_merchant_payment_processors_is_active ON merchant_payment_processors(is_active);
CREATE INDEX idx_merchant_payment_processors_is_default ON merchant_payment_processors(is_default);

COMMENT ON TABLE merchant_payment_processors IS 'Payment processor connections for merchants (e.g., Stripe)';
COMMENT ON COLUMN merchant_payment_processors.merchant_id IS 'Foreign key to merchants table';
COMMENT ON COLUMN merchant_payment_processors.processor_type IS 'Type of payment processor';
COMMENT ON COLUMN merchant_payment_processors.processor_account_id IS 'Account ID from the payment processor';
COMMENT ON COLUMN merchant_payment_processors.api_key_encrypted IS 'Encrypted API key for the processor';
COMMENT ON COLUMN merchant_payment_processors.webhook_secret_encrypted IS 'Encrypted webhook secret';
COMMENT ON COLUMN merchant_payment_processors.is_default IS 'Whether this is the default processor for the merchant';

