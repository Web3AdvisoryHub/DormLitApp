import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FeaturedAvatars = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30 pointer-events-none z-0"></div>
      
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 aura-gradient-text">Featured Mystical Avatars</h2>
          <p className="text-xl text-foreground/80 max-w-3xl mx-auto">
            Meet Echo and Helios - embodiments of mystical energy and creative expression.
            Your gateway to the Dormlit experience.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
          {/* Echo */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col items-center"
          >
            <div className="rounded-2xl overflow-hidden mb-6 border-2 border-primary/30 shadow-2xl shadow-primary/20 mystical-glow">
              <img 
                src="/avatars/echo-blueprint.png" 
                alt="Echo - Mystical Avatar" 
                className="w-full h-auto object-cover" 
              />
            </div>
            <h3 className="text-2xl font-bold mb-2">Echo</h3>
            <p className="text-foreground/70 mb-4 text-center max-w-md">
              The oracle of reflections, Echo embodies intuition and deep knowing. 
              Her ethereal presence connects realms through wisdom and silence.
            </p>
            <Button variant="outline" asChild className="rounded-full border-primary/50 hover:bg-primary/20">
              <Link href="/features/avatars" className="flex items-center gap-2">
                Learn More <ArrowRight size={16} />
              </Link>
            </Button>
          </motion.div>
          
          {/* Helios */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col items-center"
          >
            <div className="rounded-2xl overflow-hidden mb-6 border-2 border-primary/30 shadow-2xl shadow-primary/20 mystical-glow">
              <img 
                src="/avatars/helios-blueprint.png" 
                alt="Helios - Mystical Avatar" 
                className="w-full h-auto object-cover object-top" 
              />
            </div>
            <h3 className="text-2xl font-bold mb-2">Helios</h3>
            <p className="text-foreground/70 mb-4 text-center max-w-md">
              Guardian of creative fire, Helios channels raw energy into form.
              His presence ignites transformation and illuminates hidden potential.
            </p>
            <Button variant="outline" asChild className="rounded-full border-primary/50 hover:bg-primary/20">
              <Link href="/features/avatars" className="flex items-center gap-2">
                Learn More <ArrowRight size={16} />
              </Link>
            </Button>
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16"
        >
          <Button asChild size="lg" className="rounded-full px-8 mystical-glow">
            <Link href="/features/avatars">
              Explore Avatar Customization
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedAvatars;