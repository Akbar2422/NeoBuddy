// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

/**
 * verify-razorpay-signature Edge Function
 * 
 * This function verifies the signature of a Razorpay payment
 * to ensure the payment was completed successfully and the
 * response wasn't tampered with.
 * 
 * It requires the following environment variables to be set in Supabase:
 * - RAZORPAY_KEY_ID: Your Razorpay Key ID
 * - RAZORPAY_KEY_SECRET: Your Razorpay Key Secret
 */

import { createHmac } from 'https://deno.land/std@0.168.0/node/crypto.ts';

interface VerifySignatureResponse {
  success: boolean;
  verified: boolean;
  payment_id?: string;
  order_id?: string;
  error?: string;
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://neobuddy.netlify.app',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET');

    if (!RAZORPAY_KEY_SECRET) {
      return new Response(
        JSON.stringify({ success: false, error: 'Server configuration error: Missing Razorpay API secret' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ success: false, error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = await req.json();

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(payload)
      .digest('hex');

    const isSignatureValid = expectedSignature === razorpay_signature;

    const result: VerifySignatureResponse = {
      success: true,
      verified: isSignatureValid,
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
    };

    if (!isSignatureValid) {
      result.error = 'Invalid signature';
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Unexpected error:', error);

    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error', reason: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
