import { motion } from 'framer-motion';
import { useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

interface BlueprintAvatarCardProps {
  name: string;
  tagline: string;
  realm: string;
  tooltipMessage: string;
  imagePath: string;
  onChoose: (avatarName: string) => void;
}

const BlueprintAvatarCard = ({
  name,
  tagline,
  realm,
  tooltipMessage,
  imagePath,
  onChoose
}: BlueprintAvatarCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <motion.div
            className="relative rounded-2xl overflow-hidden backdrop-blur-sm border border-primary/30 
                     bg-gradient-to-b from-background/80 to-primary/10 shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ 
              scale: 1.02, 
              boxShadow: '0 0 25px rgba(139, 92, 246, 0.5)'
            }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
          >
            {/* Particle/Star Effect Background */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/40 via-transparent to-transparent"></div>
              {isHovered && (
                <>
                  <motion.div 
                    className="absolute h-1 w-1 rounded-full bg-primary/80"
                    animate={{
                      top: ['10%', '80%', '30%'],
                      left: ['80%', '10%', '50%'],
                      opacity: [0.7, 0.4, 0.7]
                    }}
                    transition={{ 
                      duration: 5, 
                      repeat: Infinity, 
                      repeatType: 'reverse' 
                    }}
                  />
                  <motion.div 
                    className="absolute h-1 w-1 rounded-full bg-primary/80"
                    animate={{
                      top: ['50%', '20%', '70%'],
                      left: ['20%', '70%', '30%'],
                      opacity: [0.5, 0.7, 0.5]
                    }}
                    transition={{ 
                      duration: 6, 
                      repeat: Infinity, 
                      repeatType: 'reverse' 
                    }}
                  />
                  <motion.div 
                    className="absolute h-1 w-1 rounded-full bg-primary/80"
                    animate={{
                      top: ['30%', '60%', '40%'],
                      left: ['50%', '30%', '70%'],
                      opacity: [0.6, 0.3, 0.6]
                    }}
                    transition={{ 
                      duration: 7, 
                      repeat: Infinity, 
                      repeatType: 'reverse' 
                    }}
                  />
                </>
              )}
            </div>

            {/* Blueprint Card Content */}
            <div className="relative z-10 flex flex-col p-4 h-full">
              <div className="mb-4 rounded-xl overflow-hidden border-2 border-primary/20 aspect-square">
                <img 
                  src={imagePath} 
                  alt={name} 
                  className={`w-full h-full object-cover transition-transform duration-500 ${name.includes('Helios') ? 'object-top' : ''}`}
                  style={{
                    transform: isHovered ? 'scale(1.05)' : 'scale(1)'
                  }}
                />
              </div>
              
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1 aura-gradient-text">{name}</h3>
                <p className="text-sm text-foreground/70 mb-1">{tagline}</p>
                <div className="mb-4 flex items-center">
                  <span className="text-xs px-3 py-1 rounded-full bg-primary/20 text-foreground/80">
                    {realm}
                  </span>
                </div>
                <div className="mt-auto">
                  <Button 
                    onClick={() => onChoose(name)}
                    className="w-full mystical-glow rounded-full relative overflow-hidden group"
                  >
                    <span className="relative z-10">Choose</span>
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-purple-600 to-primary opacity-0 group-hover:opacity-100"
                      initial={{ x: '-100%' }}
                      animate={isHovered ? { x: '100%' } : { x: '-100%' }}
                      transition={{ duration: 1, repeat: isHovered ? Infinity : 0 }}
                    />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="bg-black/80 backdrop-blur-md border-primary/30 text-foreground p-3 max-w-[200px] text-center">
          <p className="text-sm italic">{tooltipMessage}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default BlueprintAvatarCard;