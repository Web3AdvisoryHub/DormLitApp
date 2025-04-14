import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import StarBackground from '@/components/ui/star-background';
import ReadyPlayerMe from '@/components/avatar/ReadyPlayerMe';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';

const AvatarSelectionPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const handleAvatarCreated = async (avatarUrl: string) => {
    try {
      const response = await apiRequest('POST', '/api/users/avatar', { avatarUrl });
      
      if (response.ok) {
        toast({
          title: "Avatar updated!",
          description: "Your avatar has been successfully set.",
        });
        
        // Show onboarding after a short delay
        setTimeout(() => {
          setShowOnboarding(true);
        }, 1000);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save your avatar. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleOnboardingComplete = () => {
    navigate('/mood');
  };

  return (
    <>
      <StarBackground starCount={100} />
      <Header />
      
      <main className="relative z-10 container mx-auto px-4 py-12">
        <motion.div
          className="max-w-2xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold font-montserrat mb-4 aura-gradient-text">
            Create Your Avatar
          </h1>
          <p className="text-xl text-foreground/70 mb-8">
            Design a unique avatar that represents you in the Dormlit universe
          </p>
          
          <Button
            onClick={() => setIsOpen(true)}
            className="px-8 py-6 text-lg font-semibold mystical-glow"
          >
            Start Creating
          </Button>
        </motion.div>
      </main>
      
      <ReadyPlayerMe
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onAvatarCreated={handleAvatarCreated}
      />
      
      {showOnboarding && (
        <OnboardingFlow onComplete={handleOnboardingComplete} />
      )}
      
      <Footer />
    </>
  );
};

export default AvatarSelectionPage;