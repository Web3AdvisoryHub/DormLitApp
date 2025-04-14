import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface OnboardingFlowProps {
  onComplete: () => void;
}

const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const [step, setStep] = useState(0);
  const [showContinue, setShowContinue] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (step < 2) {
        setStep(step + 1);
      } else {
        setShowContinue(true);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [step]);

  const messages = [
    "Welcome to your mystical journey...",
    "Your avatar is your guide through the realms of self-discovery...",
    "Let's begin by exploring your current mood..."
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <AnimatePresence mode="wait">
          {!showContinue ? (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl font-bold aura-gradient-text"
            >
              {messages[step]}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Button
                onClick={onComplete}
                className="bg-primary text-foreground px-8 py-6 text-xl rounded-full hover:bg-primary/80 transition-all duration-300 font-medium mystical-glow"
              >
                Continue to Mood Selection
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OnboardingFlow; 