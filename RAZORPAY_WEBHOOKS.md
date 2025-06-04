# Razorpay Webhooks Integration Guide

## Overview

This guide explains how to set up and use Razorpay webhooks with NeoBuddy to automatically handle payment status changes. The webhook integration provides real-time updates for payment events such as captures, failures, and refunds.

## Benefits of Using Webhooks

1. **Real-time Updates**: Get immediate notifications when payment statuses change
2. **Automatic Recovery**: Handle payment failures and retries without user intervention
3. **Refund Tracking**: Automatically update user sessions when payments are refunded
4. **Audit Trail**: Maintain a complete log of all payment events for troubleshooting

## Prerequisites

- Supabase project with Edge Functions enabled
- Razorpay account with webhook capability
- Supabase CLI installed (`npm install -g supabase`)

## Implementation Steps

### 1. Database Setup

Create a new table to log webhook events:

```sql
CREATE TABLE payment_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id TEXT NOT NULL,
  event TEXT NOT NULL,
  payload JSONB,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for faster queries
CREATE INDEX idx_payment_logs_payment_id ON payment_logs(payment_id);
CREATE INDEX idx_payment_logs_event ON payment_logs(event);

-- Add additional columns to user_sessions table
ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS payment_failed BOOLEAN DEFAULT false;
ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS payment_failed_reason TEXT;
ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS payment_refunded BOOLEAN DEFAULT false;
ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS refund_amount NUMERIC;
ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS refund_id TEXT;
ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMP WITH TIME ZONE;
```

### 2. Deploy the Webhook Edge Function

```bash
# Login to Supabase CLI
supabase login

# Link to your Supabase project
supabase link --project-ref your-project-ref

# Set required secrets
supabase secrets set RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Deploy the Edge Function
supabase functions deploy razorpay-webhooks --no-verify-jwt
```

### 3. Configure Razorpay Webhooks

1. Log in to your Razorpay Dashboard
2. Go to Settings > Webhooks
3. Click "Add New Webhook"
4. Enter your Supabase Edge Function URL:
   ```
   https://[PROJECT_REF].supabase.co/functions/v1/razorpay-webhooks
   ```
5. Select the following events to monitor:
   - payment.captured
   - payment.failed
   - payment.refunded
6. Generate a webhook secret and save it (this is what you set as RAZORPAY_WEBHOOK_SECRET)
7. Set the webhook status to "Active"

## How It Works

### Event: payment.captured

When a payment is successfully captured:

1. The webhook function finds all user sessions with the matching payment_id
2. Updates them to set `payment_verified = true`
3. Logs the event in the payment_logs table

### Event: payment.failed

When a payment fails:

1. The webhook function finds all user sessions with the matching payment_id
2. Updates them to set `payment_verified = false` and `payment_failed = true`
3. Records the failure reason from Razorpay
4. Logs the event in the payment_logs table

### Event: payment.refunded

When a payment is refunded:

1. The webhook function finds all user sessions with the matching payment_id
2. Updates them to set `payment_refunded = true`
3. Records the refund amount, refund ID, and timestamp
4. Logs the event in the payment_logs table

## Security Considerations

1. **Webhook Signature Verification**: The function verifies the Razorpay signature to ensure the webhook is authentic
2. **Secret Management**: The webhook secret is stored securely in Supabase environment variables
3. **Error Handling**: All errors are logged for troubleshooting

## Monitoring and Debugging

### View Webhook Logs

```bash
supabase functions logs razorpay-webhooks --project-ref your-project-ref
```

### Query Payment Logs

```sql
-- View all payment events
SELECT * FROM payment_logs ORDER BY processed_at DESC LIMIT 100;

-- View events for a specific payment
SELECT * FROM payment_logs WHERE payment_id = 'pay_ABC123' ORDER BY processed_at;

-- View failed payments
SELECT * FROM payment_logs WHERE event = 'payment.failed' ORDER BY processed_at DESC;
```

## Fallback Mechanism

If webhooks fail to deliver (network issues, server downtime, etc.), you can implement a fallback mechanism:

1. Create a scheduled function that runs every few minutes
2. Query Razorpay API for recent payments that haven't been verified
3. Update the payment status manually if needed

## Retry Logic

Razorpay automatically retries webhook delivery if the endpoint returns an error or times out. The retry schedule is:

- 1st retry: 5 minutes after initial failure
- 2nd retry: 10 minutes after 1st retry
- 3rd retry: 20 minutes after 2nd retry
- 4th retry: 40 minutes after 3rd retry
- 5th retry: 80 minutes after 4th retry

After all retries fail, the webhook is marked as failed in the Razorpay dashboard.

## Conclusion

Implementing Razorpay webhooks provides a robust way to handle payment status changes in real-time, improving the reliability of your payment flow and user experience. The webhook integration ensures that your application always has the most up-to-date payment information, even if users close their browser after initiating a payment.