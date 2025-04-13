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
              <li><Link href="/features/avatars"><a className="hover:text-foreground transition-colors">Mystical Avatars</a></Link></li>
              <li><Link href="/features/bios"><a className="hover:text-foreground transition-colors">Extended Bios</a></Link></li>
              <li><Link href="/features/links"><a className="hover:text-foreground transition-colors">Link Sharing</a></Link></li>
              <li><Link href="/features/store"><a className="hover:text-foreground transition-colors">Creator Store</a></Link></li>
              <li><Link href="/features/fanwall"><a className="hover:text-foreground transition-colors">Fan Wall</a></Link></li>
              <li><Link href="/features/affiliate"><a className="hover:text-foreground transition-colors">Affiliate Program</a></Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold font-montserrat mb-6">Resources</h3>
            <ul className="space-y-3 text-foreground/70">
              <li><Link href="/resources/getting-started"><a className="hover:text-foreground transition-colors">Getting Started</a></Link></li>
              <li><Link href="/resources/creator-guide"><a className="hover:text-foreground transition-colors">Creator Guide</a></Link></li>
              <li><Link href="/resources/api-docs"><a className="hover:text-foreground transition-colors">API Documentation</a></Link></li>
              <li><Link href="/resources/tutorials"><a className="hover:text-foreground transition-colors">Tutorials</a></Link></li>
              <li><Link href="/resources/forums"><a className="hover:text-foreground transition-colors">Community Forums</a></Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold font-montserrat mb-6">Company</h3>
            <ul className="space-y-3 text-foreground/70">
              <li><Link href="/manifesto"><a className="hover:text-foreground transition-colors">Our Manifesto</a></Link></li>
              <li><Link href="/company/about"><a className="hover:text-foreground transition-colors">About Us</a></Link></li>
              <li><Link href="/company/careers"><a className="hover:text-foreground transition-colors">Careers</a></Link></li>
              <li><Link href="/company/press"><a className="hover:text-foreground transition-colors">Press Kit</a></Link></li>
              <li><Link href="/company/privacy"><a className="hover:text-foreground transition-colors">Privacy Policy</a></Link></li>
              <li><Link href="/company/terms"><a className="hover:text-foreground transition-colors">Terms of Service</a></Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-purple-900/20 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-foreground/60">
            &copy; {currentYear} Dormlit Official. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <Link href="/privacy"><a className="text-sm text-foreground/60 hover:text-foreground transition-colors">Privacy</a></Link>
            <Link href="/terms"><a className="text-sm text-foreground/60 hover:text-foreground transition-colors">Terms</a></Link>
            <Link href="/cookies"><a className="text-sm text-foreground/60 hover:text-foreground transition-colors">Cookies</a></Link>
            <Link href="/support"><a className="text-sm text-foreground/60 hover:text-foreground transition-colors">Support</a></Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
