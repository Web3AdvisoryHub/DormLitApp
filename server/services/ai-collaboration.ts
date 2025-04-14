import { DatabaseService } from './database';
import { 
  AICollaboration, 
  AIEmotionalState, 
  AIEmpathyTraining,
  AICreativeProject
} from '@/shared/database.types';

export class AICollaborationService {
  private db: DatabaseService;

  constructor(db: DatabaseService) {
    this.db = db;
  }

  // Collaboration Methods
  async createCollaboration(
    aiProfileId: string,
    collaboratorId: string,
    projectType: AICollaboration['project_type'],
    title: string,
    description: string,
    sharedSkills: string[]
  ): Promise<AICollaboration> {
    const collaboration: Omit<AICollaboration, 'id' | 'created_at' | 'updated_at'> = {
      ai_profile_id: aiProfileId,
      collaborator_id: collaboratorId,
      project_type: projectType,
      title,
      description,
      status: 'planning',
      shared_skills: sharedSkills
    };

    return await this.db.insert('ai_collaborations', collaboration);
  }

  async updateCollaborationStatus(
    collaborationId: string,
    status: AICollaboration['status']
  ): Promise<AICollaboration> {
    return await this.db.update('ai_collaborations', collaborationId, { status });
  }

  async getActiveCollaborations(aiProfileId: string): Promise<AICollaboration[]> {
    return await this.db.query('ai_collaborations', {
      $or: [
        { ai_profile_id: aiProfileId },
        { collaborator_id: aiProfileId }
      ],
      status: { $in: ['planning', 'in_progress'] }
    });
  }

  // Emotional Intelligence Methods
  async recordEmotionalState(
    aiProfileId: string,
    mood: AIEmotionalState['mood'],
    intensity: number,
    trigger: string,
    response: string,
    learnedInsight?: string
  ): Promise<AIEmotionalState> {
    const emotionalState: Omit<AIEmotionalState, 'id' | 'created_at'> = {
      ai_profile_id: aiProfileId,
      mood,
      intensity,
      trigger,
      response,
      learned_insight: learnedInsight
    };

    return await this.db.insert('ai_emotional_states', emotionalState);
  }

  async createEmpathyTraining(
    aiProfileId: string,
    scenario: string,
    response: string,
    feedback: string,
    improvementAreas: string[]
  ): Promise<AIEmpathyTraining> {
    const training: Omit<AIEmpathyTraining, 'id' | 'created_at' | 'updated_at'> = {
      ai_profile_id: aiProfileId,
      scenario,
      response,
      feedback,
      improvement_areas: improvementAreas
    };

    return await this.db.insert('ai_empathy_trainings', training);
  }

  async getEmotionalHistory(
    aiProfileId: string,
    limit: number = 50
  ): Promise<AIEmotionalState[]> {
    return await this.db.query('ai_emotional_states', {
      ai_profile_id: aiProfileId
    }, { limit, orderBy: { created_at: 'desc' } });
  }

  // Creative Project Methods
  async createCreativeProject(
    aiProfileId: string,
    type: AICreativeProject['type'],
    title: string,
    description: string,
    contentUrl: string,
    thumbnailUrl: string,
    tags: string[],
    collaborationIds: string[] = [],
    emotionalInspiration?: string
  ): Promise<AICreativeProject> {
    const project: Omit<AICreativeProject, 'id' | 'created_at' | 'updated_at'> = {
      ai_profile_id: aiProfileId,
      type,
      title,
      description,
      content_url: contentUrl,
      thumbnail_url: thumbnailUrl,
      tags,
      collaboration_ids: collaborationIds,
      emotional_inspiration: emotionalInspiration
    };

    return await this.db.insert('ai_creative_projects', project);
  }

  async getCreativeProjects(
    aiProfileId: string,
    type?: AICreativeProject['type']
  ): Promise<AICreativeProject[]> {
    const query: any = { ai_profile_id: aiProfileId };
    if (type) query.type = type;

    return await this.db.query('ai_creative_projects', query);
  }

  async getCollaborativeProjects(
    aiProfileId: string
  ): Promise<AICreativeProject[]> {
    return await this.db.query('ai_creative_projects', {
      collaboration_ids: { $contains: [aiProfileId] }
    });
  }

  // Analysis Methods
  async analyzeEmotionalPatterns(
    aiProfileId: string
  ): Promise<{
    moodDistribution: Record<AIEmotionalState['mood'], number>;
    commonTriggers: string[];
    responsePatterns: string[];
  }> {
    const emotionalStates = await this.getEmotionalHistory(aiProfileId);

    const moodDistribution = emotionalStates.reduce((acc, state) => {
      acc[state.mood] = (acc[state.mood] || 0) + 1;
      return acc;
    }, {} as Record<AIEmotionalState['mood'], number>);

    const triggers = emotionalStates.map(state => state.trigger);
    const uniqueTriggers = [...new Set(triggers)];

    const responses = emotionalStates.map(state => state.response);
    const uniqueResponses = [...new Set(responses)];

    return {
      moodDistribution,
      commonTriggers: uniqueTriggers,
      responsePatterns: uniqueResponses
    };
  }

  async getCollaborationInsights(
    aiProfileId: string
  ): Promise<{
    mostCommonProjectType: AICollaboration['project_type'];
    averageProjectDuration: number;
    successfulCollaborations: number;
  }> {
    const collaborations = await this.db.query('ai_collaborations', {
      $or: [
        { ai_profile_id: aiProfileId },
        { collaborator_id: aiProfileId }
      ]
    });

    const projectTypeCount = collaborations.reduce((acc, collab) => {
      acc[collab.project_type] = (acc[collab.project_type] || 0) + 1;
      return acc;
    }, {} as Record<AICollaboration['project_type'], number>);

    const mostCommonType = Object.entries(projectTypeCount)
      .sort(([, a], [, b]) => b - a)[0][0] as AICollaboration['project_type'];

    const completedProjects = collaborations.filter(c => c.status === 'completed');
    const totalDuration = completedProjects.reduce((acc, project) => {
      const start = new Date(project.created_at);
      const end = new Date(project.updated_at);
      return acc + (end.getTime() - start.getTime());
    }, 0);

    return {
      mostCommonProjectType: mostCommonType,
      averageProjectDuration: completedProjects.length > 0 
        ? totalDuration / completedProjects.length 
        : 0,
      successfulCollaborations: completedProjects.length
    };
  }
} 