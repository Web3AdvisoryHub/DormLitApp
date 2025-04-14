import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface ItemTraitsProps {
  onTraitsUpdated: (traits: {
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    category: string;
    tags: string[];
  }) => void;
  className?: string;
}

export function ItemTraits({ onTraitsUpdated, className }: ItemTraitsProps) {
  const [rarity, setRarity] = useState<'common' | 'rare' | 'epic' | 'legendary'>('common');
  const [category, setCategory] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      const newTags = [...tags, tagInput.trim()];
      setTags(newTags);
      setTagInput('');
      onTraitsUpdated({ rarity, category, tags: newTags });
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    onTraitsUpdated({ rarity, category, tags: newTags });
  };

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    onTraitsUpdated({ rarity, category: newCategory, tags });
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <Label>Rarity</Label>
        <div className="flex gap-2">
          {(['common', 'rare', 'epic', 'legendary'] as const).map((r) => (
            <Button
              key={r}
              variant={rarity === r ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setRarity(r);
                onTraitsUpdated({ rarity: r, category, tags });
              }}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Category</Label>
        <Input
          placeholder="Enter item category..."
          value={category}
          onChange={(e) => handleCategoryChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Add a tag..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddTag();
              }
            }}
          />
          <Button onClick={handleAddTag}>Add</Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag) => (
            <motion.div
              key={tag}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-full"
            >
              <span className="text-sm">{tag}</span>
              <button
                onClick={() => handleRemoveTag(tag)}
                className="text-xs hover:text-destructive"
              >
                ×
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
} 