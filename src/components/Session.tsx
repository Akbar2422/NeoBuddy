import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import SessionHeader from './SessionHeader';
import '../cyberpunk-theme.css';
import '../session.css';

const Session = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [runpodUrl, setRunpodUrl] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<any>(null);
  const [redirecting, setRedirecting] = useState(false);
  const [showIframe, setShowIframe] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const checkSessionAndFetchUrl = async () => {
      try {
        setLoading(true);
        
        // Get room ID from URL parameters
        const urlParams = new URLSearchParams(location.search);
        const roomId = urlParams.get('room');
        
        if (!roomId) {
          setError('Invalid room ID');
          setTimeout(() => navigate('/'), 3000);
          return;
        }
        
        // Check for valid session in localStorage
        const storedSession = localStorage.getItem('neobuddy_session');
        
        if (!storedSession) {
          setError('No active session found');
          setRedirecting(true);
          setTimeout(() => navigate('/'), 3000);
          return;
        }
        
        // Parse session data
        const sessionData = JSON.parse(storedSession);
        
        // Verify session is valid for this room
        if (sessionData.room_id !== roomId) {
          setError('Invalid session for this room');
          setRedirecting(true);
          setTimeout(() => navigate('/'), 3000);
          return;
        }
        
        // Check if rewards are greater than 0
        if (sessionData.rewards_left <= 0) {
          setError('Your session has expired. Please make a payment to continue.');
          setRedirecting(true);
          setTimeout(() => navigate('/'), 3000);
          return;
        }
        
        // Fetch room data to get RunPod URL
        const { data: roomData, error: roomError } = await supabase
          .from('rooms')
          .select('*')
          .eq('id', roomId)
          .single();
        
        if (roomError) {
          throw roomError;
        }
        
        if (!roomData || !roomData.url) {
          setError('Room not found or URL not available');
          setRedirecting(true);
          setTimeout(() => navigate('/'), 3000);
          return;
        }
        
        // Set session data and RunPod URL
        setSessionData(sessionData);
        setRunpodUrl(roomData.url);
        setShowIframe(true);
        
        // Set up rewards countdown
        startRewardsCountdown(sessionData.id);
      } catch (err) {
        console.error('Error in session verification:', err);
        setError('Failed to verify session. Please try again.');
        setRedirecting(true);
        setTimeout(() => navigate('/'), 3000);
      } finally {
        setLoading(false);
      }
    };
    
    checkSessionAndFetchUrl();
    
    // Cleanup function
    return () => {
      // Sync session data with Supabase before unmounting
      const syncSessionData = async () => {
        const storedSession = localStorage.getItem('neobuddy_session');
        if (storedSession) {
          try {
            const sessionData = JSON.parse(storedSession);
            
            // Update session in Supabase
            await supabase
              .from('user_sessions')
              .update({
                rewards_left: sessionData.rewards_left,
                last_updated: new Date().toISOString()
              })
              .eq('id', sessionData.id);
          } catch (err) {
            console.error('Error syncing session on unmount:', err);
          }
        }
      };
      
      syncSessionData();
    };
  }, [navigate, location.search]);
  
  // Function to start the rewards countdown
  const startRewardsCountdown = (sessionId: string) => {
    // Set up an interval to decrease rewards every minute
    const countdownInterval = setInterval(async () => {
      try {
        // Get current session data from localStorage
        const storedSession = localStorage.getItem('neobuddy_session');
        if (!storedSession) {
          clearInterval(countdownInterval);
          return;
        }
        
        const sessionData = JSON.parse(storedSession);
        
        // If rewards are already 0, clear interval and redirect
        if (sessionData.rewards_left <= 0) {
          clearInterval(countdownInterval);
          setError('Your session has expired. Redirecting to payment page...');
          setRedirecting(true);
          setTimeout(() => navigate('/'), 3000);
          return;
        }
        
        // Calculate time difference in minutes
        const lastUpdated = new Date(sessionData.last_updated);
        const now = new Date();
        const minutesPassed = Math.floor((now.getTime() - lastUpdated.getTime()) / (1000 * 60));
        
        // If more than 1 minute has passed, update rewards
        if (minutesPassed >= 1) {
          // Calculate new rewards value (decrease by minutes passed, but not below 0)
          const newRewards = Math.max(0, sessionData.rewards_left - minutesPassed);
          
          // Update localStorage
          sessionData.rewards_left = newRewards;
          sessionData.last_updated = now.toISOString();
          localStorage.setItem('neobuddy_session', JSON.stringify(sessionData));
          
          // Update state
          setSessionData(sessionData);
          
          // If rewards reached 0, redirect to home page
          if (newRewards <= 0) {
            clearInterval(countdownInterval);
            setError('Your session has expired. Redirecting to payment page...');
            setRedirecting(true);
            setTimeout(() => navigate('/'), 3000);
          }
        }
      } catch (err) {
        console.error('Error updating rewards:', err);
        clearInterval(countdownInterval);
      }
    }, 60000); // Check every minute
    
    // Return the interval ID for cleanup
    return countdownInterval;
  };
  
  // Create particles for background effect (same as in App.tsx)
  const particles = Array.from({ length: 10 }, (_, i) => (
    <motion.div
      key={`session-particle-${i}`}
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
  
  // If loading, show loading spinner
  if (loading) {
    return (
      <div className="session-container flex items-center justify-center">
        {/* Animated Background Orbs */}
        <div className="orb orb-purple"></div>
        <div className="orb orb-blue"></div>
        
        {/* Particle System */}
        {particles}
        
        <div className="glass-card p-8 text-center">
          <div className="session-spinner mx-auto mb-4"></div>
          <p className="text-xl text-gray-300">Loading your session...</p>
        </div>
      </div>
    );
  }
  
  // If error, show error message
  if (error) {
    return (
      <div className="session-container flex items-center justify-center">
        {/* Animated Background Orbs */}
        <div className="orb orb-purple"></div>
        <div className="orb orb-blue"></div>
        
        {/* Particle System */}
        {particles}
        
        <motion.div 
          className="session-error"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <svg className="w-16 h-16 text-pink-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </motion.div>
          
          <motion.h2 
            className="text-2xl font-bold text-white mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Session Error
          </motion.h2>
          
          <motion.p 
            className="text-gray-300 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {error}
          </motion.p>
          
          {redirecting && (
            <motion.div className="redirect-progress">
              <motion.div 
                className="redirect-progress-bar"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 3 }}
              />
            </motion.div>
          )}
          
          <motion.button
            onClick={() => navigate('/')}
            className="exit-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            Return to Home <span className="arrow">→</span>
          </motion.button>
        </motion.div>
      </div>
    );
  }
  
  // If everything is valid, show the RunPod iframe
  return (
    <div className="session-container">
      {/* Session Header - Refreshes every 10 seconds */}
      <SessionHeader 
        sessionData={sessionData} 
        adContent={{ id: '1', content: 'Try our new AI features!' }} 
      />
      
      {/* RunPod Iframe */}
      {showIframe && runpodUrl && (
        <motion.div 
          className="runpod-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <iframe 
            src={runpodUrl}
            className="runpod-iframe"
            title="NeoBuddy RunPod Session"
            allow="accelerometer; camera; microphone; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </motion.div>
      )}
      
      {/* Animated Background Orbs */}
      <div className="orb orb-purple"></div>
      <div className="orb orb-blue"></div>
      
      {/* Particle System */}
      {particles}
    </div>
  );
};

export default Session;