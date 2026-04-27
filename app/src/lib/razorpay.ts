
import { toast } from 'sonner';
import type { RazorpayOptions, RazorpayResponse, RazorpayError } from '@/types/razorpay';

export const loadRazorpay = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const initializeRazorpayPayment = async (options: Partial<RazorpayOptions>) => {
  // Validate Razorpay key
  const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;

  if (!razorpayKey || razorpayKey === 'rzp_live_REPLACE_WITH_YOUR_KEY') {
    console.error('❌ Razorpay key not configured');
    toast.error('Payment system is not configured. Please contact support.');
    return;
  }

  if (!razorpayKey.startsWith('rzp_live_') && !razorpayKey.startsWith('rzp_test_')) {
    console.error('❌ Invalid Razorpay key format');
    toast.error('Payment configuration error. Please contact support.');
    return;
  }

  const isLoaded = await loadRazorpay();
  if (!isLoaded) {
    toast.error('Payment system failed to load. Please check your internet connection.');
    return;
  }

  try {
    const rzp = new window.Razorpay({
      key: razorpayKey,
      name: 'Hackknow',
      description: 'Digital Products Marketplace',
      ...options,
      theme: {
        color: '#FFD700',
      },
      handler: function (response: RazorpayResponse) {
        console.log('✅ Payment Successful:', response);
        toast.success('Payment successful! Processing your order...');
        // Pending: WooCommerce order creation API integration after payment success
      },
      modal: {
        ondismiss: function () {
          console.log('Checkout form closed');
        },
        escape: false,
        backdropclose: false,
      },
    });

    rzp.on('payment.failed', function (response: RazorpayError) {
      console.error('❌ Payment failed:', response.error);
      toast.error('Payment failed: ' + response.error.description);
    });

    rzp.open();
  } catch (error) {
    console.error('❌ Razorpay initialization error:', error);
    toast.error('Could not initialize payment. Please try again.');
  }
};
