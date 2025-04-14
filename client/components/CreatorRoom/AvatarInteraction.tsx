import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInteraction } from '@/services/InteractionService';
import { useSound } from '@/hooks/useSound';
import { useCoinSystem } from '@/hooks/useCoinSystem';
import { FaHeart, FaComment, FaCoins, FaVolumeUp } from 'react-icons/fa';

interface AvatarInteractionProps {
  avatarId: string;
  avatarUrl: string;
  position: { x: number; y: number };
  onChatOpen: () => void;
  onMoodChange: (mood: string) => void;
}

export const AvatarInteraction: React.FC<AvatarInteractionProps> = ({
  avatarId,
  avatarUrl,
  position,
  onChatOpen,
  onMoodChange
}) => {
  const { handleClick, handleTap } = useInteraction();
  const soundManager = useSound();
  const coinSystem = useCoinSystem();
  const [showReactions, setShowReactions] = useState(false);

  const handleAvatarClick = async (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const config = {
      type: 'avatar' as const,
      position: { x: clientX, y: clientY },
      content: { url: avatarUrl, type: 'image' },
      soundUrl: '/sounds/avatar-interaction.mp3',
      coins: 5,
      message: 'Avatar interaction!'
    };

    if ('touches' in e) {
      await handleTap(config);
    } else {
      await handleClick(config);
    }

    setShowReactions(true);
    setTimeout(() => setShowReactions(false), 2000);
  };

  const handleReaction = async (reaction: string) => {
    const config = {
      type: 'emoji' as const,
      position: { x: position.x, y: position.y - 50 },
      content: reaction,
      soundUrl: '/sounds/reaction.mp3',
      coins: 2,
      message: `Reacted with ${reaction}`
    };

    await handleClick(config);
    onMoodChange(reaction);
  };

  return (
    <div className="relative">
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleAvatarClick}
        onTouchStart={handleAvatarClick}
        className="cursor-pointer"
      >
        <img
          src={avatarUrl}
          alt="Avatar"
          className="w-16 h-16 rounded-full object-cover border-2 border-purple-500"
        />
      </motion.div>

      <AnimatePresence>
        {showReactions && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 flex gap-2"
          >
            <button
              onClick={() => handleReaction('❤️')}
              className="p-2 bg-purple-800/50 rounded-full hover:bg-purple-700/50 transition-colors"
            >
              <FaHeart className="text-red-500" />
            </button>
            <button
              onClick={() => onChatOpen()}
              className="p-2 bg-purple-800/50 rounded-full hover:bg-purple-700/50 transition-colors"
            >
              <FaComment className="text-blue-500" />
            </button>
            <button
              onClick={() => handleReaction('🎉')}
              className="p-2 bg-purple-800/50 rounded-full hover:bg-purple-700/50 transition-colors"
            >
              <FaCoins className="text-yellow-500" />
            </button>
            <button
              onClick={() => soundManager.playSound('/sounds/avatar-greeting.mp3')}
              className="p-2 bg-purple-800/50 rounded-full hover:bg-purple-700/50 transition-colors"
            >
              <FaVolumeUp className="text-green-500" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 