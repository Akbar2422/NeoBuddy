# Razorpay Integration Testing Guide

## Overview

This guide provides instructions for testing the Razorpay integration using the `/v1/orders` flow. The implementation includes both server-side and client-side components, with a focus on security and reliability.

## Prerequisites

- Node.js and npm installed
- Supabase CLI installed (for deploying Edge Functions)
- Razorpay test account credentials

## Environment Setup

1. Create a `.env` file based on the provided `.env.example`:

```
# Razorpay API Keys (Test Mode)
VITE_RAZORPAY_KEY_ID=rzp_test_A0zub0VQNCBpb1
RAZORPAY_KEY_ID=rzp_test_A0zub0VQNCBpb1
RAZORPAY_KEY_SECRET=7uKfZGwbPBvZc084wz3qnE1F

# Supabase Environment Variables
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Razorpay Webhook Secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

## Testing the Integration

### 1. Local Testing with Node.js Script

To test the order creation process without deploying the Edge Function:

```bash
npm run create-order
```

This script will create a test order using the Razorpay API and display the order details.

### 2. Testing the React Component

Access the Razorpay demo page at:

```
http://localhost:5173/razorpay-demo
```

or

```
https://your-deployed-site.com/razorpay-demo
```

The demo page includes a test payment button that will:
1. Create an order using the server-side function
2. Initialize the Razorpay checkout with the order ID
3. Handle the payment response

### 3. Testing with Vanilla JavaScript

A vanilla JavaScript implementation is available at:

```
examples/razorpay-vanilla-js.html
```

Open this file in a browser to test the integration without React.

## Deployment

### 1. Deploy the Edge Functions

```bash
npm run deploy:functions
```

This will deploy both the `create-razorpay-order` and `verify-razorpay-signature` Edge Functions to Supabase.

### 2. Set Environment Variables

In the Supabase dashboard, set the following environment variables for the Edge Functions:

- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`

## Troubleshooting

### Common Issues

1. **500 Error from Edge Function**
   - Check that the environment variables are correctly set
   - Verify that the Razorpay API keys are valid
   - Check the Edge Function logs in the Supabase dashboard

2. **Payment Verification Fails**
   - Ensure the signature verification is correctly implemented
   - Check that the order ID and payment ID are being passed correctly

3. **Razorpay Checkout Doesn't Open**
   - Verify that the Razorpay script is loaded
   - Check for JavaScript errors in the browser console
   - Ensure the order creation was successful

## Test Credentials

Use these test credentials for the Razorpay checkout:

- **Card Number**: 4111 1111 1111 1111
- **Expiry Date**: Any future date
- **CVV**: Any 3-digit number
- **Name**: Any name
- **OTP**: 1234

## Additional Resources

- [Razorpay API Documentation](https://razorpay.com/docs/api/)
- [Razorpay Test Mode Guide](https://razorpay.com/docs/payments/payments/test-mode/)
- [Supabase Edge Functions Documentation](https://supabase.com/docs/guides/functions)

## Implementation Files

- Server-side:
  - `supabase/functions/create-razorpay-order/index.ts`
  - `supabase/functions/verify-razorpay-signature/index.ts`

- Client-side:
  - `src/components/RazorpayCheckout.tsx`
  - `src/pages/RazorpayDemo.tsx`

- Testing:
  - `scripts/create-razorpay-order.js`
  - `examples/razorpay-vanilla-js.html`