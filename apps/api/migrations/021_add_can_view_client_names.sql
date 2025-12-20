-- Migration: 021_add_can_view_client_names
-- Description: Add can_view_client_names column to merchant_partner_links table
-- Created: 2024

-- Add can_view_client_names column to merchant_partner_links
ALTER TABLE merchant_partner_links
ADD COLUMN can_view_client_names BOOLEAN NOT NULL DEFAULT true;

-- Add comment
COMMENT ON COLUMN merchant_partner_links.can_view_client_names IS 'Whether partner users can view client names for this merchant (false = client names are redacted)';

-- Create index for performance
CREATE INDEX idx_merchant_partner_links_can_view_client_names ON merchant_partner_links(can_view_client_names);

