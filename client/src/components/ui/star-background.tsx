import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface StarBackgroundProps {
  starCount?: number;
}

const StarBackground = ({ starCount = 100 }: StarBackgroundProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clean up existing stars
    container.innerHTML = '';

    // Create stars
    for (let i = 0; i < starCount; i++) {
      const star = document.createElement('div');
      
      // Add styling
      star.style.position = 'absolute';
      star.style.width = `${Math.random() * 2 + 1}px`;
      star.style.height = star.style.width;
      star.style.backgroundColor = 'white';
      star.style.borderRadius = '50%';
      
      // Random positioning
      star.style.top = `${Math.random() * 100}%`;
      star.style.left = `${Math.random() * 100}%`;
      
      // Random opacity
      star.style.opacity = `${Math.random() * 0.8 + 0.2}`;
      
      // Animation with random duration
      star.style.animation = `cosmic-pulse ${Math.random() * 3 + 2}s infinite`;
      
      container.appendChild(star);
    }

    // Cleanup function
    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [starCount]);

  return (
    <motion.div
      ref={containerRef}
      className="fixed inset-0 z-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    />
  );
};

export default StarBackground;
