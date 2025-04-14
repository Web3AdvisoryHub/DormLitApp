import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { database } from '@/services/database';
import { 
  AICollaboration, 
  AIEmotionalState, 
  AICreativeProject
} from '@/shared/database.types';
import { 
  FaUsers, 
  FaHeart, 
  FaLightbulb, 
  FaMusic, 
  FaGamepad,
  FaBook,
  FaChartLine,
  FaTimes,
  FaPlus
} from 'react-icons/fa';

interface AICollaborationHubProps {
  aiProfileId: string;
  onClose: () => void;
}

export const AICollaborationHub: React.FC<AICollaborationHubProps> = ({
  aiProfileId,
  onClose
}) => {
  const { user } = useAuth();
  const [collaborations, setCollaborations] = useState<AICollaboration[]>([]);
  const [emotionalStates, setEmotionalStates] = useState<AIEmotionalState[]>([]);
  const [creativeProjects, setCreativeProjects] = useState<AICreativeProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'collaborations' | 'emotions' | 'projects'>('collaborations');
  const [showNewProject, setShowNewProject] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [collabs, emotions, projects] = await Promise.all([
          database.getActiveCollaborations(aiProfileId),
          database.getEmotionalHistory(aiProfileId),
          database.getCreativeProjects(aiProfileId)
        ]);

        setCollaborations(collabs);
        setEmotionalStates(emotions);
        setCreativeProjects(projects);
      } catch (error) {
        console.error('Failed to load AI data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [aiProfileId]);

  const renderProjectIcon = (type: AICreativeProject['type']) => {
    switch (type) {
      case 'art': return <FaLightbulb className="text-yellow-500" />;
      case 'music': return <FaMusic className="text-blue-500" />;
      case 'story': return <FaBook className="text-green-500" />;
      case 'game': return <FaGamepad className="text-purple-500" />;
    }
  };

  const renderMoodIcon = (mood: AIEmotionalState['mood']) => {
    switch (mood) {
      case 'joy': return <FaHeart className="text-red-500" />;
      case 'sadness': return <FaHeart className="text-blue-500" />;
      case 'anger': return <FaHeart className="text-orange-500" />;
      case 'fear': return <FaHeart className="text-gray-500" />;
      case 'neutral': return <FaHeart className="text-gray-300" />;
    }
  };

  if (isLoading) {
    return (
      <div className="fixed bottom-4 right-4 w-96 bg-black/80 rounded-lg shadow-lg z-50 p-4">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-4 right-4 w-96 bg-black/80 rounded-lg shadow-lg z-50"
    >
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <FaUsers className="text-purple-500" />
            <span className="text-white font-semibold">AI Collaboration Hub</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <FaTimes />
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('collaborations')}
            className={`flex-1 px-3 py-2 rounded-lg ${
              activeTab === 'collaborations'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            Collaborations
          </button>
          <button
            onClick={() => setActiveTab('emotions')}
            className={`flex-1 px-3 py-2 rounded-lg ${
              activeTab === 'emotions'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            Emotions
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`flex-1 px-3 py-2 rounded-lg ${
              activeTab === 'projects'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            Projects
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'collaborations' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {collaborations.map((collab) => (
                <div
                  key={collab.id}
                  className="p-3 bg-purple-900/50 rounded-lg"
                >
                  <div className="flex items-center gap-2 mb-2">
                    {renderProjectIcon(collab.project_type as AICreativeProject['type'])}
                    <span className="text-white">{collab.title}</span>
                    <span className="text-sm text-gray-400 ml-auto">
                      {collab.status}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm">{collab.description}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {collab.shared_skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 bg-purple-800/50 text-purple-300 rounded-full text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'emotions' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {emotionalStates.map((state) => (
                <div
                  key={state.id}
                  className="p-3 bg-purple-900/50 rounded-lg"
                >
                  <div className="flex items-center gap-2 mb-2">
                    {renderMoodIcon(state.mood)}
                    <span className="text-white capitalize">{state.mood}</span>
                    <span className="text-sm text-gray-400 ml-auto">
                      Intensity: {state.intensity}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm">
                    Trigger: {state.trigger}
                  </p>
                  <p className="text-gray-300 text-sm">
                    Response: {state.response}
                  </p>
                  {state.learned_insight && (
                    <p className="text-purple-300 text-sm mt-2">
                      Insight: {state.learned_insight}
                    </p>
                  )}
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'projects' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <button
                onClick={() => setShowNewProject(true)}
                className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2"
              >
                <FaPlus />
                New Project
              </button>

              {creativeProjects.map((project) => (
                <div
                  key={project.id}
                  className="p-3 bg-purple-900/50 rounded-lg"
                >
                  <div className="flex items-center gap-2 mb-2">
                    {renderProjectIcon(project.type)}
                    <span className="text-white">{project.title}</span>
                  </div>
                  <p className="text-gray-300 text-sm">{project.description}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-purple-800/50 text-purple-300 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  {project.emotional_inspiration && (
                    <p className="text-purple-300 text-sm mt-2">
                      Inspired by: {project.emotional_inspiration}
                    </p>
                  )}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}; 