/**
 * Central place to resolve the WordPress backend URL.
 *
 * Default: hits shop.hackknow.com directly (CORS is allowed server-side
 * by the hackknow-checkout mu-plugin).
 *
 * To hide the subdomain via the hackknow.com nginx reverse proxy, set
 *   VITE_WP_API_BASE=  (empty string)  or  VITE_WP_API_BASE=/
 * and make sure /wp-json and /graphql are proxied to shop.hackknow.com.
 */
const raw = (import.meta.env.VITE_WP_API_BASE as string | undefined);
export const API_BASE: string =
  raw === undefined ? "https://shop.hackknow.com" : raw.replace(/\/+$/, "");

export const WP_REST_BASE = `${API_BASE}/wp-json/hackknow/v1`;
export const WP_GRAPHQL_URL = `${API_BASE}/graphql`;
