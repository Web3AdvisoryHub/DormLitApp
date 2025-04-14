import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface ShareButtonsProps {
  type: 'profile' | 'post' | 'nft';
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  className?: string;
}

const socialPlatforms = [
  {
    name: 'Twitter',
    icon: '🐦',
    shareUrl: (url: string, title: string) => 
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
  },
  {
    name: 'Facebook',
    icon: '📘',
    shareUrl: (url: string) => 
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
  },
  {
    name: 'LinkedIn',
    icon: '💼',
    shareUrl: (url: string, title: string, description?: string) => 
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(description || '')}`
  },
  {
    name: 'Reddit',
    icon: '📱',
    shareUrl: (url: string, title: string) => 
      `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`
  },
  {
    name: 'Tumblr',
    icon: '📝',
    shareUrl: (url: string, title: string, description?: string) => 
      `https://www.tumblr.com/widgets/share/tool?canonicalUrl=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&caption=${encodeURIComponent(description || '')}`
  }
];

export function ShareButtons({
  type,
  id,
  title,
  description,
  imageUrl,
  className
}: ShareButtonsProps) {
  const [showCopy, setShowCopy] = useState(false);
  const { toast } = useToast();

  const baseUrl = window.location.origin;
  const shareUrl = `${baseUrl}/${type}/${id}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: 'Copied!',
        description: 'Link copied to clipboard'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy link',
        variant: 'destructive'
      });
    }
  };

  const handleShare = (platform: typeof socialPlatforms[0]) => {
    const url = platform.shareUrl(shareUrl, title, description);
    window.open(url, '_blank', 'width=600,height=400');
  };

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className="flex items-center gap-2">
        <Input
          value={shareUrl}
          readOnly
          className="flex-1"
        />
        <Button
          variant="outline"
          onClick={handleCopy}
        >
          Copy
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {socialPlatforms.map(platform => (
          <motion.button
            key={platform.name}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
            onClick={() => handleShare(platform)}
            title={`Share on ${platform.name}`}
          >
            <span className="text-xl">{platform.icon}</span>
          </motion.button>
        ))}
      </div>

      {type === 'nft' && (
        <div className="mt-4 p-4 bg-gray-800 rounded-lg">
          <h4 className="font-bold mb-2">NFT Details</h4>
          <p className="text-sm text-gray-400">
            Share this NFT with collectors and fans. The link includes the full NFT metadata and ownership history.
          </p>
        </div>
      )}
    </div>
  );
} 