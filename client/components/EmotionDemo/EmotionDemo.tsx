import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Avatar } from '../Avatar/Avatar';
import { useDevice } from '../../hooks/useDevice';
import './EmotionDemo.css';

const demoMessages = {
  happy: "I'm so happy to see you! 😊 This is amazing!",
  sad: "I'm feeling a bit down today... 😢",
  excited: "Wow! This is incredible! 😃 I can't believe it!",
  confused: "Hmm... I'm not sure about this. What do you mean? 🤔",
  flirty: "You're looking quite handsome today! 😘",
  annoyed: "Ugh, this is really frustrating! 😠",
  proud: "I just achieved something amazing! 😎",
  playful: "Hehe, you're so silly! 😜"
};

export const EmotionDemo: React.FC = () => {
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const [selectedEmotion, setSelectedEmotion] = useState<string>('');
  const { deviceType, isHighEnd } = useDevice();

  const handleEmotionSelect = (emotion: string) => {
    setSelectedEmotion(emotion);
    setCurrentMessage(demoMessages[emotion as keyof typeof demoMessages]);
  };

  return (
    <div className="emotion-demo">
      <div className="demo-header">
        <h2>Emotion System Demo</h2>
        <div className="device-info">
          <span>Device: {deviceType}</span>
          <span>High-end: {isHighEnd ? 'Yes' : 'No'}</span>
        </div>
      </div>

      <div className="demo-content">
        <div className="avatar-container">
          <Avatar
            imageUrl="/avatars/default.png"
            name="Demo Avatar"
            size="large"
            message={currentMessage}
            isActive={true}
          />
        </div>

        <div className="controls">
          <h3>Test Emotions</h3>
          <div className="emotion-buttons">
            {Object.keys(demoMessages).map((emotion) => (
              <motion.button
                key={emotion}
                className={`emotion-button ${selectedEmotion === emotion ? 'active' : ''}`}
                onClick={() => handleEmotionSelect(emotion)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
              </motion.button>
            ))}
          </div>

          <div className="message-preview">
            <h3>Current Message</h3>
            <p>{currentMessage || 'Select an emotion to see the message'}</p>
          </div>
        </div>
      </div>

      <div className="demo-info">
        <h3>Device-Specific Features</h3>
        <ul>
          <li>
            <strong>Mobile:</strong> Simple head-based animations, minimal effects
          </li>
          <li>
            <strong>Desktop:</strong> Medium complexity animations with body movements
          </li>
          <li>
            <strong>VR/High-end:</strong> Full animations with particles and sound effects
          </li>
        </ul>
      </div>
    </div>
  );
}; 