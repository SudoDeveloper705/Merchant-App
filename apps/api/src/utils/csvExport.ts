/**
 * CSV export utilities
 */

/**
 * Escape CSV field value
 */
function escapeCsvField(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);

  // If value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Convert array of objects to CSV string
 */
export function arrayToCsv(data: any[], headers?: string[]): string {
  if (data.length === 0) {
    return '';
  }

  // Use provided headers or extract from first object
  const csvHeaders = headers || Object.keys(data[0]);

  // Build CSV
  const rows: string[] = [];

  // Header row
  rows.push(csvHeaders.map(escapeCsvField).join(','));

  // Data rows
  for (const row of data) {
    const values = csvHeaders.map(header => escapeCsvField(row[header]));
    rows.push(values.join(','));
  }

  return rows.join('\n');
}

/**
 * Convert transactions to CSV
 */
export function transactionsToCsv(transactions: any[]): string {
  const headers = [
    'ID',
    'External ID',
    'Transaction Type',
    'Status',
    'Subtotal (Cents)',
    'Sales Tax (Cents)',
    'Total (Cents)',
    'Fees (Cents)',
    'Net (Cents)',
    'Currency',
    'Description',
    'Transaction Date',
    'Client Name',
    'Partner Share (Cents)',
    'Merchant Share (Cents)',
    'Agreement Name',
    'Partner Name',
    'Created At',
  ];

  const csvData = transactions.map(tx => ({
    'ID': tx.id,
    'External ID': tx.external_id || '',
    'Transaction Type': tx.transaction_type,
    'Status': tx.status,
    'Subtotal (Cents)': tx.subtotal_cents,
    'Sales Tax (Cents)': tx.sales_tax_cents,
    'Total (Cents)': tx.total_cents,
    'Fees (Cents)': tx.fees_cents,
    'Net (Cents)': tx.net_cents,
    'Currency': tx.currency,
    'Description': tx.description || '',
    'Transaction Date': tx.transaction_date,
    'Client Name': tx.client_name || '',
    'Partner Share (Cents)': tx.partner_share_cents || '',
    'Merchant Share (Cents)': tx.merchant_share_cents || '',
    'Agreement Name': tx.agreement_name || '',
    'Partner Name': tx.partner_name || '',
    'Created At': tx.created_at,
  }));

  return arrayToCsv(csvData, headers);
}

/**
 * Convert payouts to CSV
 */
export function payoutsToCsv(payouts: any[]): string {
  const headers = [
    'ID',
    'Amount (Cents)',
    'Currency',
    'Status',
    'Payout Method',
    'Payout Reference',
    'Description',
    'Scheduled Date',
    'Processed At',
    'Partner Name',
    'Merchant Name',
    'Agreement Name',
    'Created At',
    'Updated At',
  ];

  const csvData = payouts.map(payout => ({
    'ID': payout.id,
    'Amount (Cents)': payout.amount_cents,
    'Currency': payout.currency,
    'Status': payout.status,
    'Payout Method': payout.payout_method,
    'Payout Reference': payout.payout_reference || '',
    'Description': payout.description || '',
    'Scheduled Date': payout.scheduled_date,
    'Processed At': payout.processed_at || '',
    'Partner Name': payout.partner_name || '',
    'Merchant Name': payout.merchant_name || '',
    'Agreement Name': payout.agreement_name || '',
    'Created At': payout.created_at,
    'Updated At': payout.updated_at,
  }));

  return arrayToCsv(csvData, headers);
}

/**
 * Convert settlement report to CSV
 */
export function settlementReportToCsv(reports: any[]): string {
  const headers = [
    'Merchant Name',
    'Partner Name',
    'Agreement Name',
    'Year',
    'Month',
    'Total Revenue (Cents)',
    'Total Transactions',
    'Partner Share (Cents)',
    'Merchant Share (Cents)',
    'Minimum Guarantee (Cents)',
    'Adjustment (Cents)',
    'Final Partner Share (Cents)',
    'Total Payouts (Cents)',
    'Outstanding Balance (Cents)',
    'Currency',
  ];

  const csvData = reports.map(report => ({
    'Merchant Name': report.merchant_name,
    'Partner Name': report.partner_name,
    'Agreement Name': report.agreement_name,
    'Year': report.year,
    'Month': report.month,
    'Total Revenue (Cents)': report.total_revenue_cents,
    'Total Transactions': report.total_transactions,
    'Partner Share (Cents)': report.partner_share_cents,
    'Merchant Share (Cents)': report.merchant_share_cents,
    'Minimum Guarantee (Cents)': report.minimum_guarantee_cents || '',
    'Adjustment (Cents)': report.adjustment_cents,
    'Final Partner Share (Cents)': report.final_partner_share_cents,
    'Total Payouts (Cents)': report.total_payouts_cents,
    'Outstanding Balance (Cents)': report.outstanding_balance_cents,
    'Currency': report.currency,
  }));

  return arrayToCsv(csvData, headers);
}

