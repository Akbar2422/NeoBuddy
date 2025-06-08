/**
 * create-razorpay-order.js
 * 
 * This script demonstrates how to create a Razorpay order using the /v1/orders API
 * directly from Node.js without using the Supabase Edge Function.
 * 
 * Usage:
 * 1. Make sure you have Node.js installed
 * 2. Run: node create-razorpay-order.js
 */

require('dotenv').config(); // Load environment variables from .env file

const https = require('https');

// Razorpay API credentials
const KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_A0zub0VQNCBpb1';
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '7uKfZGwbPBvZc084wz3qnE1F';

// Order details
const orderData = {
  amount: 50000, // ₹500 in paise
  currency: 'INR',
  receipt: 'receipt#1',
  payment_capture: 1, // Auto-capture payment
  notes: {
    purpose: 'Test order',
  },
};

// Create Basic Auth credentials
const auth = Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString('base64');

// Request options
const options = {
  hostname: 'api.razorpay.com',
  port: 443,
  path: '/v1/orders',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${auth}`,
  },
};

// Create the request
const req = https.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 200) {
      const order = JSON.parse(data);
      console.log('Order created successfully!');
      console.log('Order ID:', order.id);
      console.log('Amount:', order.amount / 100, order.currency);
      console.log('Receipt:', order.receipt);
      console.log('Status:', order.status);
      console.log('\nUse this order_id in your frontend Razorpay checkout.');
    } else {
      console.error('Failed to create order:');
      console.error(data);
    }
  });
});

// Handle request errors
req.on('error', (error) => {
  console.error('Error creating order:', error.message);
});

// Send the request with order data
req.write(JSON.stringify(orderData));
req.end();

console.log('Creating Razorpay order...');