import { DatabaseService } from './database';
import { CacheService } from './cache';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { sanitizeHtml } from 'sanitize-html';
import { z } from 'zod';

export class SecurityService {
  private static instance: SecurityService;
  private db: DatabaseService;
  private cache: CacheService;
  private rateLimiter: RateLimiterMemory;

  // Rate limiting rules
  private readonly RATE_LIMITS = {
    AUTH: {
      points: 5, // 5 attempts
      duration: 60, // per minute
    },
    API: {
      points: 100, // 100 requests
      duration: 60, // per minute
    },
    INTERACTION: {
      points: 30, // 30 interactions
      duration: 60, // per minute
    }
  };

  private constructor() {
    this.db = DatabaseService.getInstance();
    this.cache = CacheService.getInstance();
    this.rateLimiter = new RateLimiterMemory({
      points: this.RATE_LIMITS.API.points,
      duration: this.RATE_LIMITS.API.duration
    });
  }

  public static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  // Rate limiting
  public async checkRateLimit(key: string, type: 'auth' | 'api' | 'interaction'): Promise<boolean> {
    try {
      const limit = this.RATE_LIMITS[type.toUpperCase()];
      await this.rateLimiter.consume(key, limit.points);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Input validation
  public validateInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
    return schema.parse(data);
  }

  // Sanitize HTML
  public sanitizeHtml(html: string): string {
    return sanitizeHtml(html, {
      allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
      allowedAttributes: {
        'a': ['href', 'target']
      }
    });
  }

  // Session management
  public async createSession(userId: string): Promise<string> {
    const sessionId = crypto.randomUUID();
    await this.cache.set(`session:${sessionId}`, userId, 3600); // 1 hour
    return sessionId;
  }

  public async validateSession(sessionId: string): Promise<string | null> {
    return await this.cache.get(`session:${sessionId}`);
  }

  public async invalidateSession(sessionId: string): Promise<void> {
    await this.cache.del(`session:${sessionId}`);
  }

  // CSRF protection
  public generateCsrfToken(): string {
    return crypto.randomUUID();
  }

  public async validateCsrfToken(token: string, sessionId: string): Promise<boolean> {
    const storedToken = await this.cache.get(`csrf:${sessionId}`);
    return token === storedToken;
  }

  // Password hashing
  public async hashPassword(password: string): Promise<string> {
    const salt = await crypto.randomBytes(16);
    const hash = await crypto.pbkdf2(password, salt, 1000, 64, 'sha512');
    return `${salt.toString('hex')}:${hash.toString('hex')}`;
  }

  public async verifyPassword(password: string, hash: string): Promise<boolean> {
    const [salt, storedHash] = hash.split(':');
    const computedHash = await crypto.pbkdf2(password, Buffer.from(salt, 'hex'), 1000, 64, 'sha512');
    return computedHash.toString('hex') === storedHash;
  }

  // Access control
  public async checkAccess(userId: string, resourceId: string, action: string): Promise<boolean> {
    const user = await this.cache.getUser(userId);
    if (!user) return false;

    // Check if user is owner
    const isOwner = await this.db.checkResourceOwnership(userId, resourceId);
    if (isOwner) return true;

    // Check permissions
    const permissions = await this.db.getUserPermissions(userId);
    return permissions.includes(action);
  }

  // Audit logging
  public async logSecurityEvent(
    userId: string,
    eventType: string,
    details: Record<string, unknown>
  ): Promise<void> {
    await this.db.logSecurityEvent({
      user_id: userId,
      event_type: eventType,
      details: JSON.stringify(details),
      timestamp: new Date()
    });
  }

  // Input validation schemas
  public readonly schemas = {
    user: z.object({
      username: z.string().min(3).max(50),
      email: z.string().email(),
      password: z.string().min(8),
      role: z.enum(['user', 'creator', 'admin'])
    }),
    room: z.object({
      name: z.string().min(3).max(100),
      description: z.string().max(500),
      is_public: z.boolean(),
      max_occupancy: z.number().min(1).max(100)
    }),
    avatar: z.object({
      name: z.string().min(3).max(50),
      mood: z.enum(['happy', 'sad', 'angry', 'excited', 'relaxed', 'creative']),
      position: z.object({
        x: z.number(),
        y: z.number()
      })
    })
  };
} 