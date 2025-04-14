import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { StarBackground } from '@/components/background/StarBackground';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface Creator {
  id: number;
  username: string;
  avatarUrl: string;
  phoneLineRate: number;
  isAvailable: boolean;
  description: string;
}

export default function PhoneLinesPage() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [message, setMessage] = useState('');
  const [callDuration, setCallDuration] = useState(5);
  const { toast } = useToast();

  useEffect(() => {
    fetchCreators();
  }, []);

  const fetchCreators = async () => {
    try {
      const response = await apiRequest('/api/creators/phone-lines');
      setCreators(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch creators');
      setLoading(false);
    }
  };

  const handleCall = async (creatorId: number) => {
    try {
      const response = await apiRequest(`/api/creators/${creatorId}/call`, {
        method: 'POST',
        data: { duration: callDuration }
      });
      toast({
        title: 'Call initiated',
        description: `Calling creator for ${callDuration} minutes`
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to initiate call',
        variant: 'destructive'
      });
    }
  };

  const handleText = async (creatorId: number) => {
    try {
      const response = await apiRequest(`/api/creators/${creatorId}/text`, {
        method: 'POST',
        data: { message }
      });
      toast({
        title: 'Message sent',
        description: 'Your message has been sent to the creator'
      });
      setMessage('');
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center text-red-500">{error}</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <StarBackground />
      <Header />
      <main className="container mx-auto px-4 py-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-center mb-8"
        >
          Phone Line Marketplace
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {creators.map((creator) => (
            <motion.div
              key={creator.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              className={cn(
                'bg-gray-900 rounded-lg p-6 shadow-lg',
                !creator.isAvailable && 'opacity-50'
              )}
            >
              <div className="flex items-center space-x-4 mb-4">
                <img
                  src={creator.avatarUrl}
                  alt={creator.username}
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <h3 className="text-xl font-semibold">{creator.username}</h3>
                  <p className="text-gray-400">${creator.phoneLineRate}/min</p>
                </div>
              </div>
              <p className="text-gray-300 mb-4">{creator.description}</p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Call Duration (minutes)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={callDuration}
                    onChange={(e) => setCallDuration(Number(e.target.value))}
                    className="bg-gray-800"
                  />
                </div>
                <Button
                  onClick={() => handleCall(creator.id)}
                  disabled={!creator.isAvailable}
                  className="w-full"
                >
                  Call for ${(creator.phoneLineRate * callDuration).toFixed(2)}
                </Button>
                <div className="space-y-2">
                  <Label>Send Message</Label>
                  <Input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="bg-gray-800"
                  />
                </div>
                <Button
                  onClick={() => handleText(creator.id)}
                  disabled={!creator.isAvailable}
                  className="w-full"
                >
                  Send Message
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
} 