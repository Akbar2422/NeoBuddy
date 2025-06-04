-- Migration: Add payment verification columns to user_sessions table

-- Add payment_verified column (boolean with default false)
ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS payment_verified BOOLEAN DEFAULT false;

-- Add payment_id column to store Razorpay payment ID
ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS payment_id TEXT;

-- Add index on payment_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_sessions_payment_id ON user_sessions(payment_id);

-- Comment explaining the purpose of these columns
COMMENT ON COLUMN user_sessions.payment_verified IS 'Indicates whether the payment has been verified with Razorpay API';
COMMENT ON COLUMN user_sessions.payment_id IS 'Stores the Razorpay payment ID for reference and verification';