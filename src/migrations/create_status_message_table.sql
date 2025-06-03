-- Create status_message table for storing dynamic status messages
CREATE TABLE IF NOT EXISTS status_message (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('info', 'success', 'warning', 'error')) DEFAULT 'info',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert a default welcome message
INSERT INTO status_message (message, type)
VALUES ('Welcome to NeoBuddy! Our AI face replacement technology is now available for all users. Enjoy your creative journey!', 'info');

-- Grant access to the table for the anon role
ALTER TABLE status_message ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous read access to status_message" 
  ON status_message
  FOR SELECT
  TO anon
  USING (true);

-- Note: Run this SQL in your Supabase SQL editor to create the status_message table
-- This table will store dynamic status messages that will be displayed on the landing page