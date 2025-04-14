import { motion, AnimatePresence } from 'framer-motion';
import { FaCoins, FaComment, FaVolumeUp } from 'react-icons/fa';
import { useSound } from '@/hooks/useSound';
import { useCoinSystem } from '@/hooks/useCoinSystem';
import { useChat } from '@/hooks/useChat';

interface InteractionConfig {
  type: 'emoji' | 'avatar' | 'sound' | 'visual';
  position: { x: number; y: number };
  content: string | { url: string; type: string };
  mood?: string;
  coins?: number;
  message?: string;
  soundUrl?: string;
}

export class InteractionService {
  private static instance: InteractionService;
  private soundManager: ReturnType<typeof useSound>;
  private coinSystem: ReturnType<typeof useCoinSystem>;
  private chatSystem: ReturnType<typeof useChat>;

  private constructor() {
    this.soundManager = useSound();
    this.coinSystem = useCoinSystem();
    this.chatSystem = useChat();
  }

  public static getInstance(): InteractionService {
    if (!InteractionService.instance) {
      InteractionService.instance = new InteractionService();
    }
    return InteractionService.instance;
  }

  public async handleInteraction(config: InteractionConfig): Promise<void> {
    const { type, position, content, mood, coins, message, soundUrl } = config;

    // Play sound if provided
    if (soundUrl) {
      await this.soundManager.playSound(soundUrl);
    }

    // Award coins if specified
    if (coins) {
      await this.coinSystem.addCoins(coins);
    }

    // Send message to chat if provided
    if (message) {
      await this.chatSystem.sendMessage(message);
    }

    // Handle different interaction types
    switch (type) {
      case 'emoji':
        await this.handleEmojiInteraction(content as string, position);
        break;
      case 'avatar':
        await this.handleAvatarInteraction(content as { url: string; type: string }, position);
        break;
      case 'sound':
        await this.handleSoundInteraction(content as { url: string; type: string });
        break;
      case 'visual':
        await this.handleVisualInteraction(content as { url: string; type: string }, position);
        break;
    }

    // Record mood if provided
    if (mood) {
      await this.recordMood(mood);
    }
  }

  private async handleEmojiInteraction(emoji: string, position: { x: number; y: number }): Promise<void> {
    // Create floating emoji animation
    const emojiElement = document.createElement('div');
    emojiElement.className = 'floating-emoji';
    emojiElement.textContent = emoji;
    emojiElement.style.left = `${position.x}px`;
    emojiElement.style.top = `${position.y}px`;

    document.body.appendChild(emojiElement);

    // Animate emoji
    const animation = emojiElement.animate(
      [
        { transform: 'scale(1)', opacity: 1 },
        { transform: 'scale(1.5)', opacity: 0 }
      ],
      {
        duration: 1000,
        easing: 'ease-out'
      }
    );

    animation.onfinish = () => {
      document.body.removeChild(emojiElement);
    };
  }

  private async handleAvatarInteraction(
    avatar: { url: string; type: string },
    position: { x: number; y: number }
  ): Promise<void> {
    // Create avatar popup
    const popup = document.createElement('div');
    popup.className = 'avatar-popup';
    popup.style.left = `${position.x}px`;
    popup.style.top = `${position.y}px`;

    const img = document.createElement('img');
    img.src = avatar.url;
    img.alt = 'Avatar';
    popup.appendChild(img);

    document.body.appendChild(popup);

    // Animate popup
    const animation = popup.animate(
      [
        { transform: 'scale(0)', opacity: 0 },
        { transform: 'scale(1)', opacity: 1 },
        { transform: 'scale(1)', opacity: 1 },
        { transform: 'scale(0)', opacity: 0 }
      ],
      {
        duration: 2000,
        easing: 'ease-in-out'
      }
    );

    animation.onfinish = () => {
      document.body.removeChild(popup);
    };
  }

  private async handleSoundInteraction(sound: { url: string; type: string }): Promise<void> {
    await this.soundManager.playSound(sound.url);
  }

  private async handleVisualInteraction(
    visual: { url: string; type: string },
    position: { x: number; y: number }
  ): Promise<void> {
    // Create visual effect
    const effect = document.createElement('div');
    effect.className = 'visual-effect';
    effect.style.left = `${position.x}px`;
    effect.style.top = `${position.y}px`;

    if (visual.type.startsWith('image/')) {
      const img = document.createElement('img');
      img.src = visual.url;
      effect.appendChild(img);
    } else {
      effect.style.background = visual.url;
    }

    document.body.appendChild(effect);

    // Animate effect
    const animation = effect.animate(
      [
        { transform: 'scale(0)', opacity: 0 },
        { transform: 'scale(1)', opacity: 1 },
        { transform: 'scale(1)', opacity: 1 },
        { transform: 'scale(0)', opacity: 0 }
      ],
      {
        duration: 2000,
        easing: 'ease-in-out'
      }
    );

    animation.onfinish = () => {
      document.body.removeChild(effect);
    };
  }

  private async recordMood(mood: string): Promise<void> {
    // Record mood in the system
    await this.chatSystem.sendMessage(`Mood recorded: ${mood}`);
  }
}

// Export a hook for easy use in components
export const useInteraction = () => {
  const interactionService = InteractionService.getInstance();

  const handleClick = async (config: InteractionConfig) => {
    await interactionService.handleInteraction(config);
  };

  const handleTap = async (config: InteractionConfig) => {
    // Add touch-specific handling if needed
    await interactionService.handleInteraction(config);
  };

  return {
    handleClick,
    handleTap
  };
}; 