import { Link } from 'react-router-dom';

const RazorpayDemoLink = () => {
  return (
    <div className="razorpay-demo-link">
      <Link to="/razorpay-demo" className="demo-button">
        Try Razorpay Demo
      </Link>
      
      <style jsx>{`
        .razorpay-demo-link {
          margin: 20px 0;
          text-align: center;
        }
        
        .demo-button {
          display: inline-block;
          background-color: #3399cc;
          color: white;
          padding: 10px 20px;
          border-radius: 4px;
          text-decoration: none;
          font-weight: bold;
          transition: background-color 0.3s ease;
        }
        
        .demo-button:hover {
          background-color: #2980b9;
        }
      `}</style>
    </div>
  );
};

export default RazorpayDemoLink;