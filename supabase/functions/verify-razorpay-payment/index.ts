// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

/**
 * verify-razorpay-payment Edge Function
 * 
 * This function verifies that a Razorpay payment has been captured
 * by checking the payment status with the Razorpay API.
 * 
 * It requires the following environment variables to be set in Supabase:
 * - RAZORPAY_KEY_ID: Your Razorpay Key ID
 * - RAZORPAY_KEY_SECRET: Your Razorpay Key Secret
 */

interface RazorpayPaymentResponse {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: string;
  order_id: string;
  captured: boolean;
  description?: string;
  email?: string;
  contact?: string;
  error_code?: string;
  error_description?: string;
  error_source?: string;
  error_step?: string;
  error_reason?: string;
  created_at: number;
}

interface VerifyPaymentResponse {
  success: boolean;
  verified: boolean;
  payment_id?: string;
  status?: string;
  amount?: number;
  currency?: string;
  error?: string;
  reason?: string;
}

// Handle CORS preflight requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    // Get Razorpay API keys from environment variables
    const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID');
    const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET');
    
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Server configuration error: Missing Razorpay API keys',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Method not allowed',
        }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Parse request body
    const { payment_id } = await req.json();
    
    if (!payment_id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing payment_id in request body',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Create Basic Auth credentials for Razorpay API
    const credentials = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);
    
    // Fetch payment details from Razorpay API
    const response = await fetch(`https://api.razorpay.com/v1/payments/${payment_id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Razorpay API error:', errorData);
      
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to verify payment with Razorpay',
          reason: errorData.error?.description || 'Unknown error',
        }),
        {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Parse payment details
    const paymentData: RazorpayPaymentResponse = await response.json();
    
    // Check if payment is captured
    const isVerified = paymentData.status === 'captured' && paymentData.captured === true;
    
    const result: VerifyPaymentResponse = {
      success: true,
      verified: isVerified,
      payment_id: paymentData.id,
      status: paymentData.status,
      amount: paymentData.amount,
      currency: paymentData.currency,
    };
    
    // If payment is not captured, add error information
    if (!isVerified) {
      result.error = 'Payment not captured';
      result.reason = paymentData.status === 'authorized' 
        ? 'Payment is authorized but not captured' 
        : `Payment status is ${paymentData.status}`;
    }
    
    // Return the verification result
    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
    
  } catch (error) {
    // Handle any unexpected errors
    console.error('Unexpected error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
        reason: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});