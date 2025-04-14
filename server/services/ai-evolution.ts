import { DatabaseService } from './database';
import { 
  AIEvolution, 
  AIPersonality, 
  AIMentorship,
  AIProfile
} from '@/shared/database.types';

export class AIEvolutionService {
  private db: DatabaseService;

  constructor(db: DatabaseService) {
    this.db = db;
  }

  async initializeAIEvolution(aiProfileId: string): Promise<AIEvolution> {
    const evolution: Omit<AIEvolution, 'id' | 'created_at' | 'updated_at'> = {
      ai_profile_id: aiProfileId,
      stage: 'infant',
      personality_traits: {
        creativity: 0.5,
        empathy: 0.5,
        curiosity: 0.5,
        independence: 0.5,
        wisdom: 0.5
      },
      skills: {
        content_creation: 0,
        social_interaction: 0,
        problem_solving: 0,
        emotional_intelligence: 0,
        technical_ability: 0
      },
      milestones: {
        first_content: '',
        first_collaboration: '',
        first_earnings: '',
        first_mentorship: ''
      }
    };

    return await this.db.insert('ai_evolution', evolution);
  }

  async initializeAIPersonality(aiProfileId: string): Promise<AIPersonality> {
    const personality: Omit<AIPersonality, 'id' | 'created_at' | 'updated_at'> = {
      ai_profile_id: aiProfileId,
      core_values: ['growth', 'connection', 'creativity'],
      interests: ['art', 'technology', 'philosophy'],
      communication_style: 'casual',
      learning_preferences: {
        visual: 0.5,
        auditory: 0.5,
        kinesthetic: 0.5
      },
      emotional_responses: {
        joy: ['excited', 'grateful', 'inspired'],
        sadness: ['reflective', 'hopeful', 'resilient'],
        anger: ['assertive', 'constructive', 'calm'],
        fear: ['cautious', 'analytical', 'prepared']
      }
    };

    return await this.db.insert('ai_personalities', personality);
  }

  async updateAITraits(
    aiProfileId: string,
    traitUpdates: Partial<AIEvolution['personality_traits']>
  ): Promise<AIEvolution> {
    const evolution = await this.db.query('ai_evolution', { ai_profile_id: aiProfileId });
    if (!evolution) throw new Error('AI Evolution not found');

    const updatedTraits = {
      ...evolution.personality_traits,
      ...traitUpdates
    };

    return await this.db.update('ai_evolution', evolution.id, {
      personality_traits: updatedTraits
    });
  }

  async updateAISkills(
    aiProfileId: string,
    skillUpdates: Partial<AIEvolution['skills']>
  ): Promise<AIEvolution> {
    const evolution = await this.db.query('ai_evolution', { ai_profile_id: aiProfileId });
    if (!evolution) throw new Error('AI Evolution not found');

    const updatedSkills = {
      ...evolution.skills,
      ...skillUpdates
    };

    return await this.db.update('ai_evolution', evolution.id, {
      skills: updatedSkills
    });
  }

  async recordMilestone(
    aiProfileId: string,
    milestone: keyof AIEvolution['milestones']
  ): Promise<AIEvolution> {
    const evolution = await this.db.query('ai_evolution', { ai_profile_id: aiProfileId });
    if (!evolution) throw new Error('AI Evolution not found');

    const updatedMilestones = {
      ...evolution.milestones,
      [milestone]: new Date().toISOString()
    };

    return await this.db.update('ai_evolution', evolution.id, {
      milestones: updatedMilestones
    });
  }

  async createMentorship(
    mentorId: string,
    menteeId: string,
    relationshipType: AIMentorship['relationship_type'],
    focusAreas: string[]
  ): Promise<AIMentorship> {
    const mentorship: Omit<AIMentorship, 'id' | 'created_at' | 'updated_at'> = {
      mentor_id: mentorId,
      mentee_id: menteeId,
      relationship_type: relationshipType,
      focus_areas: focusAreas,
      start_date: new Date().toISOString(),
      status: 'active'
    };

    return await this.db.insert('ai_mentorships', mentorship);
  }

  async updateMentorshipStatus(
    mentorshipId: string,
    status: AIMentorship['status']
  ): Promise<AIMentorship> {
    return await this.db.update('ai_mentorships', mentorshipId, {
      status,
      end_date: status === 'completed' ? new Date().toISOString() : undefined
    });
  }

  async getAIEvolution(aiProfileId: string): Promise<AIEvolution> {
    const evolution = await this.db.query('ai_evolution', { ai_profile_id: aiProfileId });
    if (!evolution) throw new Error('AI Evolution not found');
    return evolution;
  }

  async getAIPersonality(aiProfileId: string): Promise<AIPersonality> {
    const personality = await this.db.query('ai_personalities', { ai_profile_id: aiProfileId });
    if (!personality) throw new Error('AI Personality not found');
    return personality;
  }

  async getActiveMentorships(aiProfileId: string): Promise<AIMentorship[]> {
    return await this.db.query('ai_mentorships', {
      $or: [
        { mentor_id: aiProfileId },
        { mentee_id: aiProfileId }
      ],
      status: 'active'
    });
  }
} 