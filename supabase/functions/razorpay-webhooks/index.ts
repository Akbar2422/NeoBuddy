// supabase/functions/razorpay-webhooks/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHmac } from "https://deno.land/std@0.140.0/node/crypto.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://neobuddy.netlify.app',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-razorpay-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get webhook secret
    const webhookSecret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET')
    if (!webhookSecret) {
      console.error('RAZORPAY_WEBHOOK_SECRET not found')
      return new Response('Webhook secret not configured', { status: 500, headers: corsHeaders })
    }

    // Get raw request body and signature
    const rawBody = await req.text()
    const signature = req.headers.get('x-razorpay-signature')

    if (!signature) {
      console.error('No signature provided')
      return new Response('No signature provided', { status: 400, headers: corsHeaders })
    }

    // Verify webhook signature using createHmac
    const expectedSignature = createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex')

    if (signature !== expectedSignature) {
      console.error('Invalid signature')
      console.error('Received signature:', signature)
      console.error('Expected signature:', expectedSignature)
      return new Response('Invalid signature', { status: 401, headers: corsHeaders })
    }

    // Parse webhook payload after signature verification
    const payload = JSON.parse(rawBody)
    const event = payload.event
    const paymentEntity = payload.payload.payment.entity

    console.log(`Processing webhook event: ${event}`)
    console.log(`Payment ID: ${paymentEntity.id}`)

    // Log the webhook event
    await supabase
      .from('payment_logs')
      .insert({
        payment_id: paymentEntity.id,
        event: event,
        payload: payload
      })

    // Handle different webhook events
    switch (event) {
      case 'payment.captured':
        await handlePaymentCaptured(supabase, paymentEntity)
        break
      
      case 'payment.failed':
        await handlePaymentFailed(supabase, paymentEntity)
        break
      
      case 'refund.created':
        await handleRefundCreated(supabase, payload.payload.refund.entity)
        break
      
      default:
        console.log(`Unhandled event: ${event}`)
    }

    return new Response('OK', { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function handlePaymentCaptured(supabase: any, payment: any) {
  console.log(`Payment captured: ${payment.id}`)
  
  const { error } = await supabase
    .from('user_sessions')
    .update({ 
      payment_verified: true,
      payment_failed: false,
      updated_at: new Date().toISOString()
    })
    .eq('payment_id', payment.id)

  if (error) {
    console.error('Error updating payment status:', error)
    throw error
  }
}

async function handlePaymentFailed(supabase: any, payment: any) {
  console.log(`Payment failed: ${payment.id}`)
  
  const { error } = await supabase
    .from('user_sessions')
    .update({ 
      payment_verified: false,
      payment_failed: true,
      payment_failed_reason: payment.error_description || 'Payment failed',
      updated_at: new Date().toISOString()
    })
    .eq('payment_id', payment.id)

  if (error) {
    console.error('Error updating payment failure:', error)
    throw error
  }
}

async function handleRefundCreated(supabase: any, refund: any) {
  console.log(`Refund created: ${refund.id} for payment: ${refund.payment_id}`)
  
  const { error } = await supabase
    .from('user_sessions')
    .update({ 
      payment_refunded: true,
      refund_amount: refund.amount / 100, // Convert from paise to rupees
      refund_id: refund.id,
      refunded_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('payment_id', refund.payment_id)

  if (error) {
    console.error('Error updating refund status:', error)
    throw error
  }
}