import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { apiRequest } from '@/lib/api';
import { cn } from '@/lib/utils';
import { HairStyles } from './HairStyles';
import { Clothing } from './Clothing';
import { FaceFeatures } from './FaceFeatures';

interface AvatarState {
  skinTone: string;
  hairStyle: string;
  hairColor: string;
  clothingStyle: string;
  clothingColor: string;
  faceFeatures: string[];
}

interface BaseAvatarProps {
  onAvatarCreated: (avatarUrl: string) => void;
  className?: string;
}

const PREVIEW_CONTEXTS = [
  { name: 'Profile', className: 'w-32 h-32 rounded-full' },
  { name: 'Dreamscape', className: 'w-64 h-64' },
  { name: 'Creator Room', className: 'w-48 h-48' },
];

export function BaseAvatar({ onAvatarCreated, className }: BaseAvatarProps) {
  const [currentState, setCurrentState] = useState<AvatarState>({
    skinTone: '#FFDBAC',
    hairStyle: 'short',
    hairColor: '#000000',
    clothingStyle: 'casual',
    clothingColor: '#3366FF',
    faceFeatures: ['eyes', 'nose', 'mouth'],
  });

  const [history, setHistory] = useState<AvatarState[]>([{ ...currentState }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [presetName, setPresetName] = useState('');
  const [savedPresets, setSavedPresets] = useState<{ name: string; state: AvatarState }[]>([]);
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const updateState = (newState: Partial<AvatarState>) => {
    const updatedState = { ...currentState, ...newState };
    setCurrentState(updatedState);
    
    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(updatedState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCurrentState(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCurrentState(history[historyIndex + 1]);
    }
  };

  const savePreset = () => {
    if (!presetName) {
      toast({
        title: "Error",
        description: "Please enter a name for your preset",
        variant: "destructive",
      });
      return;
    }

    setSavedPresets([...savedPresets, { name: presetName, state: { ...currentState } }]);
    setPresetName('');
    toast({
      title: "Preset Saved",
      description: "Your avatar preset has been saved successfully",
    });
  };

  const loadPreset = (preset: { name: string; state: AvatarState }) => {
    setCurrentState(preset.state);
    toast({
      title: "Preset Loaded",
      description: `Loaded preset: ${preset.name}`,
    });
  };

  const renderAvatar = (context: typeof PREVIEW_CONTEXTS[0]) => {
    return (
      <div className={cn("relative", context.className)}>
        <div className="absolute inset-0 bg-background rounded-lg overflow-hidden">
          <div className="absolute inset-0" style={{ backgroundColor: currentState.skinTone }}>
            <HairStyles
              hairStyle={currentState.hairStyle}
              hairColor={currentState.hairColor}
              className="absolute inset-0"
            />
            <Clothing
              clothingStyle={currentState.clothingStyle}
              clothingColor={currentState.clothingColor}
              className="absolute inset-0"
            />
            <FaceFeatures
              features={currentState.faceFeatures}
              className="absolute inset-0"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={cn("space-y-8", className)}>
      <Tabs defaultValue="customize" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="customize">Customize</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="customize" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Skin Tone</h3>
              <input
                type="color"
                value={currentState.skinTone}
                onChange={(e) => updateState({ skinTone: e.target.value })}
                className="w-full h-10 rounded-lg"
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Hair</h3>
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={currentState.hairStyle}
                  onChange={(e) => updateState({ hairStyle: e.target.value })}
                  className="w-full p-2 rounded-lg bg-background"
                >
                  <option value="short">Short</option>
                  <option value="medium">Medium</option>
                  <option value="long">Long</option>
                  <option value="curly">Curly</option>
                </select>
                <input
                  type="color"
                  value={currentState.hairColor}
                  onChange={(e) => updateState({ hairColor: e.target.value })}
                  className="w-full h-10 rounded-lg"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Clothing</h3>
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={currentState.clothingStyle}
                  onChange={(e) => updateState({ clothingStyle: e.target.value })}
                  className="w-full p-2 rounded-lg bg-background"
                >
                  <option value="casual">Casual</option>
                  <option value="formal">Formal</option>
                  <option value="sporty">Sporty</option>
                  <option value="creative">Creative</option>
                </select>
                <input
                  type="color"
                  value={currentState.clothingColor}
                  onChange={(e) => updateState({ clothingColor: e.target.value })}
                  className="w-full h-10 rounded-lg"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Face Features</h3>
              <div className="grid grid-cols-2 gap-4">
                {['eyes', 'nose', 'mouth', 'eyebrows'].map((feature) => (
                  <label key={feature} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={currentState.faceFeatures.includes(feature)}
                      onChange={(e) => {
                        const newFeatures = e.target.checked
                          ? [...currentState.faceFeatures, feature]
                          : currentState.faceFeatures.filter((f) => f !== feature);
                        updateState({ faceFeatures: newFeatures });
                      }}
                    />
                    <span>{feature.charAt(0).toUpperCase() + feature.slice(1)}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={undo}
                disabled={historyIndex === 0}
              >
                Undo
              </Button>
              <Button
                variant="outline"
                onClick={redo}
                disabled={historyIndex === history.length - 1}
              >
                Redo
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <Input
                placeholder="Preset name"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                className="w-48"
              />
              <Button onClick={savePreset}>Save Preset</Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PREVIEW_CONTEXTS.map((context) => (
              <div key={context.name} className="space-y-4">
                <h3 className="text-lg font-semibold">{context.name}</h3>
                {renderAvatar(context)}
              </div>
            ))}
          </div>

          {savedPresets.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Saved Presets</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {savedPresets.map((preset) => (
                  <Button
                    key={preset.name}
                    variant="outline"
                    onClick={() => loadPreset(preset)}
                    className="flex flex-col items-center p-4"
                  >
                    {renderAvatar(PREVIEW_CONTEXTS[0])}
                    <span className="mt-2">{preset.name}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button
          onClick={() => {
            // In a real implementation, this would generate an avatar URL
            const avatarUrl = `data:image/png;base64,${Math.random().toString(36).substring(7)}`;
            onAvatarCreated(avatarUrl);
          }}
        >
          Create Avatar
        </Button>
      </div>
    </div>
  );
} 