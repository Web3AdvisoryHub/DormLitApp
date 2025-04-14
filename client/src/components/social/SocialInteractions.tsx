import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

interface Reaction {
  id: string;
  emoji: string;
  label: string;
}

interface Comment {
  id: string;
  userId: string;
  content: string;
  timestamp: string;
}

interface Props {
  postId: string;
  onAddReaction: (reactionId: string) => void;
  onAddComment: (content: string) => void;
}

const defaultReactions: Reaction[] = [
  { id: 'sparkle', emoji: '✨', label: 'Sparkle' },
  { id: 'heart', emoji: '💖', label: 'Heart' },
  { id: 'star', emoji: '⭐', label: 'Star' },
  { id: 'moon', emoji: '🌙', label: 'Moon' },
  { id: 'sun', emoji: '☀️', label: 'Sun' }
];

const SocialInteractions: React.FC<Props> = ({
  postId,
  onAddReaction,
  onAddComment
}) => {
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [activeReactions, setActiveReactions] = useState<Set<string>>(new Set());

  const handleReactionClick = (reactionId: string) => {
    const newActiveReactions = new Set(activeReactions);
    if (newActiveReactions.has(reactionId)) {
      newActiveReactions.delete(reactionId);
    } else {
      newActiveReactions.add(reactionId);
    }
    setActiveReactions(newActiveReactions);
    onAddReaction(reactionId);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentContent.trim()) {
      onAddComment(commentContent);
      setCommentContent('');
      setShowCommentInput(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Reactions */}
      <div className="flex flex-wrap gap-2">
        {defaultReactions.map((reaction) => (
          <motion.button
            key={reaction.id}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleReactionClick(reaction.id)}
            className={twMerge(
              "p-2 rounded-full transition-all duration-300",
              "hover:bg-purple-500/20",
              activeReactions.has(reaction.id)
                ? "bg-purple-500/30 scale-110"
                : "bg-purple-900/30"
            )}
          >
            <span className="text-xl">{reaction.emoji}</span>
          </motion.button>
        ))}
      </div>

      {/* Comment Section */}
      <div className="space-y-2">
        <button
          onClick={() => setShowCommentInput(!showCommentInput)}
          className="text-purple-300 hover:text-purple-200 transition-colors"
        >
          {showCommentInput ? 'Cancel' : 'Add a comment...'}
        </button>

        {showCommentInput && (
          <motion.form
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleCommentSubmit}
            className="space-y-2"
          >
            <textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="Share your thoughts..."
              className="w-full p-3 rounded-lg bg-purple-900/50 border border-purple-500/30 focus:border-purple-500/50 focus:outline-none text-purple-100 placeholder-purple-400/50"
              rows={3}
            />
            <div className="flex justify-end">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white transition-colors"
              >
                Post Comment
              </motion.button>
            </div>
          </motion.form>
        )}
      </div>
    </div>
  );
};

export default SocialInteractions; 