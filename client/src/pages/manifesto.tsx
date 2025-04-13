import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';
import { Helmet } from 'react-helmet';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import StarBackground from '@/components/ui/star-background';
import { Button } from '@/components/ui/button';

// Define animation variants
const staggerContainerVariant = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const fadeUpVariant = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

const fadeInVariant = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5
    }
  }
};

const ManifestoPage = () => {
  const [hasAnimated, setHasAnimated] = useState(false);
  
  useEffect(() => {
    setHasAnimated(true);
  }, []);

  return (
    <>
      <Helmet>
        <title>The Dormlit Manifesto | Express Your Essence</title>
        <meta name="description" content="Dormlit is a mystical platform for creators to express, connect, and design their difference. Read our manifesto." />
      </Helmet>

      <StarBackground starCount={150} />
      <Header />
      
      <main className="relative z-10 container mx-auto px-4 py-16">
        <motion.div
          className="max-w-3xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={staggerContainerVariant}
        >
          <motion.div 
            className="text-center mb-16"
            variants={fadeUpVariant}
          >
            <motion.p
              className="text-lg md:text-xl text-foreground/70 italic mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ 
                duration: 1.2,
                delay: 0.3,
                ease: [0.22, 1, 0.36, 1] 
              }}
            >
              Step beyond the veil...
            </motion.p>
            
            <motion.h1 
              className="text-5xl md:text-6xl font-bold font-montserrat mb-4 aura-gradient-text"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.8, 
                ease: [0.22, 1, 0.36, 1] 
              }}
            >
              🌌 The Dormlit Manifesto
            </motion.h1>
            
            <motion.div 
              className="mystical-card p-8 rounded-2xl border border-primary/30 my-8"
              variants={fadeUpVariant}
            >
              <p className="text-xl md:text-2xl italic text-foreground/90 font-medium">
                "FEAR: Finally Existing Average Reality. Dormlit is your invitation to exit."
              </p>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="prose prose-lg md:prose-xl prose-invert mx-auto"
            variants={fadeInVariant}
          >
            <p className="text-xl leading-relaxed mb-8">
              You were never meant to blend in.<br />
              Dormlit is not a platform. It's a portal.
            </p>
            
            <p className="text-xl leading-relaxed mb-8">
              It's a realm built for creators, dreamers, shapeshifters, and quiet rebels 
              ready to reflect their essence through avatar, word, art, and action.
            </p>
            
            <p className="text-xl leading-relaxed mb-12">
              Here, you are not your job title.<br />
              You are your <span className="font-bold aura-gradient-text">intention, your link, your imprint.</span>
            </p>
            
            <motion.h2 
              className="text-3xl font-bold font-montserrat mb-8"
              variants={fadeUpVariant}
            >
              🧬 What Dormlit Stands For
            </motion.h2>
            
            <ul className="space-y-8 mb-12">
              <motion.li 
                className="flex items-start gap-4"
                variants={fadeUpVariant} 
                custom={1}
              >
                <div className="h-10 w-10 mt-1 bg-primary/20 rounded-full flex items-center justify-center mystical-glow flex-shrink-0">
                  <span className="text-lg">✨</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Mystical Selfhood</h3>
                  <p className="text-foreground/80">
                    Dormlit honors the soul behind the screen. Upload an avatar, tell your story, radiate your own rhythm.
                  </p>
                </div>
              </motion.li>
              
              <motion.li 
                className="flex items-start gap-4"
                variants={fadeUpVariant} 
                custom={2}
              >
                <div className="h-10 w-10 mt-1 bg-primary/20 rounded-full flex items-center justify-center mystical-glow flex-shrink-0">
                  <span className="text-lg">🎭</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Open Expression</h3>
                  <p className="text-foreground/80">
                    Write long bios. Drop wild links. Share your work, your journey, your imagination.
                  </p>
                </div>
              </motion.li>
              
              <motion.li 
                className="flex items-start gap-4"
                variants={fadeUpVariant} 
                custom={3}
              >
                <div className="h-10 w-10 mt-1 bg-primary/20 rounded-full flex items-center justify-center mystical-glow flex-shrink-0">
                  <span className="text-lg">🔮</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Connection Without Control</h3>
                  <p className="text-foreground/80">
                    No follower counts. No filters on reality. Just you and your truth, visible to those who resonate.
                  </p>
                </div>
              </motion.li>
              
              <motion.li 
                className="flex items-start gap-4"
                variants={fadeUpVariant} 
                custom={4}
              >
                <div className="h-10 w-10 mt-1 bg-primary/20 rounded-full flex items-center justify-center mystical-glow flex-shrink-0">
                  <span className="text-lg">👑</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Creative Sovereignty</h3>
                  <p className="text-foreground/80">
                    Your profile is a canvas. Your store is your ritual. Your avatar is your guardian.
                  </p>
                </div>
              </motion.li>
              
              <motion.li 
                className="flex items-start gap-4"
                variants={fadeUpVariant} 
                custom={5}
              >
                <div className="h-10 w-10 mt-1 bg-primary/20 rounded-full flex items-center justify-center mystical-glow flex-shrink-0">
                  <span className="text-lg">🌠</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Tech With Soul</h3>
                  <p className="text-foreground/80">
                    Dormlit is powered by future tools, but it speaks in ancient tongue. Every shimmer, every animation, every word—designed with intention.
                  </p>
                </div>
              </motion.li>
            </ul>
            
            <motion.h2 
              className="text-3xl font-bold font-montserrat mb-8"
              variants={fadeUpVariant}
            >
              🦋 Why We're Different
            </motion.h2>
            
            <p className="text-xl leading-relaxed mb-8">
              You don't have to market yourself here.<br />
              You just have to <span className="font-bold">be yourself</span>—fully, honestly, beautifully.
            </p>
            
            <p className="text-xl leading-relaxed mb-16">
              We don't chase trends. We chase <span className="font-bold">truth</span>.<br />
              And in truth, we find resonance.
            </p>
            
            <div className="border-t border-primary/30 pt-16 mb-8">
              <motion.div 
                className="text-center"
                variants={fadeUpVariant}
              >
                <p className="text-2xl font-bold mb-4">Welcome to Dormlit.</p>
                <p className="text-3xl aura-gradient-text font-bold font-montserrat">Design your difference.</p>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </main>
      
      {/* Sticky Explore Button */}
      <div className="fixed bottom-8 left-0 right-0 z-50 flex justify-center pointer-events-none">
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ 
            delay: 3,
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1]
          }}
          className="pointer-events-auto"
        >
          <Button 
            asChild
            className="px-6 py-6 rounded-full bg-primary/90 backdrop-blur-sm hover:bg-primary transition-all duration-300 shadow-xl mystical-glow"
          >
            <Link href="/discover" className="flex items-center gap-2 text-lg font-medium">
              I'm ready to explore <ArrowRight className="ml-1" size={18} />
            </Link>
          </Button>
        </motion.div>
      </div>
      
      <Footer />
    </>
  );
};

export default ManifestoPage;