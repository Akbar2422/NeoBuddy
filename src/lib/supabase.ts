import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://osknuetmjtuxmhagupks.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9za251ZXRtanR1eG1oYWd1cGtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxNTU2NzAsImV4cCI6MjA2MzczMTY3MH0.F1i8jK0jc-9K75wGAILWtecLHdUldwUEYkwW3SgUs5k';

// Create Supabase client with enhanced realtime options
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

// Enable realtime globally for all tables
supabase.channel('global-db-changes').subscribe();


// Function to fetch available rooms
export async function fetchAvailableRooms() {
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 8); // Format: "HH:MM:SS"
  const today = now.toISOString().split('T')[0]; // Format: "YYYY-MM-DD"
  
  console.log(`Fetching rooms for date: ${today} and time: ${currentTime}`);

  // First, fetch all rooms with time and date constraints
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('session_date', today) // Only fetch rooms scheduled for today
    .lte('session_start_time', currentTime)
    .gte('session_end_time', currentTime);

  if (error) {
    console.error('Error fetching rooms:', error);
    return [];
  }

  console.log(`Found ${data?.length || 0} rooms matching today's date and current time window`);

  // Then filter rooms where current_users < max_users
  const availableRooms = data ? data.filter(room => room.current_users < room.max_users) : [];

  return availableRooms;
}

// Function to check if room is currently active based on session date and times
export function isRoomActive(room) {
  const now = new Date();
  const today = now.toISOString().split('T')[0]; // Format: "YYYY-MM-DD"
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  // First check if session_date matches today's date
  if (!room.session_date || room.session_date !== today) {
    console.log(`Room ${room.id} (${room.name}) is not active: session_date ${room.session_date} doesn't match today ${today}`);
    return false;
  }
  
  // Parse session times (format: HH:MM:SS)
  const startTimeParts = room.session_start_time.split(':');
  const endTimeParts = room.session_end_time.split(':');
  
  const startHour = parseInt(startTimeParts[0], 10);
  const startMinute = parseInt(startTimeParts[1], 10);
  
  const endHour = parseInt(endTimeParts[0], 10);
  const endMinute = parseInt(endTimeParts[1], 10);
  
  // Convert current time to minutes for easier comparison
  const currentTimeInMinutes = currentHour * 60 + currentMinute;
  const startTimeInMinutes = startHour * 60 + startMinute;
  const endTimeInMinutes = endHour * 60 + endMinute;
  
  const isTimeInRange = currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes <= endTimeInMinutes;
  
  if (!isTimeInRange) {
    console.log(`Room ${room.id} (${room.name}) is not active: current time ${currentHour}:${currentMinute} is not within session time ${startHour}:${startMinute} - ${endHour}:${endMinute}`);
  } else {
    console.log(`Room ${room.id} (${room.name}) is active: matches today's date and current time is within session window`);
  }
  
  return isTimeInRange;
}

// Format session time to AM/PM format
export function formatSessionTime(timeString) {
  const timeParts = timeString.split(':');
  let hours = parseInt(timeParts[0], 10);
  const minutes = parseInt(timeParts[1], 10);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  hours = hours % 12;
  hours = hours ? hours : 12; // Convert 0 to 12
  
  return `${hours}${minutes > 0 ? ':' + minutes.toString().padStart(2, '0') : ''} ${ampm}`;
}

// Function to get user session by username and room ID
export async function getUserSession(username, roomId) {
  const { data, error } = await supabase
    .from('user_sessions')
    .select('*')
    .eq('username', username)
    .eq('room_id', roomId)
    .single();
  
  if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
    console.error('Error fetching user session:', error);
    throw error;
  }
  
  return data;
}

// Function to create a new user session
export async function createUserSession(username, roomId) {
  const { data, error } = await supabase
    .from('user_sessions')
    .insert({
      username: username,
      room_id: roomId,
      rewards_left: 60,
      last_updated: new Date().toISOString()
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating user session:', error);
    throw error;
  }
  
  return data;
}

// Function to update user session rewards
export async function updateUserSessionRewards(sessionId, rewardsLeft) {
  const { data, error } = await supabase
    .from('user_sessions')
    .update({
      rewards_left: rewardsLeft,
      last_updated: new Date().toISOString()
    })
    .eq('id', sessionId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating user session:', error);
    throw error;
  }
  
  return data;
}