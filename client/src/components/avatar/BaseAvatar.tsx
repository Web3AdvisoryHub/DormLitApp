import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { apiRequest } from '@/lib/api';
import { cn } from '@/lib/utils';
import { HairStyles } from './HairStyles';
import { Clothing } from './Clothing';

interface BaseAvatarProps {
  onAvatarCreated: (avatarUrl: string) => void;
  className?: string;
}

export function BaseAvatar({ onAvatarCreated, className }: BaseAvatarProps) {
  const [skinTone, setSkinTone] = useState('#FFDBAC');
  const [hairStyle, setHairStyle] = useState('short');
  const [hairColor, setHairColor] = useState('#000000');
  const [clothingStyle, setClothingStyle] = useState('t-shirt');
  const [clothingColor, setClothingColor] = useState('#3498db');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Create a canvas to render the avatar
      const canvas = document.createElement('canvas');
      canvas.width = 500;
      canvas.height = 500;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Failed to create canvas context');
      }

      // Draw the base avatar
      ctx.fillStyle = skinTone;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Convert to data URL
      const avatarUrl = canvas.toDataURL('image/png');

      // Save to server
      const response = await apiRequest('/api/avatar/save', {
        method: 'POST',
        body: JSON.stringify({
          skinTone,
          hairStyle,
          hairColor,
          clothingStyle,
          clothingColor,
          avatarUrl,
        }),
      });

      if (response.success) {
        onAvatarCreated(avatarUrl);
        toast({
          title: 'Success',
          description: 'Avatar saved successfully',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save avatar',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      <div className="grid grid-cols-2 gap-4">
        {/* Preview Section */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Preview</h3>
          <div className="relative w-64 h-64 mx-auto">
            <div 
              className="absolute inset-0 rounded-full"
              style={{ backgroundColor: skinTone }}
            />
            <HairStyles
              hairStyle={hairStyle}
              hairColor={hairColor}
              className="absolute inset-0"
            />
            <Clothing
              clothingStyle={clothingStyle}
              clothingColor={clothingColor}
              className="absolute inset-0"
            />
          </div>
        </div>

        {/* Customization Section */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Skin Tone</Label>
            <Input
              type="color"
              value={skinTone}
              onChange={(e) => setSkinTone(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Hair Style</Label>
            <div className="grid grid-cols-3 gap-2">
              {['short', 'medium', 'long', 'curly', 'wavy', 'afro'].map((style) => (
                <Button
                  key={style}
                  variant={hairStyle === style ? 'default' : 'outline'}
                  onClick={() => setHairStyle(style)}
                >
                  {style}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Hair Color</Label>
            <Input
              type="color"
              value={hairColor}
              onChange={(e) => setHairColor(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Clothing Style</Label>
            <div className="grid grid-cols-2 gap-2">
              {['t-shirt', 'hoodie', 'dress', 'suit'].map((style) => (
                <Button
                  key={style}
                  variant={clothingStyle === style ? 'default' : 'outline'}
                  onClick={() => setClothingStyle(style)}
                >
                  {style}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Clothing Color</Label>
            <Input
              type="color"
              value={clothingColor}
              onChange={(e) => setClothingColor(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Avatar'}
        </Button>
      </div>
    </div>
  );
} 