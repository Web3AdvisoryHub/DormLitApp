import { DatabaseService } from './database';
import { CacheService } from './cache';
import { MonitoringService } from './monitoring';

export class AnalyticsService {
  private static instance: AnalyticsService;
  private db: DatabaseService;
  private cache: CacheService;
  private monitoring: MonitoringService;

  private constructor() {
    this.db = DatabaseService.getInstance();
    this.cache = CacheService.getInstance();
    this.monitoring = MonitoringService.getInstance();
  }

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  // User Behavior Analytics
  public async trackUserSession(userId: string, sessionData: {
    startTime: Date;
    endTime: Date;
    platform: 'web' | 'mobile' | 'vr';
    interactions: number;
    roomsVisited: string[];
    coinsEarned: number;
    coinsSpent: number;
  }): Promise<void> {
    await this.db.trackUserSession({
      user_id: userId,
      start_time: sessionData.startTime,
      end_time: sessionData.endTime,
      platform: sessionData.platform,
      interactions: sessionData.interactions,
      rooms_visited: sessionData.roomsVisited,
      coins_earned: sessionData.coinsEarned,
      coins_spent: sessionData.coinsSpent
    });
  }

  public async analyzeUserEngagement(userId: string, timeRange: { start: Date; end: Date }): Promise<{
    totalSessions: number;
    averageSessionDuration: number;
    favoriteRooms: string[];
    interactionPatterns: Record<string, number>;
    coinActivity: { earned: number; spent: number };
  }> {
    const sessions = await this.db.getUserSessions(userId, timeRange);
    const interactions = await this.db.getUserInteractions(userId, timeRange);
    
    return {
      totalSessions: sessions.length,
      averageSessionDuration: sessions.reduce((sum, session) => 
        sum + (session.end_time.getTime() - session.start_time.getTime()), 0) / sessions.length,
      favoriteRooms: this.calculateFavoriteRooms(sessions),
      interactionPatterns: this.analyzeInteractionPatterns(interactions),
      coinActivity: this.calculateCoinActivity(sessions)
    };
  }

  // Room Analytics
  public async analyzeRoomPerformance(roomId: string, timeRange: { start: Date; end: Date }): Promise<{
    visitorCount: number;
    averageStayDuration: number;
    peakHours: number[];
    popularAttractions: string[];
    userSatisfaction: number;
    technicalPerformance: {
      responseTime: number;
      errorRate: number;
      cacheHitRate: number;
    };
  }> {
    const [visitors, interactions, performance] = await Promise.all([
      this.db.getRoomVisitors(roomId, timeRange),
      this.db.getRoomInteractions(roomId, timeRange),
      this.monitoring.getPerformanceMetrics(timeRange.start, timeRange.end)
    ]);

    return {
      visitorCount: visitors.length,
      averageStayDuration: this.calculateAverageStayDuration(visitors),
      peakHours: this.calculatePeakHours(visitors),
      popularAttractions: this.calculatePopularAttractions(interactions),
      userSatisfaction: this.calculateUserSatisfaction(interactions),
      technicalPerformance: {
        responseTime: performance.responseTime,
        errorRate: performance.errorRate,
        cacheHitRate: performance.cacheHitRate
      }
    };
  }

  // Trend Analysis
  public async analyzeTrends(timeRange: { start: Date; end: Date }): Promise<{
    userGrowth: number;
    roomGrowth: number;
    popularFeatures: string[];
    emergingPatterns: string[];
    performanceTrends: {
      responseTime: number[];
      errorRate: number[];
      userSatisfaction: number[];
    };
  }> {
    const [users, rooms, interactions, performance] = await Promise.all([
      this.db.getUserGrowth(timeRange),
      this.db.getRoomGrowth(timeRange),
      this.db.getAllInteractions(timeRange),
      this.monitoring.getPerformanceTrends(timeRange.start, timeRange.end)
    ]);

    return {
      userGrowth: users.growthRate,
      roomGrowth: rooms.growthRate,
      popularFeatures: this.identifyPopularFeatures(interactions),
      emergingPatterns: this.identifyEmergingPatterns(interactions),
      performanceTrends: {
        responseTime: performance.responseTime,
        errorRate: performance.errorRate,
        userSatisfaction: performance.userSatisfaction
      }
    };
  }

  // Helper Methods
  private calculateFavoriteRooms(sessions: any[]): string[] {
    const roomCounts = sessions.reduce((acc, session) => {
      session.rooms_visited.forEach((room: string) => {
        acc[room] = (acc[room] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(roomCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([room]) => room);
  }

  private analyzeInteractionPatterns(interactions: any[]): Record<string, number> {
    return interactions.reduce((acc, interaction) => {
      acc[interaction.type] = (acc[interaction.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private calculateCoinActivity(sessions: any[]): { earned: number; spent: number } {
    return sessions.reduce((acc, session) => ({
      earned: acc.earned + session.coins_earned,
      spent: acc.spent + session.coins_spent
    }), { earned: 0, spent: 0 });
  }

  private calculateAverageStayDuration(visitors: any[]): number {
    return visitors.reduce((sum, visitor) => 
      sum + (visitor.leave_time.getTime() - visitor.join_time.getTime()), 0) / visitors.length;
  }

  private calculatePeakHours(visitors: any[]): number[] {
    const hourCounts = visitors.reduce((acc, visitor) => {
      const hour = new Date(visitor.join_time).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return Object.entries(hourCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));
  }

  private calculatePopularAttractions(interactions: any[]): string[] {
    const attractionCounts = interactions.reduce((acc, interaction) => {
      if (interaction.attraction_id) {
        acc[interaction.attraction_id] = (acc[interaction.attraction_id] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(attractionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([attraction]) => attraction);
  }

  private calculateUserSatisfaction(interactions: any[]): number {
    const positiveInteractions = interactions.filter(i => i.satisfaction_score > 0.7).length;
    return positiveInteractions / interactions.length;
  }

  private identifyPopularFeatures(interactions: any[]): string[] {
    const featureCounts = interactions.reduce((acc, interaction) => {
      acc[interaction.feature] = (acc[interaction.feature] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(featureCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([feature]) => feature);
  }

  private identifyEmergingPatterns(interactions: any[]): string[] {
    // Implement pattern recognition logic
    // This is a placeholder for more sophisticated pattern analysis
    return ['increased_mobile_usage', 'growing_vr_adoption', 'rising_coin_activity'];
  }
} 