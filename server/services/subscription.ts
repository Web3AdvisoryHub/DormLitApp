import { database } from './database';
import { User, SubscriptionStatus, SubscriptionTier } from '@/shared/database.types';

export class SubscriptionService {
  private static instance: SubscriptionService;
  private readonly TIER_FEATURES = {
    shaper: {
      price: 9.99,
      features: [
        'basic_ai_customization',
        'standard_room_creation',
        'community_access',
        'basic_support'
      ]
    },
    architect: {
      price: 19.99,
      features: [
        'advanced_ai_customization',
        'unlimited_room_creation',
        'premium_avatars',
        'priority_support',
        'early_access_features'
      ]
    }
  };

  private constructor() {}

  public static getInstance(): SubscriptionService {
    if (!SubscriptionService.instance) {
      SubscriptionService.instance = new SubscriptionService();
    }
    return SubscriptionService.instance;
  }

  public async processSubscription(
    userId: string,
    tier: SubscriptionTier,
    paymentMethod: string
  ): Promise<{
    success: boolean;
    status: SubscriptionStatus;
    features: string[];
  }> {
    const user = await database.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Process payment (implement actual payment processing)
    const paymentSuccess = await this.processPayment(paymentMethod, this.TIER_FEATURES[tier].price);
    
    if (!paymentSuccess) {
      return {
        success: false,
        status: user.subscription_status,
        features: []
      };
    }

    // Update user subscription
    await database.updateUser(userId, {
      subscription_status: 'active',
      subscription_tier: tier,
      subscription_start_date: new Date(),
      features_locked: false
    });

    return {
      success: true,
      status: 'active',
      features: this.TIER_FEATURES[tier].features
    };
  }

  private async processPayment(paymentMethod: string, amount: number): Promise<boolean> {
    // Implement actual payment processing logic
    // This is a placeholder
    console.log(`Processing payment of $${amount} with method: ${paymentMethod}`);
    return true;
  }

  public async cancelSubscription(userId: string): Promise<{
    success: boolean;
    status: SubscriptionStatus;
  }> {
    const user = await database.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Update user subscription status
    await database.updateUser(userId, {
      subscription_status: 'cancelled',
      subscription_end_date: new Date()
    });

    return {
      success: true,
      status: 'cancelled'
    };
  }

  public async getSubscriptionDetails(userId: string): Promise<{
    tier: SubscriptionTier | null;
    status: SubscriptionStatus;
    features: string[];
    nextBillingDate: Date | null;
  }> {
    const user = await database.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const features = user.subscription_tier
      ? this.TIER_FEATURES[user.subscription_tier].features
      : [];

    return {
      tier: user.subscription_tier,
      status: user.subscription_status,
      features,
      nextBillingDate: user.subscription_start_date
        ? new Date(user.subscription_start_date.getTime() + 30 * 24 * 60 * 60 * 1000)
        : null
    };
  }

  public async validateSubscription(userId: string): Promise<boolean> {
    const { status, nextBillingDate } = await this.getSubscriptionDetails(userId);

    if (status !== 'active') {
      return false;
    }

    if (nextBillingDate && new Date() > nextBillingDate) {
      await this.handleSubscriptionExpiration(userId);
      return false;
    }

    return true;
  }

  private async handleSubscriptionExpiration(userId: string): Promise<void> {
    await database.updateUser(userId, {
      subscription_status: 'expired',
      features_locked: true
    });

    // Notify user about subscription expiration
    await this.sendSubscriptionExpirationNotification(userId);
  }

  private async sendSubscriptionExpirationNotification(userId: string): Promise<void> {
    // Implement notification logic (email, in-app, etc.)
    console.log(`Subscription expired for user ${userId}`);
  }

  public async getAvailableTiers(): Promise<{
    [key in SubscriptionTier]: {
      price: number;
      features: string[];
    };
  }> {
    return this.TIER_FEATURES;
  }
} 