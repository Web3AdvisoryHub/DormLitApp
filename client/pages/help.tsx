import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaChevronDown, FaChevronUp } from 'react-icons/fa';

interface FAQItem {
  question: string;
  answer: string;
  tags: string[];
}

const faqs: FAQItem[] = [
  {
    question: "How do I edit my realm?",
    answer: "To edit your realm, click on the 'Edit Realm' button in your creator room. You can customize your room's layout, add attractions, and set up interactive elements. Changes are saved automatically.",
    tags: ["realm", "editing", "creator"]
  },
  {
    question: "How do DormCoins work?",
    answer: "DormCoins are earned through various activities in your realm. You can earn coins by spending time in rooms, interacting with attractions, and completing mood logs. These coins can be used to unlock special features and rewards.",
    tags: ["coins", "rewards", "currency"]
  },
  {
    question: "How does the affiliate program work?",
    answer: "Our affiliate program allows you to earn rewards by inviting others to DormLit. Share your unique referral link, and when someone signs up through it, you'll both receive bonus DormCoins and special rewards.",
    tags: ["affiliate", "referral", "rewards"]
  },
  {
    question: "Why is my avatar talking to me?",
    answer: "Your avatar is powered by AI and can engage in conversations based on its mood and configuration. This feature is available to Shaper and Realm Architect tier subscribers. You can customize your avatar's personality and responses in the settings.",
    tags: ["avatar", "ai", "chat"]
  },
  {
    question: "What are the subscription tiers?",
    answer: "DormLit offers three subscription tiers: Free (basic features), Shaper (preset mood responses), and Realm Architect (full AI avatar + voice). Each tier unlocks different features and capabilities.",
    tags: ["subscription", "tiers", "features"]
  }
];

export default function Help() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const toggleItem = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !selectedTag || faq.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const allTags = Array.from(new Set(faqs.flatMap(faq => faq.tags)));

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">DormLit Help Center</h1>
        
        {/* Search Bar */}
        <div className="relative mb-8">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for help..."
            className="w-full bg-white/10 text-white px-4 py-3 rounded-lg pl-12 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-4 py-2 rounded-full ${
              !selectedTag ? 'bg-purple-600' : 'bg-white/10'
            }`}
          >
            All
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              className={`px-4 py-2 rounded-full ${
                tag === selectedTag ? 'bg-purple-600' : 'bg-white/10'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFaqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full flex justify-between items-center p-4"
              >
                <span className="text-lg font-semibold">{faq.question}</span>
                {expandedItems.has(index) ? (
                  <FaChevronUp className="text-purple-500" />
                ) : (
                  <FaChevronDown className="text-purple-500" />
                )}
              </button>
              <AnimatePresence>
                {expandedItems.has(index) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-4 pb-4"
                  >
                    <p className="text-gray-300">{faq.answer}</p>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {faq.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-purple-900/50 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
} 