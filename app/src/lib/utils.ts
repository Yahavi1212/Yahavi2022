import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Parse price string to numeric value
 * Removes currency symbols and returns float
 * Example: "₹499" → 499, "$19.99" → 19.99
 */
export function parsePriceValue(price?: string): number {
  if (!price) return 0;
  const numeric = price.replace(/[^0-9.]/g, "");
  return Number.parseFloat(numeric) || 0;
}
