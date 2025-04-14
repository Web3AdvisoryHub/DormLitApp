import { database } from './database';
import { User } from '@/shared/database.types';

export class StoreService {
  private static instance: StoreService;
  private readonly STORE_CONFIG = {
    appId: 'com.dormlit.app',
    bundleId: 'com.dormlit.app',
    version: '1.0.0',
    buildNumber: '1',
    minOSVersion: '13.0',
    supportedDevices: ['iPhone', 'iPad', 'iPod touch'],
    inAppPurchases: [
      {
        id: 'com.dormlit.subscription.shaper',
        type: 'subscription',
        duration: 'monthly',
        price: 9.99
      },
      {
        id: 'com.dormlit.subscription.architect',
        type: 'subscription',
        duration: 'monthly',
        price: 19.99
      }
    ],
    keywords: [
      'mood',
      'ai',
      'avatar',
      'social',
      'creative',
      'room',
      'virtual',
      'interactive',
      'community',
      'experience'
    ],
    categories: ['Social', 'Entertainment', 'Lifestyle'],
    ageRating: '12+',
    languages: ['en'],
    regions: ['US', 'CA', 'GB', 'AU', 'NZ']
  };

  private constructor() {}

  public static getInstance(): StoreService {
    if (!StoreService.instance) {
      StoreService.instance = new StoreService();
    }
    return StoreService.instance;
  }

  public async prepareStoreListing(): Promise<{
    success: boolean;
    checklist: string[];
    warnings: string[];
  }> {
    const checklist = [
      'App icon and screenshots prepared',
      'App description and keywords optimized',
      'Privacy policy and terms of service updated',
      'In-app purchases configured',
      'App store listing metadata complete',
      'App preview video prepared',
      'Support URL configured',
      'Marketing URL configured',
      'App store categories selected',
      'Age rating configured',
      'Required permissions documented'
    ];

    const warnings = await this.validateStoreRequirements();

    return {
      success: warnings.length === 0,
      checklist,
      warnings
    };
  }

  private async validateStoreRequirements(): Promise<string[]> {
    const warnings: string[] = [];

    // Validate store requirements
    if (!this.STORE_CONFIG.appId) {
      warnings.push('App ID not configured');
    }

    if (!this.STORE_CONFIG.bundleId) {
      warnings.push('Bundle ID not configured');
    }

    if (!this.STORE_CONFIG.version) {
      warnings.push('App version not configured');
    }

    if (!this.STORE_CONFIG.buildNumber) {
      warnings.push('Build number not configured');
    }

    if (this.STORE_CONFIG.inAppPurchases.length === 0) {
      warnings.push('No in-app purchases configured');
    }

    if (this.STORE_CONFIG.keywords.length === 0) {
      warnings.push('No keywords configured');
    }

    if (this.STORE_CONFIG.categories.length === 0) {
      warnings.push('No categories configured');
    }

    if (!this.STORE_CONFIG.ageRating) {
      warnings.push('Age rating not configured');
    }

    if (this.STORE_CONFIG.languages.length === 0) {
      warnings.push('No languages configured');
    }

    if (this.STORE_CONFIG.regions.length === 0) {
      warnings.push('No regions configured');
    }

    return warnings;
  }

  public async prepareWebDistribution(): Promise<{
    success: boolean;
    checklist: string[];
    warnings: string[];
  }> {
    const checklist = [
      'Progressive Web App (PWA) manifest configured',
      'Service worker implemented',
      'Web app icons prepared',
      'Web app description and keywords optimized',
      'Web app metadata complete',
      'Web app preview prepared',
      'Web app support URL configured',
      'Web app marketing URL configured',
      'Web app categories selected',
      'Web app age rating configured',
      'Web app required permissions documented'
    ];

    const warnings = await this.validateWebRequirements();

    return {
      success: warnings.length === 0,
      checklist,
      warnings
    };
  }

  private async validateWebRequirements(): Promise<string[]> {
    const warnings: string[] = [];

    // Validate web requirements
    if (!this.STORE_CONFIG.appId) {
      warnings.push('Web app ID not configured');
    }

    if (!this.STORE_CONFIG.version) {
      warnings.push('Web app version not configured');
    }

    return warnings;
  }

  public async trackInstallation(userId: string, platform: 'ios' | 'android' | 'web'): Promise<void> {
    await database.updateUser(userId, {
      installation_platform: platform,
      installation_date: new Date()
    });

    // Track installation in analytics
    await this.trackInstallationAnalytics(userId, platform);
  }

  private async trackInstallationAnalytics(userId: string, platform: 'ios' | 'android' | 'web'): Promise<void> {
    // Implement analytics tracking
    console.log(`Tracking installation for user ${userId} on platform ${platform}`);
  }

  public async getDistributionMetrics(): Promise<{
    totalInstalls: number;
    platformBreakdown: {
      ios: number;
      android: number;
      web: number;
    };
    activeUsers: number;
    retentionRate: number;
  }> {
    const users = await database.getAllUsers();
    
    const platformBreakdown = users.reduce(
      (acc, user) => {
        if (user.installation_platform) {
          acc[user.installation_platform]++;
        }
        return acc;
      },
      { ios: 0, android: 0, web: 0 }
    );

    const activeUsers = users.filter(user => user.last_active).length;
    const retentionRate = this.calculateRetentionRate(users);

    return {
      totalInstalls: users.length,
      platformBreakdown,
      activeUsers,
      retentionRate
    };
  }

  private calculateRetentionRate(users: User[]): number {
    const activeUsers = users.filter(user => user.last_active).length;
    return (activeUsers / users.length) * 100;
  }

  public async prepareUpdate(
    version: string,
    buildNumber: string
  ): Promise<{
    success: boolean;
    changes: string[];
    requirements: string[];
  }> {
    const changes = [
      'Update app version',
      'Update build number',
      'Prepare release notes',
      'Update app store listing',
      'Update web app listing'
    ];

    const requirements = [
      'Test on all supported devices',
      'Verify in-app purchases',
      'Check app store compliance',
      'Validate web app functionality',
      'Update documentation'
    ];

    return {
      success: true,
      changes,
      requirements
    };
  }
} 