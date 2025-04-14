import { supabase } from '../lib/supabase';
import { Database } from '../../shared/database.types';

type Wallet = Database['public']['Tables']['wallets']['Row'];

export class WalletService {
  static async linkWallet(userId: string, address: string, provider: string) {
    const { data: wallet, error } = await supabase
      .from('wallets')
      .upsert({
        user_id: userId,
        address,
        provider,
        verified: false,
        last_verified: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Update profile with wallet info
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        wallet_address: address,
        wallet_provider: provider,
        wallet_verified: false
      })
      .eq('id', userId);

    if (profileError) throw profileError;

    return wallet;
  }

  static async verifyWallet(userId: string, signature: string) {
    // TODO: Implement actual wallet verification logic
    // This is a placeholder for the verification process
    const verified = true; // Replace with actual verification

    if (verified) {
      const { data: wallet, error } = await supabase
        .from('wallets')
        .update({
          verified: true,
          last_verified: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      // Update profile verification status
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          wallet_verified: true
        })
        .eq('id', userId);

      if (profileError) throw profileError;

      return wallet;
    }

    throw new Error('Wallet verification failed');
  }

  static async getWallet(userId: string) {
    const { data: wallet, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return wallet;
  }

  static async trackRevenue(userId: string, amount: number, source: string) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_grandfathered')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    const platformFee = profile.is_grandfathered ? 0 : amount * 0.1; // 10% platform fee

    const { data: revenue, error } = await supabase
      .from('revenue')
      .insert({
        user_id: userId,
        amount,
        source,
        platform_fee: platformFee,
        is_grandfathered: profile.is_grandfathered
      })
      .select()
      .single();

    if (error) throw error;

    // Update user balance
    const { error: balanceError } = await supabase
      .from('profiles')
      .update({
        balance: supabase.raw(`balance + ${amount - platformFee}`)
      })
      .eq('id', userId);

    if (balanceError) throw balanceError;

    return revenue;
  }

  static async getRevenueHistory(userId: string) {
    const { data: revenue, error } = await supabase
      .from('revenue')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return revenue;
  }
} 