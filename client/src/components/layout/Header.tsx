import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const menuVariants = {
    closed: {
      opacity: 0,
      height: 0,
      transition: { duration: 0.3, ease: "easeInOut" }
    },
    open: {
      opacity: 1,
      height: "auto",
      transition: { duration: 0.3, ease: "easeInOut" }
    }
  };

  const navItems = [
    { name: "Discover", path: "/discover" },
    { name: "Marketplace", path: "/marketplace" },
    { name: "Community", path: "/community" },
    { name: "About", path: "/about" }
  ];

  return (
    <header className="relative z-10 bg-black/70 backdrop-blur-md border-b border-purple-900/30">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center mystical-glow">
                <span className="text-lg font-bold font-montserrat">D</span>
              </div>
              <h1 className="text-2xl font-bold font-montserrat aura-gradient-text">
                Dormlit
              </h1>
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-6 items-center">
            {navItems.map((item) => (
              <Link 
                key={item.path} 
                href={item.path}
                className={`text-foreground/80 hover:text-foreground transition-colors duration-300 font-medium ${
                  location === item.path ? "text-foreground" : ""
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
          
          <div className="flex items-center space-x-4">
            <Button asChild variant="default" className="bg-primary text-foreground px-4 py-2 rounded-full hover:bg-primary/80 transition-all duration-300 font-medium mystical-glow">
              <Link href="/login">
                Sign In
              </Link>
            </Button>
            <button onClick={toggleMenu} className="md:hidden text-2xl">
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        <motion.div
          className="md:hidden overflow-hidden"
          initial="closed"
          animate={isMenuOpen ? "open" : "closed"}
          variants={menuVariants}
        >
          <div className="flex flex-col space-y-4 pt-4 pb-4">
            {navItems.map((item) => (
              <Link 
                key={item.path} 
                href={item.path}
                className={`text-foreground/80 hover:text-foreground transition-colors duration-300 font-medium ${
                  location === item.path ? "text-foreground" : ""
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-2">
              <Button asChild variant="outline" className="w-full">
                <Link href="/register">
                  Create Account
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </header>
  );
};

export default Header;
