import React from 'react';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

const ManifestoPage: React.FC = () => {
  const manifestoSections = [
    {
      title: "What is Dormlet?",
      content: "Dormlet is a creative sanctuary where your digital self takes form through avatars and emotions. It's a space where your thoughts and feelings find expression through a unique blend of journaling and visual storytelling."
    },
    {
      title: "Your Digital Canvas",
      content: "Choose from our collection of mystical avatars or create your own. Each avatar becomes a vessel for your thoughts, evolving as you share your journey through mood-based journaling."
    },
    {
      title: "Mood as Language",
      content: "Express yourself through our evolving mood system. From 'Clarity' to 'Euphoria', each mood opens new pathways for self-expression and connection with others."
    },
    {
      title: "A Space to Connect",
      content: "Share your journey, react to others' stories, and build connections through gentle interactions. Your presence here is valued, and your story matters."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-indigo-900 to-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            The Dormlet Manifesto
          </h1>
          <p className="text-xl text-purple-200">
            A space where creativity meets self-expression
          </p>
        </motion.div>

        <div className="space-y-12">
          {manifestoSections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className={twMerge(
                "p-6 rounded-lg backdrop-blur-sm",
                "bg-gradient-to-r from-purple-900/50 to-indigo-900/50",
                "border border-purple-500/20",
                "hover:border-purple-500/40 transition-all duration-300"
              )}
            >
              <h2 className="text-2xl font-semibold mb-4 text-purple-300">
                {section.title}
              </h2>
              <p className="text-purple-100 leading-relaxed">
                {section.content}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-16 text-center"
        >
          <p className="text-purple-200 text-lg">
            Join us in creating a space where every story matters
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ManifestoPage; 