import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const creators = [
  {
    name: "Astral Harmony",
    username: "@astralharmony",
    bio: "Creating otherworldly music to transport listeners to distant cosmic realms. Join my journey through sound.",
    followers: "12.4K",
    creations: "89",
    tags: ["Artist", "Music"]
  },
  {
    name: "Nebula Forge",
    username: "@nebulaforge",
    bio: "Digital artist creating cosmic landscapes and ethereal beings. Each piece contains a piece of the universe.",
    followers: "8.7K",
    creations: "124",
    tags: ["Digital Art", "NFT"]
  },
  {
    name: "Quantum Tales",
    username: "@quantumtales",
    bio: "Writing stories that bridge science and mysticism. Host of the weekly \"Cosmic Whispers\" podcast.",
    followers: "15.2K",
    creations: "203",
    tags: ["Writer", "Podcast"]
  }
];

const CreatorShowcase = () => {
  return (
    <section className="py-20">
      <motion.div 
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl md:text-4xl font-bold font-montserrat mb-4 cosmic-gradient-text">
          Featured Creators
        </h2>
        <p className="text-lg text-foreground/70 max-w-2xl mx-auto font-quicksand">
          Explore the cosmic realms of our featured creators and their ethereal content
        </p>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {creators.map((creator, index) => (
          <motion.div 
            key={index}
            className="cosmic-card p-5 rounded-xl overflow-hidden group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -5 }}
          >
            <div className="h-48 rounded-lg mb-4 overflow-hidden relative">
              {/* Creator banner background */}
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20"></div>
              
              {/* Tags */}
              <div className="absolute bottom-4 left-4 flex items-center space-x-2">
                {creator.tags.map((tag, tagIndex) => (
                  <span 
                    key={tagIndex} 
                    className={`bg-${tagIndex === 0 ? 'primary' : 'secondary'}/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-16 h-16 border-4 border-card rounded-full overflow-hidden -mt-10 relative z-10 bg-gradient-to-br from-primary/40 to-secondary/40 flex items-center justify-center">
                <span className="font-bold text-xl">{creator.name.charAt(0)}</span>
              </div>
              
              <div className="ml-2 flex-1">
                <h3 className="font-montserrat font-semibold text-lg">{creator.name}</h3>
                <p className="text-foreground/60 text-sm">{creator.username}</p>
              </div>
              
              <Button 
                variant="outline" 
                className="text-xs bg-primary/20 hover:bg-primary/40 transition-colors px-3 py-1 rounded-full border border-primary/50"
              >
                Follow
              </Button>
            </div>
            
            <p className="mt-4 text-sm text-foreground/80">
              {creator.bio}
            </p>
            
            <div className="mt-4 flex justify-between text-sm">
              <div>
                <span className="text-foreground/60">Followers:</span>
                <span className="text-foreground ml-1">{creator.followers}</span>
              </div>
              <div>
                <span className="text-foreground/60">Creations:</span>
                <span className="text-foreground ml-1">{creator.creations}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <motion.div 
        className="mt-12 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Button 
          variant="outline" 
          className="px-6 py-3 border-primary rounded-full text-primary hover:bg-primary hover:text-foreground transition-all duration-300 font-medium"
        >
          Explore More Creators
        </Button>
      </motion.div>
    </section>
  );
};

export default CreatorShowcase;
