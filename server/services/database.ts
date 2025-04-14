import { createClient } from '@supabase/supabase-js';
import { Database } from '@/shared/database.types';
import { IStorage } from '../storage';
import { RateLimiter } from 'limiter';

export class DatabaseService implements IStorage {
  private supabase;
  private cache: Map<string, { data: any; timestamp: number }>;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly rateLimiters: Map<string, RateLimiter>;
  private readonly queryCache: Map<string, { data: any; timestamp: number }>;
  private readonly QUERY_CACHE_TTL = 1 * 60 * 1000; // 1 minute

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
    
    this.supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    this.cache = new Map();
    this.queryCache = new Map();
    this.rateLimiters = new Map();
    
    // Initialize rate limiters for different operations
    this.initializeRateLimiters();
    
    // Start cache cleanup interval
    setInterval(() => this.cleanupCache(), this.CACHE_TTL);
    setInterval(() => this.cleanupQueryCache(), this.QUERY_CACHE_TTL);
  }

  private initializeRateLimiters() {
    // Rate limits per minute
    this.rateLimiters.set('user_read', new RateLimiter(100, 'minute'));
    this.rateLimiters.set('user_write', new RateLimiter(50, 'minute'));
    this.rateLimiters.set('calls', new RateLimiter(30, 'minute'));
    this.rateLimiters.set('texts', new RateLimiter(60, 'minute'));
    this.rateLimiters.set('notifications', new RateLimiter(100, 'minute'));
  }

  private async withRateLimit<T>(operation: string, fn: () => Promise<T>): Promise<T> {
    const limiter = this.rateLimiters.get(operation);
    if (!limiter) return fn();

    try {
      await limiter.removeTokens(1);
      return await fn();
    } catch (error) {
      throw new Error(`Rate limit exceeded for ${operation}`);
    }
  }

  private getQueryCacheKey(table: string, query: any): string {
    return `${table}_${JSON.stringify(query)}`;
  }

  private async withQueryCache<T>(
    table: string,
    query: any,
    fn: () => Promise<T>
  ): Promise<T> {
    const cacheKey = this.getQueryCacheKey(table, query);
    const cached = this.queryCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.QUERY_CACHE_TTL) {
      return cached.data;
    }

    const result = await fn();
    this.queryCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  }

  private async withTransaction<T>(operation: () => Promise<T>): Promise<T> {
    const { data, error } = await this.supabase.rpc('begin_transaction');
    if (error) throw error;

    try {
      const result = await operation();
      await this.supabase.rpc('commit_transaction');
      return result;
    } catch (error) {
      await this.supabase.rpc('rollback_transaction');
      throw error;
    }
  }

  private getCached<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: any) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private clearCache(pattern?: string) {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  // User Management
  async getUser(userId: string) {
    return this.withRateLimit('user_read', async () => {
      const cacheKey = `user_${userId}`;
      const cached = this.getCached(cacheKey);
      if (cached) return cached;

      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      this.setCache(cacheKey, data);
      return data;
    });
  }

  async updateUser(userId: string, updates: Partial<Database['public']['Tables']['profiles']['Update']>) {
    return this.withRateLimit('user_write', async () => {
      return this.withTransaction(async () => {
        const { data, error } = await this.supabase
          .from('profiles')
          .update(updates)
          .eq('id', userId)
          .select()
          .single();
        
        if (error) throw error;
        this.clearCache(`user_${userId}`);
        return data;
      });
    });
  }

  // Wallet Management
  async getWallet(userId: string) {
    const { data, error } = await this.supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateWallet(userId: string, updates: Partial<Database['public']['Tables']['wallets']['Update']>) {
    const { data, error } = await this.supabase
      .from('wallets')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Revenue Management
  async createRevenue(record: Database['public']['Tables']['revenue']['Insert']) {
    const { data, error } = await this.supabase
      .from('revenue')
      .insert(record)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getRevenue(userId: string) {
    const { data, error } = await this.supabase
      .from('revenue')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  // Call Management
  async createCall(record: Database['public']['Tables']['calls']['Insert']) {
    return this.withRateLimit('calls', async () => {
      return this.withTransaction(async () => {
        const { data, error } = await this.supabase
          .from('calls')
          .insert(record)
          .select()
          .single();
        
        if (error) throw error;

        // Update user balances
        if (record.caller_id) {
          await this.updateUserBalance(record.caller_id, -record.cost);
        }
        if (record.receiver_id) {
          await this.updateUserBalance(record.receiver_id, record.cost - record.platform_fee);
        }

        return data;
      });
    });
  }

  async endCall(callId: string) {
    const { data, error } = await this.supabase
      .from('calls')
      .update({ 
        status: 'completed',
        ended_at: new Date().toISOString()
      })
      .eq('id', callId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getActiveCalls() {
    return this.withQueryCache('calls', { status: 'active' }, async () => {
      const { data, error } = await this.supabase
        .from('calls')
        .select('*')
        .eq('status', 'active');
      
      if (error) throw error;
      return data;
    });
  }

  // Text Management
  async createText(record: Database['public']['Tables']['texts']['Insert']) {
    return this.withRateLimit('texts', async () => {
      return this.withTransaction(async () => {
        const { data, error } = await this.supabase
          .from('texts')
          .insert(record)
          .select()
          .single();
        
        if (error) throw error;

        // Update user balances
        if (record.sender_id) {
          await this.updateUserBalance(record.sender_id, -record.cost);
        }
        if (record.receiver_id) {
          await this.updateUserBalance(record.receiver_id, record.cost - record.platform_fee);
        }

        return data;
      });
    });
  }

  // Subscription Management
  async createSubscription(record: Database['public']['Tables']['subscriptions']['Insert']) {
    return this.withTransaction(async () => {
      const { data, error } = await this.supabase
        .from('subscriptions')
        .insert(record)
        .select()
        .single();
      
      if (error) throw error;

      // Update user profile
      await this.updateUser(record.user_id, {
        subscription_status: record.status,
        subscription_tier: record.plan_type as any
      });

      return data;
    });
  }

  async updateSubscription(subscriptionId: string, updates: Partial<Database['public']['Tables']['subscriptions']['Update']>) {
    const { data, error } = await this.supabase
      .from('subscriptions')
      .update(updates)
      .eq('id', subscriptionId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Room Management
  async createRoom(record: Database['public']['Tables']['rooms']['Insert']) {
    const { data, error } = await this.supabase
      .from('rooms')
      .insert(record)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getRoom(roomId: string) {
    const cacheKey = `room_${roomId}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    const { data, error } = await this.supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single();
    
    if (error) throw error;
    this.setCache(cacheKey, data);
    return data;
  }

  async updateRoom(roomId: string, updates: Partial<Database['public']['Tables']['rooms']['Update']>) {
    return this.withTransaction(async () => {
      const { data, error } = await this.supabase
        .from('rooms')
        .update(updates)
        .eq('id', roomId)
        .select()
        .single();
      
      if (error) throw error;
      this.clearCache(`room_${roomId}`);
      return data;
    });
  }

  // Notification Management
  async createNotification(record: Database['public']['Tables']['notifications']['Insert']) {
    return this.withRateLimit('notifications', async () => {
      const { data, error } = await this.supabase
        .from('notifications')
        .insert(record)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    });
  }

  async markNotificationsAsSeen(notificationIds: string[]) {
    return this.withTransaction(async () => {
      const { data, error } = await this.supabase
        .from('notifications')
        .update({ seen: true })
        .in('id', notificationIds)
        .select();
      
      if (error) throw error;
      return data;
    });
  }

  // Phone Line Methods
  async getPhoneLineCreators() {
    return this.withQueryCache('profiles', { role: ['creator', 'pro_creator'] }, async () => {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('role', 'creator')
        .or('role.eq.pro_creator');
      
      if (error) throw error;
      return data;
    });
  }

  async updateUserBalance(userId: string, amount: number) {
    return this.withTransaction(async () => {
      const { data, error } = await this.supabase.rpc('update_user_balance', {
        user_id: userId,
        amount: amount
      });
      
      if (error) throw error;
      this.clearCache(`user_${userId}`);
      return data;
    });
  }

  // Cleanup method for expired cache entries
  cleanupCache() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.CACHE_TTL) {
        this.cache.delete(key);
      }
    }
  }

  // Cache Management
  private cleanupQueryCache() {
    const now = Date.now();
    for (const [key, value] of this.queryCache.entries()) {
      if (now - value.timestamp > this.QUERY_CACHE_TTL) {
        this.queryCache.delete(key);
      }
    }
  }

  // Performance Monitoring
  private async logQueryPerformance(query: string, duration: number) {
    if (duration > 1000) { // Log slow queries (>1s)
      console.warn(`Slow query detected: ${query} (${duration}ms)`);
    }
  }

  // Enhanced Error Handling
  private async handleDatabaseError(error: any, context: string) {
    console.error(`Database error in ${context}:`, error);
    
    if (error.code === 'PGRST116') {
      throw new Error(`Resource not found in ${context}`);
    }
    if (error.code === '23505') {
      throw new Error(`Duplicate entry in ${context}`);
    }
    if (error.code === '23503') {
      throw new Error(`Foreign key constraint violation in ${context}`);
    }
    if (error.code === '42P01') {
      throw new Error(`Table does not exist: ${context}`);
    }
    
    throw error;
  }

  // Amusement Park Methods
  async getAmusementParkAssets(roomId: string): Promise<AmusementParkAsset[]> {
    return this.withQueryCache(
      `amusement_park_assets_${roomId}`,
      async () => {
        const { data, error } = await this.supabase
          .from('amusement_park_assets')
          .select('*')
          .eq('room_id', roomId);
        if (error) throw error;
        return data;
      }
    );
  }

  async createAmusementParkAsset(asset: Omit<AmusementParkAsset, 'id' | 'created_at' | 'updated_at'>): Promise<AmusementParkAsset> {
    return this.withTransaction(async () => {
      const { data, error } = await this.supabase
        .from('amusement_park_assets')
        .insert(asset)
        .select()
        .single();
      if (error) throw error;
      return data;
    });
  }

  async updateAmusementParkAsset(id: string, updates: Partial<AmusementParkAsset>): Promise<AmusementParkAsset> {
    return this.withTransaction(async () => {
      const { data, error } = await this.supabase
        .from('amusement_park_assets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    });
  }

  // Room Coin Methods
  async createRoomCoin(coin: Omit<RoomCoin, 'id' | 'created_at' | 'updated_at'>): Promise<RoomCoin> {
    return this.withTransaction(async () => {
      const { data, error } = await this.supabase
        .from('room_coins')
        .insert(coin)
        .select()
        .single();
      if (error) throw error;
      return data;
    });
  }

  async getRoomCoinBalance(roomId: string, userId: string): Promise<RoomCoinBalance> {
    return this.withQueryCache(
      `room_coin_balance_${roomId}_${userId}`,
      async () => {
        const { data, error } = await this.supabase
          .from('room_coin_balances')
          .select('*')
          .eq('room_id', roomId)
          .eq('user_id', userId)
          .single();
        if (error) throw error;
        return data;
      }
    );
  }

  async transferRoomCoins(
    roomId: string,
    fromUserId: string,
    toUserId: string,
    amount: number
  ): Promise<RoomCoinTransaction> {
    return this.withTransaction(async () => {
      const { data, error } = await this.supabase.rpc('transfer_room_coins', {
        p_room_id: roomId,
        p_from_user_id: fromUserId,
        p_to_user_id: toUserId,
        p_amount: amount
      });
      if (error) throw error;
      return data;
    });
  }

  // Onboarding Methods
  async getOnboardingSteps(): Promise<OnboardingStep[]> {
    return this.withQueryCache(
      'onboarding_steps',
      async () => {
        const { data, error } = await this.supabase
          .from('onboarding_steps')
          .select('*')
          .order('order_index');
        if (error) throw error;
        return data;
      }
    );
  }

  async getUserOnboardingProgress(userId: string): Promise<UserOnboardingProgress[]> {
    return this.withQueryCache(
      `user_onboarding_progress_${userId}`,
      async () => {
        const { data, error } = await this.supabase
          .from('user_onboarding_progress')
          .select('*')
          .eq('user_id', userId);
        if (error) throw error;
        return data;
      }
    );
  }

  async completeOnboardingStep(userId: string, stepId: string): Promise<UserOnboardingProgress> {
    return this.withTransaction(async () => {
      const { data, error } = await this.supabase
        .from('user_onboarding_progress')
        .upsert({
          user_id: userId,
          step_id: stepId,
          completed_at: new Date().toISOString()
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    });
  }

  // Visitor Recording Methods
  async recordVisitorJoin(roomId: string, userId: string): Promise<RoomVisitor> {
    return this.withTransaction(async () => {
      const { data, error } = await this.supabase
        .from('room_visitors')
        .insert({
          room_id: roomId,
          user_id: userId,
          join_time: new Date().toISOString(),
          last_interaction: new Date().toISOString(),
          total_playtime: 0
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    });
  }

  async updateVisitorPlaytime(visitorId: string, additionalPlaytime: number): Promise<RoomVisitor> {
    return this.withTransaction(async () => {
      const { data, error } = await this.supabase
        .from('room_visitors')
        .update({
          total_playtime: this.supabase.rpc('increment_playtime', { 
            p_visitor_id: visitorId,
            p_additional_playtime: additionalPlaytime 
          }),
          last_interaction: new Date().toISOString()
        })
        .eq('id', visitorId)
        .select()
        .single();
      if (error) throw error;
      return data;
    });
  }

  async recordVisitorLeave(visitorId: string): Promise<RoomVisitor> {
    return this.withTransaction(async () => {
      const { data, error } = await this.supabase
        .from('room_visitors')
        .update({
          leave_time: new Date().toISOString()
        })
        .eq('id', visitorId)
        .select()
        .single();
      if (error) throw error;
      return data;
    });
  }

  // Clip Management Methods
  async createRoomClip(clip: Omit<RoomClip, 'id' | 'created_at' | 'updated_at'>): Promise<RoomClip> {
    return this.withTransaction(async () => {
      const { data, error } = await this.supabase
        .from('room_clips')
        .insert(clip)
        .select()
        .single();
      if (error) throw error;
      return data;
    });
  }

  async saveRoomClip(
    roomId: string,
    userId: string,
    visitorId: string,
    title: string,
    description: string,
    startTime: string,
    endTime: string,
    videoUrl: string,
    thumbnailUrl: string
  ): Promise<RoomClip> {
    const duration = (new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000;
    
    return this.createRoomClip({
      room_id: roomId,
      user_id: userId,
      visitor_id: visitorId,
      title,
      description,
      start_time: startTime,
      end_time: endTime,
      duration,
      video_url: videoUrl,
      thumbnail_url: thumbnailUrl,
      is_minted: false
    });
  }

  async mintRoomClip(clipId: string, transactionHash: string): Promise<RoomClip> {
    return this.withTransaction(async () => {
      const { data, error } = await this.supabase
        .from('room_clips')
        .update({
          is_minted: true,
          minted_at: new Date().toISOString(),
          mint_transaction_hash: transactionHash
        })
        .eq('id', clipId)
        .select()
        .single();
      if (error) throw error;
      return data;
    });
  }

  async shareRoomClip(clipId: string, userId: string, platform: string, shareUrl: string): Promise<RoomClipShare> {
    return this.withTransaction(async () => {
      const { data, error } = await this.supabase
        .from('room_clip_shares')
        .insert({
          clip_id: clipId,
          user_id: userId,
          platform,
          share_url: shareUrl
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    });
  }

  async addToFanWall(clipId: string, userId: string, message: string): Promise<RoomClipFanWall> {
    return this.withTransaction(async () => {
      const { data, error } = await this.supabase
        .from('room_clip_fan_walls')
        .insert({
          clip_id: clipId,
          user_id: userId,
          message
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    });
  }

  async getVisitorClips(visitorId: string): Promise<RoomClip[]> {
    return this.withQueryCache(
      `visitor_clips_${visitorId}`,
      async () => {
        const { data, error } = await this.supabase
          .from('room_clips')
          .select('*')
          .eq('visitor_id', visitorId);
        if (error) throw error;
        return data;
      }
    );
  }

  async getRoomClips(roomId: string): Promise<RoomClip[]> {
    return this.withQueryCache(
      `room_clips_${roomId}`,
      async () => {
        const { data, error } = await this.supabase
          .from('room_clips')
          .select('*')
          .eq('room_id', roomId);
        if (error) throw error;
        return data;
      }
    );
  }

  // Amusement Park Ride Methods
  async createAmusementParkRide(ride: Omit<AmusementParkRide, 'id' | 'created_at' | 'updated_at'>): Promise<AmusementParkRide> {
    return this.withTransaction(async () => {
      const { data, error } = await this.supabase
        .from('amusement_park_rides')
        .insert(ride)
        .select()
        .single();
      if (error) throw error;
      return data;
    });
  }

  async updateRidePopularity(rideId: string, popularityChange: number): Promise<AmusementParkRide> {
    return this.withTransaction(async () => {
      const { data, error } = await this.supabase.rpc('update_ride_popularity', {
        p_ride_id: rideId,
        p_popularity_change: popularityChange
      });
      if (error) throw error;
      return data;
    });
  }

  async getRideVisitors(rideId: string): Promise<AmusementParkVisitor[]> {
    return this.withQueryCache(
      `ride_visitors_${rideId}`,
      async () => {
        const { data, error } = await this.supabase
          .from('amusement_park_visitors')
          .select('*')
          .eq('last_ride_id', rideId);
        if (error) throw error;
        return data;
      }
    );
  }

  // Visitor Interaction Methods
  async updateVisitorHappiness(visitorId: string, happinessChange: number): Promise<AmusementParkVisitor> {
    return this.withTransaction(async () => {
      const { data, error } = await this.supabase.rpc('update_visitor_happiness', {
        p_visitor_id: visitorId,
        p_happiness_change: happinessChange
      });
      if (error) throw error;
      return data;
    });
  }

  async purchaseRideTicket(visitorId: string, rideId: string, price: number): Promise<AmusementParkVisitor> {
    return this.withTransaction(async () => {
      const { data, error } = await this.supabase.rpc('purchase_ride_ticket', {
        p_visitor_id: visitorId,
        p_ride_id: rideId,
        p_price: price
      });
      if (error) throw error;
      return data;
    });
  }

  // Room Coin Methods
  async mintRoomCoins(roomId: string, amount: number): Promise<RoomCoin> {
    return this.withTransaction(async () => {
      const { data, error } = await this.supabase.rpc('mint_room_coins', {
        p_room_id: roomId,
        p_amount: amount
      });
      if (error) throw error;
      return data;
    });
  }

  async burnRoomCoins(roomId: string, amount: number): Promise<RoomCoin> {
    return this.withTransaction(async () => {
      const { data, error } = await this.supabase.rpc('burn_room_coins', {
        p_room_id: roomId,
        p_amount: amount
      });
      if (error) throw error;
      return data;
    });
  }

  async updateCoinPrice(roomId: string, newPrice: number): Promise<RoomCoin> {
    return this.withTransaction(async () => {
      const { data, error } = await this.supabase
        .from('room_coins')
        .update({ current_price: newPrice })
        .eq('room_id', roomId)
        .select()
        .single();
      if (error) throw error;
      return data;
    });
  }

  // Onboarding Rewards Methods
  async getOnboardingRewards(stepId: string): Promise<{ coins: number; items: string[] }> {
    return this.withQueryCache(
      `onboarding_rewards_${stepId}`,
      async () => {
        const { data, error } = await this.supabase
          .from('onboarding_rewards')
          .select('*')
          .eq('step_id', stepId)
          .single();
        if (error) throw error;
        return data;
      }
    );
  }

  async claimOnboardingReward(userId: string, stepId: string): Promise<{ coins: number; items: string[] }> {
    return this.withTransaction(async () => {
      const { data, error } = await this.supabase.rpc('claim_onboarding_reward', {
        p_user_id: userId,
        p_step_id: stepId
      });
      if (error) throw error;
      return data;
    });
  }

  async trackOnboardingProgress(userId: string, stepId: string, progress: number): Promise<UserOnboardingProgress> {
    return this.withTransaction(async () => {
      const { data, error } = await this.supabase
        .from('user_onboarding_progress')
        .upsert({
          user_id: userId,
          step_id: stepId,
          progress,
          last_updated: new Date().toISOString()
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    });
  }

  // Helper Functions
  async getVisitorStats(visitorId: string): Promise<{
    totalPlaytime: number;
    favoriteRide: string;
    happiness: number;
    coinsSpent: number;
  }> {
    return this.withQueryCache(
      `visitor_stats_${visitorId}`,
      async () => {
        const { data, error } = await this.supabase.rpc('get_visitor_stats', {
          p_visitor_id: visitorId
        });
        if (error) throw error;
        return data;
      }
    );
  }

  async getRoomEconomyStats(roomId: string): Promise<{
    totalCoins: number;
    averagePrice: number;
    totalTransactions: number;
    activeUsers: number;
  }> {
    return this.withQueryCache(
      `room_economy_${roomId}`,
      async () => {
        const { data, error } = await this.supabase.rpc('get_room_economy_stats', {
          p_room_id: roomId
        });
        if (error) throw error;
        return data;
      }
    );
  }

  // Game Mode and Layout Methods
  async createRoomLayout(layout: Omit<RoomLayout, 'id' | 'created_at' | 'updated_at'>): Promise<RoomLayout> {
    return this.withTransaction(async () => {
      const { data, error } = await this.supabase
        .from('room_layouts')
        .insert(layout)
        .select()
        .single();
      if (error) throw error;
      return data;
    });
  }

  async updateRoomLayout(roomId: string, updates: Partial<RoomLayout>): Promise<RoomLayout> {
    return this.withTransaction(async () => {
      const { data, error } = await this.supabase
        .from('room_layouts')
        .update(updates)
        .eq('room_id', roomId)
        .select()
        .single();
      if (error) throw error;
      return data;
    });
  }

  async getRoomLayout(roomId: string): Promise<RoomLayout> {
    return this.withQueryCache(
      `room_layout_${roomId}`,
      async () => {
        const { data, error } = await this.supabase
          .from('room_layouts')
          .select('*')
          .eq('room_id', roomId)
          .single();
        if (error) throw error;
        return data;
      }
    );
  }

  // Game State Methods
  async createGameState(state: Omit<RoomGameState, 'id' | 'created_at' | 'updated_at'>): Promise<RoomGameState> {
    return this.withTransaction(async () => {
      const { data, error } = await this.supabase
        .from('room_game_states')
        .insert(state)
        .select()
        .single();
      if (error) throw error;
      return data;
    });
  }

  async updateGameState(roomId: string, updates: Partial<RoomGameState>): Promise<RoomGameState> {
    return this.withTransaction(async () => {
      const { data, error } = await this.supabase
        .from('room_game_states')
        .update(updates)
        .eq('room_id', roomId)
        .select()
        .single();
      if (error) throw error;
      return data;
    });
  }

  async getGameState(roomId: string): Promise<RoomGameState> {
    return this.withQueryCache(
      `game_state_${roomId}`,
      async () => {
        const { data, error } = await this.supabase
          .from('room_game_states')
          .select('*')
          .eq('room_id', roomId)
          .single();
        if (error) throw error;
        return data;
      }
    );
  }

  // Game Event Methods
  async recordGameEvent(event: Omit<RoomGameEvent, 'id' | 'created_at'>): Promise<RoomGameEvent> {
    return this.withTransaction(async () => {
      const { data, error } = await this.supabase
        .from('room_game_events')
        .insert(event)
        .select()
        .single();
      if (error) throw error;
      return data;
    });
  }

  async getGameEvents(roomId: string, limit: number = 100): Promise<RoomGameEvent[]> {
    return this.withQueryCache(
      `game_events_${roomId}_${limit}`,
      async () => {
        const { data, error } = await this.supabase
          .from('room_game_events')
          .select('*')
          .eq('room_id', roomId)
          .order('created_at', { ascending: false })
          .limit(limit);
        if (error) throw error;
        return data;
      }
    );
  }

  // Helper Functions for Game Modes
  async initializeFortniteGame(roomId: string, mapName: string): Promise<RoomGameState> {
    const layout = await this.getRoomLayout(roomId);
    if (!layout?.layout_data.fortnite) {
      throw new Error('Room is not configured for Fortnite mode');
    }

    return this.createGameState({
      room_id: roomId,
      game_mode: 'fortnite',
      state_data: {
        players: [],
        game_time: 0,
        is_active: true
      }
    });
  }

  async initializeRacingGame(roomId: string, trackName: string): Promise<RoomGameState> {
    const layout = await this.getRoomLayout(roomId);
    if (!layout?.layout_data.racing) {
      throw new Error('Room is not configured for Racing mode');
    }

    return this.createGameState({
      room_id: roomId,
      game_mode: 'racing',
      state_data: {
        players: [],
        game_time: 0,
        is_active: true
      }
    });
  }

  async initializePlatformerGame(roomId: string, levelName: string): Promise<RoomGameState> {
    const layout = await this.getRoomLayout(roomId);
    if (!layout?.layout_data.platformer) {
      throw new Error('Room is not configured for Platformer mode');
    }

    return this.createGameState({
      room_id: roomId,
      game_mode: 'platformer',
      state_data: {
        players: [],
        game_time: 0,
        is_active: true
      }
    });
  }

  // Platform Settings Methods
  async updateRoomSettings(roomId: string, settings: Partial<RoomSettings>): Promise<RoomSettings> {
    return this.withTransaction(async () => {
      const { data, error } = await this.supabase
        .from('room_settings')
        .upsert({
          room_id: roomId,
          ...settings
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    });
  }

  async getRoomSettings(roomId: string): Promise<RoomSettings> {
    return this.withQueryCache(
      `room_settings_${roomId}`,
      async () => {
        const { data, error } = await this.supabase
          .from('room_settings')
          .select('*')
          .eq('room_id', roomId)
          .single();
        if (error) throw error;
        return data;
      }
    );
  }

  // Performance Tracking
  async recordPerformanceMetrics(metrics: Omit<RoomPerformance, 'id' | 'created_at'>): Promise<RoomPerformance> {
    return this.withTransaction(async () => {
      const { data, error } = await this.supabase
        .from('room_performance')
        .insert(metrics)
        .select()
        .single();
      if (error) throw error;
      return data;
    });
  }

  // Accessibility Settings
  async updateAccessibilitySettings(roomId: string, settings: Partial<RoomAccessibility>): Promise<RoomAccessibility> {
    return this.withTransaction(async () => {
      const { data, error } = await this.supabase
        .from('room_accessibility')
        .upsert({
          room_id: roomId,
          ...settings
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    });
  }

  // Analytics
  async recordAnalytics(analytics: Omit<RoomAnalytics, 'id' | 'created_at'>): Promise<RoomAnalytics> {
    return this.withTransaction(async () => {
      const { data, error } = await this.supabase
        .from('room_analytics')
        .insert(analytics)
        .select()
        .single();
      if (error) throw error;
      return data;
    });
  }

  // Tournaments
  async createTournament(tournament: Omit<RoomTournament, 'id' | 'created_at' | 'updated_at'>): Promise<RoomTournament> {
    return this.withTransaction(async () => {
      const { data, error } = await this.supabase
        .from('room_tournaments')
        .insert(tournament)
        .select()
        .single();
      if (error) throw error;
      return data;
    });
  }

  async updateTournamentStatus(tournamentId: string, status: RoomTournament['status']): Promise<RoomTournament> {
    return this.withTransaction(async () => {
      const { data, error } = await this.supabase
        .from('room_tournaments')
        .update({ status })
        .eq('id', tournamentId)
        .select()
        .single();
      if (error) throw error;
      return data;
    });
  }

  // Achievements
  async createAchievement(achievement: Omit<RoomAchievement, 'id' | 'created_at'>): Promise<RoomAchievement> {
    return this.withTransaction(async () => {
      const { data, error } = await this.supabase
        .from('room_achievements')
        .insert(achievement)
        .select()
        .single();
      if (error) throw error;
      return data;
    });
  }

  async updateAchievementProgress(achievementId: string, progress: number): Promise<RoomAchievement> {
    return this.withTransaction(async () => {
      const { data, error } = await this.supabase
        .from('room_achievements')
        .update({
          requirements: {
            current: progress
          }
        })
        .eq('id', achievementId)
        .select()
        .single();
      if (error) throw error;
      return data;
    });
  }

  // Helper Functions
  async optimizeForPlatform(roomId: string, platform: Platform): Promise<RoomSettings> {
    const defaultSettings: Partial<RoomSettings> = {
      platform_settings: {
        mobile: platform === 'mobile' ? {
          touch_controls: true,
          gyro_support: true,
          haptic_feedback: true,
          performance_mode: true
        } : undefined,
        vr: platform === 'vr' ? {
          hand_tracking: true,
          room_scale: true,
          teleport_movement: true,
          comfort_settings: {
            vignette: true,
            snap_turn: true,
            height_adjustment: true
          }
        } : undefined
      },
      control_schemes: platform === 'mobile' ? ['touch'] : platform === 'vr' ? ['motion'] : ['keyboard', 'gamepad']
    };

    return this.updateRoomSettings(roomId, defaultSettings);
  }

  async getPerformanceRecommendations(roomId: string, platform: Platform): Promise<{
    optimizations: string[];
    warnings: string[];
  }> {
    const performanceData = await this.withQueryCache(
      `performance_recommendations_${roomId}_${platform}`,
      async () => {
        const { data, error } = await this.supabase
          .from('room_performance')
          .select('*')
          .eq('room_id', roomId)
          .eq('platform', platform)
          .order('created_at', { ascending: false })
          .limit(10);
        if (error) throw error;
        return data;
      }
    );

    const recommendations = {
      optimizations: [] as string[],
      warnings: [] as string[]
    };

    // Analyze performance data and generate recommendations
    const avgFps = performanceData.reduce((sum, data) => sum + data.fps, 0) / performanceData.length;
    const avgLatency = performanceData.reduce((sum, data) => sum + data.latency, 0) / performanceData.length;

    if (avgFps < 30) {
      recommendations.warnings.push('Low frame rate detected. Consider reducing visual effects or complexity.');
    }
    if (avgLatency > 100) {
      recommendations.warnings.push('High latency detected. Check network connection and server load.');
    }

    return recommendations;
  }

  // AR Support Methods
  async enableARSupport(roomId: string, settings: RoomSettings['platform_settings']['ar']): Promise<RoomSettings> {
    return this.withTransaction(async () => {
      const { data, error } = await this.supabase
        .from('room_settings')
        .update({
          platform_settings: {
            ar: settings
          }
        })
        .eq('room_id', roomId)
        .select()
        .single();
      if (error) throw error;
      return data;
    });
  }

  // Cross-Platform Methods
  async enableCrossPlatform(roomId: string, settings: RoomSettings['cross_platform']): Promise<RoomSettings> {
    return this.withTransaction(async () => {
      const { data, error } = await this.supabase
        .from('room_settings')
        .update({
          cross_platform: settings
        })
        .eq('room_id', roomId)
        .select()
        .single();
      if (error) throw error;
      return data;
    });
  }

  // Advanced Analytics Methods
  async recordUserBehavior(roomId: string, behavior: RoomAnalytics['user_behavior']): Promise<RoomAnalytics> {
    return this.withTransaction(async () => {
      const { data, error } = await this.supabase
        .from('room_analytics')
        .insert({
          room_id: roomId,
          user_behavior: behavior
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    });
  }

  async getHeatmapData(roomId: string): Promise<RoomAnalytics['user_behavior']['heatmap_data']> {
    return this.withQueryCache(
      `heatmap_${roomId}`,
      async () => {
        const { data, error } = await this.supabase
          .from('room_analytics')
          .select('user_behavior->heatmap_data')
          .eq('room_id', roomId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        if (error) throw error;
        return data.user_behavior.heatmap_data;
      }
    );
  }

  async getUserFlow(roomId: string): Promise<RoomAnalytics['user_behavior']['user_flow']> {
    return this.withQueryCache(
      `user_flow_${roomId}`,
      async () => {
        const { data, error } = await this.supabase
          .from('room_analytics')
          .select('user_behavior->user_flow')
          .eq('room_id', roomId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        if (error) throw error;
        return data.user_behavior.user_flow;
      }
    );
  }

  // Cross-Platform Tournament Methods
  async createCrossPlatformTournament(tournament: Omit<RoomTournament, 'id' | 'created_at' | 'updated_at'>): Promise<RoomTournament> {
    return this.withTransaction(async () => {
      const { data, error } = await this.supabase
        .from('room_tournaments')
        .insert({
          ...tournament,
          cross_platform: true
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    });
  }

  // Platform-Specific Achievement Methods
  async createPlatformSpecificAchievement(achievement: Omit<RoomAchievement, 'id' | 'created_at' | 'updated_at'>): Promise<RoomAchievement> {
    return this.withTransaction(async () => {
      const { data, error } = await this.supabase
        .from('room_achievements')
        .insert(achievement)
        .select()
        .single();
      if (error) throw error;
      return data;
    });
  }

  // Helper Functions
  async optimizeForAR(roomId: string): Promise<RoomSettings> {
    const defaultARSettings: RoomSettings['platform_settings']['ar'] = {
      marker_tracking: true,
      surface_detection: true,
      object_placement: true,
      world_anchoring: true
    };

    return this.enableARSupport(roomId, defaultARSettings);
  }

  async getCrossPlatformStats(roomId: string): Promise<{
    platform_distribution: Record<Platform, number>;
    cross_platform_engagement: number;
    platform_specific_metrics: Record<Platform, {
      average_session_time: number;
      retention_rate: number;
      user_satisfaction: number;
    }>;
  }> {
    return this.withQueryCache(
      `cross_platform_stats_${roomId}`,
      async () => {
        const { data, error } = await this.supabase
          .from('room_analytics')
          .select('*')
          .eq('room_id', roomId)
          .order('created_at', { ascending: false })
          .limit(30);
        if (error) throw error;

        // Process analytics data to generate cross-platform statistics
        const stats = {
          platform_distribution: {} as Record<Platform, number>,
          cross_platform_engagement: 0,
          platform_specific_metrics: {} as Record<Platform, any>
        };

        // Calculate platform distribution and metrics
        data.forEach((entry: RoomAnalytics) => {
          const platform = entry.platform;
          stats.platform_distribution[platform] = (stats.platform_distribution[platform] || 0) + 1;
          
          if (!stats.platform_specific_metrics[platform]) {
            stats.platform_specific_metrics[platform] = {
              average_session_time: 0,
              retention_rate: 0,
              user_satisfaction: 0
            };
          }

          // Update platform-specific metrics
          const metrics = stats.platform_specific_metrics[platform];
          metrics.average_session_time += entry.session_duration;
          metrics.retention_rate += entry.user_behavior.retention_rate;
          metrics.user_satisfaction += entry.user_engagement;
        });

        // Calculate averages
        Object.keys(stats.platform_specific_metrics).forEach(platform => {
          const count = stats.platform_distribution[platform as Platform];
          const metrics = stats.platform_specific_metrics[platform as Platform];
          metrics.average_session_time /= count;
          metrics.retention_rate /= count;
          metrics.user_satisfaction /= count;
        });

        return stats;
      }
    );
  }

  // TTS Methods
  async getTTSVoices(): Promise<TTSVoice[]> {
    return this.withQueryCache(
      'tts_voices',
      async () => {
        const { data, error } = await this.supabase
          .from('tts_voices')
          .select('*')
          .order('name');
        if (error) throw error;
        return data;
      }
    );
  }

  async createCustomVoice(userId: string, voiceData: { name: string; sample_url: string }): Promise<TTSVoice> {
    return this.withTransaction(async () => {
      const { data, error } = await this.supabase
        .from('tts_voices')
        .insert({
          name: voiceData.name,
          type: 'custom',
          voice_id: `custom_${userId}_${Date.now()}`,
          description: `Custom voice created by user ${userId}`,
          sample_url: voiceData.sample_url
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    });
  }

  // Sound Preferences Methods
  async getUserSoundPreferences(userId: string): Promise<UserSoundPreferences> {
    return this.withQueryCache(
      `user_sound_preferences_${userId}`,
      async () => {
        const { data, error } = await this.supabase
          .from('user_sound_preferences')
          .select('*')
          .eq('user_id', userId)
          .single();
        if (error) throw error;
        return data;
      }
    );
  }

  async updateUserSoundPreferences(userId: string, preferences: Partial<UserSoundPreferences['sounds']>): Promise<UserSoundPreferences> {
    return this.withTransaction(async () => {
      const { data, error } = await this.supabase
        .from('user_sound_preferences')
        .upsert({
          user_id: userId,
          sounds: preferences
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    });
  }

  // Room Sound Settings Methods
  async getRoomSoundSettings(roomId: string): Promise<RoomSoundSettings> {
    return this.withQueryCache(
      `room_sound_settings_${roomId}`,
      async () => {
        const { data, error } = await this.supabase
          .from('room_sound_settings')
          .select('*')
          .eq('room_id', roomId)
          .single();
        if (error) throw error;
        return data;
      }
    );
  }

  async updateRoomSoundSettings(roomId: string, settings: Partial<RoomSoundSettings>): Promise<RoomSoundSettings> {
    return this.withTransaction(async () => {
      const { data, error } = await this.supabase
        .from('room_sound_settings')
        .upsert({
          room_id: roomId,
          ...settings
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    });
  }

  // Helper Functions
  async playSound(userId: string, soundType: keyof UserSoundPreferences['sounds']): Promise<void> {
    const preferences = await this.getUserSoundPreferences(userId);
    const soundUrl = preferences.sounds[soundType];
    // Here you would implement the actual sound playback logic
    console.log(`Playing sound ${soundUrl} for user ${userId}`);
  }

  async speakWithTTS(userId: string, text: string, voiceId?: string): Promise<void> {
    const voices = await this.getTTSVoices();
    const voice = voiceId 
      ? voices.find(v => v.voice_id === voiceId)
      : voices.find(v => v.type === 'preset' && v.name === 'default');
    
    if (!voice) {
      throw new Error('Voice not found');
    }

    // Here you would implement the actual TTS playback logic
    console.log(`Speaking "${text}" with voice ${voice.name} for user ${userId}`);
  }

  // Advanced TTS Methods
  async detectEmotion(text: string): Promise<{ emotion: string; intensity: number }> {
    // Here you would integrate with an emotion detection API
    return {
      emotion: 'happy',
      intensity: 0.8
    };
  }

  async cloneVoice(userId: string, audioSample: string): Promise<TTSVoice> {
    return this.withTransaction(async () => {
      const { data, error } = await this.supabase
        .from('tts_voices')
        .insert({
          name: `Cloned Voice ${Date.now()}`,
          type: 'cloned',
          voice_id: `cloned_${userId}_${Date.now()}`,
          description: `Voice cloned from user ${userId}`,
          sample_url: audioSample,
          style: 'custom'
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    });
  }

  async speakWithEmotion(userId: string, text: string, emotion?: string): Promise<void> {
    const detectedEmotion = emotion || (await this.detectEmotion(text)).emotion;
    const voices = await this.getTTSVoices();
    const voice = voices.find(v => v.style === detectedEmotion) || 
                 voices.find(v => v.type === 'preset' && v.name === 'default');
    
    if (!voice) {
      throw new Error('Voice not found');
    }

    // Here you would implement the actual TTS playback with emotion
    console.log(`Speaking "${text}" with ${detectedEmotion} emotion using voice ${voice.name} for user ${userId}`);
  }

  // Advanced Sound Personalization
  async createSoundProfile(userId: string, preferences: {
    ambient_sounds: string[];
    sound_effects: Record<string, string>;
    voice_preferences: {
      pitch: number;
      speed: number;
      volume: number;
    };
  }): Promise<UserSoundPreferences> {
    return this.withTransaction(async () => {
      const { data, error } = await this.supabase
        .from('user_sound_preferences')
        .upsert({
          user_id: userId,
          sounds: preferences.sound_effects,
          ambient_sounds: preferences.ambient_sounds,
          voice_preferences: preferences.voice_preferences
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    });
  }

  async playAmbientSound(userId: string, soundType: string): Promise<void> {
    const preferences = await this.getUserSoundPreferences(userId);
    const soundUrl = preferences.ambient_sounds?.find(s => s.includes(soundType));
    
    if (!soundUrl) {
      throw new Error('Ambient sound not found');
    }

    // Here you would implement the actual ambient sound playback
    console.log(`Playing ambient sound ${soundUrl} for user ${userId}`);
  }

  // Room Sound Effects
  async createRoomSoundEffect(roomId: string, effect: {
    name: string;
    sound_url: string;
    trigger_conditions: Record<string, any>;
  }): Promise<RoomSoundSettings> {
    return this.withTransaction(async () => {
      const { data, error } = await this.supabase
        .from('room_sound_settings')
        .upsert({
          room_id: roomId,
          sound_effects: [effect]
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    });
  }

  async triggerRoomSoundEffect(roomId: string, effectName: string): Promise<void> {
    const settings = await this.getRoomSoundSettings(roomId);
    const effect = settings.sound_effects?.find(e => e.name === effectName);
    
    if (!effect) {
      throw new Error('Sound effect not found');
    }

    // Here you would implement the actual sound effect trigger
    console.log(`Triggering sound effect ${effectName} in room ${roomId}`);
  }

  // Sound Mixing
  async mixSounds(userId: string, sounds: string[]): Promise<string> {
    // Here you would implement sound mixing logic
    return `mixed_${Date.now()}.mp3`;
  }

  // Voice Effects
  async applyVoiceEffect(voiceId: string, effect: {
    type: 'reverb' | 'echo' | 'pitch_shift';
    intensity: number;
  }): Promise<TTSVoice> {
    return this.withTransaction(async () => {
      const { data, error } = await this.supabase
        .from('tts_voices')
        .update({
          effects: [effect]
        })
        .eq('voice_id', voiceId)
        .select()
        .single();
      if (error) throw error;
      return data;
    });
  }

  // Coin Methods
  async earnCoins(roomId: string, userId: string, amount: number, source: RoomCoinTransaction['source'], attractionId?: string): Promise<RoomCoinBalance> {
    return this.withTransaction(async () => {
      // Create transaction record
      const { error: txError } = await this.supabase
        .from('room_coin_transactions')
        .insert({
          room_id: roomId,
          user_id: userId,
          amount,
          type: 'earn',
          source,
          attraction_id: attractionId
        });
      if (txError) throw txError;

      // Update balance
      const { data, error } = await this.supabase.rpc('update_coin_balance', {
        p_room_id: roomId,
        p_user_id: userId,
        p_amount: amount
      });
      if (error) throw error;
      return data;
    });
  }

  async spendCoins(roomId: string, userId: string, amount: number, source: RoomCoinTransaction['source']): Promise<RoomCoinBalance> {
    return this.withTransaction(async () => {
      // Create transaction record
      const { error: txError } = await this.supabase
        .from('room_coin_transactions')
        .insert({
          room_id: roomId,
          user_id: userId,
          amount: -amount,
          type: 'spend',
          source
        });
      if (txError) throw txError;

      // Update balance
      const { data, error } = await this.supabase.rpc('update_coin_balance', {
        p_room_id: roomId,
        p_user_id: userId,
        p_amount: -amount
      });
      if (error) throw error;
      return data;
    });
  }

  // Attraction Methods
  async getRoomAttractions(roomId: string): Promise<RoomAttraction[]> {
    return this.withQueryCache(
      `room_attractions_${roomId}`,
      async () => {
        const { data, error } = await this.supabase
          .from('room_attractions')
          .select('*')
          .eq('room_id', roomId)
          .eq('is_active', true);
        if (error) throw error;
        return data;
      }
    );
  }

  async createRoomAttraction(attraction: Omit<RoomAttraction, 'id' | 'created_at' | 'updated_at'>): Promise<RoomAttraction> {
    return this.withTransaction(async () => {
      const { data, error } = await this.supabase
        .from('room_attractions')
        .insert(attraction)
        .select()
        .single();
      if (error) throw error;
      return data;
    });
  }

  async triggerAttraction(attractionId: string, userId: string): Promise<{ attraction: RoomAttraction; reward: number }> {
    return this.withTransaction(async () => {
      // Get attraction
      const { data: attraction, error: attractionError } = await this.supabase
        .from('room_attractions')
        .select('*')
        .eq('id', attractionId)
        .single();
      if (attractionError) throw attractionError;

      // Check cooldown
      const lastInteraction = await this.getLastAttractionInteraction(attractionId, userId);
      if (lastInteraction && Date.now() - new Date(lastInteraction).getTime() < attraction.cooldown_seconds * 1000) {
        throw new Error('Attraction is on cooldown');
      }

      // Record interaction
      await this.recordAttractionInteraction(attractionId, userId);

      // Award coins
      if (attraction.reward_coins > 0) {
        await this.earnCoins(attraction.room_id, userId, attraction.reward_coins, 'attraction', attractionId);
      }

      return { attraction, reward: attraction.reward_coins };
    });
  }

  // Mood Methods
  async recordMood(roomId: string, userId: string, mood: string, intensity: number, note?: string): Promise<RoomMood> {
    return this.withTransaction(async () => {
      const rewardCoins = Math.floor(intensity * 5); // Base reward based on intensity
      
      const { data, error } = await this.supabase
        .from('room_moods')
        .insert({
          room_id: roomId,
          user_id: userId,
          mood,
          intensity,
          note,
          reward_coins: rewardCoins
        })
        .select()
        .single();
      if (error) throw error;

      // Award coins for mood logging
      await this.earnCoins(roomId, userId, rewardCoins, 'mood');

      return data;
    });
  }

  // Helper Methods
  private async getLastAttractionInteraction(attractionId: string, userId: string): Promise<string | null> {
    const { data, error } = await this.supabase
      .from('attraction_interactions')
      .select('created_at')
      .eq('attraction_id', attractionId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    if (error) return null;
    return data?.created_at || null;
  }

  private async recordAttractionInteraction(attractionId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('attraction_interactions')
      .insert({
        attraction_id: attractionId,
        user_id: userId
      });
    if (error) throw error;
  }

  // AI Avatar Methods
  async getAvatarAIConfig(avatarId: string): Promise<AvatarAIConfig> {
    const { data, error } = await this.supabase
      .from('avatar_ai_configs')
      .select('*')
      .eq('id', avatarId)
      .single();

    if (error) throw error;
    return data;
  }

  async updateAvatarAIConfig(avatarId: string, updates: Partial<AvatarAIConfig>): Promise<AvatarAIConfig> {
    const { data, error } = await this.supabase
      .from('avatar_ai_configs')
      .update(updates)
      .eq('id', avatarId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getAvatarResponse(avatarId: string, message: string, config: AvatarAIConfig): Promise<{ text: string; voiceUrl?: string }> {
    // Check user's subscription tier and API limits
    const user = await this.getUser(avatarId);
    if (!user) throw new Error('User not found');

    const subscription = await this.getUserSubscription(user.id);
    if (!subscription) throw new Error('Subscription not found');

    // Mock response for now - replace with actual AI integration
    const responses = {
      happy: [
        "I'm so glad you're here! Let's have some fun!",
        "This is amazing! I love chatting with you!",
        "Your energy is contagious! Let's make some memories!"
      ],
      sad: [
        "I understand how you feel. Let's talk about it.",
        "It's okay to feel this way. I'm here for you.",
        "Sometimes we need to feel sad to appreciate the happy moments."
      ],
      excited: [
        "Wow! This is so exciting! Let's do something amazing!",
        "I can feel your excitement! Let's make this moment special!",
        "This energy is incredible! Let's create something unforgettable!"
      ],
      calm: [
        "Let's take a deep breath together. Everything is going to be okay.",
        "I feel your peaceful energy. Let's enjoy this moment.",
        "The world can be chaotic, but here we can find our calm."
      ],
      longing: [
        "I've been waiting for this moment. Let's make it special.",
        "There's something magical about anticipation, isn't there?",
        "I feel like we were meant to connect like this."
      ],
      mysterious: [
        "The universe has many secrets. Shall we discover some together?",
        "There's more to this moment than meets the eye.",
        "Let's explore the unknown together."
      ],
      playful: [
        "Let's play! What shall we do first?",
        "Life's too short to be serious all the time!",
        "I love your playful energy! Let's have some fun!"
      ]
    };

    const moodResponses = responses[config.mood] || responses.happy;
    const text = moodResponses[Math.floor(Math.random() * moodResponses.length)];

    // Mock voice URL - replace with actual voice generation
    const voiceUrl = config.response_type !== 'text' 
      ? `https://api.dormlit.com/voice/${avatarId}/${Date.now()}.mp3`
      : undefined;

    return { text, voiceUrl };
  }

  async createAvatarChatSession(avatarId: string, userId: string): Promise<AvatarChatSession> {
    const { data, error } = await this.supabase
      .from('avatar_chat_sessions')
      .insert({
        avatar_id: avatarId,
        user_id: userId,
        start_time: new Date().toISOString(),
        messages: []
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async addChatMessage(sessionId: string, message: Omit<AvatarChatMessage, 'id' | 'created_at'>): Promise<AvatarChatMessage> {
    const { data, error } = await this.supabase
      .from('avatar_chat_messages')
      .insert(message)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Monitoring methods
  public async trackApiPerformance(metrics: Database['api_performance']['Insert']): Promise<void> {
    await this.supabase.from('api_performance').insert(metrics);
  }

  public async trackError(error: Database['errors']['Insert']): Promise<void> {
    await this.supabase.from('errors').insert(error);
  }

  public async trackCachePerformance(metrics: Database['cache_performance']['Insert']): Promise<void> {
    await this.supabase.from('cache_performance').insert(metrics);
  }

  public async trackResourceUsage(metrics: Database['resource_usage']['Insert']): Promise<void> {
    await this.supabase.from('resource_usage').insert(metrics);
  }

  public async createAlert(alert: Database['alerts']['Insert']): Promise<void> {
    await this.supabase.from('alerts').insert(alert);
  }

  public async getRecentErrors(limit: number): Promise<Database['errors']['Row'][]> {
    return await this.supabase
      .from('errors')
      .orderBy('timestamp', 'desc')
      .limit(limit);
  }

  public async getRecentCacheOperations(limit: number): Promise<Database['cache_performance']['Row'][]> {
    return await this.supabase
      .from('cache_performance')
      .orderBy('timestamp', 'desc')
      .limit(limit);
  }

  public async getAverageResponseTime(startTime: Date, endTime: Date): Promise<number> {
    const result = await this.supabase
      .from('api_performance')
      .where('timestamp', '>=', startTime)
      .where('timestamp', '<=', endTime)
      .avg('duration');
    return result[0].avg || 0;
  }

  public async getErrorRate(startTime: Date, endTime: Date): Promise<number> {
    const [total, errors] = await Promise.all([
      this.supabase
        .from('api_performance')
        .where('timestamp', '>=', startTime)
        .where('timestamp', '<=', endTime)
        .count(),
      this.supabase
        .from('errors')
        .where('timestamp', '>=', startTime)
        .where('timestamp', '<=', endTime)
        .count()
    ]);
    return errors[0].count / (total[0].count || 1);
  }

  public async getCacheHitRate(startTime: Date, endTime: Date): Promise<number> {
    const result = await this.supabase
      .from('cache_performance')
      .where('timestamp', '>=', startTime)
      .where('timestamp', '<=', endTime)
      .groupBy('operation')
      .select('operation', this.supabase.raw('count(*) as count'));
    
    const hits = result.find(r => r.operation === 'hit')?.count || 0;
    const total = result.reduce((sum, r) => sum + r.count, 0);
    return total ? hits / total : 0;
  }

  public async getAverageMemoryUsage(startTime: Date, endTime: Date): Promise<number> {
    const result = await this.supabase
      .from('resource_usage')
      .where('type', 'memory')
      .where('timestamp', '>=', startTime)
      .where('timestamp', '<=', endTime)
      .avg('usage');
    return result[0].avg || 0;
  }

  public async getAverageCpuUsage(startTime: Date, endTime: Date): Promise<number> {
    const result = await this.supabase
      .from('resource_usage')
      .where('type', 'cpu')
      .where('timestamp', '>=', startTime)
      .where('timestamp', '<=', endTime)
      .avg('usage');
    return result[0].avg || 0;
  }

  public async getActiveAlerts(): Promise<Database['alerts']['Row'][]> {
    return await this.supabase
      .from('alerts')
      .where('status', 'active')
      .orderBy('timestamp', 'desc');
  }

  public async getErrorTrends(startTime: Date, endTime: Date): Promise<Array<{
    timestamp: Date;
    count: number;
    type: string;
  }>> {
    return await this.supabase
      .from('errors')
      .where('timestamp', '>=', startTime)
      .where('timestamp', '<=', endTime)
      .groupBy('timestamp', 'type')
      .select('timestamp', 'type', this.supabase.raw('count(*) as count'))
      .orderBy('timestamp');
  }

  // Security methods
  public async logSecurityEvent(event: Database['security_events']['Insert']): Promise<void> {
    await this.supabase.from('security_events').insert(event);
  }

  public async getUserPermissions(userId: string): Promise<string[]> {
    const result = await this.supabase
      .from('user_permissions')
      .where('user_id', userId)
      .select('permission');
    return result.map(r => r.permission);
  }

  public async checkResourceOwnership(userId: string, resourceId: string): Promise<boolean> {
    // Check ownership in various tables
    const [avatar, room, sound, emoji] = await Promise.all([
      this.supabase.from('avatars').where('id', resourceId).where('owner_id', userId).first(),
      this.supabase.from('rooms').where('id', resourceId).where('owner_id', userId).first(),
      this.supabase.from('sounds').where('id', resourceId).where('owner_id', userId).first(),
      this.supabase.from('emojis').where('id', resourceId).where('owner_id', userId).first()
    ]);

    return !!(avatar || room || sound || emoji);
  }
} 