-- Add device_id column to user_sessions table
ALTER TABLE user_sessions ADD COLUMN device_id TEXT;

-- Update existing rows with NULL values
UPDATE user_sessions SET device_id = NULL WHERE device_id IS NULL;

-- Note: Run this SQL in your Supabase SQL editor to add the device_id column
-- This column is used to track unique devices and prevent username sharing