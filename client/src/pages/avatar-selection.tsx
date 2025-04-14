import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { StarBackground } from '@/components/StarBackground';
import { BaseAvatar } from '@/components/avatar/BaseAvatar';
import { ReadyPlayerMe } from '@/components/avatar/ReadyPlayerMe';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';

export default function AvatarSelectionPage() {
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleBaseAvatarCreated = (url: string) => {
    setAvatarUrl(url);
    setShowOnboarding(true);
  };

  const handleCustomAvatarCreated = (url: string) => {
    setAvatarUrl(url);
    setShowOnboarding(true);
  };

  const handleOnboardingComplete = () => {
    navigate('/mood');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <StarBackground />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-4xl font-bold text-center mb-8">
            Create Your Avatar
          </h1>
          <p className="text-xl text-center text-muted-foreground mb-12">
            Start with a base avatar and customize it, or import your own custom avatar
          </p>

          <Tabs defaultValue="base" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="base">Base Avatar</TabsTrigger>
              <TabsTrigger value="custom">Custom Avatar</TabsTrigger>
            </TabsList>
            
            <TabsContent value="base">
              <BaseAvatar
                onAvatarCreated={handleBaseAvatarCreated}
                className="mt-8"
              />
            </TabsContent>
            
            <TabsContent value="custom">
              <ReadyPlayerMe
                onAvatarCreated={handleCustomAvatarCreated}
                className="mt-8"
              />
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>

      <Footer />

      {showOnboarding && (
        <OnboardingFlow
          onComplete={handleOnboardingComplete}
          avatarUrl={avatarUrl}
        />
      )}
    </div>
  );
}