import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PhoneLineCall } from './PhoneLineCall';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface CreatorInfo {
  id: number;
  username: string;
  avatarUrl: string;
  callRate: number;
  textRate: number;
  isAvailable: boolean;
  availabilityHours: {
    start: string;
    end: string;
  };
}

interface FloatingCallBubbleProps {
  creator: CreatorInfo;
  isEnabled: boolean;
  userPlan: 'free' | 'paid' | 'pro';
}

export function FloatingCallBubble({ creator, isEnabled, userPlan }: FloatingCallBubbleProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const { toast } = useToast();

  if (!isEnabled) return null;

  const isWithinAvailability = () => {
    if (!creator.isAvailable) return false;
    
    const now = new Date();
    const [startHour, startMinute] = creator.availabilityHours.start.split(':').map(Number);
    const [endHour, endMinute] = creator.availabilityHours.end.split(':').map(Number);
    
    const startTime = new Date();
    startTime.setHours(startHour, startMinute, 0);
    
    const endTime = new Date();
    endTime.setHours(endHour, endMinute, 0);
    
    return now >= startTime && now <= endTime;
  };

  const handleCall = () => {
    if (userPlan === 'free') {
      setShowUpgradeDialog(true);
      return;
    }

    if (!isWithinAvailability()) {
      toast({
        title: 'Not Available',
        description: `${creator.username} is not available at this time.`,
        variant: 'destructive'
      });
      return;
    }
    setIsCalling(true);
  };

  const handleText = async () => {
    if (userPlan === 'free') {
      setShowUpgradeDialog(true);
      return;
    }

    if (!isWithinAvailability()) {
      toast({
        title: 'Not Available',
        description: `${creator.username} is not available at this time.`,
        variant: 'destructive'
      });
      return;
    }

    try {
      await apiRequest('/api/phone-lines/message', {
        method: 'POST',
        data: {
          creatorId: creator.id,
          message: 'Hello! I would like to chat.'
        }
      });
      toast({
        title: 'Message Sent',
        description: 'Your message has been sent successfully.'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive'
      });
    }
  };

  const getPlanFeatures = () => {
    switch (userPlan) {
      case 'free':
        return {
          canCall: false,
          canText: false,
          hasMinuteTracking: false,
          hasPremiumFeatures: false
        };
      case 'paid':
        return {
          canCall: true,
          canText: true,
          hasMinuteTracking: false,
          hasPremiumFeatures: false
        };
      case 'pro':
        return {
          canCall: true,
          canText: true,
          hasMinuteTracking: true,
          hasPremiumFeatures: true
        };
    }
  };

  const planFeatures = getPlanFeatures();

  return (
    <>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-8 right-8 z-50"
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={cn(
            "w-16 h-16 rounded-full bg-primary flex items-center justify-center cursor-pointer",
            !isWithinAvailability() && "opacity-50"
          )}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <Avatar className="w-10 h-10">
            <AvatarImage src={creator.avatarUrl} />
            <AvatarFallback>{creator.username[0]}</AvatarFallback>
          </Avatar>
        </motion.div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-20 right-0 w-64 bg-gray-900 rounded-lg p-4 space-y-4"
            >
              <div className="flex items-center space-x-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={creator.avatarUrl} />
                  <AvatarFallback>{creator.username[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{creator.username}</p>
                  <p className="text-sm text-gray-400">
                    {isWithinAvailability() ? 'Available' : 'Not Available'}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  className="w-full"
                  onClick={handleCall}
                  disabled={!isWithinAvailability() || !planFeatures.canCall}
                >
                  Call (${creator.callRate}/min)
                  {planFeatures.hasMinuteTracking && ' ⏱️'}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleText}
                  disabled={!isWithinAvailability() || !planFeatures.canText}
                >
                  Text (${creator.textRate}/msg)
                  {planFeatures.hasPremiumFeatures && ' ✨'}
                </Button>
              </div>

              <div className="text-xs text-gray-400">
                Available {creator.availabilityHours.start} - {creator.availabilityHours.end}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {isCalling && (
        <PhoneLineCall
          creator={creator}
          onEndCall={() => setIsCalling(false)}
        />
      )}

      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upgrade Required</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              To access call and text features, please upgrade your plan:
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Paid Plan</span>
                <span>$9.99/month</span>
              </div>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>✓ Basic call and text features</li>
                <li>✓ No minute tracking</li>
                <li>✓ Standard support</li>
              </ul>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Pro Plan</span>
                <span>$19.99/month</span>
              </div>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>✓ Full call and text features</li>
                <li>✓ Minute tracking</li>
                <li>✓ Premium support</li>
                <li>✓ Advanced analytics</li>
              </ul>
            </div>
            <Button className="w-full" onClick={() => window.location.href = '/settings/billing'}>
              Upgrade Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 