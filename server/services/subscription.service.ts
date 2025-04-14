import { supabase } from '../lib/supabase';
import { Database } from '../../shared/database.types';

type SubscriptionTier = Database['public']['Tables']['profiles']['Row']['subscription_tier'];
type SubscriptionStatus = Database['public']['Tables']['profiles']['Row']['subscription_status'];

export class SubscriptionService {
  static async createSubscription(userId: string, tier: SubscriptionTier) {
    const { data: profile, error } = await supabase
      .from('profiles')
      .update({
        subscription_tier: tier,
        subscription_status: 'active',
        is_grandfathered: false // Only set during signup
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return profile;
  }

  static async cancelSubscription(userId: string) {
    const { data: profile, error } = await supabase
      .from('profiles')
      .update({
        subscription_status: 'cancelled',
        subscription_tier: 'explorer'
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return profile;
  }

  static async markAsGrandfathered(userId: string) {
    const { data: profile, error } = await supabase
      .from('profiles')
      .update({
        is_grandfathered: true,
        subscription_status: 'grandfathered'
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return profile;
  }

  static async getSubscriptionFeatures(tier: SubscriptionTier) {
    const features = {
      explorer: {
        canFollow: true,
        canViewProfiles: true,
        canEnterRooms: false,
        canMonetize: false
      },
      creator: {
        canFollow: true,
        canViewProfiles: true,
        canEnterRooms: true,
        canMonetize: false,
        hasCreatorRoom: true,
        hasFanWall: true,
        hasDMAccess: true,
        hasProfileLinks: true
      },
      pro_creator: {
        canFollow: true,
        canViewProfiles: true,
        canEnterRooms: true,
        canMonetize: true,
        hasCreatorRoom: true,
        hasFanWall: true,
        hasDMAccess: true,
        hasProfileLinks: true,
        hasPhoneLine: true,
        hasRiggedAvatars: true,
        hasDreamState: true,
        hasRevenueTracking: true
      },
      vip_creator: {
        canFollow: true,
        canViewProfiles: true,
        canEnterRooms: true,
        canMonetize: true,
        hasCreatorRoom: true,
        hasFanWall: true,
        hasDMAccess: true,
        hasProfileLinks: true,
        hasPhoneLine: true,
        hasRiggedAvatars: true,
        hasDreamState: true,
        hasRevenueTracking: true,
        hasAdvancedFeatures: true
      }
    };

    return features[tier];
  }

  static async checkFeatureAccess(userId: string, feature: string) {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('subscription_tier, subscription_status, is_grandfathered')
      .eq('id', userId)
      .single();

    if (error) throw error;

    const features = await this.getSubscriptionFeatures(profile.subscription_tier);
    return features[feature as keyof typeof features] || false;
  }
} 