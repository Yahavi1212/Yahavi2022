import { toast } from "sonner";
import type { RazorpayOptions, RazorpayResponse, RazorpayError } from "@/types/razorpay";

export const loadRazorpay = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
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

export interface RazorpayCallbacks {
  onSuccess?: (response: RazorpayResponse) => void;
  onFailure?: (error: RazorpayError["error"]) => void;
  onDismiss?: () => void;
}

/**
 * Open Razorpay checkout. The caller MUST pass an `order_id` returned by the
 * server and the matching `key` (key_id). All success/failure handling is
 * delegated to the caller via callbacks so the UI never marks an order paid
 * before the server has verified the signature.
 */
export const initializeRazorpayPayment = async (
  options: Partial<RazorpayOptions>,
  callbacks: RazorpayCallbacks = {}
) => {
  const razorpayKey = options.key ?? (import.meta.env.VITE_RAZORPAY_KEY_ID as string | undefined);

  if (!razorpayKey || razorpayKey === "rzp_live_REPLACE_WITH_YOUR_KEY") {
    console.error("Razorpay key not configured");
    toast.error("Payment system is not configured. Please contact support.");
    callbacks.onFailure?.({ description: "Razorpay key not configured" } as RazorpayError["error"]);
    return;
  }

  if (!razorpayKey.startsWith("rzp_live_") && !razorpayKey.startsWith("rzp_test_")) {
    console.error("Invalid Razorpay key format");
    toast.error("Payment configuration error. Please contact support.");
    callbacks.onFailure?.({ description: "Invalid Razorpay key" } as RazorpayError["error"]);
    return;
  }

  const isLoaded = await loadRazorpay();
  if (!isLoaded) {
    toast.error("Payment system failed to load. Please check your internet connection.");
    callbacks.onFailure?.({ description: "Failed to load Razorpay" } as RazorpayError["error"]);
    return;
  }

  try {
    const rzp = new window.Razorpay({
      name: "Hackknow",
      description: "Digital Products Marketplace",
      ...options,
      key: razorpayKey,
      theme: { color: "#FFD700", ...(options.theme || {}) },
      handler: function (response: RazorpayResponse) {
        callbacks.onSuccess?.(response);
      },
      modal: {
        escape: false,
        backdropclose: false,
        ...(options.modal || {}),
        ondismiss: function () {
          callbacks.onDismiss?.();
        },
      },
    });

    rzp.on("payment.failed", function (response: RazorpayError) {
      console.error("Payment failed:", response.error);
      callbacks.onFailure?.(response.error);
    });

    rzp.open();
  } catch (error) {
    console.error("Razorpay initialization error:", error);
    toast.error("Could not initialize payment. Please try again.");
    callbacks.onFailure?.({ description: String(error) } as RazorpayError["error"]);
  }
};
