import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import StarBackground from '@/components/ui/star-background';
import FeaturedAvatars from '@/components/discover/FeaturedAvatars';

const DiscoverPage = () => {
  return (
    <>
      <Helmet>
        <title>Discover Mystical Avatars | Dormlit</title>
        <meta name="description" content="Explore mystical avatars like Echo and Helios on Dormlit - your portal to creative expression and digital identity." />
      </Helmet>

      <StarBackground starCount={100} />
      <Header />
      
      <main className="relative z-10">
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-6 aura-gradient-text">
                Discover Your Mystical Self
              </h1>
              <p className="text-xl md:text-2xl text-foreground/80 max-w-3xl mx-auto">
                Explore the realm of possibilities and find the avatars that resonate with your essence.
              </p>
            </motion.div>
          </div>
        </section>
        
        <FeaturedAvatars />
        
        <section className="py-16 md:py-24 bg-black/30 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Your Digital Identity Awaits</h2>
              <p className="text-lg text-foreground/80 mb-8">
                On Dormlit, avatars are more than images - they're extensions of your creative energy. 
                Express your unique essence through mystical digital identities that transcend ordinary profiles.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="p-6 rounded-xl bg-primary/10 border border-primary/20">
                  <h3 className="text-xl font-semibold mb-3">Customizable</h3>
                  <p className="text-foreground/70">Personalize every aspect to match your energy and aesthetic.</p>
                </div>
                <div className="p-6 rounded-xl bg-primary/10 border border-primary/20">
                  <h3 className="text-xl font-semibold mb-3">Portable</h3>
                  <p className="text-foreground/70">Use your avatar across platforms and in the metaverse.</p>
                </div>
                <div className="p-6 rounded-xl bg-primary/10 border border-primary/20">
                  <h3 className="text-xl font-semibold mb-3">NFT-Ready</h3>
                  <p className="text-foreground/70">Mint your avatar as an NFT when you're ready to claim ownership.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      
      <Footer />
    </>
  );
};

export default DiscoverPage;