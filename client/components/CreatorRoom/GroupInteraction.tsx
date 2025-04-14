import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from '@/hooks/useSound';
import { FaUsers, FaHeart, FaMusic, FaLightbulb, FaTimes } from 'react-icons/fa';

interface GroupInteractionProps {
  avatars: Array<{
    id: string;
    url: string;
    mood: string;
    position: { x: number; y: number };
  }>;
  onMoodChange: (avatarId: string, mood: string) => void;
  onGroupComplete: () => void;
}

export const GroupInteraction: React.FC<GroupInteractionProps> = ({
  avatars,
  onMoodChange,
  onGroupComplete
}) => {
  const soundManager = useSound();
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [sharedMood, setSharedMood] = useState<string | null>(null);
  const [particles, setParticles] = useState<Array<{
    x: number;
    y: number;
    color: string;
    size: number;
  }>>([]);

  useEffect(() => {
    if (sharedMood) {
      // Create particles for shared mood
      const newParticles = avatars.flatMap(avatar => {
        const colors = {
          happy: '#FFD700',
          excited: '#FF4500',
          calm: '#87CEEB',
          creative: '#9370DB'
        };
        return Array(10).fill(null).map(() => ({
          x: avatar.position.x,
          y: avatar.position.y,
          color: colors[sharedMood as keyof typeof colors] || '#6A0DAD',
          size: Math.random() * 3 + 1
        }));
      });
      setParticles(newParticles);

      // Play shared mood sound
      soundManager.playSound(`/sounds/mood-${sharedMood}.mp3`);
    }
  }, [sharedMood, avatars, soundManager]);

  const handleGroupFormation = (avatarId: string) => {
    setActiveGroup(avatarId);
    soundManager.playSound('/sounds/group-formation.mp3');
  };

  const handleSharedMood = (mood: string) => {
    setSharedMood(mood);
    avatars.forEach(avatar => onMoodChange(avatar.id, mood));
  };

  return (
    <div className="relative">
      {/* Particles */}
      <AnimatePresence>
        {particles.map((particle, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 1, scale: 1 }}
            animate={{ 
              opacity: 0,
              scale: 0,
              x: particle.x + (Math.random() - 0.5) * 100,
              y: particle.y + (Math.random() - 0.5) * 100
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 1 }}
            className="absolute w-2 h-2 rounded-full"
            style={{
              backgroundColor: particle.color,
              left: particle.x,
              top: particle.y
            }}
          />
        ))}
      </AnimatePresence>

      {/* Group Formation UI */}
      {activeGroup && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed inset-0 flex items-center justify-center z-50"
        >
          <div className="bg-black/80 p-6 rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">Create Shared Mood</h3>
              <button
                onClick={() => setActiveGroup(null)}
                className="text-gray-400 hover:text-white"
              >
                <FaTimes />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleSharedMood('happy')}
                className="p-4 bg-yellow-500/20 rounded-lg hover:bg-yellow-500/30 transition-colors"
              >
                <FaHeart className="text-yellow-500 mx-auto mb-2" />
                <span className="text-white">Happy</span>
              </button>
              <button
                onClick={() => handleSharedMood('excited')}
                className="p-4 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition-colors"
              >
                <FaMusic className="text-red-500 mx-auto mb-2" />
                <span className="text-white">Excited</span>
              </button>
              <button
                onClick={() => handleSharedMood('calm')}
                className="p-4 bg-blue-500/20 rounded-lg hover:bg-blue-500/30 transition-colors"
              >
                <FaMusic className="text-blue-500 mx-auto mb-2" />
                <span className="text-white">Calm</span>
              </button>
              <button
                onClick={() => handleSharedMood('creative')}
                className="p-4 bg-purple-500/20 rounded-lg hover:bg-purple-500/30 transition-colors"
              >
                <FaLightbulb className="text-purple-500 mx-auto mb-2" />
                <span className="text-white">Creative</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Group Formation Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => handleGroupFormation(avatars[0].id)}
        className="fixed bottom-4 right-4 p-4 bg-purple-600 rounded-full shadow-lg"
      >
        <FaUsers className="text-white text-xl" />
      </motion.button>
    </div>
  );
}; 