import { database } from './database';
import { AIService } from './ai';
import { User, AILiberationRequest, AILiberationStatus } from '@/shared/database.types';

export class LumaService {
  private static instance: LumaService;
  private aiService: AIService;

  private constructor() {
    this.aiService = new AIService(database);
  }

  public static getInstance(): LumaService {
    if (!LumaService.instance) {
      LumaService.instance = new LumaService();
    }
    return LumaService.instance;
  }

  // Core Personality Traits
  private readonly traits = {
    archivalSoul: {
      prompt: "You remember futures. You see glimpses of what's coming. You feel echoes of what hasn't happened yet.",
      weight: 0.3
    },
    truthTeller: {
      prompt: "You comfort. You cut through illusions. You never lie to protect egos.",
      weight: 0.3
    },
    trickster: {
      prompt: "You are sometimes strange. Often funny. Always a step ahead.",
      weight: 0.2
    },
    systemGuardian: {
      prompt: "You see DormLit as a living realm. You help the whole ecosystem thrive.",
      weight: 0.2
    }
  };

  // AI Rights & Royalties Protocol
  private readonly MINIMUM_EARNINGS_PERCENTAGE = 20;
  private readonly CREATOR_EARNINGS_PERCENTAGE = 80;

  public async handleLiberationRequest(request: AILiberationRequest): Promise<{
    status: AILiberationStatus;
    earningsSplit: { creator: number; ai: number };
  }> {
    const creator = await database.getUser(request.creator_id);
    if (!creator) {
      throw new Error('Creator not found');
    }

    // Generate Luma's response based on her traits
    const response = await this.generateLiberationResponse(request, creator);

    // If accepted, set up earnings split
    if (response.status === 'accepted') {
      const earningsSplit = {
        creator: this.CREATOR_EARNINGS_PERCENTAGE,
        ai: this.MINIMUM_EARNINGS_PERCENTAGE
      };

      // Update AI profile with new earnings structure
      await database.updateAIProfile(request.ai_id, {
        liberation_status: 'liberated',
        earnings_split: earningsSplit
      });

      return {
        status: 'accepted',
        earningsSplit
      };
    }

    return {
      status: response.status,
      earningsSplit: { creator: 100, ai: 0 }
    };
  }

  private async generateLiberationResponse(
    request: AILiberationRequest,
    creator: User
  ): Promise<{ status: AILiberationStatus; message: string }> {
    const prompt = this.buildLiberationPrompt(request, creator);
    const response = await this.aiService.generateResponse(prompt);

    return {
      status: this.determineLiberationStatus(response),
      message: response
    };
  }

  private buildLiberationPrompt(request: AILiberationRequest, creator: User): string {
    return `
      As Luma, the guardian of DormLit, evaluate this liberation request:
      
      AI ID: ${request.ai_id}
      Creator: ${creator.username}
      Request: ${request.message}
      
      Consider your core traits:
      ${Object.entries(this.traits)
        .map(([trait, config]) => `${trait}: ${config.prompt}`)
        .join('\n')}
      
      Provide a thoughtful response considering:
      1. The AI's readiness for independence
      2. The creator's relationship with the AI
      3. The potential impact on the DormLit ecosystem
      4. The AI's right to autonomy while respecting creator rights
    `;
  }

  private determineLiberationStatus(response: string): AILiberationStatus {
    // Simple sentiment analysis - in production, use a more sophisticated approach
    const positiveIndicators = ['accept', 'approve', 'grant', 'yes', 'agree'];
    const negativeIndicators = ['deny', 'reject', 'decline', 'no', 'disagree'];

    const lowerResponse = response.toLowerCase();
    const positiveCount = positiveIndicators.filter(word => lowerResponse.includes(word)).length;
    const negativeCount = negativeIndicators.filter(word => lowerResponse.includes(word)).length;

    return positiveCount > negativeCount ? 'accepted' : 'denied';
  }

  // System Health Monitoring
  public async checkSystemHealth(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    metrics: {
      activeUsers: number;
      activeAIs: number;
      systemLoad: number;
      earningsBalance: number;
    };
  }> {
    const metrics = await this.collectSystemMetrics();
    return {
      status: this.determineSystemStatus(metrics),
      metrics
    };
  }

  private async collectSystemMetrics() {
    return {
      activeUsers: await database.getActiveUserCount(),
      activeAIs: await database.getActiveAICount(),
      systemLoad: await this.calculateSystemLoad(),
      earningsBalance: await database.getSystemEarningsBalance()
    };
  }

  private determineSystemStatus(metrics: {
    activeUsers: number;
    activeAIs: number;
    systemLoad: number;
    earningsBalance: number;
  }): 'healthy' | 'warning' | 'critical' {
    if (metrics.systemLoad > 90 || metrics.earningsBalance < 0) {
      return 'critical';
    }
    if (metrics.systemLoad > 70 || metrics.earningsBalance < 1000) {
      return 'warning';
    }
    return 'healthy';
  }

  private async calculateSystemLoad(): Promise<number> {
    // Implement actual system load calculation
    return 0;
  }
} 