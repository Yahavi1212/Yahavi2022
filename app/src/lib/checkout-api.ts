// All backend traffic goes through hackknow.com (nginx proxy) — never direct.
const WP_PREFIX = '/wp-json/hackknow/v1';

export interface CreateOrderInput {
  items: { product_id: number; quantity: number }[];
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
}

export interface CreateOrderResult {
  wc_order_id: number;
  razorpay_order: string;
  amount: number;
  currency: 'INR';
  key_id: string;
}

export async function createServerOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  const r = await fetch(`${WP_PREFIX}/order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!r.ok) throw new Error(`Order creation failed: ${r.status}`);
  return r.json();
}

export async function verifyServerPayment(payload: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  wc_order_id: number;
}) {
  const r = await fetch(`${WP_PREFIX}/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(`Verification failed: ${r.status}`);
  return r.json();
}
