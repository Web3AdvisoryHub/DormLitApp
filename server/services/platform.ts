import { database } from './database';
import { User, Room, Avatar } from '@/shared/database.types';

export class PlatformService {
  private static instance: PlatformService;
  private readonly MOBILE_CONFIG = {
    minWidth: 320,
    maxWidth: 768,
    touchControls: true,
    gyroSupport: true,
    gestureSupport: true
  };

  private readonly VR_CONFIG = {
    minFPS: 90,
    maxLatency: 20,
    handTracking: true,
    roomScale: true,
    comfortSettings: {
      vignette: true,
      snapTurn: true,
      teleport: true
    }
  };

  private constructor() {}

  public static getInstance(): PlatformService {
    if (!PlatformService.instance) {
      PlatformService.instance = new PlatformService();
    }
    return PlatformService.instance;
  }

  public async detectPlatform(userId: string): Promise<{
    platform: 'web' | 'mobile' | 'vr';
    capabilities: {
      touch: boolean;
      gyro: boolean;
      vr: boolean;
      handTracking: boolean;
    };
  }> {
    const user = await database.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get user agent and device info
    const userAgent = user.user_agent || '';
    const isMobile = this.isMobile(userAgent);
    const isVR = this.isVR(userAgent);

    return {
      platform: isVR ? 'vr' : isMobile ? 'mobile' : 'web',
      capabilities: {
        touch: isMobile,
        gyro: this.hasGyro(userAgent),
        vr: isVR,
        handTracking: isVR && this.VR_CONFIG.handTracking
      }
    };
  }

  private isMobile(userAgent: string): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  }

  private isVR(userAgent: string): boolean {
    return /Oculus|HTC|Valve|WindowsMR/i.test(userAgent);
  }

  private hasGyro(userAgent: string): boolean {
    return /iPhone|iPad|iPod/i.test(userAgent);
  }

  public async optimizeForPlatform(
    userId: string,
    roomId: string
  ): Promise<{
    success: boolean;
    optimizations: {
      controls: string[];
      performance: string[];
      accessibility: string[];
    };
  }> {
    const { platform, capabilities } = await this.detectPlatform(userId);
    const room = await database.getRoom(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    const optimizations = {
      controls: this.getControlOptimizations(platform, capabilities),
      performance: this.getPerformanceOptimizations(platform),
      accessibility: this.getAccessibilityOptimizations(platform)
    };

    return {
      success: true,
      optimizations
    };
  }

  private getControlOptimizations(
    platform: 'web' | 'mobile' | 'vr',
    capabilities: {
      touch: boolean;
      gyro: boolean;
      vr: boolean;
      handTracking: boolean;
    }
  ): string[] {
    const optimizations: string[] = [];

    if (platform === 'mobile') {
      if (capabilities.touch) {
        optimizations.push('touch_controls');
      }
      if (capabilities.gyro) {
        optimizations.push('gyro_controls');
      }
    }

    if (platform === 'vr') {
      optimizations.push('vr_controls');
      if (capabilities.handTracking) {
        optimizations.push('hand_tracking');
      }
    }

    return optimizations;
  }

  private getPerformanceOptimizations(platform: 'web' | 'mobile' | 'vr'): string[] {
    const optimizations: string[] = [];

    if (platform === 'mobile') {
      optimizations.push('reduced_particles');
      optimizations.push('lower_poly_models');
      optimizations.push('optimized_textures');
    }

    if (platform === 'vr') {
      optimizations.push('vr_optimized_rendering');
      optimizations.push('asynchronous_time_warp');
      optimizations.push('dynamic_resolution');
    }

    return optimizations;
  }

  private getAccessibilityOptimizations(platform: 'web' | 'mobile' | 'vr'): string[] {
    const optimizations: string[] = [];

    if (platform === 'mobile') {
      optimizations.push('larger_touch_targets');
      optimizations.push('simplified_ui');
    }

    if (platform === 'vr') {
      optimizations.push('comfort_settings');
      optimizations.push('snap_turn');
      optimizations.push('teleport_movement');
    }

    return optimizations;
  }

  public async validatePlatformSupport(
    userId: string,
    roomId: string
  ): Promise<{
    supported: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const { platform, capabilities } = await this.detectPlatform(userId);
    const room = await database.getRoom(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    const issues: string[] = [];
    const recommendations: string[] = [];

    if (platform === 'mobile') {
      if (!capabilities.touch) {
        issues.push('Touch controls not supported');
        recommendations.push('Consider using a device with touch support');
      }

      if (room.complexity > 3 && !capabilities.gyro) {
        issues.push('High complexity room may not perform well on this device');
        recommendations.push('Consider using a device with better performance');
      }
    }

    if (platform === 'vr') {
      if (!capabilities.handTracking) {
        issues.push('Hand tracking not supported');
        recommendations.push('Consider using a VR device with hand tracking');
      }

      if (room.complexity > 4) {
        issues.push('Room may be too complex for VR');
        recommendations.push('Consider reducing room complexity for VR');
      }
    }

    return {
      supported: issues.length === 0,
      issues,
      recommendations
    };
  }

  public async trackPlatformUsage(userId: string): Promise<void> {
    const { platform, capabilities } = await this.detectPlatform(userId);

    // Track platform usage in analytics
    console.log(
      `Tracking platform usage: user=${userId}, platform=${platform}, capabilities=${JSON.stringify(
        capabilities
      )}`
    );
  }
} 