# Razorpay Integration Guide: `/v1/orders` Flow

## Overview

This guide explains how to integrate Razorpay payments using the recommended `/v1/orders` flow, which provides better stability and security compared to the `standard_checkout` API.

## Integration Flow

The recommended Razorpay integration follows these steps:

1. **Server-side**: Create an order using Razorpay's `/v1/orders` API
2. **Client-side**: Initialize Razorpay checkout with the `order_id` returned from step 1
3. **Server-side**: Verify the payment signature after successful payment

## Prerequisites

- Razorpay account with API keys
- Supabase project with Edge Functions enabled
- Node.js/TypeScript development environment

## Environment Setup

1. Copy `.env.example` to `.env` for local development:

```bash
cp .env.example .env
```

2. Update the `.env` file with your actual credentials if needed

## Server-side Implementation

### 1. Create Order Function

The `create-razorpay-order` Edge Function creates a new order using Razorpay's API:

```typescript
// supabase/functions/create-razorpay-order/index.ts
// This function creates a new Razorpay order
```

### 2. Verify Signature Function

The `verify-razorpay-signature` Edge Function verifies the payment signature:

```typescript
// supabase/functions/verify-razorpay-signature/index.ts
// This function verifies the signature of a Razorpay payment
```

## Client-side Implementation

### RazorpayCheckout Component

The `RazorpayCheckout` component handles the client-side integration:

```typescript
// src/components/RazorpayCheckout.tsx
// This component initializes the Razorpay checkout
```

### Demo Page

The `RazorpayDemo` page demonstrates the complete integration:

```typescript
// src/pages/RazorpayDemo.tsx
// This page shows how to use the RazorpayCheckout component
```

## Deployment

### Supabase Edge Functions

Deploy the Edge Functions to Supabase:

```bash
supabase functions deploy create-razorpay-order
supabase functions deploy verify-razorpay-signature
```

### Environment Variables

Set the following environment variables in the Supabase dashboard:

- `RAZORPAY_KEY_ID`: Your Razorpay Key ID
- `RAZORPAY_KEY_SECRET`: Your Razorpay Key Secret

## Testing

1. Run the application locally
2. Navigate to the Razorpay demo page
3. Click the "Pay" button to test the integration
4. Use Razorpay test card details for payment:
   - Card Number: 4111 1111 1111 1111
   - Expiry: Any future date
   - CVV: Any 3-digit number
   - Name: Any name
   - 3D Secure Password: 1221

## Debugging the 500 Error with `standard_checkout` API

The 500 Internal Server Error encountered with the `standard_checkout` API could be due to several reasons:

1. **Authentication Issues**: The API key might not have the necessary permissions or might be incorrect
2. **Invalid Parameters**: The `session_token` parameter might be invalid or expired
3. **Special Characters**: The request might contain emojis or special characters that cause issues
4. **API Deprecation**: The `standard_checkout` API might be deprecated or changed
5. **Server Issues**: Razorpay's servers might be experiencing issues

The recommended `/v1/orders` flow avoids these issues by using a more stable and well-documented API endpoint.

## Security Best Practices

1. **Never expose the secret key in frontend code**
2. **Always use HTTPS for API calls**
3. **Verify payment signatures server-side**
4. **Implement proper error handling**
5. **Use webhooks for asynchronous payment status updates**

## Troubleshooting

### Common Issues

1. **Order creation fails**: Check your API keys and request parameters
2. **Checkout doesn't open**: Ensure the Razorpay script is loaded correctly
3. **Payment verification fails**: Check the signature verification logic
4. **CORS errors**: Ensure your Edge Functions have proper CORS headers

### Razorpay Support

If you encounter persistent issues, contact Razorpay support with the following information:

- Your Razorpay account ID
- The API endpoint you're trying to access
- The error message and code
- The request parameters (excluding sensitive information)

## Conclusion

By following this guide, you've implemented Razorpay payments using the recommended `/v1/orders` flow, which provides better stability, security, and user experience compared to the `standard_checkout` API.