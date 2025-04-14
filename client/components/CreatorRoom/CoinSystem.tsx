import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { database } from '@/services/database';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCoins, FaClock, FaGift } from 'react-icons/fa';
import { RoomAttraction, RoomCoinBalance } from '@/shared/database.types';

interface CoinSystemProps {
  roomId: string;
}

export const CoinSystem: React.FC<CoinSystemProps> = ({ roomId }) => {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [attractions, setAttractions] = useState<RoomAttraction[]>([]);
  const [showReward, setShowReward] = useState<{ amount: number; x: number; y: number; type: 'click' | 'time' | 'mood' } | null>(null);
  const [timeSpent, setTimeSpent] = useState<number>(0);
  const [lastRewardTime, setLastRewardTime] = useState<number>(0);

  // Load initial state from localStorage
  useEffect(() => {
    if (!user) return;
    
    const savedBalance = localStorage.getItem(`dormlit_coins_${user.id}`);
    const savedTime = localStorage.getItem(`dormlit_time_${user.id}`);
    const savedLastReward = localStorage.getItem(`dormlit_last_reward_${user.id}`);
    
    if (savedBalance) setBalance(Number(savedBalance));
    if (savedTime) setTimeSpent(Number(savedTime));
    if (savedLastReward) setLastRewardTime(Number(savedLastReward));
  }, [user]);

  // Save state to localStorage
  useEffect(() => {
    if (!user) return;
    
    localStorage.setItem(`dormlit_coins_${user.id}`, balance.toString());
    localStorage.setItem(`dormlit_time_${user.id}`, timeSpent.toString());
    localStorage.setItem(`dormlit_last_reward_${user.id}`, lastRewardTime.toString());
  }, [user, balance, timeSpent, lastRewardTime]);

  useEffect(() => {
    if (!user) return;

    // Load attractions
    const loadAttractions = async () => {
      const roomAttractions = await database.getRoomAttractions(roomId);
      setAttractions(roomAttractions);
    };

    loadAttractions();

    // Time tracking
    const timeInterval = setInterval(() => {
      setTimeSpent(prev => prev + 1);
      
      // Award coins every 5 minutes
      if (timeSpent % 300 === 0) {
        const reward = 5;
        setBalance(prev => prev + reward);
        setLastRewardTime(Date.now());
        setShowReward({
          amount: reward,
          x: window.innerWidth / 2,
          y: window.innerHeight / 2,
          type: 'time'
        });
      }
    }, 1000);

    return () => clearInterval(timeInterval);
  }, [roomId, user, timeSpent]);

  const handleAttractionClick = async (attraction: RoomAttraction, event: React.MouseEvent) => {
    if (!user) return;

    try {
      const { reward } = await database.triggerAttraction(attraction.id, user.id);
      setBalance(prev => prev + reward);

      // Show reward animation
      setShowReward({
        amount: reward,
        x: event.clientX,
        y: event.clientY,
        type: 'click'
      });

      // Play sound effect
      if (attraction.content.includes('sound')) {
        const audio = new Audio(attraction.content);
        audio.play();
      }

      // Hide reward after animation
      setTimeout(() => setShowReward(null), 2000);
    } catch (error) {
      console.error('Failed to trigger attraction:', error);
    }
  };

  const handleMoodReward = (amount: number) => {
    setBalance(prev => prev + amount);
    setShowReward({
      amount,
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      type: 'mood'
    });
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* Coin Display */}
      <div className="flex items-center gap-2 bg-black/50 p-2 rounded-lg">
        <FaCoins className="text-yellow-400" />
        <span className="text-white font-bold">{balance}</span>
      </div>

      {/* Time Spent Display */}
      <div className="flex items-center gap-2 bg-black/50 p-2 rounded-lg mt-2">
        <FaClock className="text-blue-400" />
        <span className="text-white">
          {Math.floor(timeSpent / 60)}m {timeSpent % 60}s
        </span>
      </div>

      {/* Attractions */}
      <div className="absolute top-24 right-0 flex flex-col gap-2">
        {attractions.map((attraction) => (
          <motion.div
            key={attraction.id}
            className="cursor-pointer"
            onClick={(e) => handleAttractionClick(attraction, e)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {attraction.type === 'emoji' ? (
              <span className="text-4xl">{attraction.content}</span>
            ) : (
              <img src={attraction.content} alt={attraction.name} className="w-12 h-12" />
            )}
          </motion.div>
        ))}
      </div>

      {/* Reward Animations */}
      <AnimatePresence>
        {showReward && (
          <motion.div
            className="fixed pointer-events-none"
            initial={{ opacity: 1, y: 0, x: showReward.x }}
            animate={{ opacity: 0, y: -50, x: showReward.x }}
            exit={{ opacity: 0 }}
            style={{ top: showReward.y }}
          >
            <div className="flex items-center gap-1 bg-black/50 p-1 rounded">
              {showReward.type === 'time' ? (
                <FaClock className="text-blue-400" />
              ) : showReward.type === 'mood' ? (
                <FaGift className="text-purple-400" />
              ) : (
                <FaCoins className="text-yellow-400" />
              )}
              <span className="text-white font-bold">+{showReward.amount}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 