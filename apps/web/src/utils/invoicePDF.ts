/**
 * Invoice PDF Generator
 * 
 * Generates a PDF document from invoice data using client-side PDF generation
 */

export interface InvoicePDFData {
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  issueDate: string;
  dueDate: string;
  description?: string;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPriceCents: number;
    totalCents: number;
  }>;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  currency: string;
  status: string;
}

/**
 * Format currency from cents
 */
function formatCurrency(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Format date
 */
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Generate and download invoice PDF
 */
export async function generateInvoicePDF(invoice: InvoicePDFData): Promise<void> {
  // Create a printable HTML document
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Invoice ${invoice.invoiceNumber}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          font-size: 12px;
          line-height: 1.6;
          color: #333;
          padding: 40px;
          background: white;
        }
        .invoice-header {
          margin-bottom: 30px;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 20px;
        }
        .invoice-title {
          font-size: 28px;
          font-weight: bold;
          color: #111827;
          margin-bottom: 5px;
        }
        .invoice-number {
          font-size: 14px;
          color: #6b7280;
        }
        .invoice-info {
          display: flex;
          justify-content: space-between;
          margin-top: 30px;
          margin-bottom: 30px;
        }
        .bill-to {
          flex: 1;
        }
        .invoice-dates {
          flex: 1;
          text-align: right;
        }
        .section-title {
          font-size: 11px;
          font-weight: 600;
          color: #374151;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }
        .client-name {
          font-size: 14px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 4px;
        }
        .client-email {
          font-size: 12px;
          color: #6b7280;
        }
        .date-value {
          font-size: 12px;
          color: #111827;
          margin-bottom: 4px;
        }
        .description {
          margin: 20px 0;
          padding: 15px;
          background: #f9fafb;
          border-radius: 6px;
          font-size: 12px;
          color: #374151;
        }
        .line-items {
          margin: 30px 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        thead {
          background: #f9fafb;
        }
        th {
          padding: 12px;
          text-align: left;
          font-size: 11px;
          font-weight: 600;
          color: #374151;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 2px solid #e5e7eb;
        }
        td {
          padding: 12px;
          border-bottom: 1px solid #e5e7eb;
          font-size: 12px;
          color: #111827;
        }
        .text-right {
          text-align: right;
        }
        .summary {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 2px solid #e5e7eb;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 12px;
        }
        .summary-label {
          color: #6b7280;
        }
        .summary-value {
          color: #111827;
          font-weight: 500;
        }
        .summary-total {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          margin-top: 10px;
          border-top: 1px solid #e5e7eb;
        }
        .total-label {
          font-size: 14px;
          font-weight: 600;
          color: #111827;
        }
        .total-value {
          font-size: 18px;
          font-weight: bold;
          color: #111827;
        }
        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          margin-top: 10px;
        }
        .status-sent {
          background: #dbeafe;
          color: #1e40af;
        }
        .status-paid {
          background: #d1fae5;
          color: #065f46;
        }
        .status-draft {
          background: #f3f4f6;
          color: #374151;
        }
        .status-overdue {
          background: #fee2e2;
          color: #991b1b;
        }
        @media print {
          body {
            padding: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="invoice-header">
        <div class="invoice-title">INVOICE</div>
        <div class="invoice-number">${invoice.invoiceNumber}</div>
      </div>

      <div class="invoice-info">
        <div class="bill-to">
          <div class="section-title">Bill To</div>
          <div class="client-name">${invoice.clientName}</div>
          <div class="client-email">${invoice.clientEmail}</div>
        </div>
        <div class="invoice-dates">
          <div class="section-title">Issue Date</div>
          <div class="date-value">${formatDate(invoice.issueDate)}</div>
          <div class="section-title" style="margin-top: 15px;">Due Date</div>
          <div class="date-value">${formatDate(invoice.dueDate)}</div>
        </div>
      </div>

      ${invoice.description ? `
        <div class="description">
          <strong>Description:</strong> ${invoice.description}
        </div>
      ` : ''}

      <div class="line-items">
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th class="text-right">Quantity</th>
              <th class="text-right">Unit Price</th>
              <th class="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.lineItems.map(item => `
              <tr>
                <td>${item.description}</td>
                <td class="text-right">${item.quantity}</td>
                <td class="text-right">${formatCurrency(item.unitPriceCents)}</td>
                <td class="text-right">${formatCurrency(item.totalCents)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="summary">
        <div class="summary-row">
          <span class="summary-label">Subtotal</span>
          <span class="summary-value">${formatCurrency(invoice.subtotalCents)}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Tax</span>
          <span class="summary-value">${formatCurrency(invoice.taxCents)}</span>
        </div>
        <div class="summary-total">
          <span class="total-label">Total</span>
          <span class="total-value">${formatCurrency(invoice.totalCents)}</span>
        </div>
        <div style="margin-top: 8px; font-size: 11px; color: #6b7280;">
          Currency: ${invoice.currency}
        </div>
        <div class="status-badge status-${invoice.status.toLowerCase()}">
          ${invoice.status}
        </div>
      </div>
    </body>
    </html>
  `;

  // Create a blob and download
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  // Create a temporary link and trigger download
  const link = document.createElement('a');
  link.href = url;
  link.download = `Invoice-${invoice.invoiceNumber}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Open in new window for printing
  const printWindow = window.open(url, '_blank');
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print();
    };
  }
  
  // Clean up
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

