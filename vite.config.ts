import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.RAZORPAY_KEY_ID': JSON.stringify(process.env.VITE_RAZORPAY_KEY_ID),
    // Note: We don't expose the secret key to the frontend
  },
})
