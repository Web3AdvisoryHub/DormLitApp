import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { StarBackground } from '@/components/StarBackground';

const featuredAvatars = [
  {
    id: 'blueprint-1',
    name: 'Blueprint Alpha',
    description: 'A versatile foundation for your digital identity',
    image: '/assets/avatars/blueprint-alpha.png',
    features: ['Modular Design', 'Customizable', 'Future-Proof'],
  },
  {
    id: 'blueprint-2',
    name: 'Blueprint Beta',
    description: 'Advanced template for creative expression',
    image: '/assets/avatars/blueprint-beta.png',
    features: ['Dynamic Components', 'Upgradeable', 'Creator-Ready'],
  },
];

export function FeaturedAvatars() {
  return (
    <section className="relative py-20 overflow-hidden">
      <StarBackground />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">
            Foundation Avatars
          </h2>
          <p className="text-xl text-muted-foreground">
            Your gateway to the DormLit experience
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {featuredAvatars.map((avatar, index) => (
            <motion.div
              key={avatar.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="bg-card rounded-lg overflow-hidden shadow-lg"
            >
              <div className="p-6">
                <div className="aspect-w-16 aspect-h-9 mb-6">
                  <img
                    src={avatar.image}
                    alt={avatar.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                
                <h3 className="text-2xl font-bold mb-2">{avatar.name}</h3>
                <p className="text-muted-foreground mb-4">{avatar.description}</p>
                
                <ul className="space-y-2 mb-6">
                  {avatar.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <span className="text-primary mr-2">✦</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button className="w-full">
                  Explore {avatar.name}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 