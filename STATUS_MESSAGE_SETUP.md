# NeoBuddy Status Message Feature

## Overview

This feature allows the NeoBuddy landing page to display dynamic status messages fetched from a Supabase database table. The messages are updated in real-time when changes occur in the database.

## Database Setup

Before using this feature, you need to create the `status_message` table in your Supabase database:

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `src/migrations/create_status_message_table.sql`
4. Run the SQL query

## Table Structure

The `status_message` table has the following structure:

- `id`: Unique identifier for each message (UUID)
- `message`: The actual message text (TEXT)
- `type`: The type of message - one of 'info', 'success', 'warning', 'error' (TEXT)
- `created_at`: Timestamp indicating when the message was created (TIMESTAMP WITH TIME ZONE)

## How It Works

1. When the application loads, it fetches the latest status message from the `status_message` table
2. The message is displayed in the StatusMessage component on the landing page
3. A real-time subscription is set up to listen for changes to the `status_message` table
4. When a new message is added or an existing message is updated, the displayed message is automatically updated

## Adding or Updating Messages

To add or update messages:

1. Log in to your Supabase dashboard
2. Navigate to the Table Editor
3. Select the `status_message` table
4. Click "Insert row" to add a new message or edit an existing row
5. The changes will be immediately reflected on the landing page

## Implementation Details

- The feature uses Supabase's real-time subscription capabilities
- Messages are ordered by creation date, with the most recent message displayed
- The StatusMessage component supports different message types with appropriate styling and icons
- Users can dismiss messages by clicking on them (if the onDismiss prop is provided)