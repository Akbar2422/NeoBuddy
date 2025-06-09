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
}

const SessionHeader: React.FC<SessionHeaderProps> = ({ sessionData }) => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState<number>(sessionData?.rewards_left || 0);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [iframeAdIndex, setIframeAdIndex] = useState(0);
  
  const adIframes = [
    "https://www.highperformanceformat.com/3effeb7d346a1243769cfd1702ab655a/index.html",
    "https://www.highperformanceformat.com/e015a7e68a89c81d3e9f222bac041adb/index.html",
    "https://www.highperformanceformat.com/ba23abaee8f06688f8660a8609465b1d/index.html"
  ];

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
    } catch (error) {
      console.error('Error refreshing session header:', error);
    }
  };

  useEffect(() => {
    // Set up the refresh interval (35 seconds)
    const refreshInterval = setInterval(() => {
      fetchUpdatedSessionData();
      // Update the refresh key to trigger re-render of motion components
      setRefreshKey(prevKey => prevKey + 1);
    }, 35000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(refreshInterval);
  }, [sessionData?.id]);

  useEffect(() => {
    // Set up the ad rotation interval (30 seconds)
    const adRotationInterval = setInterval(() => {
      setIframeAdIndex(prevIndex => (prevIndex + 1) % adIframes.length);
    }, 30000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(adRotationInterval);
  }, []);

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
        <motion.div
          className="ml-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          key={`iframe-ad-${iframeAdIndex}`}
        >
          <iframe
            src={adIframes[iframeAdIndex]}
            width="728"
            height="90"
            frameBorder="0"
            scrolling="no"
            sandbox="allow-scripts allow-same-origin"
            title={`Ad ${iframeAdIndex}`}
          ></iframe>
        </motion.div>
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