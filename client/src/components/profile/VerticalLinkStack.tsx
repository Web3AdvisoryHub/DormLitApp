import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface SocialLink {
  platform: string;
  url: string;
  icon: string;
  isVisible: boolean;
  customLabel?: string;
}

interface VerticalLinkStackProps {
  links: SocialLink[];
  isEditable?: boolean;
  onUpdate?: (links: SocialLink[]) => void;
}

export function VerticalLinkStack({ links: initialLinks, isEditable = false, onUpdate }: VerticalLinkStackProps) {
  const [links, setLinks] = useState<SocialLink[]>(initialLinks);
  const [isEditing, setIsEditing] = useState(false);

  const handleToggleVisibility = (platform: string) => {
    const updatedLinks = links.map(link =>
      link.platform === platform ? { ...link, isVisible: !link.isVisible } : link
    );
    setLinks(updatedLinks);
    onUpdate?.(updatedLinks);
  };

  const handleUpdateLabel = (platform: string, label: string) => {
    const updatedLinks = links.map(link =>
      link.platform === platform ? { ...link, customLabel: label } : link
    );
    setLinks(updatedLinks);
    onUpdate?.(updatedLinks);
  };

  const getPlatformIcon = (platform: string) => {
    const icons: Record<string, string> = {
      'twitter': '🐦',
      'instagram': '📸',
      'youtube': '🎥',
      'tiktok': '🎵',
      'twitch': '🎮',
      'website': '🌐',
      'discord': '💬',
      'patreon': '🎭',
      'onlyfans': '💎',
      'snapchat': '👻',
      'facebook': '📘',
      'linkedin': '💼',
      'reddit': '📱',
      'pinterest': '📌',
      'spotify': '🎵',
      'soundcloud': '🎶',
      'apple': '🍎',
      'amazon': '📦',
      'etsy': '🛍️',
      'shopify': '🛒'
    };
    return icons[platform.toLowerCase()] || '🔗';
  };

  return (
    <div className="space-y-4">
      {isEditable && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Done' : 'Edit Links'}
          </Button>
        </div>
      )}

      <div className="space-y-2">
        {links.map((link) => (
          <motion.div
            key={link.platform}
            whileHover={{ scale: 1.02 }}
            className={cn(
              "flex items-center space-x-2 p-2 rounded-lg",
              isEditing ? "bg-gray-900" : "hover:bg-gray-900"
            )}
          >
            {isEditing && (
              <Switch
                checked={link.isVisible}
                onCheckedChange={() => handleToggleVisibility(link.platform)}
                className="mr-2"
              />
            )}

            {isEditing ? (
              <div className="flex-1 flex items-center space-x-2">
                <span className="text-xl">{getPlatformIcon(link.platform)}</span>
                <Input
                  type="text"
                  value={link.customLabel || link.platform}
                  onChange={(e) => handleUpdateLabel(link.platform, e.target.value)}
                  className="flex-1"
                  placeholder="Custom label"
                />
              </div>
            ) : link.isVisible ? (
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center space-x-2 hover:text-primary"
              >
                <span className="text-xl">{getPlatformIcon(link.platform)}</span>
                <span>{link.customLabel || link.platform}</span>
              </a>
            ) : null}
          </motion.div>
        ))}
      </div>
    </div>
  );
} 