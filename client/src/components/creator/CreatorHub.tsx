import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface SocialLink {
  platform: string;
  url: string;
  visibility: number;
  icon: string;
}

interface SearchTip {
  id: number;
  content: string;
  category: string;
  isActive: boolean;
}

interface MysticalPrompt {
  id: number;
  question: string;
  lastUsed: Date | null;
}

export function CreatorHub() {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [searchTips, setSearchTips] = useState<SearchTip[]>([]);
  const [prompts, setPrompts] = useState<MysticalPrompt[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCreatorData();
  }, []);

  const fetchCreatorData = async () => {
    try {
      const [links, tips, mysticalPrompts] = await Promise.all([
        apiRequest('/api/creator/social-links'),
        apiRequest('/api/creator/search-tips'),
        apiRequest('/api/creator/prompts')
      ]);
      
      setSocialLinks(links.data);
      setSearchTips(tips.data);
      setPrompts(mysticalPrompts.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load creator data',
        variant: 'destructive'
      });
    }
  };

  const checkLinkVisibility = async (url: string) => {
    try {
      const response = await apiRequest('/api/creator/check-visibility', {
        method: 'POST',
        data: { url }
      });
      return response.data.visibility;
    } catch (error) {
      return 0;
    }
  };

  const updateSocialLink = async (platform: string, url: string) => {
    const visibility = await checkLinkVisibility(url);
    const icon = getPlatformIcon(platform);
    
    setSocialLinks(prev => {
      const existing = prev.find(link => link.platform === platform);
      if (existing) {
        return prev.map(link => 
          link.platform === platform ? { ...link, url, visibility, icon } : link
        );
      }
      return [...prev, { platform, url, visibility, icon }];
    });
  };

  const getPlatformIcon = (platform: string) => {
    const icons: Record<string, string> = {
      'twitter': '🐦',
      'instagram': '📸',
      'youtube': '🎥',
      'tiktok': '🎵',
      'twitch': '🎮',
      'website': '🌐'
    };
    return icons[platform.toLowerCase()] || '🔗';
  };

  const toggleSearchTip = async (id: number) => {
    try {
      await apiRequest('/api/creator/toggle-tip', {
        method: 'POST',
        data: { id }
      });
      setSearchTips(prev => 
        prev.map(tip => tip.id === id ? { ...tip, isActive: !tip.isActive } : tip)
      );
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update search tip',
        variant: 'destructive'
      });
    }
  };

  const usePrompt = async (id: number) => {
    try {
      await apiRequest('/api/creator/use-prompt', {
        method: 'POST',
        data: { id }
      });
      setPrompts(prev =>
        prev.map(prompt => prompt.id === id ? { ...prompt, lastUsed: new Date() } : prompt)
      );
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to use prompt',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-8 p-6">
      {/* Social Links Section */}
      <Card>
        <CardHeader>
          <CardTitle>Link Boost</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {['twitter', 'instagram', 'youtube', 'tiktok', 'twitch', 'website'].map(platform => (
            <div key={platform} className="flex items-center space-x-4">
              <Label className="w-24">{platform}</Label>
              <Input
                type="url"
                placeholder={`Enter ${platform} URL`}
                onChange={(e) => updateSocialLink(platform, e.target.value)}
                className="flex-1"
              />
              <div className="w-8 text-center">
                {socialLinks.find(link => link.platform === platform)?.icon}
              </div>
              <div className="w-16 text-center">
                {socialLinks.find(link => link.platform === platform)?.visibility}%
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Search Tips Section */}
      <Card>
        <CardHeader>
          <CardTitle>Search Assist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {searchTips.map(tip => (
            <div key={tip.id} className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium">{tip.content}</p>
                <p className="text-sm text-gray-500">{tip.category}</p>
              </div>
              <Switch
                checked={tip.isActive}
                onCheckedChange={() => toggleSearchTip(tip.id)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Mystical Prompts Section */}
      <Card>
        <CardHeader>
          <CardTitle>Realm Prompts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {prompts.map(prompt => (
            <motion.div
              key={prompt.id}
              whileHover={{ scale: 1.02 }}
              className="p-4 bg-gray-900 rounded-lg cursor-pointer"
              onClick={() => usePrompt(prompt.id)}
            >
              <p className="text-lg font-medium">{prompt.question}</p>
              {prompt.lastUsed && (
                <p className="text-sm text-gray-500">
                  Last used: {new Date(prompt.lastUsed).toLocaleDateString()}
                </p>
              )}
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
} 