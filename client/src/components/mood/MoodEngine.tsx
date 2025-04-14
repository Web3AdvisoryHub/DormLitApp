import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

interface Mood {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  prompts: string[];
}

const defaultMoods: Mood[] = [
  {
    id: 'clarity',
    name: 'Clarity',
    description: 'Moments of clear vision and understanding',
    color: 'from-blue-400 to-cyan-300',
    icon: '✨',
    prompts: [
      'What insight came to you today?',
      'Describe a moment of sudden understanding',
      'What truth became clear to you?'
    ]
  },
  {
    id: 'euphoria',
    name: 'Euphoria',
    description: 'Pure joy and elevated energy',
    color: 'from-pink-400 to-purple-300',
    icon: '🌟',
    prompts: [
      'What made your heart sing today?',
      'Describe a moment of pure joy',
      'What lifted your spirits?'
    ]
  },
  {
    id: 'longing',
    name: 'Longing',
    description: 'Deep desire and wistful reflection',
    color: 'from-indigo-400 to-violet-300',
    icon: '🌙',
    prompts: [
      'What do you yearn for?',
      'Describe a moment of deep desire',
      'What calls to your heart?'
    ]
  }
];

const MoodEngine: React.FC = () => {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [showPrompts, setShowPrompts] = useState(false);

  const handleMoodSelect = (mood: Mood) => {
    setSelectedMood(mood);
    setShowPrompts(true);
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center text-purple-200">
          Choose Your Mood
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {defaultMoods.map((mood) => (
            <motion.div
              key={mood.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleMoodSelect(mood)}
              className={twMerge(
                "p-6 rounded-lg cursor-pointer",
                "bg-gradient-to-br",
                mood.color,
                "hover:shadow-lg transition-all duration-300",
                "border border-white/10"
              )}
            >
              <div className="text-4xl mb-4">{mood.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-white">
                {mood.name}
              </h3>
              <p className="text-white/80">{mood.description}</p>
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {showPrompts && selectedMood && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-8 p-6 rounded-lg bg-purple-900/50 backdrop-blur-sm"
            >
              <h3 className="text-2xl font-semibold mb-4 text-purple-200">
                {selectedMood.name} Prompts
              </h3>
              <div className="space-y-4">
                {selectedMood.prompts.map((prompt, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-lg bg-purple-800/30 hover:bg-purple-800/50 transition-colors cursor-pointer"
                  >
                    <p className="text-purple-100">{prompt}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MoodEngine; 