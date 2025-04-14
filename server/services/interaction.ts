import { DatabaseService } from './database';
import { AvatarMood } from '@/shared/database.types';

export class InteractionService {
  private static instance: InteractionService;
  private db: DatabaseService;
  
  // Click rate limiting
  private readonly CLICK_COOLDOWN = 1000; // 1 second
  private readonly MAX_CLICKS_PER_SECOND = 10;
  private clickTimestamps: Map<string, number[]> = new Map();

  private constructor() {
    this.db = DatabaseService.getInstance();
  }

  public static getInstance(): InteractionService {
    if (!InteractionService.instance) {
      InteractionService.instance = new InteractionService();
    }
    return InteractionService.instance;
  }

  // Handle avatar click
  public async handleAvatarClick(
    userId: string,
    avatarId: string,
    roomId: string
  ): Promise<{ success: boolean; rewards?: { coins: number; xp: number } }> {
    try {
      // Validate click rate
      if (!this.validateClickRate(userId)) {
        return { success: false };
      }

      // Check if user has access to the avatar
      const hasAccess = await this.validateAccess(userId, avatarId, 'avatar');
      if (!hasAccess) {
        return { success: false };
      }

      // Get avatar mood
      const avatar = await this.db.getAvatar(avatarId);
      if (!avatar) {
        return { success: false };
      }

      // Generate response based on mood
      const response = this.generateMoodResponse(avatar.mood);

      // Calculate rewards
      const rewards = this.calculateRewards(avatar.mood);

      // Track interaction
      await this.trackInteraction(userId, avatarId, 'avatar_click', roomId);

      return {
        success: true,
        rewards
      };
    } catch (error) {
      console.error('Error handling avatar click:', error);
      return { success: false };
    }
  }

  // Handle emoji click
  public async handleEmojiClick(
    userId: string,
    emojiId: string,
    roomId: string
  ): Promise<{ success: boolean; rewards?: { coins: number; xp: number } }> {
    try {
      if (!this.validateClickRate(userId)) {
        return { success: false };
      }

      const hasAccess = await this.validateAccess(userId, emojiId, 'emoji');
      if (!hasAccess) {
        return { success: false };
      }

      const rewards = this.calculateRewards('happy'); // Emoji clicks always give happy mood rewards

      await this.trackInteraction(userId, emojiId, 'emoji_click', roomId);

      return {
        success: true,
        rewards
      };
    } catch (error) {
      console.error('Error handling emoji click:', error);
      return { success: false };
    }
  }

  // Handle sound click
  public async handleSoundClick(
    userId: string,
    soundId: string,
    roomId: string
  ): Promise<{ success: boolean; rewards?: { coins: number; xp: number } }> {
    try {
      if (!this.validateClickRate(userId)) {
        return { success: false };
      }

      const hasAccess = await this.validateAccess(userId, soundId, 'sound');
      if (!hasAccess) {
        return { success: false };
      }

      const rewards = this.calculateRewards('relaxed'); // Sound clicks give relaxed mood rewards

      await this.trackInteraction(userId, soundId, 'sound_click', roomId);

      return {
        success: true,
        rewards
      };
    } catch (error) {
      console.error('Error handling sound click:', error);
      return { success: false };
    }
  }

  // Handle room zone click
  public async handleRoomZoneClick(
    userId: string,
    zoneId: string,
    roomId: string
  ): Promise<{ success: boolean; rewards?: { coins: number; xp: number } }> {
    try {
      if (!this.validateClickRate(userId)) {
        return { success: false };
      }

      const hasAccess = await this.validateAccess(userId, zoneId, 'zone');
      if (!hasAccess) {
        return { success: false };
      }

      const rewards = this.calculateRewards('excited'); // Zone clicks give excited mood rewards

      await this.trackInteraction(userId, zoneId, 'zone_click', roomId);

      return {
        success: true,
        rewards
      };
    } catch (error) {
      console.error('Error handling room zone click:', error);
      return { success: false };
    }
  }

  // Validate click rate to prevent spam
  private validateClickRate(userId: string): boolean {
    const now = Date.now();
    const userClicks = this.clickTimestamps.get(userId) || [];
    
    // Remove clicks older than cooldown
    const recentClicks = userClicks.filter(timestamp => now - timestamp < this.CLICK_COOLDOWN);
    
    // Check if user has exceeded max clicks
    if (recentClicks.length >= this.MAX_CLICKS_PER_SECOND) {
      return false;
    }
    
    // Add new click
    recentClicks.push(now);
    this.clickTimestamps.set(userId, recentClicks);
    
    return true;
  }

  // Validate user access to target
  private async validateAccess(
    userId: string,
    targetId: string,
    targetType: 'avatar' | 'emoji' | 'sound' | 'zone'
  ): Promise<boolean> {
    try {
      switch (targetType) {
        case 'avatar':
          const avatar = await this.db.getAvatar(targetId);
          return avatar?.owner_id === userId;
        case 'emoji':
          const emoji = await this.db.getEmoji(targetId);
          return emoji?.owner_id === userId;
        case 'sound':
          const sound = await this.db.getSound(targetId);
          return sound?.owner_id === userId;
        case 'zone':
          const zone = await this.db.getRoomZone(targetId);
          return zone?.room_id === (await this.db.getUserRoom(userId))?.id;
        default:
          return false;
      }
    } catch (error) {
      console.error('Error validating access:', error);
      return false;
    }
  }

  // Generate response based on avatar mood
  private generateMoodResponse(mood: AvatarMood): string {
    const responses: Record<AvatarMood, string[]> = {
      happy: ['Yay!', 'That was fun!', 'I love this!'],
      sad: ['I need a hug...', 'Not feeling great...', 'Could be better...'],
      angry: ['Grrr!', 'Not cool!', 'I'm upset!'],
      excited: ['Woohoo!', 'This is amazing!', 'Let's go!'],
      relaxed: ['Ahh...', 'So peaceful...', 'Feeling good...'],
      creative: ['Inspiration!', 'New ideas!', 'Let's create!']
    };

    const moodResponses = responses[mood];
    return moodResponses[Math.floor(Math.random() * moodResponses.length)];
  }

  // Calculate rewards based on mood
  private calculateRewards(mood: AvatarMood): { coins: number; xp: number } {
    const rewardMultipliers: Record<AvatarMood, { coins: number; xp: number }> = {
      happy: { coins: 2, xp: 1 },
      sad: { coins: 1, xp: 1 },
      angry: { coins: 1, xp: 1 },
      excited: { coins: 3, xp: 2 },
      relaxed: { coins: 2, xp: 1 },
      creative: { coins: 3, xp: 2 }
    };

    const baseRewards = rewardMultipliers[mood];
    return {
      coins: baseRewards.coins,
      xp: baseRewards.xp
    };
  }

  // Track interaction in analytics
  private async trackInteraction(
    userId: string,
    targetId: string,
    interactionType: string,
    roomId: string
  ): Promise<void> {
    try {
      await this.db.trackInteraction({
        user_id: userId,
        target_id: targetId,
        interaction_type: interactionType,
        room_id: roomId,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error tracking interaction:', error);
    }
  }
} 