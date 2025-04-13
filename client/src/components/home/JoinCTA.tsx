import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  PaintbrushVertical, 
  Smartphone, 
  Code, 
  Shield
} from 'lucide-react';

const JoinCTA = () => {
  return (
    <section className="py-24 text-center relative">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-secondary/20 rounded-3xl -z-10"></div>
      
      <motion.div 
        className="max-w-3xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-4xl md:text-5xl font-bold font-montserrat mb-6 leading-tight cosmic-gradient-text">
          Begin Your Cosmic Journey
        </h2>
        <p className="text-xl text-foreground/80 mb-10 font-quicksand">
          Create your mystical digital haven, connect with your community, and expand your cosmic presence
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6">
          <Button asChild className="px-8 py-7 bg-primary rounded-full text-lg font-semibold cosmic-glow hover:bg-primary/80 transition-all duration-300">
            <Link href="/create-profile">
              <a>Create Your Space</a>
            </Link>
          </Button>
          <Button asChild variant="outline" className="px-8 py-7 border-foreground/30 rounded-full text-lg font-semibold hover:bg-foreground/10 transition-all duration-300">
            <Link href="/about">
              <a>Learn More</a>
            </Link>
          </Button>
        </div>
        
        <motion.div 
          className="mt-16 flex flex-wrap justify-center gap-6 text-foreground/60"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex items-center">
            <PaintbrushVertical className="mr-2 text-accent" size={18} />
            <span>Mystical Design</span>
          </div>
          <div className="flex items-center">
            <Smartphone className="mr-2 text-accent" size={18} />
            <span>Fully Responsive</span>
          </div>
          <div className="flex items-center">
            <Code className="mr-2 text-accent" size={18} />
            <span>Modern Tech Stack</span>
          </div>
          <div className="flex items-center">
            <Shield className="mr-2 text-accent" size={18} />
            <span>Secure Platform</span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default JoinCTA;
