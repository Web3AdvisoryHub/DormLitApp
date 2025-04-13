import { QueryClientProvider } from "@tanstack/react-query";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";

// Pages
import HomePage from "@/pages/home";
import LoginPage from "@/pages/login";
import CreateProfilePage from "@/pages/create-profile";
import ProfilePage from "@/pages/profile";
import ManifestoPage from "@/pages/manifesto";
import DiscoverPage from "@/pages/discover";
import AvatarSelectionPage from "@/pages/avatar-selection";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/create-profile" component={CreateProfilePage} />
      <Route path="/profile/:username" component={ProfilePage} />
      <Route path="/manifesto" component={ManifestoPage} />
      
      {/* Additional routes */}
      <Route path="/discover" component={DiscoverPage} />
      <Route path="/marketplace" component={() => <div className="p-20 text-center text-2xl">Marketplace - Coming Soon</div>} />
      <Route path="/community" component={() => <div className="p-20 text-center text-2xl">Community - Coming Soon</div>} />
      <Route path="/about" component={() => <div className="p-20 text-center text-2xl">About - Coming Soon</div>} />
      
      {/* Feature routes */}
      <Route path="/features/avatars" component={AvatarSelectionPage} />
      <Route path="/features/bios" component={() => <div className="p-20 text-center text-2xl">Bio Features - Coming Soon</div>} />
      <Route path="/features/links" component={() => <div className="p-20 text-center text-2xl">Link Features - Coming Soon</div>} />
      <Route path="/features/store" component={() => <div className="p-20 text-center text-2xl">Store Features - Coming Soon</div>} />
      <Route path="/features/fanwall" component={() => <div className="p-20 text-center text-2xl">Fan Wall Features - Coming Soon</div>} />
      <Route path="/features/affiliate" component={() => <div className="p-20 text-center text-2xl">Affiliate Features - Coming Soon</div>} />
      <Route path="/features/nft" component={() => <div className="p-20 text-center text-2xl">NFT Features - Coming Soon</div>} />
      
      {/* Resource routes */}
      <Route path="/resources/:type" component={() => <div className="p-20 text-center text-2xl">Resources - Coming Soon</div>} />
      <Route path="/company/:type" component={() => <div className="p-20 text-center text-2xl">Company Info - Coming Soon</div>} />
      
      {/* Policy routes */}
      <Route path="/privacy" component={() => <div className="p-20 text-center text-2xl">Privacy Policy - Coming Soon</div>} />
      <Route path="/terms" component={() => <div className="p-20 text-center text-2xl">Terms of Service - Coming Soon</div>} />
      <Route path="/cookies" component={() => <div className="p-20 text-center text-2xl">Cookie Policy - Coming Soon</div>} />
      <Route path="/support" component={() => <div className="p-20 text-center text-2xl">Support - Coming Soon</div>} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
