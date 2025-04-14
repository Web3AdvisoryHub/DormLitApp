import { DatabaseService } from './database';
import { CacheService } from './cache';
import { AnalyticsService } from './analytics';
import { Server } from 'socket.io';

export class EventsService {
  private static instance: EventsService;
  private db: DatabaseService;
  private cache: CacheService;
  private analytics: AnalyticsService;
  private io: Server | null = null;

  private constructor() {
    this.db = DatabaseService.getInstance();
    this.cache = CacheService.getInstance();
    this.analytics = AnalyticsService.getInstance();
  }

  public static getInstance(): EventsService {
    if (!EventsService.instance) {
      EventsService.instance = new EventsService();
    }
    return EventsService.instance;
  }

  public initializeSocket(io: Server): void {
    this.io = io;
    this.setupSocketHandlers();
  }

  private setupSocketHandlers(): void {
    if (!this.io) return;

    this.io.on('connection', (socket) => {
      // Handle user joining a room
      socket.on('join_room', async (data: { roomId: string; userId: string }) => {
        socket.join(data.roomId);
        await this.handleUserJoin(data.roomId, data.userId);
      });

      // Handle user leaving a room
      socket.on('leave_room', async (data: { roomId: string; userId: string }) => {
        socket.leave(data.roomId);
        await this.handleUserLeave(data.roomId, data.userId);
      });

      // Handle room interactions
      socket.on('room_interaction', async (data: {
        roomId: string;
        userId: string;
        type: string;
        details: any;
      }) => {
        await this.handleRoomInteraction(data);
      });

      // Handle coin transactions
      socket.on('coin_transaction', async (data: {
        roomId: string;
        userId: string;
        amount: number;
        type: 'earn' | 'spend';
        source: string;
      }) => {
        await this.handleCoinTransaction(data);
      });

      // Handle mood updates
      socket.on('mood_update', async (data: {
        roomId: string;
        userId: string;
        mood: string;
        intensity: number;
      }) => {
        await this.handleMoodUpdate(data);
      });
    });
  }

  // Event Handlers
  private async handleUserJoin(roomId: string, userId: string): Promise<void> {
    // Record the join event
    await this.db.recordVisitorJoin(roomId, userId);
    
    // Broadcast to room
    this.io?.to(roomId).emit('user_joined', {
      userId,
      timestamp: new Date(),
      roomId
    });

    // Update analytics
    await this.analytics.trackUserSession(userId, {
      startTime: new Date(),
      endTime: new Date(),
      platform: 'web', // This should be determined from the client
      interactions: 0,
      roomsVisited: [roomId],
      coinsEarned: 0,
      coinsSpent: 0
    });
  }

  private async handleUserLeave(roomId: string, userId: string): Promise<void> {
    // Record the leave event
    await this.db.recordVisitorLeave(userId);
    
    // Broadcast to room
    this.io?.to(roomId).emit('user_left', {
      userId,
      timestamp: new Date(),
      roomId
    });
  }

  private async handleRoomInteraction(data: {
    roomId: string;
    userId: string;
    type: string;
    details: any;
  }): Promise<void> {
    // Record the interaction
    await this.db.recordRoomInteraction({
      room_id: data.roomId,
      user_id: data.userId,
      type: data.type,
      details: data.details,
      timestamp: new Date()
    });

    // Broadcast to room
    this.io?.to(data.roomId).emit('room_interaction', {
      userId: data.userId,
      type: data.type,
      details: data.details,
      timestamp: new Date()
    });
  }

  private async handleCoinTransaction(data: {
    roomId: string;
    userId: string;
    amount: number;
    type: 'earn' | 'spend';
    source: string;
  }): Promise<void> {
    // Process the transaction
    const transaction = await this.db.createCoinTransaction({
      room_id: data.roomId,
      user_id: data.userId,
      amount: data.amount,
      type: data.type,
      source: data.source,
      timestamp: new Date()
    });

    // Broadcast to room
    this.io?.to(data.roomId).emit('coin_transaction', {
      userId: data.userId,
      amount: data.amount,
      type: data.type,
      source: data.source,
      timestamp: new Date()
    });

    // Update user's balance
    await this.db.updateUserBalance(data.userId, data.type === 'earn' ? data.amount : -data.amount);
  }

  private async handleMoodUpdate(data: {
    roomId: string;
    userId: string;
    mood: string;
    intensity: number;
  }): Promise<void> {
    // Record the mood update
    await this.db.recordMood(data.roomId, data.userId, data.mood, data.intensity);

    // Broadcast to room
    this.io?.to(data.roomId).emit('mood_update', {
      userId: data.userId,
      mood: data.mood,
      intensity: data.intensity,
      timestamp: new Date()
    });

    // Award coins for mood logging
    const rewardCoins = Math.floor(data.intensity * 5);
    await this.handleCoinTransaction({
      roomId: data.roomId,
      userId: data.userId,
      amount: rewardCoins,
      type: 'earn',
      source: 'mood_logging'
    });
  }

  // Public Methods
  public async broadcastToRoom(roomId: string, event: string, data: any): Promise<void> {
    this.io?.to(roomId).emit(event, {
      ...data,
      timestamp: new Date()
    });
  }

  public async notifyUser(userId: string, event: string, data: any): Promise<void> {
    this.io?.to(`user_${userId}`).emit(event, {
      ...data,
      timestamp: new Date()
    });
  }

  public async broadcastToAll(event: string, data: any): Promise<void> {
    this.io?.emit(event, {
      ...data,
      timestamp: new Date()
    });
  }
} 