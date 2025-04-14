import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { database } from '@/services/database';
import { AvatarAIConfig, AvatarChatMessage, AvatarMood, ResponseType } from '@/shared/database.types';
import { FaMicrophone, FaRobot, FaTimes, FaVolumeUp, FaVolumeMute, FaCog } from 'react-icons/fa';

interface AvatarChatProps {
  avatarId: string;
  userId: string;
  mood: AvatarMood;
  onClose: () => void;
}

export const AvatarChat: React.FC<AvatarChatProps> = ({ avatarId, userId, mood, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<AvatarChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiConfig, setAiConfig] = useState<AvatarAIConfig | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [useLocalModel, setUseLocalModel] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadAiConfig = async () => {
      try {
        const config = await database.getAvatarAIConfig(avatarId);
        setAiConfig(config);
      } catch (error) {
        console.error('Failed to load AI config:', error);
        // Use default config if none exists
        setAiConfig({
          id: 'default',
          user_id: userId,
          mood,
          prompt: `You are a friendly avatar in a virtual space. Respond to users in a ${mood} tone.`,
          voice_style: 'gentle',
          tone: 'friendly',
          response_type: 'text',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    };

    loadAiConfig();
  }, [avatarId, userId, mood]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !aiConfig || !user) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      // Create new message
      const newMessage: AvatarChatMessage = {
        id: Date.now().toString(),
        avatar_id: avatarId,
        user_id: user.id,
        message: userMessage,
        response: '',
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, newMessage]);

      // Get AI response
      const response = await database.getAvatarResponse(avatarId, userMessage, aiConfig);
      
      // Update message with response
      const updatedMessage = {
        ...newMessage,
        response: response.text,
        voice_url: response.voiceUrl
      };

      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id ? updatedMessage : msg
      ));

      // Play voice if available and enabled
      if (response.voiceUrl && aiConfig.response_type !== 'text' && !isMuted) {
        const audio = new Audio(response.voiceUrl);
        audio.play();
      }
    } catch (error) {
      console.error('Failed to get AI response:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-4 right-4 w-96 bg-black/80 rounded-lg shadow-lg z-50"
    >
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <FaRobot className="text-purple-500" />
            <span className="text-white font-semibold">Avatar Chat</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="text-gray-400 hover:text-white"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
            </button>
            <button
              onClick={toggleSettings}
              className="text-gray-400 hover:text-white"
              title="Settings"
            >
              <FaCog />
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-4 p-4 bg-purple-900/50 rounded-lg"
            >
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  id="useLocalModel"
                  checked={useLocalModel}
                  onChange={(e) => setUseLocalModel(e.target.checked)}
                  className="rounded text-purple-500"
                />
                <label htmlFor="useLocalModel" className="text-white">
                  Use Local AI Model
                </label>
              </div>
              <div className="text-sm text-gray-300">
                {useLocalModel
                  ? "Using local AI model for responses (offline)"
                  : "Using cloud AI model for responses"}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="h-96 overflow-y-auto mb-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="space-y-2">
              <div className="bg-purple-900/50 p-3 rounded-lg">
                <p className="text-white">{message.message}</p>
              </div>
              <div className="bg-purple-800/50 p-3 rounded-lg">
                <p className="text-white">{message.response}</p>
                {message.voice_url && !isMuted && (
                  <button
                    onClick={() => new Audio(message.voice_url).play()}
                    className="mt-2 text-purple-400 hover:text-purple-300"
                  >
                    <FaMicrophone />
                  </button>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-white/10 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </motion.div>
  );
}; 