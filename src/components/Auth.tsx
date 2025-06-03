import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import '../auth.css';

// Instructions for updating Supabase schema:
// 1. Go to Supabase dashboard > SQL Editor
// 2. Run the following SQL query to add promo_code_used column to user_sessions table:
// ALTER TABLE user_sessions ADD COLUMN promo_code_used TEXT;

interface AuthProps {
  onLogin: (username: string, roomUrl: string) => void;
  roomId: string;
  roomUrl: string;
  paymentCompleted?: boolean;
}

const Auth: React.FC<AuthProps> = ({ onLogin, roomId, roomUrl, paymentCompleted = false }) => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get promo code from URL if any
  const urlParams = new URLSearchParams(window.location.search);
  const promoCode = urlParams.get('promo');

  // Generate a unique device ID for multi-device detection
  const deviceId = localStorage.getItem('neobuddy_device_id') || btoa(Math.random().toString()).substring(0, 15);
  localStorage.setItem('neobuddy_device_id', deviceId);

  // Check for existing session on component mount
  useEffect(() => {
    const checkExistingSession = async () => {
      if (!paymentCompleted) return;

      try {
        const existingSession = localStorage.getItem('neobuddy_session');
        if (existingSession) {
          const parsedSession = JSON.parse(existingSession);
          if (parsedSession.roomId === roomId) {
            window.location.href = `/session?room=${roomId}`;
          }
        }
      } catch (err) {
        console.error('Failed to parse session:', err);
      }
    };

    checkExistingSession();
  }, [paymentCompleted, roomId]);

  // Start rewards countdown (if session exists)
  useEffect(() => {
    let countdownInterval: NodeJS.Timeout;

    const startRewardsCountdown = async (sessionId: string) => {
      // Existing rewards logic stays untouched
      countdownInterval = setInterval(async () => {
        try {
          const { data: currentSession, error: fetchError } = await supabase
            .from('user_sessions')
            .select('*')
            .eq('id', sessionId)
            .single();

          if (fetchError) throw fetchError;

          if (currentSession.rewards_left <= 0) {
            clearInterval(countdownInterval);
            window.location.href = '/';
            return;
          }

          // Decrease rewards every minute
          await supabase
            .from('user_sessions')
            .update({ rewards_left: currentSession.rewards_left - 1 })
            .eq('id', sessionId);
        } catch (err) {
          console.error('Error syncing session:', err);
          clearInterval(countdownInterval);
        }
      }, 60000); // Every 60 seconds
    };

    // If we have a session in localStorage, start countdown
    const sessionData = localStorage.getItem('neobuddy_session');
    if (sessionData) {
      const parsedSession = JSON.parse(sessionData);
      if (parsedSession.roomId === roomId && parsedSession.rewards_left > 0) {
        startRewardsCountdown(parsedSession.id);
      }
    }

    return () => {
      if (countdownInterval) clearInterval(countdownInterval);
    };
  }, [roomId]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Username is required');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      // Check if username already has an active session
      const { data: existingSession, error: fetchError } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('username', username.trim())
        .eq('room_id', roomId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // Not "not found" error
        throw fetchError;
      }

      if (existingSession) {
        if (existingSession.rewards_left <= 0) {
          setError('Your session has expired. Please make a new payment to continue.');
          setLoading(false);
          window.location.href = '/';
          return;
        }

        const sessionDeviceId = existingSession.device_id;
        if (sessionDeviceId && sessionDeviceId !== deviceId) {
          const minutesSinceLastUpdate = Math.floor(
            (new Date().getTime() - new Date(existingSession.last_updated).getTime()) / (1000 * 60)
          );

          if (minutesSinceLastUpdate < 60) {
            setError('This username is currently in use on another device. Choose another username.');
            setLoading(false);
            return;
          }
        }

        // Session exists → redirect
        localStorage.setItem('neobuddy_session', JSON.stringify(existingSession));
        window.location.href = `/session?room=${roomId}`;
        return;
      }

      // No existing session → create new one with promo_code_used if available
      const sessionData = {
        username: username.trim(),
        room_id: roomId,
        rewards_left: 60,
        device_id: deviceId,
        last_updated: new Date().toISOString(),
        // Add promo_code_used if a promo code is available
        ...(promoCode ? { promo_code_used: promoCode } : {})
      };

      const { data: newSession, error: insertError } = await supabase
        .from('user_sessions')
        .insert(sessionData)
        .select()
        .single();

      if (insertError) throw insertError;

      // Save session to localStorage
      localStorage.setItem('neobuddy_session', JSON.stringify(newSession));

      // Update promo code usage if a valid promo code was used
      if (promoCode) {
        try {
          // First validate the promo code exists and is still valid
          const { data: promoData, error: promoError } = await supabase
            .from('promo_codes')
            .select('*')
            .eq('code', promoCode)
            .single();
          
          if (promoError) {
            console.error('Error fetching promo code:', promoError);
          } else if (promoData) {
            // Check if promo code is active
            const isActive = typeof promoData.active === 'boolean' ? promoData.active : 
                           typeof promoData.active === 'number' ? promoData.active !== 0 :
                           typeof promoData.active === 'string' ? 
                             ['true', 't', '1', 'yes'].includes(promoData.active.toLowerCase()) : true;
            
            // Check if promo code has expired
            const isExpired = promoData.expiry_date ? new Date(promoData.expiry_date) < new Date() : false;
            
            // Check if promo code has reached max uses
            const hasReachedMaxUses = promoData.max_uses > 0 && promoData.total_uses >= promoData.max_uses;
            
            // We no longer update the usage count here to prevent double increments
            // The usage count is updated in App.tsx's updatePromoCodeUsage function
            if (isActive && !isExpired && !hasReachedMaxUses) {
              console.log('Valid promo code detected. Usage count will be updated after payment.');
            } else {
              console.log('Promo code validation failed:', 
                !isActive ? 'Inactive' : 
                isExpired ? 'Expired' : 
                'Max uses reached');
            }
          }
        } catch (err) {
          console.error('Error processing promo code:', err);
          // Don't block the user flow if promo code processing fails
        }
      }

      // Redirect to session page
      window.location.href = `/session?room=${roomId}`;

    } catch (err) {
      console.error('Authentication error:', err);
      setError('Failed to authenticate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Background particles */}
      <motion.div className="auth-background">
        {Array.from({ length: 10 }).map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="auth-particle"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight
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
        ))}
      </motion.div>

      {/* Auth Card */}
      <div className="auth-card">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-bold text-center gradient-text mb-6"
        >
          Enter Your Username
        </motion.h2>

        <p className="text-gray-300 text-sm text-center mb-6">
          {paymentCompleted ? 'Enter a username to begin your session' : 'Please complete payment first'}
        </p>

        {paymentCompleted ? (
          <form onSubmit={handleSubmit} className="auth-form">
            <label htmlFor="username" className="block text-gray-300 mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="auth-input"
              disabled={loading}
              required
            />

            {error && (
              <p className="text-red-400 text-sm mt-2">{error}</p>
            )}

            <motion.button
              type="submit"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="auth-button mt-4 flex items-center justify-center w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Processing...
                </>
              ) : (
                'Continue →'
              )}
            </motion.button>
          </form>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-300">No payment detected</p>
            <a href="/" className="inline-block mt-4 btn-primary">
              Make Payment First
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;