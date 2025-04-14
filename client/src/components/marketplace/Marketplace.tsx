import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Item } from '@/types/creator';

interface MarketplaceProps {
  items: Item[];
  onPurchase?: (item: Item) => void;
  onList?: (item: Item, price: number) => void;
  className?: string;
}

export function Marketplace({
  items,
  onPurchase,
  onList,
  className,
}: MarketplaceProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [sortBy, setSortBy] = useState<'price' | 'date' | 'popularity'>('price');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter and sort items
  const filteredItems = items
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPrice = item.price >= priceRange[0] && item.price <= priceRange[1];
      return matchesSearch && matchesPrice;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.price - b.price;
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'popularity':
          return (b.views || 0) - (a.views || 0);
        default:
          return 0;
      }
    });

  return (
    <div className={cn("space-y-6", className)}>
      {/* Search and Filters */}
      <div className="flex flex-col gap-4">
        <Input
          placeholder="Search items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium">Price Range</label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                className="w-24"
              />
              <span>to</span>
              <Input
                type="number"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                className="w-24"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              List
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant={sortBy === 'price' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('price')}
          >
            Price
          </Button>
          <Button
            variant={sortBy === 'date' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('date')}
          >
            Newest
          </Button>
          <Button
            variant={sortBy === 'popularity' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('popularity')}
          >
            Popular
          </Button>
        </div>
      </div>

      {/* Items Grid/List */}
      <div className={cn(
        "gap-4",
        viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "space-y-4"
      )}>
        {filteredItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={cn(
              "overflow-hidden",
              viewMode === 'list' && "flex"
            )}>
              <div className={cn(
                "aspect-square",
                viewMode === 'list' ? "w-32" : "w-full"
              )}>
                {item.previewUrl ? (
                  <img
                    src={item.previewUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-secondary">
                    <span className="text-muted-foreground">No preview</span>
                  </div>
                )}
              </div>

              <div className={cn(
                "p-4",
                viewMode === 'list' && "flex-1"
              )}>
                <CardHeader className="p-0">
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-0 mt-2">
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="text-2xl font-bold">${item.price}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.views || 0} views
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onList?.(item, item.price)}
                      >
                        List
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => onPurchase?.(item)}
                      >
                        Buy
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 