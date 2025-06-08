import { useState } from 'react';

interface RazorpayCheckoutProps {
  amount: number; // Amount in INR (will be converted to paise)
  onSuccess: (paymentId: string, orderId: string, signature: string) => void;
  onError: (error: any) => void;
  keyId: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
}

// Define Razorpay interface for TypeScript
declare global {
  interface Window {
    Razorpay: any;
  }
}

const RazorpayCheckout: React.FC<RazorpayCheckoutProps> = ({
  amount,
  onSuccess,
  onError,
  keyId,
  prefill = {},
  notes = {},
  theme = { color: '#3399cc' },
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      // Step 1: Create an order on the server
      const orderResponse = await fetch(
        'https://osknuetmjtuxmhagupks.supabase.co/functions/v1/create-razorpay-order',
        {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          
          body: JSON.stringify({
            amount: amount * 100, // Convert to paise
            currency: 'INR',
            receipt: 'receipt#1',
            notes: notes,
          }),
        }
      );

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const orderData = await orderResponse.json();

      if (!orderData.success || !orderData.order_id) {
        throw new Error('Failed to create order: ' + (orderData.error || 'Unknown error'));
      }

      // Step 2: Initialize Razorpay checkout with the order_id
      const options = {
        key: keyId,
        amount: orderData.amount, // Amount in paise
        currency: orderData.currency,
        name: 'NeoBuddy AI',
        description: 'Payment for NeoBuddy AI services',
        image: 'https://neobuddy.netlify.app/logo.png',
        order_id: orderData.order_id,
        retry: true,
        send_sms_hash: true,
        remember_customer: true,
        analytics: { enable: true },
        callback_url: 'https://neobuddy.netlify.app/payment-success',
        handler: function (response: any) {
          // Handle successful payment
          onSuccess(
            response.razorpay_payment_id,
            response.razorpay_order_id,
            response.razorpay_signature
          );
        },
        prefill: {
          name: prefill.name || '',
          email: prefill.email || '',
          contact: prefill.contact || '',
        },
        notes: notes,
        theme: {
          color: theme.color,
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response: any) {
        let errorMessage = 'Payment failed';
        
        // Enhanced error handling
        if (response.error) {
          if (response.error.code === 'BAD_REQUEST_ERROR') {
            errorMessage = `Payment failed: Invalid request. Please try again.`;
          } else if (response.error.code === 'GATEWAY_ERROR') {
            errorMessage = `Payment gateway error. Please try another payment method.`;
          } else {
            errorMessage = `Payment failed: ${response.error.description || 'Unknown error'}`;
          }
        }
        
        setError(errorMessage);
        onError(response.error);
        setLoading(false);
      });

      razorpay.open();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      onError(err);
      setLoading(false);
    }
  };

  return (
    <div className="razorpay-checkout">
      {error && <div className="error-message">{error}</div>}
      <button
        onClick={handlePayment}
        disabled={loading}
        className="payment-button"
      >
        {loading ? 'Processing...' : 'Pay ₹' + amount}
      </button>
    </div>
  );
};

export default RazorpayCheckout;