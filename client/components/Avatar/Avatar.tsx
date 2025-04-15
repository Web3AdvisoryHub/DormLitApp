import React from 'react';
import { motion } from 'framer-motion';
import { useEmotion } from '../../hooks/useEmotion';
import { useDevice } from '../../hooks/useDevice';
import './Avatar.css';

interface AvatarProps {
  imageUrl: string;
  name: string;
  size?: 'small' | 'medium' | 'large';
  isActive?: boolean;
  message?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  imageUrl,
  name,
  size = 'medium',
  isActive = false,
  message
}) => {
  const {
    processMessage,
    currentEmotion,
    emotionIntensity,
    getEmotionStyles,
    getEmotionClasses
  } = useEmotion();

  const { isHighEnd } = useDevice();

  // Process message for emotions when it changes
  React.useEffect(() => {
    if (message) {
      processMessage(message);
    }
  }, [message, processMessage]);

  // Get size classes
  const getSizeClass = () => {
    switch (size) {
      case 'small':
        return 'avatar-small';
      case 'large':
        return 'avatar-large';
      default:
        return 'avatar-medium';
    }
  };

  // Get emotion-specific animation variants
  const getAnimationVariants = () => {
    if (!currentEmotion) return {};

    const baseVariants = {
      initial: { scale: 1 },
      animate: { scale: 1 },
      exit: { scale: 1 }
    };

    switch (currentEmotion) {
      case 'happy':
        return {
          ...baseVariants,
          animate: {
            scale: 1 + (emotionIntensity * 0.1),
            rotate: [0, -5, 5, -5, 0],
            transition: {
              duration: 1,
              repeat: 0
            }
          }
        };
      case 'sad':
        return {
          ...baseVariants,
          animate: {
            scale: 1 - (emotionIntensity * 0.05),
            y: emotionIntensity * 10,
            transition: {
              duration: 1.5,
              repeat: 0
            }
          }
        };
      // Add more emotion variants as needed
      default:
        return baseVariants;
    }
  };

  return (
    <motion.div
      className={`avatar-container ${getSizeClass()} ${isActive ? 'active' : ''}`}
      variants={isHighEnd ? getAnimationVariants() : {}}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div
        className={getEmotionClasses()}
        style={getEmotionStyles()}
      >
        <img
          src={imageUrl}
          alt={name}
          className="avatar-image"
          loading="lazy"
        />
        {isHighEnd && currentEmotion && (
          <div className="emotion-indicator">
            {currentEmotion}
          </div>
        )}
      </div>
      <div className="avatar-name">{name}</div>
    </motion.div>
  );
}; 