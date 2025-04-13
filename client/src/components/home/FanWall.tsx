import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { floatAnimation } from '@/lib/animations';
import { 
  MessageCircle, 
  Gift, 
  LineChart, 
  Image, 
  Link, 
  Smile, 
  Heart
} from 'lucide-react';

// Sample demo wall comments
const comments = [
  {
    id: 1,
    name: "DreamWeaver",
    timeAgo: "Just now",
    content: "I've been following your work for years and it just keeps getting better! ✨",
    likes: 24,
    isCreator: false
  },
  {
    id: 2,
    name: "MysticQueen",
    timeAgo: "10 minutes ago",
    content: "The new collection is absolutely stunning! Just purchased my favorite piece. 💜",
    likes: 42,
    isCreator: false
  },
  {
    id: 3,
    name: "AetherWalker",
    timeAgo: "1 hour ago",
    content: "Your podcast episode about creative inspiration changed my perspective! When is the next one coming out?",
    likes: 18,
    isCreator: false
  },
  {
    id: 4,
    name: "HarmonyCreator",
    timeAgo: "30 minutes ago",
    content: "Thank you so much! The next episode drops this Friday - all about the connection between music and creative energies. 🎵✨",
    likes: 37,
    isCreator: true,
    replyTo: "AetherWalker"
  },
  {
    id: 5,
    name: "StarWanderer",
    timeAgo: "3 hours ago",
    content: "Just discovered your work through a friend. Immediately became a supporter! Your creative vision is unmatched. 🌠",
    likes: 12,
    isCreator: false
  }
];

const FanWall = () => {
  const [comment, setComment] = useState('');

  return (
    <section className="py-20">
      <motion.div 
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl md:text-4xl font-bold font-montserrat mb-4 aura-gradient-text">
          Interactive Fan Wall
        </h2>
        <p className="text-lg text-foreground/70 max-w-2xl mx-auto font-quicksand">
          Build meaningful connections with your community through our interactive fan engagement system
        </p>
      </motion.div>
      
      <div className="relative">
        {/* Floating comment cards */}
        <motion.div 
          className="absolute -top-10 right-10 z-10"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          {...floatAnimation}
        >
          <div className="cosmic-card p-3 rounded-lg max-w-xs rotate-3 shadow-lg">
            <div className="flex items-center mb-2">
              <div className="h-8 w-8 rounded-full bg-primary/40 flex items-center justify-center mr-2">
                <span className="text-sm font-bold">MF</span>
              </div>
              <div>
                <p className="text-sm font-medium">MysticalFan42</p>
                <p className="text-xs text-foreground/60">2 hours ago</p>
              </div>
            </div>
            <p className="text-sm">Your latest creation blew my mind! The colors are out of this world! 🌌✨</p>
          </div>
        </motion.div>
        
        <motion.div 
          className="absolute -bottom-8 left-10 z-10"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          {...floatAnimation}
        >
          <div className="cosmic-card p-3 rounded-lg max-w-xs -rotate-2 shadow-lg">
            <div className="flex items-center mb-2">
              <div className="h-8 w-8 rounded-full bg-secondary/40 flex items-center justify-center mr-2">
                <span className="text-sm font-bold">SG</span>
              </div>
              <div>
                <p className="text-sm font-medium">StarGazer</p>
                <p className="text-xs text-foreground/60">5 hours ago</p>
              </div>
            </div>
            <p className="text-sm">Just supported your store! Can't wait for my mystical merch to arrive! Thanks for creating such amazing art! 💫</p>
          </div>
        </motion.div>
        
        <motion.div 
          className="cosmic-card p-8 rounded-xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-bold font-montserrat mb-4">Engage Your Creator Community</h3>
              <p className="text-foreground/70 mb-6">
                The Fan Wall creates a direct connection between you and your supporters. Share updates, receive feedback, and build lasting relationships.
              </p>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <div className="mt-1 mr-3 h-6 w-6 flex items-center justify-center rounded-full bg-primary/30">
                    <MessageCircle className="text-accent" size={14} />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Real-time Interactions</h4>
                    <p className="text-sm text-foreground/70">Engage with fans through live comments and reactions</p>
                  </div>
                </li>
                
                <li className="flex items-start">
                  <div className="mt-1 mr-3 h-6 w-6 flex items-center justify-center rounded-full bg-primary/30">
                    <Gift className="text-accent" size={14} />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Supporter Spotlights</h4>
                    <p className="text-sm text-foreground/70">Highlight your most engaged fans with special recognition</p>
                  </div>
                </li>
                
                <li className="flex items-start">
                  <div className="mt-1 mr-3 h-6 w-6 flex items-center justify-center rounded-full bg-primary/30">
                    <LineChart className="text-accent" size={14} />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Engagement Analytics</h4>
                    <p className="text-sm text-foreground/70">Track interactions and identify your most popular content</p>
                  </div>
                </li>
              </ul>
              
              <Button className="px-6 py-3 bg-primary rounded-full text-base font-semibold cosmic-glow hover:bg-primary/80 transition-all duration-300">
                Activate Fan Wall
              </Button>
            </div>
            
            <div className="relative">
              <div className="h-full bg-card/50 rounded-xl p-4 overflow-y-auto max-h-[500px]">
                <div className="space-y-4">
                  {/* Sample fan comments */}
                  {comments.map((comment) => (
                    <div key={comment.id} className={`flex gap-3 ${comment.replyTo ? 'pl-12' : ''}`}>
                      <div className={`h-10 w-10 rounded-full flex-shrink-0 ${comment.isCreator ? 'ring-2 ring-primary' : ''}`}>
                        <div className={`w-full h-full rounded-full ${comment.isCreator ? 'bg-primary/50' : 'bg-secondary/30'} flex items-center justify-center`}>
                          <span className="font-semibold text-sm">{comment.name.charAt(0)}</span>
                        </div>
                      </div>
                      <div className={`cosmic-card p-3 rounded-lg flex-1 ${comment.isCreator ? 'border border-primary/50' : ''}`}>
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center">
                            <p className="font-medium">{comment.name}</p>
                            {comment.isCreator && (
                              <span className="ml-2 bg-primary/80 text-xs px-2 py-0.5 rounded-full">Creator</span>
                            )}
                          </div>
                          <p className="text-xs text-foreground/60">{comment.timeAgo}</p>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                        <div className="mt-2 flex gap-2">
                          <button className="text-xs bg-primary/20 hover:bg-primary/30 transition-colors px-2 py-0.5 rounded-full flex items-center">
                            <Heart size={12} className="mr-1" /> {comment.likes}
                          </button>
                          {!comment.isCreator && (
                            <button className="text-xs bg-transparent hover:bg-foreground/10 transition-colors px-2 py-0.5 rounded-full">
                              Reply
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Comment input area */}
                <div className="mt-6">
                  <div className="flex gap-3">
                    <div className="h-10 w-10 rounded-full overflow-hidden flex-shrink-0">
                      <div className="w-full h-full bg-primary/30 flex items-center justify-center">
                        <span className="font-semibold text-sm">Y</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <Textarea 
                        className="cosmic-input rounded-lg bg-card/50 border border-primary/30 p-3 w-full text-sm h-20 min-h-[80px]"
                        placeholder="Share your thoughts..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                      />
                      <div className="flex justify-between mt-2">
                        <div className="flex space-x-2">
                          <button className="text-foreground/70 hover:text-foreground transition-colors">
                            <Image size={18} />
                          </button>
                          <button className="text-foreground/70 hover:text-foreground transition-colors">
                            <Link size={18} />
                          </button>
                          <button className="text-foreground/70 hover:text-foreground transition-colors">
                            <Smile size={18} />
                          </button>
                        </div>
                        <Button className="bg-primary px-4 py-1 rounded-full text-sm font-medium hover:bg-primary/80 transition-colors">
                          Post
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FanWall;
