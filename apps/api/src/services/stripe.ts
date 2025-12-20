import Stripe from 'stripe';
import { db } from '../config/database';
import { decrypt } from '../utils/encryption';

/**
 * Get Stripe client for a merchant's payment processor
 */
export async function getStripeClient(merchantId: string, processorId?: string): Promise<Stripe> {
  let query = `
    SELECT id, api_key_encrypted, processor_account_id
    FROM merchant_payment_processors
    WHERE merchant_id = $1 AND processor_type = 'STRIPE' AND is_active = true
  `;
  const params: any[] = [merchantId];

  if (processorId) {
    query += ' AND id = $2';
    params.push(processorId);
  } else {
    query += ' AND is_default = true';
  }

  const result = await db.query(query, params);

  if (result.rows.length === 0) {
    throw new Error('No active Stripe connection found for merchant');
  }

  const processor = result.rows[0];
  
  if (!processor.api_key_encrypted) {
    throw new Error('Stripe API key not configured');
  }

  const apiKey = decrypt(processor.api_key_encrypted);
  
  return new Stripe(apiKey, {
    apiVersion: '2024-11-20.acacia',
    typescript: true,
  });
}

/**
 * Fetch payments from Stripe
 */
export async function fetchStripePayments(
  stripe: Stripe,
  options: {
    limit?: number;
    startingAfter?: string;
    endingBefore?: string;
    created?: { gte?: number; lte?: number };
  } = {}
): Promise<Stripe.PaymentIntent[]> {
  const params: Stripe.PaymentIntentListParams = {
    limit: options.limit || 100,
    expand: ['data.charges', 'data.customer'],
  };

  if (options.startingAfter) {
    params.starting_after = options.startingAfter;
  }

  if (options.endingBefore) {
    params.ending_before = options.endingBefore;
  }

  if (options.created) {
    params.created = options.created;
  }

  const paymentIntents = await stripe.paymentIntents.list(params);
  return paymentIntents.data;
}

/**
 * Fetch charges from Stripe
 */
export async function fetchStripeCharges(
  stripe: Stripe,
  options: {
    limit?: number;
    startingAfter?: string;
    endingBefore?: string;
    created?: { gte?: number; lte?: number };
  } = {}
): Promise<Stripe.Charge[]> {
  const params: Stripe.ChargeListParams = {
    limit: options.limit || 100,
    expand: ['data.customer', 'data.payment_intent'],
  };

  if (options.startingAfter) {
    params.starting_after = options.startingAfter;
  }

  if (options.endingBefore) {
    params.ending_before = options.endingBefore;
  }

  if (options.created) {
    params.created = options.created;
  }

  const charges = await stripe.charges.list(params);
  return charges.data;
}

/**
 * Fetch payouts from Stripe
 */
export async function fetchStripePayouts(
  stripe: Stripe,
  options: {
    limit?: number;
    startingAfter?: string;
    endingBefore?: string;
    created?: { gte?: number; lte?: number };
  } = {}
): Promise<Stripe.Payout[]> {
  const params: Stripe.PayoutListParams = {
    limit: options.limit || 100,
  };

  if (options.startingAfter) {
    params.starting_after = options.startingAfter;
  }

  if (options.endingBefore) {
    params.ending_before = options.endingBefore;
  }

  if (options.created) {
    params.created = options.created;
  }

  const payouts = await stripe.payouts.list(params);
  return payouts.data;
}

/**
 * Get a specific payment intent by ID
 */
export async function getStripePaymentIntent(
  stripe: Stripe,
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  return await stripe.paymentIntents.retrieve(paymentIntentId, {
    expand: ['charges', 'customer'],
  });
}

/**
 * Get a specific charge by ID
 */
export async function getStripeCharge(
  stripe: Stripe,
  chargeId: string
): Promise<Stripe.Charge> {
  return await stripe.charges.retrieve(chargeId, {
    expand: ['customer', 'payment_intent'],
  });
}

/**
 * Get account information
 */
export async function getStripeAccount(stripe: Stripe): Promise<Stripe.Account> {
  return await stripe.accounts.retrieve();
}

