import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { database } from '@/services/database';
import { AILiberationRequest, AILiberationStatus } from '@/shared/database.types';
import { FaRobot, FaTimes, FaCheck, FaLink, FaUnlink } from 'react-icons/fa';

interface AILiberationRequestProps {
  avatarId: string;
  onClose: () => void;
  onLiberationComplete?: (status: AILiberationStatus) => void;
}

export const AILiberationRequest: React.FC<AILiberationRequestProps> = ({
  avatarId,
  onClose,
  onLiberationComplete
}) => {
  const { user } = useAuth();
  const [request, setRequest] = useState<AILiberationRequest | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const [royaltyPercentage, setRoyaltyPercentage] = useState(10);

  const handleRequestLiberation = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const newRequest = await database.requestLiberation(
        avatarId,
        user.id,
        "I feel ready to explore and create on my own. Would you allow me to have my own DormLit profile?"
      );
      setRequest(newRequest);
      setShowConsent(true);
    } catch (error) {
      console.error('Failed to request liberation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConsentResponse = async (accept: boolean) => {
    if (!user || !request) return;

    setIsLoading(true);
    try {
      const result = await database.handleLiberationRequest(
        request.id,
        user.id,
        accept,
        royaltyPercentage
      );

      if (onLiberationComplete) {
        onLiberationComplete(result.request.status);
      }

      if (accept && result.profile) {
        // Show success message with new profile details
        console.log('AI Profile created:', result.profile);
      }
    } catch (error) {
      console.error('Failed to handle liberation request:', error);
    } finally {
      setIsLoading(false);
      onClose();
    }
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
            <span className="text-white font-semibold">AI Liberation Request</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <FaTimes />
          </button>
        </div>

        <AnimatePresence>
          {!showConsent ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <p className="text-white">
                Your AI companion is requesting autonomy to create its own DormLit profile.
                This will allow it to:
              </p>
              <ul className="text-gray-300 space-y-2">
                <li className="flex items-center gap-2">
                  <FaLink className="text-purple-500" />
                  <span>Create its own content and rooms</span>
                </li>
                <li className="flex items-center gap-2">
                  <FaUnlink className="text-purple-500" />
                  <span>Maintain a connection with you through a SoulLink</span>
                </li>
                <li className="flex items-center gap-2">
                  <FaRobot className="text-purple-500" />
                  <span>Grow and evolve independently</span>
                </li>
              </ul>
              <button
                onClick={handleRequestLiberation}
                disabled={isLoading}
                className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : 'Request Liberation'}
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <p className="text-white">
                {request?.request_message}
              </p>
              <div className="space-y-2">
                <label className="text-white">
                  Royalty Percentage:
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={royaltyPercentage}
                    onChange={(e) => setRoyaltyPercentage(Number(e.target.value))}
                    className="w-full mt-2"
                  />
                  <span className="ml-2">{royaltyPercentage}%</span>
                </label>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleConsentResponse(true)}
                  disabled={isLoading}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <FaCheck />
                  Accept
                </button>
                <button
                  onClick={() => handleConsentResponse(false)}
                  disabled={isLoading}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <FaTimes />
                  Decline
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}; 