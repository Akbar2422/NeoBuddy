// supabase/functions/razorpay-webhooks/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts"

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

    // Get request body and signature
    const body = await req.text()
    const signature = req.headers.get('x-razorpay-signature')

    if (!signature) {
      console.error('No signature provided')
      return new Response('No signature provided', { status: 400, headers: corsHeaders })
    }

    // Verify webhook signature
    const expectedSignature = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(webhookSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    ).then(key => 
      crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body))
    ).then(signature => 
      Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
    )

    if (signature !== expectedSignature) {
      console.error('Invalid signature')
      return new Response('Invalid signature', { status: 401, headers: corsHeaders })
    }

    // Parse webhook payload
    const payload = JSON.parse(body)
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