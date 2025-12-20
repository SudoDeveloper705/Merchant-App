import Stripe from 'stripe';

/**
 * Normalize Stripe PaymentIntent to transaction format
 */
export interface NormalizedTransaction {
  external_id: string;
  transaction_type: 'PAYMENT' | 'REFUND' | 'CHARGEBACK';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  subtotal_cents: number;
  sales_tax_cents: number;
  total_cents: number;
  fees_cents: number;
  net_cents: number;
  currency: string;
  description?: string;
  transaction_date: Date;
  metadata: Record<string, any>;
  raw_stripe_data: any;
}

/**
 * Normalize Stripe PaymentIntent to our transaction format
 */
export function normalizePaymentIntent(
  paymentIntent: Stripe.PaymentIntent,
  charge?: Stripe.Charge
): NormalizedTransaction {
  const amount = paymentIntent.amount;
  const currency = paymentIntent.currency.toUpperCase();
  
  // Get fees from charge if available
  let feesCents = 0;
  if (charge && charge.balance_transaction) {
    // Fees are typically in the balance transaction
    // For now, we'll calculate from the charge amount vs payment intent amount
    // In production, you'd fetch the balance transaction for accurate fees
    feesCents = 0; // Will be updated when we have balance transaction
  }

  // Calculate subtotal (amount before tax)
  // Stripe doesn't separate tax, so we'll set it to 0 unless we have line items
  let subtotalCents = amount;
  let salesTaxCents = 0;

  // If we have line items with tax, calculate it
  if (paymentIntent.metadata?.tax_amount) {
    salesTaxCents = parseInt(paymentIntent.metadata.tax_amount) || 0;
    subtotalCents = amount - salesTaxCents;
  }

  // Total is the payment intent amount
  const totalCents = amount;
  
  // Net is total minus fees
  const netCents = totalCents - feesCents;

  // Determine transaction type
  let transactionType: 'PAYMENT' | 'REFUND' | 'CHARGEBACK' = 'PAYMENT';
  if (paymentIntent.metadata?.transaction_type === 'REFUND') {
    transactionType = 'REFUND';
  } else if (paymentIntent.metadata?.transaction_type === 'CHARGEBACK') {
    transactionType = 'CHARGEBACK';
  }

  // Map Stripe status to our status
  let status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' = 'PENDING';
  switch (paymentIntent.status) {
    case 'succeeded':
      status = 'COMPLETED';
      break;
    case 'canceled':
      status = 'CANCELLED';
      break;
    case 'processing':
    case 'requires_action':
    case 'requires_capture':
    case 'requires_confirmation':
    case 'requires_payment_method':
      status = 'PENDING';
      break;
    default:
      status = 'FAILED';
  }

  return {
    external_id: paymentIntent.id,
    transaction_type: transactionType,
    status,
    subtotal_cents: subtotalCents,
    sales_tax_cents: salesTaxCents,
    total_cents: totalCents,
    fees_cents: feesCents,
    net_cents: netCents,
    currency,
    description: paymentIntent.description || paymentIntent.metadata?.description,
    transaction_date: new Date(paymentIntent.created * 1000),
    metadata: {
      stripe_payment_intent_id: paymentIntent.id,
      stripe_customer_id: typeof paymentIntent.customer === 'string' 
        ? paymentIntent.customer 
        : paymentIntent.customer?.id,
      stripe_charge_id: charge?.id,
      payment_method: paymentIntent.payment_method,
      ...paymentIntent.metadata,
    },
    raw_stripe_data: paymentIntent,
  };
}

/**
 * Normalize Stripe Charge to transaction format
 */
export function normalizeCharge(charge: Stripe.Charge): NormalizedTransaction {
  const amount = charge.amount;
  const currency = charge.currency.toUpperCase();
  
  // Get fees from balance transaction if available
  let feesCents = 0;
  if (charge.balance_transaction && typeof charge.balance_transaction === 'object') {
    feesCents = charge.balance_transaction.fee || 0;
  }

  // Calculate subtotal and tax
  let subtotalCents = amount;
  let salesTaxCents = 0;

  if (charge.metadata?.tax_amount) {
    salesTaxCents = parseInt(charge.metadata.tax_amount) || 0;
    subtotalCents = amount - salesTaxCents;
  }

  const totalCents = amount;
  const netCents = totalCents - feesCents;

  // Determine transaction type
  let transactionType: 'PAYMENT' | 'REFUND' | 'CHARGEBACK' = 'PAYMENT';
  if (charge.refunded) {
    transactionType = 'REFUND';
  } else if ((charge as any).dispute || (charge as any).disputed) {
    transactionType = 'CHARGEBACK';
  }

  // Map Stripe status to our status
  let status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' = 'PENDING';
  if (charge.status === 'succeeded') {
    status = 'COMPLETED';
  } else if (charge.status === 'failed') {
    status = 'FAILED';
  } else if (charge.refunded) {
    status = 'COMPLETED'; // Refund is completed
  }

  return {
    external_id: charge.id,
    transaction_type: transactionType,
    status,
    subtotal_cents: subtotalCents,
    sales_tax_cents: salesTaxCents,
    total_cents: totalCents,
    fees_cents: feesCents,
    net_cents: netCents,
    currency,
    description: charge.description || charge.metadata?.description,
    transaction_date: new Date(charge.created * 1000),
    metadata: {
      stripe_charge_id: charge.id,
      stripe_customer_id: typeof charge.customer === 'string' 
        ? charge.customer 
        : charge.customer?.id,
      stripe_payment_intent_id: typeof charge.payment_intent === 'string'
        ? charge.payment_intent
        : charge.payment_intent?.id,
      ...charge.metadata,
    },
    raw_stripe_data: charge,
  };
}

/**
 * Normalize Stripe Payout to our payout format
 */
export interface NormalizedPayout {
  external_id: string;
  amount_cents: number;
  currency: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  payout_reference: string;
  processed_at?: Date;
  metadata: Record<string, any>;
  raw_stripe_data: any;
}

export function normalizePayout(payout: Stripe.Payout): NormalizedPayout {
  let status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' = 'PENDING';
  
  switch (payout.status) {
    case 'paid':
      status = 'COMPLETED';
      break;
    case 'pending':
      status = 'PENDING';
      break;
    case 'in_transit':
      status = 'PROCESSING';
      break;
    case 'canceled':
      status = 'CANCELLED';
      break;
    case 'failed':
      status = 'FAILED';
      break;
  }

  return {
    external_id: payout.id,
    amount_cents: payout.amount,
    currency: payout.currency.toUpperCase(),
    status,
    payout_reference: payout.id,
    processed_at: payout.arrival_date ? new Date(payout.arrival_date * 1000) : undefined,
    metadata: {
      stripe_payout_id: payout.id,
      destination: payout.destination,
      method: payout.method,
      ...payout.metadata,
    },
    raw_stripe_data: payout,
  };
}

