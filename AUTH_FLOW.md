# NeoBuddy Secure Authentication Flow

## Overview

This document outlines the secure authentication flow implemented for NeoBuddy, which enforces payment before showing the username form, prevents username sharing, and manages session rewards.

## Authentication Flow

1. User clicks "Access Now" on a room card
2. Razorpay payment modal opens
3. After successful payment, user is redirected to `/auth?room=abc123`
4. Username form is displayed only after payment verification
5. On submit:
   - System checks if username exists in `user_sessions` for this room
   - For new users: Creates session with 60 rewards
   - For existing users: Resumes session if rewards > 0 and not expired
6. After login, user is automatically redirected to RunPod URL

## Security Features

- **Payment First**: Authentication form is only shown after successful payment
- **Prevent Username Sharing**: Enforces one active session per (username + room_id) pair
- **Device Tracking**: Tracks unique devices to prevent session sharing
- **Rewards Countdown**: Decreases rewards every minute and syncs with Supabase
- **Session Expiry**: Redirects to payment screen when rewards reach zero

## Database Migration

Before using the application, you need to run the SQL migration to add the `device_id` column to the `user_sessions` table:

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `src/migrations/add_device_id_column.sql`
4. Run the SQL query

## Implementation Details

- **Auth Component**: Handles username validation, session management, and rewards countdown
- **App Component**: Manages payment flow and URL parameter handling
- **Session Storage**: Uses localStorage for temporary session persistence with Supabase sync
- **UI**: Matches cyberpunk theme with animations, particles, and gradients

## Testing

To test the authentication flow:

1. Click "Access Now" on any available room
2. Complete the Razorpay payment (use test card details)
3. Enter a username in the authentication form
4. Verify automatic redirect to the room URL
5. Try using the same username on another device to test sharing prevention