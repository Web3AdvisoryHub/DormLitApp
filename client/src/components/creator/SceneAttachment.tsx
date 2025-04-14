import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface SceneAttachmentProps {
  onSceneAttached: (scene: {
    type: 'audio' | 'animation' | 'memory';
    file: File;
    previewUrl: string;
    description: string;
  }) => void;
  className?: string;
}

export function SceneAttachment({ onSceneAttached, className }: SceneAttachmentProps) {
  const [sceneType, setSceneType] = useState<'audio' | 'animation' | 'memory'>('audio');
  const [description, setDescription] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    onSceneAttached({
      type: sceneType,
      file,
      previewUrl: url,
      description
    });
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <Label>Scene Type</Label>
        <div className="flex gap-2">
          {(['audio', 'animation', 'memory'] as const).map((type) => (
            <Button
              key={type}
              variant={sceneType === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSceneType(type)}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Input
          placeholder="Describe the scene..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={
          sceneType === 'audio'
            ? 'audio/*'
            : sceneType === 'animation'
            ? 'video/*'
            : 'image/*'
        }
        className="hidden"
      />

      <Button
        onClick={handleUploadClick}
        className="w-full"
      >
        Upload {sceneType.charAt(0).toUpperCase() + sceneType.slice(1)}
      </Button>

      {previewUrl && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4"
        >
          {sceneType === 'audio' && (
            <audio controls src={previewUrl} className="w-full" />
          )}
          {sceneType === 'animation' && (
            <video controls src={previewUrl} className="w-full rounded-lg" />
          )}
          {sceneType === 'memory' && (
            <img
              src={previewUrl}
              alt="Memory preview"
              className="w-full rounded-lg"
            />
          )}
        </motion.div>
      )}
    </div>
  );
} 