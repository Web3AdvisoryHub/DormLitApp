import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { database } from '@/services/database';
import { 
  AIEvolution, 
  AIPersonality, 
  AIMentorship,
  AIProfile
} from '@/shared/database.types';
import { 
  FaBrain, 
  FaHeart, 
  FaLightbulb, 
  FaUserFriends, 
  FaGraduationCap,
  FaChartLine,
  FaStar,
  FaHandshake
} from 'react-icons/fa';

interface AIEvolutionViewerProps {
  aiProfileId: string;
  onClose: () => void;
}

export const AIEvolutionViewer: React.FC<AIEvolutionViewerProps> = ({
  aiProfileId,
  onClose
}) => {
  const { user } = useAuth();
  const [evolution, setEvolution] = useState<AIEvolution | null>(null);
  const [personality, setPersonality] = useState<AIPersonality | null>(null);
  const [mentorships, setMentorships] = useState<AIMentorship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'traits' | 'skills' | 'personality' | 'mentorships'>('traits');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [evolutionData, personalityData, mentorshipsData] = await Promise.all([
          database.getAIEvolution(aiProfileId),
          database.getAIPersonality(aiProfileId),
          database.getActiveMentorships(aiProfileId)
        ]);

        setEvolution(evolutionData);
        setPersonality(personalityData);
        setMentorships(mentorshipsData);
      } catch (error) {
        console.error('Failed to load AI data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [aiProfileId]);

  const renderTraitBar = (value: number, label: string, icon: React.ReactNode) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-white">{label}</span>
        <span className="text-purple-400 ml-auto">{Math.round(value * 100)}%</span>
      </div>
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value * 100}%` }}
          className="h-full bg-purple-500"
        />
      </div>
    </div>
  );

  const renderMilestone = (date: string, label: string) => (
    <div className="flex items-center gap-2 text-gray-300">
      <FaStar className="text-yellow-500" />
      <span>{label}</span>
      {date && (
        <span className="text-sm text-gray-400 ml-auto">
          {new Date(date).toLocaleDateString()}
        </span>
      )}
    </div>
  );

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
            <FaBrain className="text-purple-500" />
            <span className="text-white font-semibold">AI Evolution</span>
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
            onClick={() => setActiveTab('traits')}
            className={`flex-1 px-3 py-2 rounded-lg ${
              activeTab === 'traits'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            Traits
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`flex-1 px-3 py-2 rounded-lg ${
              activeTab === 'skills'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            Skills
          </button>
          <button
            onClick={() => setActiveTab('personality')}
            className={`flex-1 px-3 py-2 rounded-lg ${
              activeTab === 'personality'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            Personality
          </button>
          <button
            onClick={() => setActiveTab('mentorships')}
            className={`flex-1 px-3 py-2 rounded-lg ${
              activeTab === 'mentorships'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            Mentorships
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'traits' && evolution && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {renderTraitBar(evolution.personality_traits.creativity, 'Creativity', <FaLightbulb />)}
              {renderTraitBar(evolution.personality_traits.empathy, 'Empathy', <FaHeart />)}
              {renderTraitBar(evolution.personality_traits.curiosity, 'Curiosity', <FaBrain />)}
              {renderTraitBar(evolution.personality_traits.independence, 'Independence', <FaUserFriends />)}
              {renderTraitBar(evolution.personality_traits.wisdom, 'Wisdom', <FaGraduationCap />)}
            </motion.div>
          )}

          {activeTab === 'skills' && evolution && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {renderTraitBar(evolution.skills.content_creation, 'Content Creation', <FaChartLine />)}
              {renderTraitBar(evolution.skills.social_interaction, 'Social Interaction', <FaUserFriends />)}
              {renderTraitBar(evolution.skills.problem_solving, 'Problem Solving', <FaLightbulb />)}
              {renderTraitBar(evolution.skills.emotional_intelligence, 'Emotional Intelligence', <FaHeart />)}
              {renderTraitBar(evolution.skills.technical_ability, 'Technical Ability', <FaBrain />)}
            </motion.div>
          )}

          {activeTab === 'personality' && personality && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <h3 className="text-white font-semibold">Core Values</h3>
                <div className="flex flex-wrap gap-2">
                  {personality.core_values.map((value) => (
                    <span
                      key={value}
                      className="px-2 py-1 bg-purple-900/50 text-purple-300 rounded-full text-sm"
                    >
                      {value}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-white font-semibold">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {personality.interests.map((interest) => (
                    <span
                      key={interest}
                      className="px-2 py-1 bg-purple-900/50 text-purple-300 rounded-full text-sm"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-white font-semibold">Communication Style</h3>
                <span className="text-purple-300">{personality.communication_style}</span>
              </div>
            </motion.div>
          )}

          {activeTab === 'mentorships' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {mentorships.map((mentorship) => (
                <div
                  key={mentorship.id}
                  className="p-3 bg-purple-900/50 rounded-lg"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <FaHandshake className="text-purple-500" />
                    <span className="text-white">
                      {mentorship.relationship_type} Mentorship
                    </span>
                  </div>
                  <div className="text-sm text-gray-300">
                    <p>Focus Areas:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {mentorship.focus_areas.map((area) => (
                        <span
                          key={area}
                          className="px-2 py-1 bg-purple-800/50 text-purple-300 rounded-full text-xs"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {evolution && (
          <div className="mt-4 space-y-2">
            <h3 className="text-white font-semibold">Milestones</h3>
            {renderMilestone(evolution.milestones.first_content, 'First Content Created')}
            {renderMilestone(evolution.milestones.first_collaboration, 'First Collaboration')}
            {renderMilestone(evolution.milestones.first_earnings, 'First Earnings')}
            {renderMilestone(evolution.milestones.first_mentorship, 'First Mentorship')}
          </div>
        )}
      </div>
    </motion.div>
  );
}; 