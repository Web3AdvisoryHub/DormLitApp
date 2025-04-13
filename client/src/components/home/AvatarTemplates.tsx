import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

const avatarTemplates = [
  {
    name: "Echo",
    tagline: "The cosmic resonator",
    color: "text-accent",
    tagBackground: "bg-primary/70",
    tag: "Ethereal & Harmonious",
    features: [
      "Harmonic aura effects",
      "Sound reactive animations",
      "Customizable resonance patterns"
    ],
    buttonClass: "bg-primary hover:bg-primary/80",
    gradientFrom: "from-primary/40",
    gradientTo: "to-accent/40"
  },
  {
    name: "Helios",
    tagline: "The stellar illuminator",
    color: "text-secondary",
    tagBackground: "bg-secondary/70",
    tag: "Radiant & Powerful",
    features: [
      "Solar flare animations",
      "Dynamic light emission",
      "Cosmic energy visualizers"
    ],
    buttonClass: "bg-secondary hover:bg-secondary/80",
    gradientFrom: "from-secondary/40",
    gradientTo: "to-accent/40"
  }
];

const AvatarTemplates = () => {
  return (
    <section className="py-20 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-3xl -z-10"></div>
      
      <motion.div 
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl md:text-4xl font-bold font-montserrat mb-4 cosmic-gradient-text">
          Blueprint Avatar Templates
        </h2>
        <p className="text-lg text-foreground/70 max-w-2xl mx-auto font-quicksand">
          Choose your cosmic form with our mystical templates designed for a unique digital presence
        </p>
      </motion.div>
      
      <div className="flex flex-col md:flex-row gap-10 justify-center items-center">
        {avatarTemplates.map((template, index) => (
          <motion.div 
            key={index}
            className="cosmic-card p-8 rounded-xl max-w-md transition-all duration-500"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-center mb-6">
              <h3 className={`text-2xl font-semibold font-montserrat ${template.color} mb-2`}>{template.name}</h3>
              <p className="text-foreground/70">{template.tagline}</p>
            </div>
            
            <div className="relative h-80 mb-6 rounded-lg overflow-hidden">
              {/* Avatar visualization */}
              <div className={`w-full h-full bg-gradient-to-br ${template.gradientFrom} ${template.gradientTo} flex items-center justify-center`}>
                <svg width="200" height="200" viewBox="0 0 200 200">
                  <defs>
                    <radialGradient id={`avatar-gradient-${index}`} cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                      <stop offset="0%" stopColor={index === 0 ? "#50E3C2" : "#4A90E2"} stopOpacity="0.8" />
                      <stop offset="100%" stopColor={index === 0 ? "#6A0DAD" : "#8A2BE2"} stopOpacity="0.4" />
                    </radialGradient>
                  </defs>
                  
                  {/* Base circle */}
                  <circle cx="100" cy="100" r="80" fill={`url(#avatar-gradient-${index})`} />
                  
                  {/* Decoration elements */}
                  {template.name === "Echo" ? (
                    <>
                      <circle cx="100" cy="100" r="70" fill="none" stroke="#50E3C2" strokeOpacity="0.5" strokeWidth="2" strokeDasharray="10 5" />
                      <circle cx="100" cy="100" r="60" fill="none" stroke="#50E3C2" strokeOpacity="0.3" strokeWidth="1" />
                      <circle cx="100" cy="100" r="50" fill="none" stroke="#50E3C2" strokeOpacity="0.2" strokeWidth="1" strokeDasharray="5 5" />
                      <path d="M100,30 Q130,100 100,170 Q70,100 100,30" fill="none" stroke="#FFFFFF" strokeOpacity="0.6" strokeWidth="2" />
                    </>
                  ) : (
                    <>
                      <circle cx="100" cy="100" r="70" fill="none" stroke="#4A90E2" strokeOpacity="0.5" strokeWidth="2" />
                      <path d="M100,30 L120,60 L150,70 L120,80 L100,110 L80,80 L50,70 L80,60 Z" fill="none" stroke="#FFFFFF" strokeOpacity="0.6" strokeWidth="2" />
                      <circle cx="100" cy="100" r="40" fill="none" stroke="#FFFFFF" strokeOpacity="0.3" strokeWidth="1" strokeDasharray="1 2" />
                      <path d="M60,60 L140,140 M60,140 L140,60" stroke="#4A90E2" strokeOpacity="0.4" strokeWidth="1" />
                    </>
                  )}
                </svg>
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent"></div>
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <span className={`inline-block ${template.tagBackground} backdrop-blur-sm px-4 py-2 rounded-full text-sm`}>
                  {template.tag}
                </span>
              </div>
            </div>
            
            <ul className="space-y-3 mb-6">
              {template.features.map((feature, featureIndex) => (
                <li key={featureIndex} className="flex items-center">
                  <Check className="text-green-400 mr-3" size={16} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            
            <Button className={`w-full py-6 rounded-full transition-all duration-300 font-medium ${template.buttonClass}`}>
              Choose {template.name}
            </Button>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default AvatarTemplates;
