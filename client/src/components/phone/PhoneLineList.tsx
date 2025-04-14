import { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { PhoneLineCard } from './PhoneLineCard';
import { cn } from '@/lib/utils';

interface Creator {
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
}

interface PhoneLineListProps {
  creators: Creator[];
  onCall: (creatorId: string) => void;
  onText: (creatorId: string) => void;
  className?: string;
}

export function PhoneLineList({ creators, onCall, onText, className }: PhoneLineListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCreators = creators.filter(creator =>
    creator.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCall = (creatorId: string) => {
    onCall(creatorId);
  };

  const handleText = (creatorId: string) => {
    onText(creatorId);
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="relative">
        <Input
          type="text"
          placeholder="Search creators..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCreators.map((creator) => (
          <motion.div
            key={creator.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <PhoneLineCard
              creator={creator}
              onCall={() => handleCall(creator.id)}
              onText={() => handleText(creator.id)}
            />
          </motion.div>
        ))}
      </div>

      {filteredCreators.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No creators found matching your search.</p>
        </div>
      )}
    </div>
  );
} 