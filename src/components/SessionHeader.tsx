import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import '../session.css';

interface SessionHeaderProps {
  sessionData: {
    id: string;
    rewards_left: number;
    username: string;
    room_id: string;
    last_updated: string;
  } | null;
  adContent?: {
    id: string;
    content: string;
    url?: string;
  } | null;
}

const SessionHeader: React.FC<SessionHeaderProps> = ({ sessionData, adContent: initialAdContent }) => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState<number>(sessionData?.rewards_left || 0);
  const [adContent, setAdContent] = useState(initialAdContent);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Function to fetch updated session data
  const fetchUpdatedSessionData = async () => {
    if (!sessionData?.id) return;
    
    try {
      // Get updated session data from localStorage
      const storedSession = localStorage.getItem('neobuddy_session');
      if (storedSession) {
        const parsedSession = JSON.parse(storedSession);
        setCurrentTime(parsedSession.rewards_left);
      }
      
      // Fetch new ad content (simulated here, replace with actual API call)
      fetchNewAdContent();
    } catch (error) {
      console.error('Error refreshing session header:', error);
    }
  };

  // Function to fetch new ad content
  const fetchNewAdContent = async () => {
    // This is a placeholder for the actual ad fetching logic
    // In a real implementation, you would call your ad service API
    try {
      // Simulating an API call with a timeout
      // Replace this with your actual ad fetching logic
      const mockAds = [
        { id: '1', content: 'Try our new AI features!', url: '#' },
        { id: '2', content: 'Upgrade for more session time', url: '#' },
        { id: '3', content: 'Share your creations with friends', url: '#' },
        { id: '4', content: 'Limited time offer: 50% off premium', url: '#' },
      ];
      
      // Randomly select an ad
      const randomAd = mockAds[Math.floor(Math.random() * mockAds.length)];
      setAdContent(randomAd);
    } catch (error) {
      console.error('Error fetching ad content:', error);
    }
  };

  useEffect(() => {
    // Set up the refresh interval (10 seconds)
    const refreshInterval = setInterval(() => {
      fetchUpdatedSessionData();
      // Update the refresh key to trigger re-render of motion components
      setRefreshKey(prevKey => prevKey + 1);
    }, 10000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(refreshInterval);
  }, [sessionData?.id]);

  return (
    <header className="session-header p-4 flex justify-between items-center">
      <div className="flex items-center">
        <motion.h1 
          className="text-2xl font-bold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          key={`logo-${refreshKey}`}
        >
          <span className="gradient-text">Neo</span>
          <span className="text-white">Buddy</span>
        </motion.h1>
        
        {/* Ad Content Area */}
        {adContent && (
          <motion.div
            className="ml-4 px-3 py-1 bg-opacity-30 bg-purple-900 rounded-full text-sm"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            key={`ad-${refreshKey}-${adContent.id}`}
          >
            <a href={adContent.url || '#'} className="text-purple-200 hover:text-white transition-colors">
              {adContent.content}
            </a>
          </motion.div>
        )}
      </div>
      
      <div className="flex items-center space-x-4">
        {sessionData && (
          <motion.div 
            className="time-indicator"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            key={`timer-${refreshKey}`}
          >
            <svg className="w-4 h-4 text-purple-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span className="text-gray-300">
              <span className="time-value">{currentTime}</span> min
            </span>
          </motion.div>
        )}
        
        <motion.button
          onClick={() => navigate('/')}
          className="exit-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          key={`exit-${refreshKey}`}
        >
          Exit Session
        </motion.button>
      </div>
    </header>
  );
};

export default SessionHeader;