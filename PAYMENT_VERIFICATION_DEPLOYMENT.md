# Razorpay Payment Verification Deployment Guide

## Overview

This guide explains how to deploy the secure Razorpay payment verification flow for NeoBuddy. The implementation includes:

1. A Supabase Edge Function for server-side payment verification
2. Updated frontend code to verify payments before granting access
3. Database schema changes to track payment verification status

## Prerequisites

- Supabase CLI installed (`npm install -g supabase`)
- Netlify CLI installed (if deploying to Netlify)
- Razorpay API credentials (Key ID and Key Secret)

## Deployment Steps

### 1. Database Migration

Run the SQL migration to add payment verification columns to the user_sessions table:

```sql
-- Run this in Supabase SQL Editor
ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS payment_verified BOOLEAN DEFAULT false;
ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS payment_id TEXT;
CREATE INDEX IF NOT EXISTS idx_user_sessions_payment_id ON user_sessions(payment_id);
```

### 2. Deploy Supabase Edge Function

```bash
# Login to Supabase CLI
supabase login

# Link to your Supabase project
supabase link --project-ref your-project-ref

# Set Razorpay secrets
supabase secrets set RAZORPAY_KEY_ID=your_razorpay_key_id
supabase secrets set RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Deploy the Edge Function
supabase functions deploy verify-razorpay-payment --no-verify-jwt
```

### 3. Configure Netlify Environment Variables

Add the following environment variables in your Netlify project settings:

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key
- `VITE_RAZORPAY_KEY_ID`: Your Razorpay Key ID (public key)

### 4. Deploy Frontend to Netlify

```bash
# Build the project
npm run build

# Deploy to Netlify
netlify deploy --prod
```

## Security Notes

1. **API Key Management**:
   - NEVER expose the Razorpay Key Secret in frontend code
   - Only store secrets in Supabase Edge Function environment variables
   - Regularly rotate API keys for enhanced security

2. **Error Handling**:
   - The Edge Function includes retry logic for network failures
   - Payment verification failures are logged for monitoring
   - Users are prevented from accessing rooms without verified payments

3. **Webhook Integration (Optional Enhancement)**:
   - Consider implementing a separate Edge Function to handle Razorpay webhooks
   - Listen for events like `payment.captured`, `payment.failed`, and `payment.refunded`
   - Update user session status based on webhook events

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure the Edge Function properly handles CORS preflight requests

2. **Authentication Failures**: Verify that the Supabase anon key has permission to call the Edge Function

3. **Payment Verification Failures**: Check Razorpay dashboard for payment status and logs

### Logging

To view Edge Function logs:

```bash
supabase functions logs verify-razorpay-payment --project-ref your-project-ref
```

## Monitoring Recommendations

1. Set up alerts for failed payment verifications
2. Monitor the ratio of verified vs. unverified payments
3. Regularly audit user sessions with missing payment verification

## Future Enhancements

1. Implement automatic retries for failed payments
2. Add webhook support for real-time payment status updates
3. Create an admin dashboard to view and manage payment verifications