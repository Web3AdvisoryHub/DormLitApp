import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PhoneLineCardProps {
  creator: {
    id: string;
    name: string;
    avatarUrl?: string;
    callRate: number;
    textRate: number;
    isAvailable: boolean;
    availabilityHours: {
      start: string;
      end: string;
    };
  };
  onCall: () => void;
  onText: () => void;
  className?: string;
}

export function PhoneLineCard({ creator, onCall, onText, className }: PhoneLineCardProps) {
  const [isHovered, setIsHovered] = useState(false);

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

  const getAvailabilityStatus = () => {
    if (!creator.isAvailable) return 'Unavailable';
    return isWithinAvailability() ? 'Available Now' : 'Available Later';
  };

  const getAvailabilityColor = () => {
    if (!creator.isAvailable) return 'bg-red-500';
    return isWithinAvailability() ? 'bg-green-500' : 'bg-yellow-500';
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className={cn("w-full max-w-md", className)}>
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={creator.avatarUrl} />
            <AvatarFallback>{creator.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle>{creator.name}</CardTitle>
            <Badge className={cn("mt-2", getAvailabilityColor())}>
              {getAvailabilityStatus()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Call Rate</p>
              <p className="text-lg font-semibold">${creator.callRate}/min</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Text Rate</p>
              <p className="text-lg font-semibold">${creator.textRate}/msg</p>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Available Hours</p>
            <p className="text-sm">
              {creator.isAvailable
                ? `${creator.availabilityHours.start} - ${creator.availabilityHours.end}`
                : 'Not available'}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              className="flex-1"
              onClick={onCall}
              disabled={!creator.isAvailable || !isWithinAvailability()}
            >
              Call Now
            </Button>
            <Button
              className="flex-1"
              variant="outline"
              onClick={onText}
              disabled={!creator.isAvailable}
            >
              Send Message
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
} 