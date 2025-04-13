import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import StarBackground from '@/components/ui/star-background';
import { fadeIn, fadeUp, staggerContainer } from '@/lib/animations';

const ManifestoPage = () => {
  const [hasAnimated, setHasAnimated] = useState(false);
  
  useEffect(() => {
    setHasAnimated(true);
  }, []);

  return (
    <>
      <StarBackground starCount={150} />
      <Header />
      
      <main className="relative z-10 container mx-auto px-4 py-16">
        <motion.div
          className="max-w-3xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div 
            className="text-center mb-16"
            variants={fadeUp}
          >
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
              variants={fadeUp}
            >
              <p className="text-xl md:text-2xl italic text-foreground/90 font-medium">
                "FEAR: Finally Existing Average Reality. Dormlit is your invitation to exit."
              </p>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="prose prose-lg md:prose-xl prose-invert mx-auto"
            variants={fadeIn}
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
              variants={fadeUp}
            >
              🧬 What Dormlit Stands For
            </motion.h2>
            
            <ul className="space-y-8 mb-12">
              <motion.li 
                className="flex items-start gap-4"
                variants={fadeUp} 
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
                variants={fadeUp} 
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
                variants={fadeUp} 
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
                variants={fadeUp} 
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
                variants={fadeUp} 
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
              variants={fadeUp}
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
                variants={fadeUp}
              >
                <p className="text-2xl font-bold mb-4">Welcome to Dormlit.</p>
                <p className="text-3xl aura-gradient-text font-bold font-montserrat">Design your difference.</p>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </main>
      
      <Footer />
    </>
  );
};

export default ManifestoPage;