import { create } from 'zustand';
import { DeviceType } from '../types/device';

interface EmotionState {
  currentEmotion: string | null;
  emotionIntensity: number;
  deviceType: DeviceType;
  detectedKeywords: string[];
  detectedEmojis: string[];
  animationQueue: string[];
  isAnimating: boolean;
  setDeviceType: (type: DeviceType) => void;
  detectEmotion: (text: string) => void;
  queueAnimation: (emotion: string) => void;
  clearAnimationQueue: () => void;
}

// Emotion keywords and their corresponding emotions
const emotionKeywords = {
  happy: ['happy', 'joy', 'excited', 'great', 'wonderful', 'amazing', 'love', 'loved', 'enjoy'],
  sad: ['sad', 'unhappy', 'sorry', 'disappointed', 'upset', 'hurt', 'cry', 'tears'],
  excited: ['excited', 'thrilled', 'wow', 'awesome', 'incredible', 'amazing', 'fantastic'],
  confused: ['confused', 'unsure', 'question', 'what', 'how', 'why', 'huh', '?'],
  flirty: ['flirt', 'wink', 'blush', 'cute', 'handsome', 'beautiful', 'attractive'],
  annoyed: ['annoyed', 'frustrated', 'angry', 'mad', 'upset', 'irritated', 'bother'],
  proud: ['proud', 'accomplished', 'achieved', 'success', 'win', 'victory', 'champion'],
  playful: ['playful', 'fun', 'joke', 'laugh', 'tease', 'silly', 'goofy']
};

// Emoji to emotion mapping
const emojiEmotions = {
  '😊': 'happy',
  '😢': 'sad',
  '😃': 'excited',
  '😕': 'confused',
  '😘': 'flirty',
  '😠': 'annoyed',
  '😎': 'proud',
  '😜': 'playful'
};

// Animation configurations based on device type
const animationConfigs = {
  mobile: {
    happy: { duration: 1000, type: 'simple', rig: 'head' },
    sad: { duration: 1500, type: 'simple', rig: 'head' },
    excited: { duration: 1200, type: 'simple', rig: 'head' },
    confused: { duration: 1000, type: 'simple', rig: 'head' },
    flirty: { duration: 1000, type: 'simple', rig: 'head' },
    annoyed: { duration: 1000, type: 'simple', rig: 'head' },
    proud: { duration: 1000, type: 'simple', rig: 'head' },
    playful: { duration: 1000, type: 'simple', rig: 'head' }
  },
  desktop: {
    happy: { duration: 1500, type: 'medium', rig: 'full' },
    sad: { duration: 2000, type: 'medium', rig: 'full' },
    excited: { duration: 1800, type: 'medium', rig: 'full' },
    confused: { duration: 1500, type: 'medium', rig: 'full' },
    flirty: { duration: 1500, type: 'medium', rig: 'full' },
    annoyed: { duration: 1500, type: 'medium', rig: 'full' },
    proud: { duration: 1500, type: 'medium', rig: 'full' },
    playful: { duration: 1500, type: 'medium', rig: 'full' }
  },
  vr: {
    happy: { duration: 2000, type: 'complex', rig: 'full', particles: true, sound: true },
    sad: { duration: 2500, type: 'complex', rig: 'full', particles: true, sound: true },
    excited: { duration: 2200, type: 'complex', rig: 'full', particles: true, sound: true },
    confused: { duration: 2000, type: 'complex', rig: 'full', particles: true, sound: true },
    flirty: { duration: 2000, type: 'complex', rig: 'full', particles: true, sound: true },
    annoyed: { duration: 2000, type: 'complex', rig: 'full', particles: true, sound: true },
    proud: { duration: 2000, type: 'complex', rig: 'full', particles: true, sound: true },
    playful: { duration: 2000, type: 'complex', rig: 'full', particles: true, sound: true }
  }
};

export const useEmotionStore = create<EmotionState>((set, get) => ({
  currentEmotion: null,
  emotionIntensity: 0,
  deviceType: 'desktop',
  detectedKeywords: [],
  detectedEmojis: [],
  animationQueue: [],
  isAnimating: false,

  setDeviceType: (type: DeviceType) => {
    set({ deviceType: type });
  },

  detectEmotion: (text: string) => {
    const keywords: string[] = [];
    const emojis: string[] = [];
    let detectedEmotion: string | null = null;
    let maxIntensity = 0;

    // Check for keywords
    Object.entries(emotionKeywords).forEach(([emotion, words]) => {
      const matches = words.filter(word => 
        text.toLowerCase().includes(word.toLowerCase())
      );
      if (matches.length > 0) {
        keywords.push(...matches);
        if (matches.length > maxIntensity) {
          maxIntensity = matches.length;
          detectedEmotion = emotion;
        }
      }
    });

    // Check for emojis
    Object.entries(emojiEmotions).forEach(([emoji, emotion]) => {
      if (text.includes(emoji)) {
        emojis.push(emoji);
        if (!detectedEmotion) {
          detectedEmotion = emotion;
        }
      }
    });

    set({
      detectedKeywords: keywords,
      detectedEmojis: emojis,
      currentEmotion: detectedEmotion,
      emotionIntensity: Math.min(maxIntensity / 3, 1) // Normalize intensity
    });

    if (detectedEmotion) {
      get().queueAnimation(detectedEmotion);
    }
  },

  queueAnimation: (emotion: string) => {
    const { animationQueue, isAnimating } = get();
    const newQueue = [...animationQueue, emotion];
    set({ animationQueue: newQueue });

    if (!isAnimating) {
      get().playNextAnimation();
    }
  },

  playNextAnimation: async () => {
    const { animationQueue, deviceType } = get();
    if (animationQueue.length === 0) {
      set({ isAnimating: false });
      return;
    }

    set({ isAnimating: true });
    const emotion = animationQueue[0];
    const config = animationConfigs[deviceType][emotion];

    // Play animation based on device type
    switch (deviceType) {
      case 'mobile':
        await playMobileAnimation(emotion, config);
        break;
      case 'desktop':
        await playDesktopAnimation(emotion, config);
        break;
      case 'vr':
        await playVRAnimation(emotion, config);
        break;
    }

    // Remove the played animation from queue
    set(state => ({
      animationQueue: state.animationQueue.slice(1),
      isAnimating: false
    }));

    // Play next animation if available
    get().playNextAnimation();
  },

  clearAnimationQueue: () => {
    set({ animationQueue: [], isAnimating: false });
  }
}));

// Animation player functions
async function playMobileAnimation(emotion: string, config: any) {
  // Simple head-based animations for mobile
  const avatar = document.querySelector('.avatar');
  if (!avatar) return;

  switch (emotion) {
    case 'happy':
      avatar.classList.add('animate-head-nod');
      break;
    case 'sad':
      avatar.classList.add('animate-head-tilt');
      break;
    // Add more cases for other emotions
  }

  await new Promise(resolve => setTimeout(resolve, config.duration));
  avatar.classList.remove('animate-head-nod', 'animate-head-tilt');
}

async function playDesktopAnimation(emotion: string, config: any) {
  // Medium complexity animations for desktop
  const avatar = document.querySelector('.avatar');
  if (!avatar) return;

  switch (emotion) {
    case 'happy':
      avatar.classList.add('animate-smile', 'animate-hand-wave');
      break;
    case 'sad':
      avatar.classList.add('animate-frown', 'animate-head-down');
      break;
    // Add more cases for other emotions
  }

  await new Promise(resolve => setTimeout(resolve, config.duration));
  avatar.classList.remove('animate-smile', 'animate-hand-wave', 'animate-frown', 'animate-head-down');
}

async function playVRAnimation(emotion: string, config: any) {
  // Complex animations for VR
  const avatar = document.querySelector('.avatar');
  if (!avatar) return;

  // Add particle effects if configured
  if (config.particles) {
    const particles = document.createElement('div');
    particles.className = 'particle-effect';
    avatar.appendChild(particles);
  }

  // Add sound if configured
  if (config.sound) {
    const sound = new Audio(`/sounds/emotions/${emotion}.mp3`);
    sound.play();
  }

  switch (emotion) {
    case 'happy':
      avatar.classList.add('animate-full-smile', 'animate-jump', 'animate-wave');
      break;
    case 'sad':
      avatar.classList.add('animate-full-frown', 'animate-sit', 'animate-cry');
      break;
    // Add more cases for other emotions
  }

  await new Promise(resolve => setTimeout(resolve, config.duration));
  avatar.classList.remove(
    'animate-full-smile', 'animate-jump', 'animate-wave',
    'animate-full-frown', 'animate-sit', 'animate-cry'
  );

  // Clean up particles
  const particles = avatar.querySelector('.particle-effect');
  if (particles) {
    particles.remove();
  }
} 