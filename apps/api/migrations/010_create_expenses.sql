-- Migration: 010_create_expenses
-- Description: Create expenses table
-- Created: 2024

CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    amount_cents BIGINT NOT NULL CHECK (amount_cents >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    expense_date DATE NOT NULL,
    receipt_url TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_expenses_merchant_id ON expenses(merchant_id);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_expenses_date ON expenses(expense_date);
CREATE INDEX idx_expenses_merchant_date ON expenses(merchant_id, expense_date);

COMMENT ON TABLE expenses IS 'Expenses incurred by merchants';
COMMENT ON COLUMN expenses.merchant_id IS 'Foreign key to merchants table';
COMMENT ON COLUMN expenses.amount_cents IS 'Expense amount in cents';
COMMENT ON COLUMN expenses.category IS 'Expense category (e.g., OFFICE, MARKETING, TRAVEL)';
COMMENT ON COLUMN expenses.metadata IS 'Additional expense metadata as JSON';

