import { Link } from 'wouter';
import { 
  Twitter, 
  Instagram, 
  Youtube,
  MessageCircle
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="relative z-10 bg-black/90 backdrop-blur-md border-t border-purple-900/30 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center mystical-glow">
                <span className="text-lg font-bold font-montserrat">D</span>
              </div>
              <h2 className="text-xl font-bold font-montserrat">Dormlit</h2>
            </div>
            <p className="text-foreground/70 mb-6">
              Your mystical digital fan haven where creativity and community converge in a magical experience.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/40 transition-colors">
                <Twitter size={18} />
              </a>
              <a href="#" className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/40 transition-colors">
                <Instagram size={18} />
              </a>
              <a href="#" className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/40 transition-colors">
                <MessageCircle size={18} />
              </a>
              <a href="#" className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/40 transition-colors">
                <Youtube size={18} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold font-montserrat mb-6">Features</h3>
            <ul className="space-y-3 text-foreground/70">
              <li><Link href="/features/avatars" className="hover:text-foreground transition-colors">Mystical Avatars</Link></li>
              <li><Link href="/features/bios" className="hover:text-foreground transition-colors">Extended Bios</Link></li>
              <li><Link href="/features/links" className="hover:text-foreground transition-colors">Link Sharing</Link></li>
              <li><Link href="/features/store" className="hover:text-foreground transition-colors">Creator Store</Link></li>
              <li><Link href="/features/fanwall" className="hover:text-foreground transition-colors">Fan Wall</Link></li>
              <li><Link href="/features/affiliate" className="hover:text-foreground transition-colors">Affiliate Program</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold font-montserrat mb-6">Resources</h3>
            <ul className="space-y-3 text-foreground/70">
              <li><Link href="/resources/getting-started" className="hover:text-foreground transition-colors">Getting Started</Link></li>
              <li><Link href="/resources/creator-guide" className="hover:text-foreground transition-colors">Creator Guide</Link></li>
              <li><Link href="/resources/api-docs" className="hover:text-foreground transition-colors">API Documentation</Link></li>
              <li><Link href="/resources/tutorials" className="hover:text-foreground transition-colors">Tutorials</Link></li>
              <li><Link href="/resources/forums" className="hover:text-foreground transition-colors">Community Forums</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold font-montserrat mb-6">Company</h3>
            <ul className="space-y-3 text-foreground/70">
              <li><Link href="/company/about" className="hover:text-foreground transition-colors">About Us</Link></li>
              <li><Link href="/company/careers" className="hover:text-foreground transition-colors">Careers</Link></li>
              <li><Link href="/company/press" className="hover:text-foreground transition-colors">Press Kit</Link></li>
              <li><Link href="/company/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="/company/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-purple-900/20 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-foreground/60">
            &copy; {currentYear} Dormlit Official. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <Link href="/privacy" className="text-sm text-foreground/60 hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms" className="text-sm text-foreground/60 hover:text-foreground transition-colors">Terms</Link>
            <Link href="/cookies" className="text-sm text-foreground/60 hover:text-foreground transition-colors">Cookies</Link>
            <Link href="/support" className="text-sm text-foreground/60 hover:text-foreground transition-colors">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
