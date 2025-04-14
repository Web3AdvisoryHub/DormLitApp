import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { AvatarPreview } from './AvatarPreview';

interface AvatarBuilderProps {
  onAvatarCreated: (avatarData: any) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function AvatarBuilder({ onAvatarCreated, isOpen, onClose }: AvatarBuilderProps) {
  const [avatarData, setAvatarData] = useState({
    faceShape: 'round',
    hairStyle: 'short',
    hairColor: '#000000',
    eyeShape: 'normal',
    eyeColor: '#000000',
    noseType: 'normal',
    mouthStyle: 'smile',
    skinTone: '#FFD3B6',
    clothing: 'casual',
    accessories: [],
  });

  const handleSave = () => {
    onAvatarCreated(avatarData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>Create Your Avatar</DialogTitle>
        </DialogHeader>
        
        <div className="flex gap-8 h-full">
          {/* Avatar Preview */}
          <div className="w-1/2 flex items-center justify-center bg-gray-100 rounded-lg">
            <div className="w-64 h-64">
              <AvatarPreview data={avatarData} />
            </div>
          </div>

          {/* Customization Options */}
          <div className="w-1/2">
            <Tabs defaultValue="face" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="face">Face</TabsTrigger>
                <TabsTrigger value="hair">Hair</TabsTrigger>
                <TabsTrigger value="clothing">Clothing</TabsTrigger>
                <TabsTrigger value="accessories">Accessories</TabsTrigger>
              </TabsList>

              <TabsContent value="face" className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Face Shape</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {['round', 'oval', 'square'].map((shape) => (
                      <Button
                        key={shape}
                        variant={avatarData.faceShape === shape ? 'default' : 'outline'}
                        onClick={() => setAvatarData({ ...avatarData, faceShape: shape })}
                      >
                        {shape}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Skin Tone</h3>
                  <Slider
                    value={[0]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(value) => {
                      const hue = value[0];
                      setAvatarData({ ...avatarData, skinTone: `hsl(${hue}, 70%, 80%)` });
                    }}
                  />
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Eye Color</h3>
                  <input
                    type="color"
                    value={avatarData.eyeColor}
                    onChange={(e) => setAvatarData({ ...avatarData, eyeColor: e.target.value })}
                    className="w-full h-10 rounded-md"
                  />
                </div>
              </TabsContent>

              <TabsContent value="hair" className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Hair Style</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {['short', 'medium', 'long'].map((style) => (
                      <Button
                        key={style}
                        variant={avatarData.hairStyle === style ? 'default' : 'outline'}
                        onClick={() => setAvatarData({ ...avatarData, hairStyle: style })}
                      >
                        {style}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Hair Color</h3>
                  <input
                    type="color"
                    value={avatarData.hairColor}
                    onChange={(e) => setAvatarData({ ...avatarData, hairColor: e.target.value })}
                    className="w-full h-10 rounded-md"
                  />
                </div>
              </TabsContent>

              <TabsContent value="clothing" className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Style</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {['casual', 'formal', 'sporty', 'business'].map((style) => (
                      <Button
                        key={style}
                        variant={avatarData.clothing === style ? 'default' : 'outline'}
                        onClick={() => setAvatarData({ ...avatarData, clothing: style })}
                      >
                        {style}
                      </Button>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="accessories" className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Add Accessories</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {['glasses', 'hat', 'earrings', 'necklace'].map((item) => (
                      <Button
                        key={item}
                        variant={avatarData.accessories.includes(item) ? 'default' : 'outline'}
                        onClick={() => {
                          const newAccessories = avatarData.accessories.includes(item)
                            ? avatarData.accessories.filter(a => a !== item)
                            : [...avatarData.accessories, item];
                          setAvatarData({ ...avatarData, accessories: newAccessories });
                        }}
                      >
                        {item}
                      </Button>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-4 flex justify-end">
              <Button onClick={handleSave}>Save Avatar</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 