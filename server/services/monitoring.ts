import { DatabaseService } from './database';
import { CacheService } from './cache';
import { SecurityService } from './security';

export class MonitoringService {
  private static instance: MonitoringService;
  private db: DatabaseService;
  private cache: CacheService;
  private security: SecurityService;

  // Performance thresholds
  private readonly THRESHOLDS = {
    RESPONSE_TIME: 1000, // 1 second
    ERROR_RATE: 0.05, // 5%
    CACHE_HIT_RATE: 0.8, // 80%
    MEMORY_USAGE: 0.8, // 80%
    CPU_USAGE: 0.8 // 80%
  };

  private constructor() {
    this.db = DatabaseService.getInstance();
    this.cache = CacheService.getInstance();
    this.security = SecurityService.getInstance();
  }

  public static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  // Track API performance
  public async trackApiPerformance(
    endpoint: string,
    method: string,
    duration: number,
    statusCode: number
  ): Promise<void> {
    const metrics = {
      endpoint,
      method,
      duration,
      status_code: statusCode,
      timestamp: new Date()
    };

    await this.db.trackApiPerformance(metrics);

    // Alert if response time exceeds threshold
    if (duration > this.THRESHOLDS.RESPONSE_TIME) {
      await this.alertPerformanceIssue('high_response_time', {
        endpoint,
        duration,
        threshold: this.THRESHOLDS.RESPONSE_TIME
      });
    }
  }

  // Track error
  public async trackError(
    error: Error,
    context: Record<string, unknown>
  ): Promise<void> {
    const errorData = {
      message: error.message,
      stack: error.stack,
      context: JSON.stringify(context),
      timestamp: new Date()
    };

    await this.db.trackError(errorData);
    await this.checkErrorRate();
  }

  // Track cache performance
  public async trackCachePerformance(
    operation: 'hit' | 'miss',
    key: string
  ): Promise<void> {
    const metrics = {
      operation,
      key,
      timestamp: new Date()
    };

    await this.db.trackCachePerformance(metrics);
    await this.checkCacheHitRate();
  }

  // Track resource usage
  public async trackResourceUsage(
    type: 'memory' | 'cpu',
    usage: number
  ): Promise<void> {
    const metrics = {
      type,
      usage,
      timestamp: new Date()
    };

    await this.db.trackResourceUsage(metrics);

    // Alert if usage exceeds threshold
    if (usage > this.THRESHOLDS[`${type.toUpperCase()}_USAGE`]) {
      await this.alertPerformanceIssue(`high_${type}_usage`, {
        usage,
        threshold: this.THRESHOLDS[`${type.toUpperCase()}_USAGE`]
      });
    }
  }

  // Check error rate
  private async checkErrorRate(): Promise<void> {
    const recentErrors = await this.db.getRecentErrors(100);
    const errorRate = recentErrors.length / 100;

    if (errorRate > this.THRESHOLDS.ERROR_RATE) {
      await this.alertPerformanceIssue('high_error_rate', {
        errorRate,
        threshold: this.THRESHOLDS.ERROR_RATE
      });
    }
  }

  // Check cache hit rate
  private async checkCacheHitRate(): Promise<void> {
    const recentCacheOps = await this.db.getRecentCacheOperations(100);
    const hits = recentCacheOps.filter(op => op.operation === 'hit').length;
    const hitRate = hits / 100;

    if (hitRate < this.THRESHOLDS.CACHE_HIT_RATE) {
      await this.alertPerformanceIssue('low_cache_hit_rate', {
        hitRate,
        threshold: this.THRESHOLDS.CACHE_HIT_RATE
      });
    }
  }

  // Alert performance issues
  private async alertPerformanceIssue(
    type: string,
    details: Record<string, unknown>
  ): Promise<void> {
    await this.db.createAlert({
      type,
      details: JSON.stringify(details),
      severity: 'warning',
      status: 'active',
      timestamp: new Date()
    });
  }

  // Get performance metrics
  public async getPerformanceMetrics(
    startTime: Date,
    endTime: Date
  ): Promise<{
    responseTime: number;
    errorRate: number;
    cacheHitRate: number;
    memoryUsage: number;
    cpuUsage: number;
  }> {
    const [
      responseTime,
      errorRate,
      cacheHitRate,
      memoryUsage,
      cpuUsage
    ] = await Promise.all([
      this.db.getAverageResponseTime(startTime, endTime),
      this.db.getErrorRate(startTime, endTime),
      this.db.getCacheHitRate(startTime, endTime),
      this.db.getAverageMemoryUsage(startTime, endTime),
      this.db.getAverageCpuUsage(startTime, endTime)
    ]);

    return {
      responseTime,
      errorRate,
      cacheHitRate,
      memoryUsage,
      cpuUsage
    };
  }

  // Get active alerts
  public async getActiveAlerts(): Promise<Array<{
    type: string;
    details: string;
    severity: string;
    timestamp: Date;
  }>> {
    return await this.db.getActiveAlerts();
  }

  // Get error trends
  public async getErrorTrends(
    startTime: Date,
    endTime: Date
  ): Promise<Array<{
    timestamp: Date;
    count: number;
    type: string;
  }>> {
    return await this.db.getErrorTrends(startTime, endTime);
  }
} 