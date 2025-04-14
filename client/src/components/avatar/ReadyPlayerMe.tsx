import { useState } from 'react';
import { Visage } from '@readyplayerme/visage-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ReadyPlayerMeProps {
  onAvatarCreated: (avatarUrl: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function ReadyPlayerMe({ onAvatarCreated, isOpen, onClose }: ReadyPlayerMeProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const subdomain = import.meta.env.VITE_READY_PLAYER_ME_SUBDOMAIN || 'dormlit';

  const handleAvatarCreated = (url: string) => {
    setAvatarUrl(url);
  };

  const handleContinue = () => {
    if (avatarUrl) {
      onAvatarCreated(avatarUrl);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>Create Your Avatar</DialogTitle>
        </DialogHeader>
        <div className="flex-1 h-full">
          <Visage
            subdomain={subdomain}
            onAvatarCreated={handleAvatarCreated}
            className="w-full h-full"
          />
        </div>
        {avatarUrl && (
          <div className="mt-4 text-center">
            <p className="text-green-500 mb-4">Avatar created successfully!</p>
            <Button onClick={handleContinue}>Continue</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 