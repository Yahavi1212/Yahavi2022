import { toast } from "sonner";
import type {
  RazorpayOptions,
  RazorpayResponse,
  RazorpayError,
} from "@/types/razorpay";

type Callbacks = {
  onSuccess?: (resp: RazorpayResponse) => void;
  onFailure?: (message: string) => void;
  onDismiss?: () => void;
};

export const loadRazorpay = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && (window as { Razorpay?: unknown }).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

function isValidKey(key: string | undefined | null): key is string {
  return typeof key === "string"
    && (key.startsWith("rzp_live_") || key.startsWith("rzp_test_"))
    && !key.includes("REPLACE_WITH");
}

/**
 * Open Razorpay checkout. The caller MUST pass `order_id` (server-issued).
 *
 * The `key` is resolved in this order:
 *   1. options.key                          (preferred — server-issued)
 *   2. import.meta.env.VITE_RAZORPAY_KEY_ID (fallback for local dev)
 * If neither is a real key the request is rejected with a clear error,
 * instead of silently dropping it like the previous version did.
 */
export const initializeRazorpayPayment = async (
  options: Partial<RazorpayOptions> & { callbacks?: Callbacks }
) => {
  const { callbacks, ...rzpOptions } = options;
  const optKey = (rzpOptions as Partial<RazorpayOptions>).key as string | undefined;
  const envKey = import.meta.env.VITE_RAZORPAY_KEY_ID as string | undefined;
  const razorpayKey = isValidKey(optKey) ? optKey : isValidKey(envKey) ? envKey : null;

  if (!razorpayKey) {
    const msg =
      "Payment system is not configured. The server did not return a Razorpay key " +
      "and no fallback key is set. Please contact support.";
    toast.error(msg);
    callbacks?.onFailure?.(msg);
    return;
  }

  const isLoaded = await loadRazorpay();
  if (!isLoaded) {
    toast.error("Payment system failed to load. Check your internet connection.");
    callbacks?.onFailure?.("Failed to load Razorpay script");
    return;
  }

  try {
    const rzp = new window.Razorpay({
      name: "HackKnow",
      description: "Digital Products Marketplace",
      ...rzpOptions,
      key: razorpayKey,
      theme: { color: "#FFD700", ...(rzpOptions.theme || {}) },
      handler: function (response: RazorpayResponse) {
        callbacks?.onSuccess?.(response);
      },
      modal: {
        escape: false,
        backdropclose: false,
        ...(rzpOptions.modal || {}),
        ondismiss: function () {
          callbacks?.onDismiss?.();
        },
      },
    });

    rzp.on("payment.failed", function (response: RazorpayError) {
      const msg = response?.error?.description || "Payment failed";
      toast.error("Payment failed: " + msg);
      callbacks?.onFailure?.(msg);
    });

    rzp.open();
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Razorpay init error:", error);
    toast.error("Could not initialize payment. Please try again.");
    callbacks?.onFailure?.(msg);
  }
};
