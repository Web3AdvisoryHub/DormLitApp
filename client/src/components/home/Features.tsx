import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { 
  UserCircle, 
  PenLine, 
  Link as LinkIcon, 
  Store, 
  MessageSquare, 
  Gem,
  ArrowRight
} from 'lucide-react';

const features = [
  {
    icon: <UserCircle className="text-accent" size={24} />,
    title: "Mystical Avatars",
    description: "Create your digital identity with our avatar templates including Echo and Helios profiles",
    link: "/features/avatars",
    linkText: "Customize Avatar"
  },
  {
    icon: <PenLine className="text-accent" size={24} />,
    title: "Extended Bios",
    description: "Tell your story with up to 8000 characters, format with rich text, and embed media",
    link: "/features/bios",
    linkText: "Craft Your Story"
  },
  {
    icon: <LinkIcon className="text-accent" size={24} />,
    title: "Connected Links",
    description: "Connect your digital universe with customizable links to all your platforms and content",
    link: "/features/links",
    linkText: "Connect Universe"
  },
  {
    icon: <Store className="text-accent" size={24} />,
    title: "Creator Store",
    description: "Build your mystical marketplace with our intuitive store interface to sell your digital and physical treasures",
    link: "/features/store",
    linkText: "Open Shop"
  },
  {
    icon: <MessageSquare className="text-accent" size={24} />,
    title: "Fan Wall",
    description: "Engage with your community through an interactive fan wall where meaningful connections are made",
    link: "/features/fanwall",
    linkText: "Engage Fans"
  },
  {
    icon: <Gem className="text-accent" size={24} />,
    title: "NFT Ready",
    description: "Prepare for the future with our NFT-ready sections to showcase your digital collectibles",
    link: "/features/nft",
    linkText: "Explore NFTs"
  }
];

const Features = () => {
  return (
    <section className="py-20">
      <motion.div 
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl md:text-4xl font-bold font-montserrat mb-4 aura-gradient-text">
          Mystical Features
        </h2>
        <p className="text-lg text-foreground/70 max-w-2xl mx-auto font-quicksand">
          Discover the mystical tools that elevate your digital presence and connect you with your community
        </p>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-6">
        {features.map((feature, index) => (
          <motion.div 
            key={index}
            className="mystical-card p-6 rounded-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -5 }}
          >
            <div className="w-14 h-14 flex items-center justify-center bg-primary/30 rounded-full mb-4">
              {feature.icon}
            </div>
            <h3 className="text-xl font-semibold font-montserrat mb-3">{feature.title}</h3>
            <p className="text-foreground/70 mb-4">
              {feature.description}
            </p>
            <Link href={feature.link}>
              <a className="text-secondary font-medium hover:text-secondary/80 transition-colors flex items-center">
                {feature.linkText} <ArrowRight className="ml-2" size={16} />
              </a>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Features;
