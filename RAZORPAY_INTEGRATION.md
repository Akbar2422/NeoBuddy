# Razorpay Integration Guide

## Overview
This document outlines how Razorpay payment processing is integrated into the NeoBuddy application.

## Environment Variables

The following environment variables are used for Razorpay integration:

- `VITE_RAZORPAY_KEY_ID`: Your Razorpay Key ID (public key)
- `VITE_RAZORPAY_KEY_SECRET`: Your Razorpay Key Secret (private key)

## Configuration Files

### Local Development
For local development, create a `.env.local` file with your Razorpay test keys:

```
VITE_RAZORPAY_KEY_ID=your_test_key_id
VITE_RAZORPAY_KEY_SECRET=your_test_key_secret
```

### Production
For production, the `.env.production` file contains only the public key:

```
VITE_RAZORPAY_KEY_ID=your_live_key_id
```

**Important:** The secret key should NEVER be committed to version control. Instead, set it as an environment variable in your deployment platform (e.g., Netlify, Vercel).

## Security Best Practices

1. **Never expose the secret key in frontend code**
2. **Always use HTTPS for API calls**
3. **Implement proper webhook validation on your backend**
4. **Verify payment status on your server before confirming transactions**

## Implementation Details

The Razorpay checkout is initialized in the `handlePayment` function in `App.tsx`. The function creates a Razorpay instance with the necessary configuration and handles the payment flow.

## Deployment Checklist

- [ ] Set `VITE_RAZORPAY_KEY_ID` in your deployment platform
- [ ] Set `VITE_RAZORPAY_KEY_SECRET` in your deployment platform (if using server-side validation)
- [ ] Test a live payment after deployment
- [ ] Verify webhook functionality (if applicable)
- [ ] Monitor for any payment errors