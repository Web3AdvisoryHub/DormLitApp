import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type Mood = 'clarity' | 'euphoria' | 'longing' | 'serenity' | 'nostalgia';

interface MoodTheme {
  primaryColor: string;
  secondaryColor: string;
  ambientTone: string;
  description: string;
}

const MOOD_THEMES: Record<Mood, MoodTheme> = {
  clarity: {
    primaryColor: '#4A90E2',
    secondaryColor: '#E3F2FD',
    ambientTone: 'calm',
    description: 'Clear thoughts, focused mind'
  },
  euphoria: {
    primaryColor: '#FF6B6B',
    secondaryColor: '#FFE3E3',
    ambientTone: 'energetic',
    description: 'Joyful energy, vibrant spirit'
  },
  longing: {
    primaryColor: '#9B59B6',
    secondaryColor: '#F3E5F5',
    ambientTone: 'melancholic',
    description: 'Deep emotions, wistful dreams'
  },
  serenity: {
    primaryColor: '#2ECC71',
    secondaryColor: '#E8F5E9',
    ambientTone: 'peaceful',
    description: 'Tranquil mind, balanced soul'
  },
  nostalgia: {
    primaryColor: '#F39C12',
    secondaryColor: '#FFF3E0',
    ambientTone: 'warm',
    description: 'Sweet memories, golden moments'
  }
};

interface MoodEngineProps {
  onMoodChange?: (mood: Mood, theme: MoodTheme) => void;
  className?: string;
}

export function MoodEngine({ onMoodChange, className }: MoodEngineProps) {
  const [selectedMood, setSelectedMood] = useState<Mood>('clarity');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (onMoodChange) {
      onMoodChange(selectedMood, MOOD_THEMES[selectedMood]);
    }
  }, [selectedMood, onMoodChange]);

  return (
    <div className={cn("relative", className)}>
      <motion.div
        className="flex flex-col gap-2 p-4 rounded-lg bg-background/80 backdrop-blur-sm"
        initial={false}
        animate={{ height: isExpanded ? 'auto' : '48px' }}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Mood Engine</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </Button>
        </div>

        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 md:grid-cols-5 gap-2"
          >
            {(Object.keys(MOOD_THEMES) as Mood[]).map((mood) => (
              <motion.button
                key={mood}
                className={cn(
                  "p-2 rounded-lg text-sm transition-colors",
                  "hover:bg-primary/10",
                  selectedMood === mood
                    ? "bg-primary/20 text-primary"
                    : "bg-muted/50"
                )}
                onClick={() => setSelectedMood(mood)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div
                  className="w-6 h-6 rounded-full mx-auto mb-1"
                  style={{ backgroundColor: MOOD_THEMES[mood].primaryColor }}
                />
                <span className="capitalize">{mood}</span>
              </motion.button>
            ))}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-muted-foreground mt-2"
        >
          {MOOD_THEMES[selectedMood].description}
        </motion.div>
      </motion.div>
    </div>
  );
} 