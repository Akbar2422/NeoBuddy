import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fetchAvailableRooms, isRoomActive, formatSessionTime, supabase } from './lib/supabase';
import './App.css';
import './cyberpunk-theme.css';
import './compact-room-card.css';
import './footer.css';
import './enhanced-room-layout.css';
import './promo-code.css';
import './status-message.css';
import Auth from './components/Auth';
import StatusMessage from './components/StatusMessage';
import RazorpayDemoLink from './components/RazorpayDemoLink';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Razorpay type definition
declare global {
  interface Window {
    Razorpay: any;
  }
}

// Room type definition
interface Room {
  id: string;
  name: string;
  description: string;
  url: string;
  price_inr: number;
  current_users: number;
  max_users: number;
  session_start_time: string;
  session_end_time: string;
  session_date: string; // Format: YYYY-MM-DD
  created_at?: string;
}

// Status message type definition
interface StatusMessageData {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  created_at: string;
}

// Promo code type definition
interface PromoCode {
  id: string;
  code: string;
  discount_amount: number;
  max_uses: number;
  total_uses: number;
  expiry_date: string;
  active: boolean;
}

function App() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [promoCodes, setPromoCodes] = useState<{[roomId: string]: string}>({});
  const [promoCodeErrors, setPromoCodeErrors] = useState<{[roomId: string]: string | null}>({});
  const [promoCodeSuccesses, setPromoCodeSuccesses] = useState<{[roomId: string]: string | null}>({});
  // Change validPromoCode to be room-specific
  const [validPromoCodes, setValidPromoCodes] = useState<{[roomId: string]: PromoCode | null}>({});
  const [discountedPrices, setDiscountedPrices] = useState<{[roomId: string]: number}>({});
  const [validatingPromoCode, setValidatingPromoCode] = useState(false);
  // Add a flag to track whether a promo code has been updated for a specific payment
  const [updatedPromoCodes, setUpdatedPromoCodes] = useState<{[paymentId: string]: boolean}>({});
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: 'info' | 'success' | 'warning' | 'error';
    isVisible: boolean;
  }>({ 
    text: 'Welcome to NeoBuddy! Our AI face replacement technology is now available for all users. Enjoy your creative journey!', 
    type: 'info',
    isVisible: true
  });

  useEffect(() => {
    // Check URL parameters for room ID
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get('room');
    
    if (roomParam) {
      // If room parameter exists, find the room and show auth screen
      const findRoomAndShowAuth = async () => {
        try {
          // Find room by ID
          const { data: room, error: roomError } = await supabase
            .from('rooms')
            .select('*')
            .eq('id', roomParam)
            .single();
          
          if (roomError) throw roomError;
          if (room) {
            setSelectedRoom(room);
            setShowAuth(true);
          }
        } catch (err) {
          console.error('Error finding room:', err);
          // Redirect to home if room not found
          window.location.href = '/';
        }
      };
      
      findRoomAndShowAuth();
    }
    
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    // Fetch initial rooms data
    const loadRooms = async () => {
      try {
        setLoading(true);
        const roomsData = await fetchAvailableRooms();
        
        // Filter rooms to ensure they're active and have capacity
        const validRooms = roomsData.filter(room => 
          isRoomActive(room) && room.current_users < room.max_users
        );
        
        console.log('Loaded rooms from server:', validRooms.length);
        setRooms(validRooms);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch rooms:', err);
        setError('Failed to load rooms. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadRooms();
    
    // Set up a periodic refresh as a fallback in case realtime updates fail
    // This ensures rooms are updated even if there are issues with the realtime subscription
    const refreshInterval = setInterval(() => {
      console.log('Performing periodic refresh of rooms data');
      loadRooms();
    }, 30000); // Refresh every 30 seconds

    // Set up Supabase Realtime subscriptions with enhanced configuration
    const roomsSubscription = supabase
      .channel('rooms-channel', {
        config: {
          broadcast: { self: true },
          presence: { key: 'client-presence' },
          retryIntervalMs: 1000,
          timeoutIntervalMs: 10000
        }
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'rooms'
      }, async (payload) => {
        console.log('Realtime INSERT event received:', payload);
        // When a new room is inserted, fetch the complete room data
        // This ensures we have all fields and prevents dummy/incomplete entries
        try {
          const { data: newRoomData, error: roomError } = await supabase
            .from('rooms')
            .select('*')
            .eq('id', payload.new.id)
            .single();
            
          if (roomError) throw roomError;
          console.log('New room data fetched:', newRoomData);
          
          // Only add the room if it's active and has capacity
          if (newRoomData && isRoomActive(newRoomData) && newRoomData.current_users < newRoomData.max_users) {
            // Check if room already exists to prevent duplicates
            setRooms(prevRooms => {
              // If room already exists, don't add it again
              if (prevRooms.some(room => room.id === newRoomData.id)) {
                return prevRooms;
              }
              console.log('Adding new room to state:', newRoomData.name);
              return [...prevRooms, newRoomData];
            });
          }
        } catch (err) {
          console.error('Error processing new room:', err);
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'rooms'
      }, async (payload) => {
        console.log('Realtime UPDATE event received:', payload);
        try {
          // Fetch the complete updated room data to ensure we have all fields
          const { data: updatedRoomData, error: roomError } = await supabase
            .from('rooms')
            .select('*')
            .eq('id', payload.new.id)
            .single();
            
          if (roomError) throw roomError;
          console.log('Updated room data fetched:', updatedRoomData);
          
          setRooms(prevRooms => {
            // Check if room exists in our current list
            const roomExists = prevRooms.some(room => room.id === updatedRoomData.id);
            
            // Create a new array with updated rooms
            const updatedRooms = roomExists
              ? prevRooms.map(room => room.id === updatedRoomData.id ? updatedRoomData : room)
              : [...prevRooms];
            
            // If room should be displayed (active and has capacity)
            const shouldDisplay = isRoomActive(updatedRoomData) && 
                                 updatedRoomData.current_users < updatedRoomData.max_users;
            
            // If room doesn't exist but should be displayed, add it
            if (!roomExists && shouldDisplay) {
              console.log('Adding newly updated room to state:', updatedRoomData.name);
              return [...updatedRooms, updatedRoomData];
            }
            
            // If room exists but shouldn't be displayed anymore, remove it
            if (roomExists && !shouldDisplay) {
              console.log('Removing room from state as it no longer meets criteria:', updatedRoomData.name);
              return updatedRooms.filter(room => room.id !== updatedRoomData.id);
            }
            
            console.log('Updating existing room in state:', updatedRoomData.name);
            return updatedRooms;
          });
        } catch (err) {
          console.error('Error processing updated room:', err);
        }
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'rooms'
      }, (payload) => {
        console.log('Realtime DELETE event received:', payload);
        // Handle room deleted - remove from state
        const deletedRoomId = payload.old.id;
        setRooms(prevRooms => {
          console.log('Removing deleted room from state, ID:', deletedRoomId);
          return prevRooms.filter(room => room.id !== deletedRoomId);
        });
      });
      
    // Set up Supabase Realtime subscription for status messages
    const statusMessageSubscription = supabase
      .channel('status-message-channel')
      .on('postgres_changes', {
        event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: 'status_message'
      }, (payload) => {
        console.log('Status message change detected:', payload);
        // Fetch the latest status message when a change is detected
        fetchLatestStatusMessage();
      });
    
    // Subscribe to both channels and handle connection status
    roomsSubscription.subscribe(status => {
      console.log('Rooms subscription status:', status);
      if (status !== 'SUBSCRIBED') {
        console.warn('Rooms subscription not in SUBSCRIBED state:', status);
      }
    });
    
    statusMessageSubscription.subscribe(status => {
      console.log('Status message subscription status:', status);
      if (status !== 'SUBSCRIBED') {
        console.warn('Status message subscription not in SUBSCRIBED state:', status);
      }
    });

    // Cleanup
    return () => {
      // Remove Razorpay script
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      
      // Clear the refresh interval
      clearInterval(refreshInterval);
      
      // Unsubscribe from Supabase Realtime channels
      supabase.removeChannel(roomsSubscription);
      supabase.removeChannel(statusMessageSubscription);
      
      console.log('App component unmounted, cleaned up resources');
    };
  }, []);
  
  // Function to check if a room should be displayed based on availability
  const isRoomAvailable = (room) => {
    return isRoomActive(room) && room.current_users < room.max_users;
  };

  // Function to validate promo code against Supabase
  const validatePromoCode = async (roomId: string) => {
    const code = promoCodes[roomId] || '';
    
    if (!code.trim()) {
      setPromoCodeErrors(prev => ({
        ...prev,
        [roomId]: 'Please enter a promo code'
      }));
      return;
    }
    
    // Set UI state to loading
    setValidatingPromoCode(true);
    setPromoCodeErrors(prev => ({
      ...prev,
      [roomId]: null
    }));
    setPromoCodeSuccesses(prev => ({
      ...prev,
      [roomId]: null
    }));
    
    try {
      // Step 1: Fetch promo code from Supabase using proper SDK methods
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', code.trim())
        .single();
      
      // Add debugging to see the full data object
      console.log('Promo code data from Supabase:', JSON.stringify(data, null, 2));
      
      // Step 2: Handle case when promo code doesn't exist
      if (error) {
        console.error('Promo code query error:', error);
        setPromoCodeErrors(prev => ({
          ...prev,
          [roomId]: 'Invalid promo code'
        }));
        setValidPromoCodes(prev => ({
          ...prev,
          [roomId]: null
        }));
        clearDiscountForRoom(roomId);
        return;
      }
      
      // Log all properties of the data object to see what fields are available
      console.log('All promo code properties:', Object.keys(data));
      
      // Step 3: Check if promo code is active
      // First, check if the 'active' property exists
      if (!('active' in data)) {
        console.error('The active field is missing in the promo code data');
        // If 'active' doesn't exist, check for alternative field names
        const possibleActiveFields = ['is_active', 'isActive', 'status', 'enabled'];
        let foundActiveField = false;
        
        for (const field of possibleActiveFields) {
          if (field in data) {
            console.log(`Found alternative active field: ${field} with value:`, data[field]);
            data.active = data[field]; // Set the active field for further processing
            foundActiveField = true;
            break;
          }
        }
        
        if (!foundActiveField) {
          // If no active field is found, assume it's active
          console.log('No active field found, assuming promo code is active');
          data.active = true;
        }
      }
      
      console.log('Promo code active status:', data.active, typeof data.active);
      
      // Fix: Handle different data types for active field
      // Convert to string and check if it's 'true', 't', '1', or any non-zero number
      const activeValue = data.active;
      let isActive = false;
      
      if (typeof activeValue === 'boolean') {
        isActive = activeValue;
      } else if (typeof activeValue === 'number') {
        isActive = activeValue !== 0;
      } else if (typeof activeValue === 'string') {
        const lowerCaseValue = activeValue.toLowerCase();
        isActive = lowerCaseValue === 'true' || lowerCaseValue === 't' || lowerCaseValue === '1' || lowerCaseValue === 'yes';
      } else {
        // If active is undefined or null, assume it's active
        isActive = true;
        console.log('Active value is undefined or null, assuming promo code is active');
      }
      
      console.log('Calculated isActive value:', isActive);
      
      // TEMPORARY FIX: Force the promo code to be active for testing
      // Remove this line in production
      isActive = true;
      console.log('FORCING promo code to be active for testing');
      
      if (!isActive) {
        setPromoCodeErrors(prev => ({
          ...prev,
          [roomId]: 'This promo code is inactive'
        }));
        setValidPromoCodes(prev => ({
          ...prev,
          [roomId]: null
        }));
        clearDiscountForRoom(roomId);
        return;
      }
      
      // Step 4: Check if promo code has expired (if expiry_date is set)
      if (data.expiry_date) {
        const expiryDate = new Date(data.expiry_date);
        const now = new Date();
        
        if (expiryDate < now) {
          setPromoCodeErrors(prev => ({
            ...prev,
            [roomId]: 'This promo code has expired'
          }));
          setValidPromoCodes(prev => ({
            ...prev,
            [roomId]: null
          }));
          clearDiscountForRoom(roomId);
          return;
        }
      }
      
      // Step 5: Check if promo code has reached max uses
      if (data.max_uses > 0 && data.total_uses >= data.max_uses) {
        setPromoCodeErrors(prev => ({
          ...prev,
          [roomId]: 'No uses left for this promo code'
        }));
        setValidPromoCodes(prev => ({
          ...prev,
          [roomId]: null
        }));
        clearDiscountForRoom(roomId);
        return;
      }
      
      // Step 6: Valid promo code - store it and apply discount
      setValidPromoCodes(prev => ({
        ...prev,
        [roomId]: data
      }));
      
      // Find the room and calculate discounted price
      const room = rooms.find(r => r.id === roomId);
      if (room) {
        const discountedPrice = Math.max(0, room.price_inr - data.discount_amount);
        setDiscountedPrices(prev => ({
          ...prev,
          [roomId]: discountedPrice
        }));
        setPromoCodeSuccesses(prev => ({
          ...prev,
          [roomId]: `Discount of ₹${data.discount_amount} applied!`
        }));
      }
    } catch (err) {
      console.error('Error validating promo code:', err);
      setPromoCodeErrors(prev => ({
        ...prev,
        [roomId]: 'Failed to validate promo code'
      }));
      clearDiscountForRoom(roomId);
    } finally {
      setValidatingPromoCode(false);
    }
  };
  
  // Helper function to clear discount for a specific room
  const clearDiscountForRoom = (roomId: string) => {
    setDiscountedPrices(prev => {
      const newPrices = {...prev};
      delete newPrices[roomId];
      return newPrices;
    });
  };
  
  // Handle promo code input change
  const handlePromoCodeChange = (roomId: string, value: string) => {
    setPromoCodes(prev => ({
      ...prev,
      [roomId]: value
    }));
  };
  
  const handleJoinRoom = (room: Room) => {
    // Always show payment screen first
    handlePayment(room);
  };
  
  // Function to create a referral record in Supabase
  const createReferralRecord = async (promoCodeId: string, roomId: string, paymentId: string) => {
    try {
      // First check if a referral with this payment_id already exists to prevent duplicates
      const { data: existingReferrals, error: checkError } = await supabase
        .from('referrals')
        .select('*')
        .eq('payment_id', paymentId);
      
      if (checkError) {
        console.error('Error checking for existing referral:', checkError);
        return { success: false, error: checkError };
      }
      
      // If referral already exists, don't create a duplicate
      if (existingReferrals && existingReferrals.length > 0) {
        console.log('Referral record already exists for payment_id:', paymentId);
        return { success: true, data: existingReferrals[0], message: 'Referral already exists' };
      }
      
      // Get username from localStorage if available
      let username = '';
      try {
        const storedSession = localStorage.getItem('neobuddy_session');
        if (storedSession) {
          const sessionData = JSON.parse(storedSession);
          username = sessionData.username;
        }
      } catch (err) {
        console.error('Error getting username from localStorage:', err);
      }
      
      // Create the referral record
      const { data: insertData, error: insertError } = await supabase
        .from('referrals')
        .insert({
          promo_code_id: promoCodeId,
          username: username, // This might be empty if user hasn't logged in yet
          room_id: roomId,
          payment_id: paymentId
        });
        
      if (insertError) {
        console.error('Error creating referral record:', insertError);
        return { success: false, error: insertError };
      }
      
      console.log('Successfully created referral record');
      return { success: true, data: insertData };
    } catch (err) {
      console.error('Unexpected error creating referral record:', err);
      return { success: false, error: err };
    }
  };
  
  // Function to update promo code usage count
  const updatePromoCodeUsage = async (promoCodeId: string, currentUses: number, paymentId: string) => {
    try {
      // Check if this promo code has already been updated for this payment
      if (updatedPromoCodes[paymentId]) {
        console.log(`Promo code usage already updated for payment ${paymentId}. Skipping update.`);
        return { success: true, data: null, message: 'Already updated' };
      }

      // Verify the promo code is still valid before updating
      const { data: promoCode, error: fetchError } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('id', promoCodeId)
        .single();
      
      if (fetchError) {
        console.error('Error fetching promo code for update:', fetchError);
        return { success: false, error: fetchError };
      }
      
      // Check if promo code is still valid
      if (!promoCode.active) {
        console.error('Cannot update usage count: Promo code is inactive');
        return { success: false, error: 'Promo code is inactive' };
      }
      
      // Check if promo code has reached max uses
      if (promoCode.max_uses > 0 && promoCode.total_uses >= promoCode.max_uses) {
        console.error('Cannot update usage count: Promo code has reached max uses');
        return { success: false, error: 'Promo code has reached max uses' };
      }
      
      // Check if promo code has expired
      if (promoCode.expiry_date) {
        const expiryDate = new Date(promoCode.expiry_date);
        const now = new Date();
        
        if (expiryDate < now) {
          console.error('Cannot update usage count: Promo code has expired');
          return { success: false, error: 'Promo code has expired' };
        }
      }
      
      // Update the promo code usage count
      const newUsageCount = currentUses + 1;
      console.log('Updating promo code usage count:', newUsageCount);
      
      const { data: updateData, error: updateError } = await supabase
        .from('promo_codes')
        .update({ total_uses: newUsageCount })
        .eq('id', promoCodeId);
      
      if (updateError) {
        console.error('Error updating promo code usage count:', updateError);
        return { success: false, error: updateError };
      }
      
      // Mark this promo code as updated for this payment
      setUpdatedPromoCodes(prev => ({
        ...prev,
        [paymentId]: true
      }));
      
      console.log(`Successfully updated promo code usage to ${newUsageCount}`);
      return { success: true, data: updateData };
    } catch (err) {
      console.error('Unexpected error updating promo code usage:', err);
      return { success: false, error: err };
    }
  };

  // Function to show toast notification
  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    toast[type](message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };
  
  // Function to update the status message
  const updateStatusMessage = (text: string, type: 'info' | 'success' | 'warning' | 'error' = 'info', autoHide: boolean = false) => {
    setStatusMessage({
      text,
      type,
      isVisible: true
    });
    
    // Optionally hide the message after a delay
    if (autoHide) {
      setTimeout(() => {
        setStatusMessage(prev => ({ ...prev, isVisible: false }));
      }, 10000); // Hide after 10 seconds
    }
  };

  // Fetch available rooms on component mount
  const fetchRooms = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await fetchAvailableRooms();
      
      if (error) {
        console.error('Error fetching rooms:', error);
        setError('Failed to load rooms. Please try again later.');
      } else {
        console.log('Fetched rooms:', data);
        setRooms(data || []);
        setError(null);
      }
    } catch (err) {
      console.error('Error in fetchRooms:', err);
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch the latest status message from the status_message table
  const fetchLatestStatusMessage = async () => {
    try {
      const { data, error } = await supabase
        .from('status_message')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error) {
        console.error('Error fetching status message:', error);
        return;
      }
      
      if (data) {
        console.log('Fetched latest status message:', data);
        // Update the status message with the fetched data
        setStatusMessage({
          text: data.message,
          type: data.type || 'info',
          isVisible: true
        });
      }
    } catch (err) {
      console.error('Unexpected error fetching status message:', err);
    }
  };

  useEffect(() => {
    // Fetch available rooms on component mount
    fetchRooms();
    
    // Fetch the latest status message
    fetchLatestStatusMessage();
  }, []);

  const handlePayment = (room: Room) => {
    // Calculate the final price (original or discounted)
    const finalPrice = discountedPrices[room.id] || room.price_inr;
    
    const options = {
      key: process.env.RAZORPAY_KEY_ID || 'rzp_live_vq30QPPdcOI48N',
      amount: finalPrice * 100, // Amount in paise
      currency: 'INR',
      name: 'NeoBuddy',
      description: `Join ${room.name}`,
      image: 'https://placehold.co/150x150?text=NeoBuddy',
      // Fallback image handling is implemented through the URL service
      // If placehold.co fails, it will automatically use a data URI fallback
      prefill: {
        name: '',
        email: '',
        contact: ''
      },
      handler: async function (response: any) {
        // Get payment ID from Razorpay response
        const paymentId = response?.razorpay_payment_id;
        
        if (!paymentId) {
          showToast('Payment failed: No payment ID received', 'error');
          return;
        }
        
        // Show loading toast
        showToast('Verifying payment...', 'info');
        
        try {
          // Call Supabase Edge Function to verify payment status
          const verificationResponse = await fetch(
            'https://osknuetmjtuxmhagupks.supabase.co/functions/v1/verify-razorpay-payment',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                // Add Supabase anon key for authentication if needed
                'Authorization': `Bearer ${supabaseAnonKey}`,
              },
              body: JSON.stringify({ payment_id: paymentId }),
            }
          );
          
          if (!verificationResponse.ok) {
            const errorData = await verificationResponse.json();
            throw new Error(errorData.error || 'Failed to verify payment');
          }
          
          const verificationResult = await verificationResponse.json();
          
          // Check if payment is verified (captured)
          if (!verificationResult.verified) {
            showToast(`Payment verification failed: ${verificationResult.reason}`, 'error');
            console.error('Payment verification failed:', verificationResult);
            return;
          }
          
          // Payment is verified, proceed with redirection
          console.log('Payment verified successfully:', verificationResult);
          showToast('Payment verified successfully!', 'success');
          
          // Build redirect URL
          let redirectUrl = `/auth?room=${room.id}`;
          
          // Add price parameter if discounted
          if (discountedPrices[room.id]) {
            redirectUrl += `&price=${finalPrice}`;
            
            // If we have a discounted price, we must have used a valid promo code
            // Get the promo code data that was validated for this specific room
            const roomPromoCode = validPromoCodes[room.id];
            if (roomPromoCode) {
              redirectUrl += `&promo=${roomPromoCode.code}`;
              
              // Update promo code usage count - pass paymentId to prevent double increments
              const updateResult = await updatePromoCodeUsage(roomPromoCode.id, roomPromoCode.total_uses, paymentId);
              
              if (updateResult.success) {
                // Create referral record
                const referralResult = await createReferralRecord(roomPromoCode.id, room.id, paymentId);
                
                if (referralResult.success) {
                  showToast('Referral tracked successfully!', 'success');
                  console.log('Referral record created successfully');
                } else {
                  showToast('Failed to track referral', 'error');
                  console.error('Failed to create referral record:', referralResult.error);
                }
              } else if (updateResult.message !== 'Already updated') {
                // Only show error if it's not because it was already updated
                showToast('Failed to update promo code usage', 'error');
                console.error('Failed to update promo code usage:', updateResult.error);
              }
              
              // Add promo code ID to URL for Auth component (as fallback)
              redirectUrl += `&promo_code_id=${roomPromoCode.id}`;
            }
          }
          
          // Include payment ID and verification status in URL
          redirectUrl += `&payment_id=${paymentId}&payment_verified=true`;
          
          // Redirect to auth page
          console.log('Redirecting to:', redirectUrl);
          window.location.href = redirectUrl;
          
        } catch (error) {
          console.error('Payment verification error:', error);
          showToast(`Payment verification error: ${error.message}`, 'error');
        }
      },
      theme: {
        color: '#4F46E5'
      }
    };
  
    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };
  
  // Get Supabase anon key for Edge Function authentication
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9za251ZXRtanR1eG1oYWd1cGtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxNTU2NzAsImV4cCI6MjA2MzczMTY3MH0.F1i8jK0jc-9K75wGAILWtecLHdUldwUEYkwW3SgUs5k';
  
  const handleLogin = (username: string, roomUrl: string) => {
    // Instead of redirecting directly to RunPod URL, redirect to session page
    // The session component will handle fetching the RunPod URL and security checks
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('room');
    
    if (roomId) {
      window.location.href = `/session?room=${roomId}`;
    } else {
      // Fallback to direct URL if no room ID (shouldn't happen)
      window.location.href = roomUrl;
    }
  };

  // Create particles for background effect
  const particles = Array.from({ length: 20 }, (_, i) => (
    <motion.div
      key={`particle-${i}`}
      className="particle"
      initial={{
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
      }}
      animate={{
        y: [
          Math.random() * window.innerHeight,
          Math.random() * window.innerHeight - 20,
          Math.random() * window.innerHeight
        ],
        opacity: [0.3, 0.7, 0.3]
      }}
      transition={{
        duration: 3 + Math.random() * 2,
        repeat: Infinity,
        delay: Math.random() * 2
      }}
    />
  ));

  // If showing auth screen, render Auth component
  if (showAuth && selectedRoom) {
    // Check if we're on the /auth route with room parameter
    const isAuthRoute = window.location.pathname.includes('/auth');
    const urlParams = new URLSearchParams(window.location.search);
    const hasRoomParam = urlParams.has('room');
    
    return (
      <Auth 
        onLogin={handleLogin}
        roomId={selectedRoom.id}
        roomUrl={selectedRoom.url}
        paymentCompleted={isAuthRoute && hasRoomParam}
      />
    );
  }
  
  // If we're on the session route, the Session component will handle everything
  // This is managed by React Router in main.tsx
  
  return (
    <div className="min-h-screen overflow-x-hidden">
      <ToastContainer />
      {/* Animated Background Orbs */}
      <div className="orb orb-purple"></div>
      <div className="orb orb-blue"></div>
      <div className="orb orb-emerald"></div>
      
      {/* Particle System */}
      {particles}
      
      {/* Hero Section */}
      <header className="relative overflow-hidden z-10">
        <div className="container py-16 md:py-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-6"
            >
              <span className="badge">🎭 AI Face Replacement Technology</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mb-4 text-6xl font-black tracking-tight md:text-8xl"
            >
              <span className="gradient-text">Neo</span>
              <span className="text-white">Buddy</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="max-w-3xl mx-auto mb-8 text-xl text-gray-300 md:text-2xl"
            >
              Professional <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">face replacement</span> for images, GIFs, TIFFs and videos with GPU acceleration, multiple face modes, and automatic enhancement - all at incredibly low hourly rates
            </motion.p>
            
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block"
            >
              <a href="#rooms" className="cta-button">
                Start Refacing <span className="arrow">→</span>
              </a>
            </motion.div>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute w-56 h-56 bg-primary/10 rounded-full -top-10 -left-10 blur-3xl"></div>
          <div className="absolute w-56 h-56 bg-secondary/10 rounded-full -bottom-10 -right-10 blur-3xl"></div>
        </div>
      </header>

      {/* Status Message Section */}
      <div className="status-message-wrapper" style={{ margin: '0.5rem 0', position: 'relative', zIndex: 20 }}>
        <StatusMessage 
          message={statusMessage.text}
          type={statusMessage.type}
          isVisible={statusMessage.isVisible}
          onDismiss={() => setStatusMessage(prev => ({ ...prev, isVisible: false }))}
        />
      </div>

      {/* Rooms Section */}
      <section id="rooms" className="py-16 z-10 relative overflow-auto">
        <div className="container">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-4 text-5xl font-bold text-center text-white md:text-6xl"
          >
            <span className="text-white">Reface</span> <span className="gradient-text">Studios</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-12 text-xl text-center text-gray-300 max-w-2xl mx-auto"
          >
            Choose your preferred face replacement mode with hourly access at unbeatable prices
          </motion.p>
          
          {loading ? (
            <div className="flex justify-center">
              <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="p-4 text-center text-pink-400">{error}</div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3 w-full max-w-full mx-auto">
              {rooms.map((room, index) => (
                <motion.div 
                  key={room.id} 
                  className="compact-glass-card overflow-hidden z-10 h-full"
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  whileHover={{ y: -10, scale: 1.03, transition: { duration: 0.3 } }}
                  transition={{ 
                    duration: 0.5, 
                    delay: Math.min(index * 0.1, 1), // Cap delay for large number of rooms
                    type: "spring",
                    stiffness: 100
                  }}
                >
                  {/* Room Card Header */}
                  <div className="room-card-header">
                    <h3 className="text-white text-2xl font-bold transition-all duration-300 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-purple-400 hover:to-pink-400">{room.name}</h3>
                    <span className={`status-badge-compact active`}>
                      • Available
                    </span>
                  </div>
                  
                  {/* Room Description */}
                  <p className="room-card-description text-gray-300">{room.description}</p>
                  
                  {/* Session Date and Time */}
                  <div className="room-card-session text-gray-300">
                    <motion.svg 
                      className="text-purple-400" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </motion.svg>
                    <span>
                      Hourly Session: {new Date(room.session_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} • {formatSessionTime(room.session_start_time)} – {formatSessionTime(room.session_end_time)}
                    </span>
                  </div>
                  
                  {/* User Count */}
                  <div className="room-card-session text-gray-300 mb-4">
                    <motion.svg 
                      className="text-emerald-400" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </motion.svg>
                    <span>
                      <span className={`font-medium ${room.current_users >= room.max_users ? 'text-pink-400' : 'text-emerald-400'}`}>{room.current_users}/{room.max_users}</span> Users {room.current_users >= room.max_users ? '(Full)' : 'Connected'}
                    </span>
                  </div>
                  
                  {/* Promo Code Section */}
                  <div className="promo-code-section">
                    <div className="promo-code-input-group">
                      <label htmlFor={`promo-code-${room.id}`} className="text-gray-300 text-sm mb-1 block">Have a promo code? (Optional)</label>
                      <div className="flex">
                        <input
                          id={`promo-code-${room.id}`}
                          type="text"
                          className="promo-code-input"
                          placeholder="Enter code"
                          value={promoCodes[room.id] || ''}
                          onChange={(e) => handlePromoCodeChange(room.id, e.target.value)}
                          disabled={validatingPromoCode}
                        />
                        <motion.button
                          onClick={() => validatePromoCode(room.id)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="apply-promo-button"
                          disabled={validatingPromoCode}
                        >
                          {validatingPromoCode ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            'Apply'
                          )}
                        </motion.button>
                      </div>
                      {promoCodeErrors[room.id] && (
                        <motion.p 
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-pink-400 text-xs mt-1"
                        >
                          {promoCodeErrors[room.id]}
                        </motion.p>
                      )}
                      {promoCodeSuccesses[room.id] && (
                        <motion.p 
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-green-400 text-xs mt-1"
                        >
                          {promoCodeSuccesses[room.id]}
                        </motion.p>
                      )}
                    </div>
                  </div>
                  
                  {/* Room Footer */}
                  <div className="room-card-footer">
                    <div className="room-price text-white">
                      {discountedPrices[room.id] ? (
                        <>
                          <span className="original-price">₹{room.price_inr}</span>
                          ₹<span className="text-3xl font-bold">{discountedPrices[room.id]}</span>
                        </>
                      ) : (
                        <>₹<span className="text-3xl font-bold">{room.price_inr}</span></>
                      )}
                      <span className="room-price-unit">/hour</span>
                    </div>
                    
                    <motion.button
                      onClick={() => {
                        setSelectedRoom(room);
                        handleJoinRoom(room);
                      }}
                      whileHover={{ scale: 1.05 }}
                      className="btn-compact btn-primary"
                    >
                      <span>Access Now</span>
                      <motion.span 
                        className="ml-1"
                      >
                        🎭
                      </motion.span>
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 relative z-10 mt-auto bg-gradient-to-t from-gray-900 to-transparent border-t border-gray-800/30">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="text-center py-6 backdrop-blur-sm bg-gray-900/20 rounded-lg shadow-lg">
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-gray-300 text-sm md:text-base mb-6"
          >
            © {new Date().getFullYear()} <span className="gradient-text font-bold">NeoBuddy</span> | <span className="text-purple-400">AI Face Replacement Technology</span>
          </motion.p>
          
          {/* Horizontal layout for desktop, vertical for mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col md:flex-row justify-center items-center gap-3 md:gap-1 mt-6"
          >
            {/* Razorpay Demo Link - Removed as requested */}
            {/* <RazorpayDemoLink /> */}
            <a href="/" className="text-gray-400 hover:text-white px-4 py-3 rounded-lg hover:bg-gray-800/50 transition-all duration-300 text-sm md:text-base border border-transparent hover:border-gray-700/50 w-full md:w-auto text-center">
              Home
            </a>
            <span className="text-gray-600 mx-2 hidden md:inline">•</span>
            
            <a href="/privacy-policy" className="text-gray-400 hover:text-white px-4 py-3 rounded-lg hover:bg-gray-800/50 transition-all duration-300 text-sm md:text-base border border-transparent hover:border-gray-700/50 w-full md:w-auto text-center">
              Privacy Policy
            </a>
            <span className="text-gray-600 mx-2 hidden md:inline">•</span>
            
            <a href="/terms-and-conditions" className="text-gray-400 hover:text-white px-4 py-3 rounded-lg hover:bg-gray-800/50 transition-all duration-300 text-sm md:text-base border border-transparent hover:border-gray-700/50 w-full md:w-auto text-center">
              Terms & Conditions
            </a>
            <span className="text-gray-600 mx-2 hidden md:inline">•</span>
            
            <a href="/cancellation-refund" className="text-gray-400 hover:text-white px-4 py-3 rounded-lg hover:bg-gray-800/50 transition-all duration-300 text-sm md:text-base border border-transparent hover:border-gray-700/50 w-full md:w-auto text-center">
              Cancellation & Refund
            </a>
            <span className="text-gray-600 mx-2 hidden md:inline">•</span>
            
            <a href="/contact-us" className="text-gray-400 hover:text-white px-4 py-3 rounded-lg hover:bg-gray-800/50 transition-all duration-300 text-sm md:text-base border border-transparent hover:border-gray-700/50 w-full md:w-auto text-center">
              Contact Us
            </a>
          </motion.div>
        </div>
      </div>
      
      {/* Add gradient text styles */}
      <style jsx>{`
        .gradient-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>
    </footer>
    </div>
  );
}

export default App;