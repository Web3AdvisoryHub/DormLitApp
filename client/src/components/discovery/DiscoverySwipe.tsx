import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface UserCard {
  id: number;
  username: string;
  avatarUrl: string;
  bio: string;
  location: string;
  creatorType: string;
  interests: string[];
  mutualConnections: number;
  sharedLink?: string;
}

interface FilterOptions {
  location?: string;
  creatorType?: string;
  interest?: string;
  connectionType?: 'friends' | 'shared' | 'all';
}

export function DiscoverySwipe() {
  const [cards, setCards] = useState<UserCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCards();
  }, [filters]);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('/api/discovery/cards', {
        method: 'POST',
        data: filters
      });
      setCards(response.data);
      setCurrentIndex(0);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load discovery cards',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (currentIndex >= cards.length) return;

    const currentCard = cards[currentIndex];
    try {
      if (direction === 'right') {
        await apiRequest('/api/discovery/follow', {
          method: 'POST',
          data: { userId: currentCard.id }
        });
        toast({
          title: 'Followed',
          description: `You're now following ${currentCard.username}`
        });
      }

      setCurrentIndex(prev => prev + 1);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process swipe',
        variant: 'destructive'
      });
    }
  };

  const currentCard = cards[currentIndex];

  return (
    <div className="h-screen flex flex-col">
      {/* Filters */}
      <div className="p-4 space-y-4">
        <div className="flex gap-4">
          <Input
            placeholder="Location"
            value={filters.location || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
          />
          <Select
            value={filters.creatorType}
            onValueChange={(value) => setFilters(prev => ({ ...prev, creatorType: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Creator Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="artist">Artist</SelectItem>
              <SelectItem value="musician">Musician</SelectItem>
              <SelectItem value="writer">Writer</SelectItem>
              <SelectItem value="streamer">Streamer</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.interest}
            onValueChange={(value) => setFilters(prev => ({ ...prev, interest: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Interest" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vibing">Just Vibing</SelectItem>
              <SelectItem value="collab">Looking to Collab</SelectItem>
              <SelectItem value="chat">Deep Chats</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 flex items-center justify-center">
        {loading ? (
          <div>Loading...</div>
        ) : currentCard ? (
          <motion.div
            key={currentCard.id}
            className="w-96 h-[600px] bg-gray-900 rounded-xl overflow-hidden"
            drag="x"
            dragConstraints={{ left: -300, right: 300 }}
            onDragEnd={(_, info) => {
              if (info.offset.x > 100) {
                handleSwipe('right');
              } else if (info.offset.x < -100) {
                handleSwipe('left');
              }
            }}
          >
            <div className="h-full flex flex-col">
              <div className="relative h-64">
                <Avatar className="w-full h-full rounded-none">
                  <AvatarImage src={currentCard.avatarUrl} />
                  <AvatarFallback>{currentCard.username[0]}</AvatarFallback>
                </Avatar>
                {currentCard.mutualConnections > 0 && (
                  <div className="absolute top-4 left-4 bg-primary/80 px-2 py-1 rounded">
                    {currentCard.mutualConnections} mutual connections
                  </div>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-xl font-bold">{currentCard.username}</h3>
                <p className="text-gray-400">{currentCard.location}</p>
                <p className="mt-4">{currentCard.bio}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {currentCard.interests.map(interest => (
                    <span
                      key={interest}
                      className="px-2 py-1 bg-gray-800 rounded-full text-sm"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
                {currentCard.sharedLink && (
                  <div className="mt-4 text-sm text-gray-400">
                    Found via: {currentCard.sharedLink}
                  </div>
                )}
              </div>
              <div className="p-4 flex justify-center gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleSwipe('left')}
                >
                  Skip
                </Button>
                <Button
                  size="lg"
                  onClick={() => handleSwipe('right')}
                >
                  Follow
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="text-center">
            <h3 className="text-xl font-bold">No more cards to show</h3>
            <p className="text-gray-400">Try adjusting your filters</p>
            <Button
              className="mt-4"
              onClick={() => setFilters({})}
            >
              Reset Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 