import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Item } from '@/types/creator';

interface ItemGalleryProps {
  items: Item[];
  onItemSelect?: (item: Item) => void;
  className?: string;
}

export function ItemGallery({ items, onItemSelect, className }: ItemGalleryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRarity, setSelectedRarity] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Get unique categories and tags
  const categories = Array.from(new Set(items.map(item => item.category)));
  const allTags = Array.from(new Set(items.flatMap(item => item.tags)));

  // Filter items based on search and filters
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRarity = !selectedRarity || item.rarity === selectedRarity;
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.every(tag => item.tags.includes(tag));
    
    return matchesSearch && matchesRarity && matchesCategory && matchesTags;
  });

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search and Filters */}
      <div className="flex flex-col gap-4">
        <Input
          placeholder="Search items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="flex flex-wrap gap-2">
          {['common', 'rare', 'epic', 'legendary'].map(rarity => (
            <Button
              key={rarity}
              variant={selectedRarity === rarity ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedRarity(selectedRarity === rarity ? null : rarity)}
            >
              {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
            </Button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
            >
              {category}
            </Button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {allTags.map(tag => (
            <Button
              key={tag}
              variant={selectedTags.includes(tag) ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setSelectedTags(prev => 
                  prev.includes(tag)
                    ? prev.filter(t => t !== tag)
                    : [...prev, tag]
                );
              }}
            >
              {tag}
            </Button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <AnimatePresence>
          {filteredItems.map(item => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative group cursor-pointer"
              onClick={() => onItemSelect?.(item)}
            >
              <div className="aspect-square rounded-lg overflow-hidden bg-background/50">
                {item.previewUrl ? (
                  <img
                    src={item.previewUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-muted-foreground">No preview</span>
                  </div>
                )}
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/20">
                      {item.rarity}
                    </span>
                    {item.tags.map(tag => (
                      <span key={tag} className="text-xs px-2 py-1 rounded-full bg-secondary">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
} 