import { database } from './database';
import { User, SubscriptionStatus } from '@/shared/database.types';

export class TrialService {
  private static instance: TrialService;
  private readonly EARLY_ADOPTER_GRACE_PERIOD = 7; // days
  private readonly TRIAL_PERIOD = 14; // days

  private constructor() {}

  public static getInstance(): TrialService {
    if (!TrialService.instance) {
      TrialService.instance = new TrialService();
    }
    return TrialService.instance;
  }

  public async initializeUserTrial(userId: string): Promise<{
    isEarlyAdopter: boolean;
    trialEndDate: Date;
    status: SubscriptionStatus;
  }> {
    const user = await database.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const signupDate = new Date(user.created_at);
    const now = new Date();
    const daysSinceSignup = Math.floor((now.getTime() - signupDate.getTime()) / (1000 * 60 * 60 * 24));

    const isEarlyAdopter = daysSinceSignup <= this.EARLY_ADOPTER_GRACE_PERIOD;
    const trialEndDate = new Date(signupDate);
    trialEndDate.setDate(trialEndDate.getDate() + this.TRIAL_PERIOD);

    const status: SubscriptionStatus = isEarlyAdopter ? 'active' : 'trial';

    await database.updateUser(userId, {
      subscription_status: status,
      trial_end_date: trialEndDate,
      is_early_adopter: isEarlyAdopter
    });

    return {
      isEarlyAdopter,
      trialEndDate,
      status
    };
  }

  public async checkTrialStatus(userId: string): Promise<{
    status: SubscriptionStatus;
    daysRemaining: number;
    isEarlyAdopter: boolean;
  }> {
    const user = await database.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.subscription_status === 'active') {
      return {
        status: 'active',
        daysRemaining: Infinity,
        isEarlyAdopter: user.is_early_adopter
      };
    }

    const now = new Date();
    const trialEndDate = new Date(user.trial_end_date);
    const daysRemaining = Math.max(0, Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    if (daysRemaining === 0 && user.subscription_status === 'trial') {
      await this.handleTrialExpiration(userId);
    }

    return {
      status: user.subscription_status,
      daysRemaining,
      isEarlyAdopter: user.is_early_adopter
    };
  }

  private async handleTrialExpiration(userId: string): Promise<void> {
    await database.updateUser(userId, {
      subscription_status: 'expired',
      features_locked: true
    });

    // Notify user about trial expiration
    await this.sendTrialExpirationNotification(userId);
  }

  private async sendTrialExpirationNotification(userId: string): Promise<void> {
    // Implement notification logic (email, in-app, etc.)
    console.log(`Trial expired for user ${userId}`);
  }

  public async getFeatureAccess(userId: string): Promise<{
    hasAccess: boolean;
    lockedFeatures: string[];
  }> {
    const { status, isEarlyAdopter } = await this.checkTrialStatus(userId);

    if (status === 'active' || isEarlyAdopter) {
      return {
        hasAccess: true,
        lockedFeatures: []
      };
    }

    // Define which features are locked during trial
    const lockedFeatures = [
      'premium_avatars',
      'advanced_ai_customization',
      'priority_support',
      'unlimited_room_creation'
    ];

    return {
      hasAccess: false,
      lockedFeatures
    };
  }

  public async sendTrialReminder(userId: string): Promise<void> {
    const { daysRemaining, status } = await this.checkTrialStatus(userId);

    if (status === 'trial' && daysRemaining <= 3) {
      // Implement reminder notification logic
      console.log(`Sending trial reminder to user ${userId}. ${daysRemaining} days remaining.`);
    }
  }
} 