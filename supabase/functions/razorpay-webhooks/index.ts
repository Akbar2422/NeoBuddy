// Supabase Edge Function for handling Razorpay webhooks
// This function listens for Razorpay webhook events and updates user sessions accordingly

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import * as crypto from 'https://deno.land/std@0.168.0/crypto/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, razorpay-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get environment variables
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || ''
    const RAZORPAY_WEBHOOK_SECRET = Deno.env.get('RAZORPAY_WEBHOOK_SECRET') || ''

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !RAZORPAY_WEBHOOK_SECRET) {
      throw new Error('Missing environment variables')
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

    // Get request body and signature
    const body = await req.text()
    const signature = req.headers.get('razorpay-signature')

    if (!signature) {
      throw new Error('Missing Razorpay signature')
    }

    // Verify webhook signature
    const isValid = await verifyWebhookSignature(body, signature, RAZORPAY_WEBHOOK_SECRET)
    if (!isValid) {
      throw new Error('Invalid webhook signature')
    }

    // Parse webhook payload
    const payload = JSON.parse(body)
    const event = payload.event
    const paymentId = payload.payload?.payment?.entity?.id

    if (!paymentId) {
      throw new Error('Missing payment ID in webhook payload')
    }

    console.log(`Processing Razorpay webhook: ${event} for payment ${paymentId}`)

    // Handle different webhook events
    switch (event) {
      case 'payment.captured':
        await handlePaymentCaptured(supabase, paymentId, payload)
        break
      case 'payment.failed':
        await handlePaymentFailed(supabase, paymentId, payload)
        break
      case 'payment.refunded':
        await handlePaymentRefunded(supabase, paymentId, payload)
        break
      default:
        console.log(`Unhandled webhook event: ${event}`)
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Webhook processing error:', error.message)
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

// Verify Razorpay webhook signature
async function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    // Convert secret to Uint8Array
    const keyData = new TextEncoder().encode(secret)
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )

    // Create HMAC signature
    const bodyData = new TextEncoder().encode(body)
    const signatureData = await crypto.subtle.sign('HMAC', key, bodyData)
    const signatureHex = Array.from(new Uint8Array(signatureData))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    // Compare signatures
    return signature === signatureHex
  } catch (error) {
    console.error('Signature verification error:', error)
    return false
  }
}

// Handle payment.captured webhook event
async function handlePaymentCaptured(supabase: any, paymentId: string, payload: any) {
  try {
    // Find user session with this payment ID
    const { data: sessions, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('payment_id', paymentId)

    if (error) throw error

    if (sessions && sessions.length > 0) {
      // Update all sessions with this payment ID to mark as verified
      const { error: updateError } = await supabase
        .from('user_sessions')
        .update({ payment_verified: true })
        .eq('payment_id', paymentId)

      if (updateError) throw updateError
      console.log(`Updated ${sessions.length} sessions for payment ${paymentId} as verified`)
    } else {
      console.log(`No sessions found for payment ${paymentId}`)
    }

    // Log the webhook event for auditing
    await supabase.from('payment_logs').insert({
      payment_id: paymentId,
      event: 'payment.captured',
      payload: payload,
      processed_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error handling payment.captured:', error)
    throw error
  }
}

// Handle payment.failed webhook event
async function handlePaymentFailed(supabase: any, paymentId: string, payload: any) {
  try {
    // Find user session with this payment ID
    const { data: sessions, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('payment_id', paymentId)

    if (error) throw error

    if (sessions && sessions.length > 0) {
      // Update all sessions with this payment ID to mark as failed
      const { error: updateError } = await supabase
        .from('user_sessions')
        .update({ 
          payment_verified: false,
          payment_failed: true,
          payment_failed_reason: payload.payload?.payment?.entity?.error_description || 'Payment failed'
        })
        .eq('payment_id', paymentId)

      if (updateError) throw updateError
      console.log(`Updated ${sessions.length} sessions for payment ${paymentId} as failed`)
    }

    // Log the webhook event for auditing
    await supabase.from('payment_logs').insert({
      payment_id: paymentId,
      event: 'payment.failed',
      payload: payload,
      processed_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error handling payment.failed:', error)
    throw error
  }
}

// Handle payment.refunded webhook event
async function handlePaymentRefunded(supabase: any, paymentId: string, payload: any) {
  try {
    // Find user session with this payment ID
    const { data: sessions, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('payment_id', paymentId)

    if (error) throw error

    if (sessions && sessions.length > 0) {
      // Update all sessions with this payment ID to mark as refunded
      const { error: updateError } = await supabase
        .from('user_sessions')
        .update({ 
          payment_refunded: true,
          refund_amount: payload.payload?.refund?.entity?.amount / 100, // Convert from paise to rupees
          refund_id: payload.payload?.refund?.entity?.id,
          refunded_at: new Date().toISOString()
        })
        .eq('payment_id', paymentId)

      if (updateError) throw updateError
      console.log(`Updated ${sessions.length} sessions for payment ${paymentId} as refunded`)
    }

    // Log the webhook event for auditing
    await supabase.from('payment_logs').insert({
      payment_id: paymentId,
      event: 'payment.refunded',
      payload: payload,
      processed_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error handling payment.refunded:', error)
    throw error
  }
}