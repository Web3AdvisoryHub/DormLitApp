import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

interface AffiliateStats {
  totalInvites: number;
  activeUsers: number;
  pendingInvites: number;
}

const AffiliateSystem: React.FC = () => {
  const [stats, setStats] = useState<AffiliateStats>({
    totalInvites: 0,
    activeUsers: 0,
    pendingInvites: 0
  });

  const generateInviteLink = () => {
    // In a real implementation, this would generate a unique invite link
    return 'dormlit.com/invite/placeholder';
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Add visual feedback for copy action
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Share DormLit</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {Object.entries(stats).map(([key, value]) => (
            <motion.div
              key={key}
              whileHover={{ scale: 1.02 }}
              className={twMerge(
                "p-6 rounded-lg",
                "bg-gradient-to-br from-purple-900/50 to-indigo-900/50",
                "border border-purple-500/20"
              )}
            >
              <h3 className="text-xl font-semibold mb-2 text-purple-300">
                {key.split(/(?=[A-Z])/).join(' ')}
              </h3>
              <p className="text-3xl font-bold text-white">{value}</p>
            </motion.div>
          ))}
        </div>

        <div className="p-6 rounded-lg bg-purple-900/30 backdrop-blur-sm">
          <h3 className="text-xl font-semibold mb-4 text-purple-200">
            Your Invite Link
          </h3>
          <div className="flex gap-4">
            <input
              type="text"
              value={generateInviteLink()}
              readOnly
              className="flex-1 p-3 rounded-lg bg-purple-800/50 border border-purple-500/30 text-purple-100"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => copyToClipboard(generateInviteLink())}
              className="px-6 py-3 rounded-lg bg-purple-500 hover:bg-purple-600 text-white transition-colors"
            >
              Copy Link
            </motion.button>
          </div>
        </div>

        <div className="mt-8 p-6 rounded-lg bg-purple-900/30 backdrop-blur-sm">
          <h3 className="text-xl font-semibold mb-4 text-purple-200">
            How It Works
          </h3>
          <ul className="space-y-4 text-purple-100">
            <li className="flex items-start gap-3">
              <span className="text-purple-400">1.</span>
              <span>Share your unique invite link with friends</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-400">2.</span>
              <span>When they join using your link, they'll get special starter avatars</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-400">3.</span>
              <span>Track your invites and see who's active in your network</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AffiliateSystem; 