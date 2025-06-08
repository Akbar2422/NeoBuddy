import { useState } from 'react';
import RazorpayCheckout from '../components/RazorpayCheckout';

const RazorpayDemo = () => {
  // Use the test credentials provided
  const RAZORPAY_KEY_ID = 'rzp_test_A0zub0VQNCBpb1';
  
  const [paymentStatus, setPaymentStatus] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);

  const handlePaymentSuccess = (paymentId: string, orderId: string, signature: string) => {
    console.log('Payment successful:', { paymentId, orderId, signature });
    
    // In a real application, you would verify the payment on your server
    // by sending these details to a verification endpoint
    
    setPaymentStatus({
      success: true,
      message: 'Payment successful!',
      details: { paymentId, orderId, signature }
    });
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment failed:', error);
    
    setPaymentStatus({
      success: false,
      message: `Payment failed: ${error.description || error.message || 'Unknown error'}`,
      details: error
    });
  };

  const resetStatus = () => {
    setPaymentStatus(null);
  };

  return (
    <div className="razorpay-demo-container">
      <h1>Razorpay Integration Demo</h1>
      <p>This page demonstrates the recommended Razorpay integration flow using the <code>/v1/orders</code> API.</p>
      
      <div className="demo-card">
        <h2>Test Payment</h2>
        <p>Amount: ₹500</p>
        
        {!paymentStatus ? (
          <RazorpayCheckout
            amount={500} // ₹500
            keyId={RAZORPAY_KEY_ID}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            prefill={{
              name: 'Test User',
              email: 'test@example.com',
              contact: '9999999999'
            }}
            theme={{
              color: '#3399cc'
            }}
          />
        ) : (
          <div className={`status-card ${paymentStatus.success ? 'success' : 'error'}`}>
            <h3>{paymentStatus.success ? 'Payment Successful' : 'Payment Failed'}</h3>
            <p>{paymentStatus.message}</p>
            
            {paymentStatus.success && paymentStatus.details && (
              <div className="payment-details">
                <p><strong>Payment ID:</strong> {paymentStatus.details.paymentId}</p>
                <p><strong>Order ID:</strong> {paymentStatus.details.orderId}</p>
                <p><strong>Signature:</strong> {paymentStatus.details.signature}</p>
              </div>
            )}
            
            <button onClick={resetStatus}>Try Again</button>
          </div>
        )}
      </div>
      
      <div className="integration-notes">
        <h2>Integration Notes</h2>
        <ul>
          <li>This demo uses the recommended <code>/v1/orders</code> flow instead of <code>standard_checkout</code>.</li>
          <li>The order is created server-side using a Supabase Edge Function.</li>
          <li>The payment is processed client-side using the Razorpay checkout.</li>
          <li>Test credentials are used for this demo.</li>
          <li>In a production environment, you should verify the payment signature server-side.</li>
        </ul>
      </div>
      
      <style jsx>{`
        .razorpay-demo-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          font-family: Arial, sans-serif;
        }
        
        .demo-card {
          background: #f5f5f5;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .status-card {
          padding: 15px;
          border-radius: 4px;
          margin-top: 20px;
        }
        
        .status-card.success {
          background-color: #d4edda;
          border: 1px solid #c3e6cb;
          color: #155724;
        }
        
        .status-card.error {
          background-color: #f8d7da;
          border: 1px solid #f5c6cb;
          color: #721c24;
        }
        
        .payment-details {
          background: rgba(255,255,255,0.5);
          padding: 10px;
          border-radius: 4px;
          margin: 10px 0;
        }
        
        button {
          background: #3399cc;
          color: white;
          border: none;
          padding: 10px 15px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
          margin-top: 10px;
        }
        
        button:hover {
          background: #2980b9;
        }
        
        .integration-notes {
          background: #e9f7fe;
          border-left: 4px solid #3498db;
          padding: 15px;
          border-radius: 4px;
          margin-top: 30px;
        }
        
        code {
          background: #f1f1f1;
          padding: 2px 5px;
          border-radius: 3px;
          font-family: monospace;
        }
      `}</style>
    </div>
  );
};

export default RazorpayDemo;