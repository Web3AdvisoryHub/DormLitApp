import { useEffect, useRef } from 'react';
import { useEmotionStore } from '../services/emotion';
import { useDevice } from './useDevice';

export const useEmotion = () => {
  const {
    detectEmotion,
    currentEmotion,
    emotionIntensity,
    deviceType,
    setDeviceType
  } = useEmotionStore();
  
  const { deviceType: detectedDeviceType } = useDevice();
  const lastMessageRef = useRef<string>('');

  // Update device type when it changes
  useEffect(() => {
    setDeviceType(detectedDeviceType);
  }, [detectedDeviceType, setDeviceType]);

  // Process message for emotions
  const processMessage = (message: string) => {
    // Skip if this is the same message as last time
    if (message === lastMessageRef.current) return;
    
    lastMessageRef.current = message;
    detectEmotion(message);
  };

  // Get emotion-specific styles
  const getEmotionStyles = () => {
    if (!currentEmotion) return {};

    const baseStyles = {
      transition: 'all 0.3s ease',
    };

    switch (currentEmotion) {
      case 'happy':
        return {
          ...baseStyles,
          transform: `scale(${1 + (emotionIntensity * 0.1)})`,
          filter: `brightness(${1 + (emotionIntensity * 0.2)})`,
        };
      case 'sad':
        return {
          ...baseStyles,
          transform: `scale(${1 - (emotionIntensity * 0.05)})`,
          filter: `brightness(${1 - (emotionIntensity * 0.1)})`,
        };
      case 'excited':
        return {
          ...baseStyles,
          transform: `scale(${1 + (emotionIntensity * 0.15)})`,
          filter: `saturate(${1 + (emotionIntensity * 0.3)})`,
        };
      case 'confused':
        return {
          ...baseStyles,
          transform: `rotate(${emotionIntensity * 5}deg)`,
        };
      case 'flirty':
        return {
          ...baseStyles,
          transform: `scale(${1 + (emotionIntensity * 0.1)})`,
          filter: `hue-rotate(${emotionIntensity * 30}deg)`,
        };
      case 'annoyed':
        return {
          ...baseStyles,
          transform: `scale(${1 - (emotionIntensity * 0.05)})`,
          filter: `contrast(${1 + (emotionIntensity * 0.2)})`,
        };
      case 'proud':
        return {
          ...baseStyles,
          transform: `scale(${1 + (emotionIntensity * 0.1)})`,
          filter: `brightness(${1 + (emotionIntensity * 0.1)})`,
        };
      case 'playful':
        return {
          ...baseStyles,
          transform: `scale(${1 + (emotionIntensity * 0.1)})`,
          filter: `saturate(${1 + (emotionIntensity * 0.2)})`,
        };
      default:
        return baseStyles;
    }
  };

  // Get emotion-specific class names
  const getEmotionClasses = () => {
    if (!currentEmotion) return '';

    const baseClass = 'avatar';
    const intensityClass = `intensity-${Math.floor(emotionIntensity * 5)}`;
    
    return `${baseClass} ${currentEmotion} ${intensityClass}`;
  };

  return {
    processMessage,
    currentEmotion,
    emotionIntensity,
    deviceType,
    getEmotionStyles,
    getEmotionClasses
  };
}; 