// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

/**
 * create-razorpay-order Edge Function
 * 
 * This function creates a new Razorpay order using the /v1/orders API
 * and returns the order details to the client.
 * 
 * It requires the following environment variables to be set in Supabase:
 * - RAZORPAY_KEY_ID: Your Razorpay Key ID
 * - RAZORPAY_KEY_SECRET: Your Razorpay Key Secret
 */

interface RazorpayOrderResponse {
    id: string;
    entity: string;
    amount: number;
    amount_paid: number;
    amount_due: number;
    currency: string;
    receipt: string;
    status: string;
    attempts: number;
    notes: Record<string, string>;
    created_at: number;
  }
  
  interface CreateOrderResponse {
    success: boolean;
    order_id?: string;
    amount?: number;
    currency?: string;
    receipt?: string;
    error?: string;
  }
  
  // CORS settings for production
  const corsHeaders = {
    'Access-Control-Allow-Origin': 'https://neobuddy.netlify.app',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
  
  Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }
  
    try {
      const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID');
      const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET');
  
      if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
        return new Response(
          JSON.stringify({ success: false, error: 'Server configuration error: Missing Razorpay API keys' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
  
      if (req.method !== 'POST') {
        return new Response(
          JSON.stringify({ success: false, error: 'Method not allowed' }),
          { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
  
      const { amount, currency = 'INR', receipt, notes = {} } = await req.json();
      
      // Generate a unique receipt ID that's less than 40 characters
      // Format: rcpt_<timestamp>_<random3chars>
      const timestamp = Date.now().toString().slice(-10); // Last 10 digits of timestamp
      const randomChars = Math.random().toString(36).substring(2, 5); // 3 random alphanumeric chars
      const uniqueReceipt = `rcpt_${timestamp}_${randomChars}`;
  
      if (!amount) {
        return new Response(
          JSON.stringify({ success: false, error: 'Missing amount in request body' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
  
      const credentials = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);
  
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          receipt: uniqueReceipt, // Use our generated unique receipt ID
          payment_capture: 1,
          notes,
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Razorpay API error:', errorData);
  
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Failed to create order with Razorpay',
            reason: errorData.error?.description || 'Unknown error',
          }),
          { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
  
      const orderData: RazorpayOrderResponse = await response.json();
  
      return new Response(
        JSON.stringify({
          success: true,
          order_id: orderData.id,
          amount: orderData.amount,
          currency: orderData.currency,
          receipt: orderData.receipt,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Unexpected error:', error);
  
      return new Response(
        JSON.stringify({ success: false, error: 'Internal server error', reason: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  });
  