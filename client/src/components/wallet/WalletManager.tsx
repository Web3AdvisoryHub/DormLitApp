import { useState } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { linkWallet, verifyWallet, getWallet } from '@/lib/supabase';

interface WalletManagerProps {
  userId: string;
  className?: string;
}

export function WalletManager({
  userId,
  className
}: WalletManagerProps) {
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState('');
  const [provider, setProvider] = useState('');
  const [signature, setSignature] = useState('');
  const [wallet, setWallet] = useState<any>(null);
  const { toast } = useToast();

  const handleLinkWallet = async () => {
    try {
      setLoading(true);
      const { data, error } = await linkWallet(userId, address, provider);
      
      if (error) throw error;
      
      setWallet(data);
      toast({
        title: 'Wallet Linked',
        description: 'Your wallet has been linked successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to link wallet. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyWallet = async () => {
    try {
      setLoading(true);
      const { data, error } = await verifyWallet(userId, signature);
      
      if (error) throw error;
      
      setWallet(data);
      toast({
        title: 'Wallet Verified',
        description: 'Your wallet has been verified successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to verify wallet. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadWallet = async () => {
    try {
      setLoading(true);
      const { data, error } = await getWallet(userId);
      
      if (error) throw error;
      
      setWallet(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load wallet information.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      <Card>
        <CardHeader>
          <CardTitle>Wallet Management</CardTitle>
          <CardDescription>
            Link and verify your wallet to receive payments and track revenue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!wallet ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="address">Wallet Address</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your wallet address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="provider">Wallet Provider</Label>
                <Input
                  id="provider"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  placeholder="Enter wallet provider (e.g., MetaMask)"
                />
              </div>
              <Button
                onClick={handleLinkWallet}
                disabled={loading || !address || !provider}
                className="w-full"
              >
                {loading ? 'Linking...' : 'Link Wallet'}
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Linked Wallet</Label>
                <div className="p-4 bg-muted rounded-md">
                  <p className="font-mono text-sm break-all">{wallet.address}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Provider: {wallet.provider}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Status: {wallet.verified ? 'Verified' : 'Unverified'}
                  </p>
                </div>
              </div>
              {!wallet.verified && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="signature">Verification Signature</Label>
                    <Input
                      id="signature"
                      value={signature}
                      onChange={(e) => setSignature(e.target.value)}
                      placeholder="Enter verification signature"
                    />
                  </div>
                  <Button
                    onClick={handleVerifyWallet}
                    disabled={loading || !signature}
                    className="w-full"
                  >
                    {loading ? 'Verifying...' : 'Verify Wallet'}
                  </Button>
                </>
              )}
            </>
          )}
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            onClick={loadWallet}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Loading...' : 'Refresh Wallet Info'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 