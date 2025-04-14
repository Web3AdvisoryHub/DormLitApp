import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Item } from '@/types/creator';

interface SocialFeaturesProps {
  item: Item;
  onLike?: () => void;
  onComment?: (comment: string) => void;
  onShare?: () => void;
  className?: string;
}

export function SocialFeatures({
  item,
  onLike,
  onComment,
  onShare,
  className,
}: SocialFeaturesProps) {
  const [comment, setComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike?.();
  };

  const handleComment = () => {
    if (comment.trim()) {
      onComment?.(comment.trim());
      setComment('');
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Like and Share Buttons */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          className={cn(
            "flex items-center gap-2",
            isLiked && "text-primary"
          )}
        >
          <motion.div
            animate={{ scale: isLiked ? [1, 1.2, 1] : 1 }}
            transition={{ duration: 0.3 }}
          >
            ♥
          </motion.div>
          <span>{item.likes || 0}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onShare}
          className="flex items-center gap-2"
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            ↪
          </motion.div>
          <span>Share</span>
        </Button>
      </div>

      {/* Comments Section */}
      <div className="space-y-4">
        <h3 className="font-semibold">Comments</h3>
        
        {/* Comment Input */}
        <div className="flex gap-2">
          <Input
            placeholder="Add a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleComment();
              }
            }}
          />
          <Button
            onClick={handleComment}
            disabled={!comment.trim()}
          >
            Post
          </Button>
        </div>

        {/* Comments List */}
        <div className="space-y-4">
          {item.comments?.map((comment, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex gap-3"
            >
              <Avatar>
                <AvatarImage src={comment.user.avatarUrl} />
                <AvatarFallback>
                  {comment.user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{comment.user.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(comment.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm">{comment.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Share Options */}
      <div className="space-y-2">
        <h3 className="font-semibold">Share Options</h3>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            <span className="mr-2">📱</span>
            Copy Link
          </Button>
          <Button variant="outline" size="sm">
            <span className="mr-2">📧</span>
            Email
          </Button>
          <Button variant="outline" size="sm">
            <span className="mr-2">📱</span>
            SMS
          </Button>
          <Button variant="outline" size="sm">
            <span className="mr-2">📱</span>
            WhatsApp
          </Button>
        </div>
      </div>
    </div>
  );
} 