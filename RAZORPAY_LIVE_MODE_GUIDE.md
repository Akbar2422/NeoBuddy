# Razorpay Integration: Transitioning from Test to Live Mode

## Overview

This guide provides step-by-step instructions for transitioning your Razorpay integration from test mode to live mode. It covers all necessary changes to environment variables, Supabase secrets, security considerations, and best practices for a production environment.

## Prerequisites

- Completed test mode integration using the `/v1/orders` flow
- Razorpay live account with activated payment methods
- Supabase project with deployed Edge Functions
- Proper domain verification and SSL setup for your production website

## Step 1: Update Razorpay API Keys

### Local Environment Variables

1. Update your `.env` file with live mode credentials:

```
# Razorpay API Keys (Live Mode)
VITE_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx

# Supabase Edge Function Environment Variables
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx

# Other variables remain the same
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> **IMPORTANT**: Never commit your live API keys to version control. Make sure `.env` is in your `.gitignore` file.

### Supabase Secrets

2. Update the Supabase Edge Function secrets with live credentials:

```bash
supabase secrets set RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
```

Alternatively, you can set these in the Supabase dashboard:
- Go to Project Settings > API > Edge Functions
- Update the environment variables with your live credentials

## Step 2: Redeploy Edge Functions

After updating the secrets, redeploy your Edge Functions to apply the changes:

```bash
npm run deploy:functions
```

Or manually deploy each function:

```bash
supabase functions deploy create-razorpay-order
supabase functions deploy verify-razorpay-signature
```

## Step 3: Update Client-Side Configuration

### Frontend Environment Variables

When building for production, ensure your frontend environment variables are updated:

```bash
# For local testing with live keys
VITE_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx npm run build

# For deployment platforms like Vercel, Netlify, etc.
# Set the environment variables in their respective dashboards
```

### Authorization Headers

The `Authorization` header with the Supabase anon key is **required in both test and live modes**. This header authenticates your client with Supabase Edge Functions:

```javascript
headers: {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
}
```

> **Security Note**: The anon key is designed to be public and used in client-side code. It has limited permissions defined by your Supabase Row Level Security (RLS) policies.

## Step 4: Razorpay Checkout Configuration Differences

### Live Mode Specific Settings

When transitioning to live mode, consider these additional configuration options:

1. **Branding and UX**:
   - Update the `image` URL to your production logo
   - Ensure `name` and `description` are appropriate for customer receipts
   - Consider customizing the theme color to match your brand

2. **Callback URLs**:
   - Update any hardcoded callback URLs to use your production domain
   - Ensure webhook endpoints are properly configured for live mode

3. **Additional Options for Live Mode**:

```javascript
const options = {
  // ... existing options
  
  // Recommended for production
  retry: true, // Enable automatic retries on payment failures
  send_sms_hash: true, // For faster OTP auto-read
  remember_customer: true, // For returning customers
  
  // Optional but recommended for better analytics
  analytics: {
    enable: true,
  },
};
```

## Step 5: Enhanced Security for Production

### 1. Implement Webhook Verification

For asynchronous payment confirmations, set up Razorpay webhooks:

1. Configure webhook endpoints in the Razorpay dashboard
2. Generate and store a webhook secret
3. Verify webhook signatures in your backend

```typescript
// Example webhook verification
const webhookSignature = request.headers.get('x-razorpay-signature');
const isValid = verifyWebhookSignature(requestBody, webhookSignature, WEBHOOK_SECRET);
```

### 2. Implement Additional Error Handling

Enhance error handling for production:

```typescript
try {
  // Payment processing
} catch (error) {
  // Detailed error logging
  console.error('Payment error:', error.code, error.description);
  
  // User-friendly error messages based on error type
  if (error.code === 'BAD_REQUEST_ERROR') {
    // Handle validation errors
  } else if (error.code === 'GATEWAY_ERROR') {
    // Handle payment gateway issues
  } else {
    // Generic error handling
  }
  
  // Error reporting to monitoring service
  reportErrorToMonitoring(error);
}
```

### 3. Implement Proper CORS Headers

Review and restrict CORS headers in production:

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://your-production-domain.com',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
```

## Step 6: Testing Live Integration

Before full deployment, test your live integration thoroughly:

1. Make a small real payment (e.g., ₹1) to verify the complete flow
2. Test error scenarios (insufficient funds, declined cards)
3. Verify webhook functionality
4. Check payment records in the Razorpay dashboard

## Step 7: Monitoring and Logging

Implement proper monitoring for production:

1. Set up Supabase Edge Function logs monitoring
2. Configure alerts for payment failures
3. Implement transaction logging for reconciliation
4. Set up regular backups of payment records

## Common Issues When Going Live

1. **Domain Verification**: Ensure your domain is verified in the Razorpay dashboard
2. **SSL Certificate**: Ensure your website uses HTTPS
3. **Payment Methods**: Verify all required payment methods are activated
4. **KYC Completion**: Ensure your business KYC is complete for live payments
5. **Rate Limits**: Be aware of API rate limits in production

## Production Checklist

- [ ] Live Razorpay API keys configured
- [ ] Supabase secrets updated
- [ ] Edge Functions redeployed
- [ ] Frontend environment variables updated
- [ ] Proper error handling implemented
- [ ] CORS headers restricted to production domains
- [ ] Webhook verification implemented
- [ ] SSL certificate installed
- [ ] Domain verified in Razorpay dashboard
- [ ] Test transactions completed successfully
- [ ] Monitoring and logging configured

## Conclusion

By following this guide, you've successfully transitioned your Razorpay integration from test mode to live mode. Your application is now ready to process real payments securely and efficiently.

For any issues or questions, refer to the [Razorpay API Documentation](https://razorpay.com/docs/api/) or contact Razorpay support.