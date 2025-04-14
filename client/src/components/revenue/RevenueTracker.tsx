import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getRevenueHistory } from '@/lib/supabase';

interface RevenueTrackerProps {
  userId: string;
  isGrandfathered: boolean;
  className?: string;
}

interface RevenueItem {
  id: string;
  amount: number;
  source: string;
  platform_fee: number;
  created_at: string;
}

export function RevenueTracker({
  userId,
  isGrandfathered,
  className
}: RevenueTrackerProps) {
  const [loading, setLoading] = useState(false);
  const [revenue, setRevenue] = useState<RevenueItem[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalFees, setTotalFees] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    loadRevenue();
  }, [userId]);

  const loadRevenue = async () => {
    try {
      setLoading(true);
      const { data, error } = await getRevenueHistory(userId);
      
      if (error) throw error;
      
      setRevenue(data || []);
      
      // Calculate totals
      const earnings = data?.reduce((sum, item) => sum + item.amount, 0) || 0;
      const fees = data?.reduce((sum, item) => sum + item.platform_fee, 0) || 0;
      
      setTotalEarnings(earnings);
      setTotalFees(fees);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load revenue history.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={cn('space-y-6', className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Earnings</CardTitle>
            <CardDescription>
              Your total revenue before platform fees
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(totalEarnings)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Platform Fees</CardTitle>
            <CardDescription>
              {isGrandfathered ? 'Grandfathered - No Fees' : '10% Platform Fee'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(totalFees)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue History</CardTitle>
          <CardDescription>
            Detailed breakdown of your earnings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {revenue.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 bg-muted rounded-md"
              >
                <div>
                  <p className="font-medium">{item.source}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(item.created_at)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(item.amount)}</p>
                  {!isGrandfathered && (
                    <p className="text-sm text-muted-foreground">
                      Fee: {formatCurrency(item.platform_fee)}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
            {revenue.length === 0 && !loading && (
              <p className="text-center text-muted-foreground">
                No revenue history available
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            onClick={loadRevenue}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Loading...' : 'Refresh History'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 