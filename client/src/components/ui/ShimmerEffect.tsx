import React from 'react';
import { motion } from 'framer-motion';

interface ShimmerEffectProps {
  children: React.ReactNode;
  className?: string;
  shimmerColor?: string;
}

const ShimmerEffect: React.FC<ShimmerEffectProps> = ({
  children,
  className = '',
  shimmerColor = 'rgba(255, 255, 255, 0.1)',
}) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {children}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(90deg, transparent, ${shimmerColor}, transparent)`,
        }}
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
};

export default ShimmerEffect; 