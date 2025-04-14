import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStar, FaHeart, FaMusic, FaLightbulb } from 'react-icons/fa';

interface AvatarEffectsProps {
  mood: string;
  isActive: boolean;
  position: { x: number; y: number };
  onEffectComplete?: () => void;
}

const MOOD_COLORS = {
  happy: '#FFD700',
  excited: '#FF4500',
  calm: '#87CEEB',
  creative: '#9370DB',
  default: '#6A0DAD'
};

const MOOD_ICONS = {
  happy: FaHeart,
  excited: FaStar,
  calm: FaMusic,
  creative: FaLightbulb,
  default: FaStar
};

export const AvatarEffects: React.FC<AvatarEffectsProps> = ({
  mood,
  isActive,
  position,
  onEffectComplete
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
  }>>([]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 200;
    canvas.height = 200;

    // Create particles
    if (isActive) {
      for (let i = 0; i < 50; i++) {
        particles.current.push({
          x: position.x,
          y: position.y,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          size: Math.random() * 3 + 1,
          color: MOOD_COLORS[mood as keyof typeof MOOD_COLORS] || MOOD_COLORS.default
        });
      }
    }

    // Animation loop
    let animationFrameId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.current.forEach((particle, index) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.size *= 0.98;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();

        if (particle.size < 0.1) {
          particles.current.splice(index, 1);
        }
      });

      if (particles.current.length > 0) {
        animationFrameId = requestAnimationFrame(animate);
      } else if (onEffectComplete) {
        onEffectComplete();
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isActive, mood, position, onEffectComplete]);

  const Icon = MOOD_ICONS[mood as keyof typeof MOOD_ICONS] || MOOD_ICONS.default;
  const color = MOOD_COLORS[mood as keyof typeof MOOD_COLORS] || MOOD_COLORS.default;

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          transform: `translate(${position.x - 100}px, ${position.y - 100}px)`
        }}
      />
      <motion.div
        initial={{ scale: 1 }}
        animate={{ scale: isActive ? 1.1 : 1 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0"
        style={{
          boxShadow: isActive ? `0 0 20px ${color}` : 'none',
          borderRadius: '50%'
        }}
      />
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute -top-8 left-1/2 transform -translate-x-1/2"
          >
            <Icon className="text-2xl" style={{ color }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 