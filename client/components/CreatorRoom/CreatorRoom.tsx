import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import { database } from '@/services/database';
import { RoomMood } from '@/shared/database.types';
import { CoinSystem } from './CoinSystem';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHome, FaArrowLeft } from 'react-icons/fa';
import { AvatarInteraction } from './AvatarInteraction';
import { AvatarChat } from './AvatarChat';
import { cn } from '@/lib/utils';
import { AvatarEffects } from './AvatarEffects';
import { GroupInteraction } from './GroupInteraction';
import { useSocket } from '@/hooks/useSocket';
import { MoodSystem } from './MoodSystem';
import { AvatarSystem } from './AvatarSystem';
import { RoomLayout } from './RoomLayout';
import { RoomSettings } from './RoomSettings';
import { RoomAnalytics } from './RoomAnalytics';
import { RoomTournaments } from './RoomTournaments';
import { RoomAchievements } from './RoomAchievements';
import { RoomSoundSettings } from './RoomSoundSettings';
import { RoomAccessibility } from './RoomAccessibility';
import { RoomPerformance } from './RoomPerformance';
import { RoomGameState } from './RoomGameState';
import { RoomGameEvents } from './RoomGameEvents';
import { RoomLayouts } from './RoomLayouts';
import { RoomGameModes } from './RoomGameModes';
import { RoomGameSettings } from './RoomGameSettings';
import { RoomGameControls } from './RoomGameControls';
import { RoomGameUI } from './RoomGameUI';
import { RoomGameHUD } from './RoomGameHUD';
import { RoomGameChat } from './RoomGameChat';
import { RoomGameLeaderboard } from './RoomGameLeaderboard';
import { RoomGameInventory } from './RoomGameInventory';
import { RoomGameShop } from './RoomGameShop';
import { RoomGameAchievements } from './RoomGameAchievements';
import { RoomGameTournaments } from './RoomGameTournaments';
import { RoomGameAnalytics } from './RoomGameAnalytics';
import { RoomGameSettings as RoomGameSettingsComponent } from './RoomGameSettings';
import { RoomGameControls as RoomGameControlsComponent } from './RoomGameControls';
import { RoomGameUI as RoomGameUIComponent } from './RoomGameUI';
import { RoomGameHUD as RoomGameHUDComponent } from './RoomGameHUD';
import { RoomGameChat as RoomGameChatComponent } from './RoomGameChat';
import { RoomGameLeaderboard as RoomGameLeaderboardComponent } from './RoomGameLeaderboard';
import { RoomGameInventory as RoomGameInventoryComponent } from './RoomGameInventory';
import { RoomGameShop as RoomGameShopComponent } from './RoomGameShop';
import { RoomGameAchievements as RoomGameAchievementsComponent } from './RoomGameAchievements';
import { RoomGameTournaments as RoomGameTournamentsComponent } from './RoomGameTournaments';
import { RoomGameAnalytics as RoomGameAnalyticsComponent } from './RoomGameAnalytics';

export const CreatorRoom: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [moods, setMoods] = useState<RoomMood[]>([]);
  const [currentMood, setCurrentMood] = useState<string>('');
  const [moodIntensity, setMoodIntensity] = useState<number>(5);
  const [showMessage, setShowMessage] = useState<{ text: string; x: number; y: number } | null>(null);
  const coinSystemRef = useRef<{ handleMoodReward: (amount: number) => void }>(null);
  const [showAvatarChat, setShowAvatarChat] = useState(false);
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null);
  const [avatarMood, setAvatarMood] = useState<string>('happy');
  const [activeAvatars, setActiveAvatars] = useState<Array<{
    id: string;
    url: string;
    mood: string;
    position: { x: number; y: number };
  }>>([]);

  const {
    isConnected,
    roomUsers,
    roomInteractions,
    coinTransactions,
    moodUpdates,
    sendRoomInteraction,
    sendCoinTransaction,
    sendMoodUpdate,
  } = useSocket('creator-room');

  const [activeTab, setActiveTab] = useState('layout');
  const [showSettings, setShowSettings] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showTournaments, setShowTournaments] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showSoundSettings, setShowSoundSettings] = useState(false);
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [showPerformance, setShowPerformance] = useState(false);
  const [showGameState, setShowGameState] = useState(false);
  const [showGameEvents, setShowGameEvents] = useState(false);
  const [showLayouts, setShowLayouts] = useState(false);
  const [showGameModes, setShowGameModes] = useState(false);
  const [showGameSettings, setShowGameSettings] = useState(false);
  const [showGameControls, setShowGameControls] = useState(false);
  const [showGameUI, setShowGameUI] = useState(false);
  const [showGameHUD, setShowGameHUD] = useState(false);
  const [showGameChat, setShowGameChat] = useState(false);
  const [showGameLeaderboard, setShowGameLeaderboard] = useState(false);
  const [showGameInventory, setShowGameInventory] = useState(false);
  const [showGameShop, setShowGameShop] = useState(false);
  const [showGameAchievements, setShowGameAchievements] = useState(false);
  const [showGameTournaments, setShowGameTournaments] = useState(false);
  const [showGameAnalytics, setShowGameAnalytics] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Load user's moods
    const loadMoods = async () => {
      const userMoods = await database.getUserMoods(user.id);
      setMoods(userMoods);
    };

    loadMoods();
  }, [user]);

  useEffect(() => {
    if (isConnected && user?.id) {
      // Record initial room join
      sendRoomInteraction({
        userId: user.id,
        type: 'room_join',
        details: { timestamp: new Date() },
      });
    }
  }, [isConnected, user?.id, sendRoomInteraction]);

  const handleMoodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !currentMood) return;

    try {
      const newMood = await database.recordMood(
        'creator-room',
        user.id,
        currentMood,
        moodIntensity
      );
      setMoods([...moods, newMood]);
      
      // Award coins based on mood intensity
      const reward = Math.floor(moodIntensity * 2);
      coinSystemRef.current?.handleMoodReward(reward);
      
      setCurrentMood('');
      setMoodIntensity(5);
    } catch (error) {
      console.error('Failed to record mood:', error);
    }
  };

  const handleReturnToMain = () => {
    router.push('/manifesto');
  };

  const handleAttractionClick = (event: React.MouseEvent) => {
    const messages = [
      "Welcome to my realm! ✨",
      "Thanks for visiting! 💫",
      "Make yourself at home! 🏠",
      "Enjoy your stay! 🌟"
    ];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    setShowMessage({
      text: randomMessage,
      x: event.clientX,
      y: event.clientY
    });

    setTimeout(() => setShowMessage(null), 2000);
  };

  const handleAvatarMoodChange = (avatarId: string, mood: string) => {
    setActiveAvatars(prev => prev.map(avatar => 
      avatar.id === avatarId ? { ...avatar, mood } : avatar
    ));
  };

  const handleGroupComplete = () => {
    setActiveAvatars([]);
  };

  const handleMoodUpdate = (mood: string, intensity: number) => {
    if (user?.id) {
      sendMoodUpdate({
        userId: user.id,
        mood,
        intensity,
      });
    }
  };

  const handleCoinTransaction = (amount: number, type: 'earn' | 'spend', source: string) => {
    if (user?.id) {
      sendCoinTransaction({
        userId: user.id,
        amount,
        type,
        source,
      });
    }
  };

  const handleRoomInteraction = (type: string, details: any) => {
    if (user?.id) {
      sendRoomInteraction({
        userId: user.id,
        type,
        details,
      });
    }
  };

  return (
    <div className={cn('relative min-h-screen bg-gradient-to-b from-purple-900 to-black', 'grid grid-cols-3 gap-4')}>
      {/* Return Button */}
      <motion.button
        onClick={handleReturnToMain}
        className="fixed top-4 left-4 bg-black/50 p-2 rounded-lg text-white flex items-center gap-2 z-50"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <FaArrowLeft />
        <span>Return to DormLit</span>
      </motion.button>

      {/* Coin System */}
      <CoinSystem roomId="creator-room" ref={coinSystemRef} />

      {/* Interactive Background */}
      <div 
        className="absolute inset-0 cursor-pointer"
        onClick={handleAttractionClick}
      >
        {/* Add floating elements here */}
        <motion.div
          className="absolute top-1/4 left-1/4 text-4xl"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ✨
        </motion.div>
        <motion.div
          className="absolute top-1/3 right-1/4 text-4xl"
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          💫
        </motion.div>
      </div>

      {/* Mood Logging */}
      <motion.div
        className="fixed bottom-4 left-4 bg-black/50 p-4 rounded-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <form onSubmit={handleMoodSubmit} className="flex flex-col gap-2">
          <input
            type="text"
            value={currentMood}
            onChange={(e) => setCurrentMood(e.target.value)}
            placeholder="How are you feeling?"
            className="bg-white/10 text-white px-4 py-2 rounded"
          />
          <div className="flex items-center gap-2">
            <span className="text-white">Intensity:</span>
            <input
              type="range"
              min="1"
              max="10"
              value={moodIntensity}
              onChange={(e) => setMoodIntensity(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-white">{moodIntensity}</span>
          </div>
          <button
            type="submit"
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
          >
            Log Mood
          </button>
        </form>
      </motion.div>

      {/* Mood History */}
      <div className="fixed bottom-4 right-4 bg-black/50 p-4 rounded-lg max-h-48 overflow-y-auto">
        <h3 className="text-white font-bold mb-2">Recent Moods</h3>
        <div className="flex flex-col gap-2">
          {moods.map((mood) => (
            <div key={mood.id} className="flex items-center gap-2">
              <span className="text-white">{mood.mood}</span>
              <div className="flex-1 h-2 bg-white/20 rounded">
                <div
                  className="h-full bg-purple-600 rounded"
                  style={{ width: `${(mood.intensity / 10) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Message Popup */}
      <AnimatePresence>
        {showMessage && (
          <motion.div
            className="fixed pointer-events-none"
            initial={{ opacity: 0, y: 0, x: showMessage.x }}
            animate={{ opacity: 1, y: -50, x: showMessage.x }}
            exit={{ opacity: 0 }}
            style={{ top: showMessage.y }}
          >
            <div className="bg-black/50 text-white px-4 py-2 rounded-lg">
              {showMessage.text}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Section */}
      <div className="col-span-2 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {moods.map((mood) => (
            <div key={mood.id} className="flex items-start space-x-2">
              <AvatarInteraction
                avatarId={mood.userId}
                avatarUrl={mood.avatarUrl}
                position={{ x: 0, y: 0 }}
                onChatOpen={() => {
                  setSelectedAvatarId(mood.userId);
                  setShowAvatarChat(true);
                }}
                onMoodChange={(mood) => setAvatarMood(mood)}
              />
              <div>
                <p className="font-semibold">{mood.username}</p>
                <p>{mood.mood}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(mood.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* NFT Items Section */}
      <div className="col-span-1 bg-gray-900 p-4 rounded-lg overflow-y-auto">
        {/* ... existing NFT items code ... */}
      </div>

      {/* Avatar Chat Modal */}
      {showAvatarChat && selectedAvatarId && (
        <AvatarChat
          avatarId={selectedAvatarId}
          userId={selectedAvatarId}
          mood={avatarMood}
          onClose={() => {
            setShowAvatarChat(false);
            setSelectedAvatarId(null);
          }}
        />
      )}

      {/* Avatar Effects */}
      {activeAvatars.map(avatar => (
        <AvatarEffects
          key={avatar.id}
          mood={avatar.mood}
          isActive={true}
          position={avatar.position}
        />
      ))}

      {/* Group Interaction */}
      {activeAvatars.length > 1 && (
        <GroupInteraction
          avatars={activeAvatars}
          onMoodChange={handleAvatarMoodChange}
          onGroupComplete={handleGroupComplete}
        />
      )}

      <div className="creator-room-header">
        <h1>Creator Room</h1>
        <div className="creator-room-controls">
          <button onClick={() => setShowSettings(!showSettings)}>Settings</button>
          <button onClick={() => setShowAnalytics(!showAnalytics)}>Analytics</button>
          <button onClick={() => setShowTournaments(!showTournaments)}>Tournaments</button>
          <button onClick={() => setShowAchievements(!showAchievements)}>Achievements</button>
          <button onClick={() => setShowSoundSettings(!showSoundSettings)}>Sound</button>
          <button onClick={() => setShowAccessibility(!showAccessibility)}>Accessibility</button>
          <button onClick={() => setShowPerformance(!showPerformance)}>Performance</button>
        </div>
      </div>

      <div className="creator-room-content">
        <div className="creator-room-sidebar">
          <button onClick={() => setActiveTab('layout')}>Layout</button>
          <button onClick={() => setActiveTab('game')}>Game</button>
          <button onClick={() => setActiveTab('analytics')}>Analytics</button>
          <button onClick={() => setActiveTab('settings')}>Settings</button>
        </div>

        <div className="creator-room-main">
          {activeTab === 'layout' && (
            <>
              <RoomLayout roomId="creator-room" />
              <RoomLayouts roomId="creator-room" />
            </>
          )}

          {activeTab === 'game' && (
            <>
              <RoomGameState roomId="creator-room" />
              <RoomGameEvents roomId="creator-room" />
              <RoomGameModes roomId="creator-room" />
              <RoomGameSettings roomId="creator-room" />
              <RoomGameControls roomId="creator-room" />
              <RoomGameUI roomId="creator-room" />
              <RoomGameHUD roomId="creator-room" />
              <RoomGameChat roomId="creator-room" />
              <RoomGameLeaderboard roomId="creator-room" />
              <RoomGameInventory roomId="creator-room" />
              <RoomGameShop roomId="creator-room" />
              <RoomGameAchievements roomId="creator-room" />
              <RoomGameTournaments roomId="creator-room" />
              <RoomGameAnalytics roomId="creator-room" />
            </>
          )}

          {activeTab === 'analytics' && (
            <>
              <RoomAnalytics roomId="creator-room" />
              <RoomPerformance roomId="creator-room" />
            </>
          )}

          {activeTab === 'settings' && (
            <>
              <RoomSettings roomId="creator-room" />
              <RoomSoundSettings roomId="creator-room" />
              <RoomAccessibility roomId="creator-room" />
            </>
          )}
        </div>

    </div>
  );
}; 