import { getAuthToken } from "@/lib/auth-token";

const API_BASE =
  (import.meta.env.VITE_WORDPRESS_API_BASE as string | undefined) ??
  "/wp-json/hackknow/v1";

export interface ServerOrder {
  order_id: number;
  razorpay_order_id: string;
  amount: number;
  currency: string;
  key_id: string;
}

export interface CartLine {
  product_id: string | number;
  quantity: number;
}

export interface CustomerDetails {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
}

async function api<T>(path: string, body: unknown): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.message || `Request failed (${res.status})`);
  }
  return json as T;
}

export function createServerOrder(payload: {
  cart: CartLine[];
  customer: CustomerDetails;
}): Promise<ServerOrder> {
  return api<ServerOrder>("/checkout/create-order", payload);
}

export function verifyServerPayment(payload: {
  order_id: number;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}): Promise<{ success: boolean; order_id: number }> {
  return api("/checkout/verify-payment", payload);
}
