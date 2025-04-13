import { motion } from 'framer-motion';
import { useState } from 'react';
import { useLocation } from 'wouter';
import { Helmet } from 'react-helmet';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import StarBackground from '@/components/ui/star-background';
import BlueprintAvatarCard from '@/components/avatars/BlueprintAvatarCard';

const AvatarSelectionPage = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const handleAvatarChoice = (avatarName: string) => {
    toast({
      title: "Avatar Selected",
      description: `You've chosen ${avatarName} as your mystical avatar.`,
      duration: 3000,
    });
    
    // In a real implementation, we would save the avatar choice to the user's profile
    // For now, we'll just navigate to the profile page after a short delay
    setTimeout(() => {
      setLocation('/create-profile');
    }, 1500);
  };

  return (
    <>
      <Helmet>
        <title>Choose Your Mystical Avatar | Dormlit</title>
        <meta name="description" content="Select your mystical avatar and begin your journey on Dormlit." />
      </Helmet>
      
      <StarBackground starCount={150} />
      <Header />
      
      <main className="min-h-screen pt-24 pb-32 relative z-10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6 aura-gradient-text">
              Choose Your Blueprint Avatar
            </h1>
            <p className="text-lg md:text-xl text-foreground/80 max-w-3xl mx-auto">
              Your avatar is your mystical guide and reflection. Select the one that resonates with your energy.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 md:gap-12 max-w-5xl mx-auto">
            <BlueprintAvatarCard
              name="Echo the Resonator"
              tagline="Ethereal & Adaptive"
              realm="Tides & Frequencies"
              tooltipMessage="Echo listens to who you've always been."
              imagePath="/assets/avatars/echo-blueprint.png"
              onChoose={handleAvatarChoice}
            />
            
            <BlueprintAvatarCard
              name="Helios the Illuminator"
              tagline="Radiant & Grounded"
              realm="Flare & Foundation"
              tooltipMessage="Helios reflects who you're becoming."
              imagePath="/assets/avatars/helios-blueprint.png"
              onChoose={handleAvatarChoice}
            />
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="mt-20 text-center text-foreground/60 max-w-3xl mx-auto"
          >
            <p className="text-sm italic">
              Your choice will guide your initial aesthetic, but you can customize and evolve your avatar as your journey unfolds.
            </p>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default AvatarSelectionPage;