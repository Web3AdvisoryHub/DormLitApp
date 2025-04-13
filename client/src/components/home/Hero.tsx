import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { floatAnimation } from '@/lib/animations';

const Hero = () => {
  return (
    <section className="py-16 md:py-24 text-center relative">
      <motion.div
        className="max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl md:text-6xl font-bold font-montserrat mb-6 leading-tight aura-gradient-text">
          Your Digital Fan Haven
        </h1>
        <p className="text-xl text-foreground/80 mb-10 font-quicksand">
          Connect with fans in a mystical digital realm where creativity flows and communities thrive
        </p>
        <div className="flex flex-col md:flex-row justify-center gap-4 md:gap-6">
          <Button asChild className="px-8 py-7 bg-primary rounded-full text-lg font-semibold mystical-glow hover:bg-primary/80 transition-all duration-300">
            <Link href="/create-profile">
              <a>Create Your Space</a>
            </Link>
          </Button>
          <Button asChild variant="outline" className="px-8 py-7 border-secondary rounded-full text-lg font-semibold hover:bg-secondary/20 transition-all duration-300 mystical-glow">
            <Link href="/discover">
              <a>Explore Creators</a>
            </Link>
          </Button>
        </div>
      </motion.div>
      
      <div className="mt-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background z-10"></div>
        <div className="max-w-5xl mx-auto relative z-0">
          {/* Platform showcase image */}
          <motion.div
            className="relative rounded-xl overflow-hidden shadow-2xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            {...floatAnimation}
          >
            <svg 
              viewBox="0 0 1200 600" 
              className="w-full h-auto"
              style={{ background: 'linear-gradient(135deg, #121212, #2D1B4E)' }}
            >
              {/* Platform mockup */}
              <rect x="100" y="60" width="1000" height="30" rx="4" fill="#6A0DAD" fillOpacity="0.3" />
              <rect x="120" y="68" width="120" height="15" rx="2" fill="#8A2BE2" fillOpacity="0.7" />
              <rect x="260" y="68" width="120" height="15" rx="2" fill="#8A2BE2" fillOpacity="0.5" />
              <rect x="400" y="68" width="120" height="15" rx="2" fill="#8A2BE2" fillOpacity="0.5" />
              <rect x="900" y="68" width="180" height="15" rx="7" fill="#6A0DAD" />
              
              <rect x="100" y="110" width="700" height="200" rx="4" fill="#1A1A1A" />
              <rect x="120" y="130" width="400" height="30" rx="2" fill="#6A0DAD" fillOpacity="0.8" />
              <rect x="120" y="170" width="550" height="12" rx="2" fill="#FFFFFF" fillOpacity="0.5" />
              <rect x="120" y="190" width="550" height="12" rx="2" fill="#FFFFFF" fillOpacity="0.5" />
              <rect x="120" y="210" width="350" height="12" rx="2" fill="#FFFFFF" fillOpacity="0.5" />
              <rect x="120" y="250" width="160" height="40" rx="20" fill="#6A0DAD" />
              <rect x="300" y="250" width="160" height="40" rx="20" fill="transparent" stroke="#4A90E2" />
              
              <rect x="820" y="110" width="280" height="380" rx="4" fill="#1A1A1A" />
              <circle cx="960" cy="140" r="30" fill="#2D1B4E" />
              <rect x="840" y="180" width="240" height="12" rx="2" fill="#FFFFFF" fillOpacity="0.7" />
              <rect x="860" y="200" width="200" height="12" rx="2" fill="#FFFFFF" fillOpacity="0.5" />
              <rect x="840" y="230" width="240" height="1" rx="0.5" fill="#6A0DAD" fillOpacity="0.5" />
              <rect x="840" y="250" width="240" height="80" rx="4" fill="#2D1B4E" fillOpacity="0.4" />
              <rect x="840" y="350" width="240" height="80" rx="4" fill="#2D1B4E" fillOpacity="0.4" />
              <rect x="840" y="450" width="100" height="20" rx="10" fill="#6A0DAD" fillOpacity="0.6" />
              
              <rect x="100" y="330" width="340" height="160" rx="4" fill="#1A1A1A" />
              <rect x="120" y="350" width="200" height="20" rx="2" fill="#FFFFFF" fillOpacity="0.7" />
              <rect x="120" y="380" width="300" height="12" rx="2" fill="#FFFFFF" fillOpacity="0.5" />
              <rect x="120" y="400" width="300" height="12" rx="2" fill="#FFFFFF" fillOpacity="0.5" />
              <rect x="120" y="440" width="130" height="30" rx="15" fill="#4A90E2" fillOpacity="0.7" />
              
              <rect x="460" y="330" width="340" height="160" rx="4" fill="#1A1A1A" />
              <rect x="480" y="350" width="200" height="20" rx="2" fill="#FFFFFF" fillOpacity="0.7" />
              <rect x="480" y="380" width="300" height="12" rx="2" fill="#FFFFFF" fillOpacity="0.5" />
              <rect x="480" y="400" width="300" height="12" rx="2" fill="#FFFFFF" fillOpacity="0.5" />
              <rect x="480" y="440" width="130" height="30" rx="15" fill="#50E3C2" fillOpacity="0.7" />
              
              {/* Decorative elements */}
              <circle cx="300" cy="530" r="15" fill="#6A0DAD" fillOpacity="0.3" />
              <circle cx="340" cy="530" r="10" fill="#4A90E2" fillOpacity="0.3" />
              <circle cx="370" cy="530" r="5" fill="#50E3C2" fillOpacity="0.3" />
              
              <circle cx="950" cy="530" r="15" fill="#6A0DAD" fillOpacity="0.3" />
              <circle cx="910" cy="530" r="10" fill="#4A90E2" fillOpacity="0.3" />
              <circle cx="880" cy="530" r="5" fill="#50E3C2" fillOpacity="0.3" />
            </svg>
          </motion.div>
          
          {/* Floating Cards */}
          <motion.div 
            className="absolute -top-10 -right-10 z-10"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            {...floatAnimation}
          >
            <div className="mystical-card p-4 rounded-lg w-48 rotate-6 shadow-xl">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 rounded-full bg-primary mr-2"></div>
                <span className="font-medium">@MysticalCreator</span>
              </div>
              <div className="text-xs text-foreground/70">Just launched a new mystical experience!</div>
            </div>
          </motion.div>
          
          <motion.div 
            className="absolute -bottom-14 -left-8 z-10"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            style={{ animationDelay: "2s" }}
            {...floatAnimation}
          >
            <div className="mystical-card p-4 rounded-lg w-48 -rotate-3 shadow-xl">
              <div className="text-sm mb-1 font-medium">NFT Collection Live</div>
              <div className="h-16 bg-gradient-to-r from-primary/40 to-accent/40 rounded-md mb-2"></div>
              <div className="flex justify-between">
                <span className="text-xs text-foreground/70">12.5 ETH</span>
                <span className="text-xs text-green-400">+24%</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
