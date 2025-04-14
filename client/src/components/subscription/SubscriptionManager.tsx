import { useState } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { createSubscription, cancelSubscription } from '@/lib/supabase';

type SubscriptionTier = 'explorer' | 'creator' | 'pro_creator' | 'vip_creator';

interface SubscriptionManagerProps {
  userId: string;
  currentTier: SubscriptionTier;
  isGrandfathered: boolean;
  className?: string;
}

const subscriptionFeatures = {
  explorer: {
    title: 'Explorer Mode',
    price: 'Free',
    features: [
      'Discover creators',
      'Follow profiles',
      'Basic profile access'
    ]
  },
  creator: {
    title: 'Creator Tier',
    price: '$7/month',
    features: [
      'All Explorer features',
      'Creator Room access',
      'Fan Wall',
      'Direct messaging',
      'Profile links'
    ]
  },
  pro_creator: {
    title: 'Pro Creator Tier',
    price: '$22/month',
    features: [
      'All Creator features',
      'Phone/Text monetization',
      'Rigged avatars',
      'DreamState expansion',
      'Revenue tracking',
      '90% revenue share'
    ]
  },
  vip_creator: {
    title: 'VIP Creator',
    price: 'Coming Soon',
    features: [
      'All Pro Creator features',
      'Advanced monetization',
      'Priority support',
      'Custom features'
    ]
  }
};

export function SubscriptionManager({
  userId,
  currentTier,
  isGrandfathered,
  className
}: SubscriptionManagerProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubscription = async (tier: SubscriptionTier) => {
    try {
      setLoading(true);
      const { error } = await createSubscription(userId, tier);
      
      if (error) throw error;
      
      toast({
        title: 'Subscription Updated',
        description: `You are now subscribed to ${subscriptionFeatures[tier].title}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update subscription. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      setLoading(true);
      const { error } = await cancelSubscription(userId);
      
      if (error) throw error;
      
      toast({
        title: 'Subscription Cancelled',
        description: 'Your subscription has been cancelled.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel subscription. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6', className)}>
      {Object.entries(subscriptionFeatures).map(([tier, details]) => (
        <motion.div
          key={tier}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <Card className={cn(
            'h-full flex flex-col',
            currentTier === tier && 'border-primary'
          )}>
            <CardHeader>
              <CardTitle>{details.title}</CardTitle>
              <CardDescription className="text-2xl font-bold">
                {details.price}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-2">
                {details.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {currentTier === tier ? (
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={loading || tier === 'explorer' || isGrandfathered}
                  className="w-full"
                >
                  {loading ? 'Processing...' : 'Cancel Subscription'}
                </Button>
              ) : (
                <Button
                  onClick={() => handleSubscription(tier as SubscriptionTier)}
                  disabled={loading || tier === 'vip_creator' || isGrandfathered}
                  className="w-full"
                >
                  {loading ? 'Processing...' : tier === 'vip_creator' ? 'Coming Soon' : 'Subscribe'}
                </Button>
              )}
            </CardFooter>
          </Card>
        </motion.div>
      ))}
    </div>
  );
} 