import React from 'react';
import { Route, Switch } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/home';
import DiscoverPage from './pages/discover';
import ManifestoPage from './pages/manifesto';
import LoginPage from './pages/login';
import RegisterPage from './pages/register';
import ProfilePage from './pages/profile';
import CreateProfilePage from './pages/create-profile';
import AvatarSelectionPage from './pages/avatar-selection';
import CreatorRoomPage from './pages/creator-room';
import DreamscapePage from './pages/dreamscape';
import NotFoundPage from './pages/not-found';
import StarryBackground from './components/ui/StarryBackground';
import MoodEngine from './components/mood/MoodEngine';
import AffiliateSystem from './components/affiliate/AffiliateSystem';
import OnboardingFlow from './components/onboarding/OnboardingFlow';
import { queryClient } from './lib/queryClient';

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <div className="min-h-screen bg-gradient-to-b from-purple-900 via-indigo-900 to-black text-white">
              <StarryBackground />
              <Header />
              <main className="container mx-auto px-4 py-8">
                <Switch>
                  <Route path="/" component={HomePage} />
                  <Route path="/discover" component={DiscoverPage} />
                  <Route path="/manifesto" component={ManifestoPage} />
                  <Route path="/mood" component={MoodEngine} />
                  <Route path="/invite" component={AffiliateSystem} />
                  <Route path="/login" component={LoginPage} />
                  <Route path="/register" component={RegisterPage} />
                  <Route path="/profile/:userId" component={ProfilePage} />
                  <Route path="/create-profile" component={CreateProfilePage} />
                  <Route path="/avatar-selection" component={AvatarSelectionPage} />
                  <Route path="/creator-room" component={CreatorRoomPage} />
                  <Route path="/dreamscape" component={DreamscapePage} />
                  <Route path="/onboarding" component={OnboardingFlow} />
                  <Route component={NotFoundPage} />
                </Switch>
              </main>
              <Footer />
            </div>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
