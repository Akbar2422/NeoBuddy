import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import Session from './components/Session.tsx'
import PrivacyPolicy from './components/PrivacyPolicy.tsx'
import TermsAndConditions from './components/TermsAndConditions.tsx'
import CancellationRefundPolicy from './components/CancellationRefundPolicy.tsx'
import ContactUs from './components/ContactUs.tsx'
import RazorpayDemo from './pages/RazorpayDemo.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/auth" element={<App />} />
        <Route path="/session" element={<Session />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="/cancellation-refund" element={<CancellationRefundPolicy />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/razorpay-demo" element={<RazorpayDemo />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
