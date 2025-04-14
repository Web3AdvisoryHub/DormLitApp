import NodeCache from 'node-cache';
import { DatabaseService } from './database';

export class CacheService {
  private static instance: CacheService;
  private cache: NodeCache;
  private db: DatabaseService;

  // Cache TTLs in seconds
  private readonly TTL = {
    AVATAR: 300, // 5 minutes
    ROOM: 300,
    USER: 300,
    SOUND: 3600, // 1 hour
    EMOJI: 3600,
    SETTINGS: 3600,
    ANALYTICS: 60 // 1 minute
  };

  private constructor() {
    this.cache = new NodeCache({
      stdTTL: 300, // Default TTL: 5 minutes
      checkperiod: 120, // Check for expired items every 2 minutes
      useClones: false // Store references to objects
    });
    this.db = DatabaseService.getInstance();
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  // Avatar caching
  public async getAvatar(avatarId: string) {
    const cacheKey = `avatar:${avatarId}`;
    let avatar = this.cache.get(cacheKey);
    
    if (!avatar) {
      avatar = await this.db.getAvatar(avatarId);
      if (avatar) {
        this.cache.set(cacheKey, avatar, this.TTL.AVATAR);
      }
    }
    
    return avatar;
  }

  public invalidateAvatar(avatarId: string) {
    this.cache.del(`avatar:${avatarId}`);
  }

  // Room caching
  public async getRoom(roomId: string) {
    const cacheKey = `room:${roomId}`;
    let room = this.cache.get(cacheKey);
    
    if (!room) {
      room = await this.db.getRoom(roomId);
      if (room) {
        this.cache.set(cacheKey, room, this.TTL.ROOM);
      }
    }
    
    return room;
  }

  public invalidateRoom(roomId: string) {
    this.cache.del(`room:${roomId}`);
  }

  // User caching
  public async getUser(userId: string) {
    const cacheKey = `user:${userId}`;
    let user = this.cache.get(cacheKey);
    
    if (!user) {
      user = await this.db.getUser(userId);
      if (user) {
        this.cache.set(cacheKey, user, this.TTL.USER);
      }
    }
    
    return user;
  }

  public invalidateUser(userId: string) {
    this.cache.del(`user:${userId}`);
  }

  // Sound caching
  public async getSound(soundId: string) {
    const cacheKey = `sound:${soundId}`;
    let sound = this.cache.get(cacheKey);
    
    if (!sound) {
      sound = await this.db.getSound(soundId);
      if (sound) {
        this.cache.set(cacheKey, sound, this.TTL.SOUND);
      }
    }
    
    return sound;
  }

  public invalidateSound(soundId: string) {
    this.cache.del(`sound:${soundId}`);
  }

  // Emoji caching
  public async getEmoji(emojiId: string) {
    const cacheKey = `emoji:${emojiId}`;
    let emoji = this.cache.get(cacheKey);
    
    if (!emoji) {
      emoji = await this.db.getEmoji(emojiId);
      if (emoji) {
        this.cache.set(cacheKey, emoji, this.TTL.EMOJI);
      }
    }
    
    return emoji;
  }

  public invalidateEmoji(emojiId: string) {
    this.cache.del(`emoji:${emojiId}`);
  }

  // Settings caching
  public async getUserSettings(userId: string) {
    const cacheKey = `settings:${userId}`;
    let settings = this.cache.get(cacheKey);
    
    if (!settings) {
      settings = await this.db.getUserSettings(userId);
      if (settings) {
        this.cache.set(cacheKey, settings, this.TTL.SETTINGS);
      }
    }
    
    return settings;
  }

  public invalidateUserSettings(userId: string) {
    this.cache.del(`settings:${userId}`);
  }

  // Analytics caching
  public async getRoomAnalytics(roomId: string) {
    const cacheKey = `analytics:${roomId}`;
    let analytics = this.cache.get(cacheKey);
    
    if (!analytics) {
      analytics = await this.db.getRoomAnalytics(roomId);
      if (analytics) {
        this.cache.set(cacheKey, analytics, this.TTL.ANALYTICS);
      }
    }
    
    return analytics;
  }

  public invalidateRoomAnalytics(roomId: string) {
    this.cache.del(`analytics:${roomId}`);
  }

  // Clear all cache
  public clearAll() {
    this.cache.flushAll();
  }

  // Get cache stats
  public getStats() {
    return this.cache.getStats();
  }
} 