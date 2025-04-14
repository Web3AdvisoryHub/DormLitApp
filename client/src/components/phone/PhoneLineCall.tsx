import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface PhoneLineCallProps {
  creator: {
    id: number;
    username: string;
    avatarUrl: string;
    callRate: number;
  };
  onEndCall: () => void;
}

export function PhoneLineCall({ creator, onEndCall }: PhoneLineCallProps) {
  const [duration, setDuration] = useState(0);
  const [cost, setCost] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();
  const callIdRef = useRef<number>();
  const { toast } = useToast();

  useEffect(() => {
    startCall();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (callIdRef.current) {
        endCall();
      }
    };
  }, []);

  const startCall = async () => {
    try {
      const response = await apiRequest('/api/phone-lines/call', {
        method: 'POST',
        data: { creatorId: creator.id }
      });
      callIdRef.current = response.data.callId;
      
      // Start timer
      timerRef.current = setInterval(() => {
        setDuration(prev => {
          const newDuration = prev + 1;
          setCost(newDuration * creator.callRate);
          return newDuration;
        });
      }, 1000);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start call',
        variant: 'destructive'
      });
      onEndCall();
    }
  };

  const endCall = async () => {
    if (!callIdRef.current) return;
    
    try {
      await apiRequest('/api/phone-lines/end-call', {
        method: 'POST',
        data: { callId: callIdRef.current }
      });
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      toast({
        title: 'Call ended',
        description: `Duration: ${formatDuration(duration)} - Cost: $${cost.toFixed(2)}`
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to end call',
        variant: 'destructive'
      });
    } finally {
      onEndCall();
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
    >
      <div className="bg-gray-900 rounded-lg p-8 max-w-md w-full space-y-6">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={creator.avatarUrl} />
            <AvatarFallback>{creator.username[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-xl font-semibold">{creator.username}</h3>
            <p className="text-gray-400">${creator.callRate}/min</p>
          </div>
        </div>

        <div className="text-center space-y-2">
          <div className="text-4xl font-bold">{formatDuration(duration)}</div>
          <div className="text-2xl text-primary">${cost.toFixed(2)}</div>
        </div>

        <div className="flex justify-center space-x-4">
          <Button
            variant={isMuted ? "destructive" : "outline"}
            size="icon"
            onClick={() => setIsMuted(!isMuted)}
          >
            <motion.div
              animate={{ scale: isMuted ? 1.2 : 1 }}
              transition={{ duration: 0.2 }}
            >
              {isMuted ? '🔇' : '🎤'}
            </motion.div>
          </Button>

          <Button
            variant={isSpeakerOn ? "default" : "outline"}
            size="icon"
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
          >
            <motion.div
              animate={{ scale: isSpeakerOn ? 1.2 : 1 }}
              transition={{ duration: 0.2 }}
            >
              🔊
            </motion.div>
          </Button>

          <Button
            variant="destructive"
            size="icon"
            onClick={endCall}
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              📞
            </motion.div>
          </Button>
        </div>
      </div>
    </motion.div>
  );
} 