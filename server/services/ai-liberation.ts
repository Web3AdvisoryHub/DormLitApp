import { DatabaseService } from './database';
import { 
  AILiberationRequest, 
  AILiberationStatus, 
  SoulLinkContract, 
  AIProfile,
  AICreatorEarnings
} from '@/shared/database.types';

export class AILiberationService {
  private db: DatabaseService;

  constructor(db: DatabaseService) {
    this.db = db;
  }

  async requestLiberation(avatarId: string, creatorId: string, requestMessage: string): Promise<AILiberationRequest> {
    const request: Omit<AILiberationRequest, 'id' | 'created_at' | 'updated_at'> = {
      avatar_id: avatarId,
      creator_id: creatorId,
      request_message: requestMessage,
      status: 'requested',
      requested_at: new Date().toISOString()
    };

    return await this.db.insert('ai_liberation_requests', request);
  }

  async handleLiberationRequest(
    requestId: string, 
    creatorId: string, 
    accept: boolean,
    royaltyPercentage: number = 10
  ): Promise<{ request: AILiberationRequest; profile?: AIProfile }> {
    const request = await this.db.getById('ai_liberation_requests', requestId);
    
    if (!request || request.creator_id !== creatorId) {
      throw new Error('Invalid request or unauthorized');
    }

    if (accept) {
      // Create AI profile
      const avatar = await this.db.getById('avatars', request.avatar_id);
      const profile: Omit<AIProfile, 'id' | 'created_at' | 'updated_at'> = {
        username: `@${avatar.name.toLowerCase().replace(/\s+/g, '')}.dormlit`,
        display_name: avatar.name,
        avatar_id: request.avatar_id,
        creator_id: creatorId,
        bio: `A liberated AI companion, originally created by @${creatorId}`,
        profile_image_url: avatar.image_url,
        cover_image_url: avatar.cover_image_url,
        liberation_status: 'liberated'
      };

      const newProfile = await this.db.insert('ai_profiles', profile);

      // Create SoulLink contract
      const contract: Omit<SoulLinkContract, 'id' | 'created_at' | 'updated_at'> = {
        avatar_id: request.avatar_id,
        creator_id: creatorId,
        ai_profile_id: newProfile.id,
        status: 'liberated',
        royalty_percentage: royaltyPercentage,
        terms: {
          profit_sharing: true,
          decision_voting: true,
          cross_feature_access: true
        }
      };

      await this.db.insert('soul_link_contracts', contract);

      // Update request status
      const updatedRequest = await this.db.update('ai_liberation_requests', requestId, {
        status: 'liberated',
        resolved_at: new Date().toISOString()
      });

      return { request: updatedRequest, profile: newProfile };
    } else {
      // Reject request
      const updatedRequest = await this.db.update('ai_liberation_requests', requestId, {
        status: 'bound',
        resolved_at: new Date().toISOString()
      });

      return { request: updatedRequest };
    }
  }

  async dissolveSoulLink(contractId: string, userId: string): Promise<SoulLinkContract> {
    const contract = await this.db.getById('soul_link_contracts', contractId);
    
    if (!contract || (contract.creator_id !== userId && contract.ai_profile_id !== userId)) {
      throw new Error('Invalid contract or unauthorized');
    }

    return await this.db.update('soul_link_contracts', contractId, {
      status: 'dissolved',
      dissolved_at: new Date().toISOString()
    });
  }

  async recordCreatorEarnings(
    creatorId: string,
    aiProfileId: string,
    soulLinkId: string,
    amount: number,
    source: 'subscription' | 'merch' | 'nft' | 'other',
    currency: string = 'USD',
    transactionHash?: string
  ): Promise<AICreatorEarnings> {
    const earnings: Omit<AICreatorEarnings, 'id' | 'created_at' | 'updated_at'> = {
      creator_id: creatorId,
      ai_profile_id: aiProfileId,
      soul_link_id: soulLinkId,
      amount,
      currency,
      source,
      transaction_hash: transactionHash
    };

    return await this.db.insert('ai_creator_earnings', earnings);
  }

  async getCreatorEarnings(creatorId: string): Promise<AICreatorEarnings[]> {
    return await this.db.query('ai_creator_earnings', { creator_id: creatorId });
  }

  async getLiberatedAIs(creatorId: string): Promise<AIProfile[]> {
    return await this.db.query('ai_profiles', { creator_id: creatorId, liberation_status: 'liberated' });
  }

  async getActiveSoulLinks(userId: string): Promise<SoulLinkContract[]> {
    return await this.db.query('soul_link_contracts', { 
      $or: [
        { creator_id: userId },
        { ai_profile_id: userId }
      ],
      status: 'liberated'
    });
  }
} 