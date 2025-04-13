import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import StarBackground from '@/components/ui/star-background';
import Hero from '@/components/home/Hero';
import Features from '@/components/home/Features';
import CreatorShowcase from '@/components/home/CreatorShowcase';
import AvatarTemplates from '@/components/home/AvatarTemplates';
import FanWall from '@/components/home/FanWall';
import JoinCTA from '@/components/home/JoinCTA';

const HomePage = () => {
  return (
    <>
      <Helmet>
        <title>Dormlit Official - Your Digital Fan Haven</title>
        <meta name="description" content="Connect with fans in a mystical digital realm where creativity flows and communities thrive" />
      </Helmet>
      
      <StarBackground starCount={100} />
      
      <Header />
      
      <motion.main 
        className="relative z-10 container mx-auto px-4 py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Hero />
        <Features />
        <CreatorShowcase />
        <AvatarTemplates />
        <FanWall />
        <JoinCTA />
      </motion.main>
      
      <Footer />
    </>
  );
};

export default HomePage;
