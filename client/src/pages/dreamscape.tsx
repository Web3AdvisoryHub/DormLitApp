import { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { StarBackground } from '@/components/StarBackground';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const GRID_SIZE = 10;
const TILE_TYPES = {
  EMPTY: 'empty',
  WALL: 'wall',
  FLOOR: 'floor',
  DECORATION: 'decoration',
};

export default function Dreamscape() {
  const [grid, setGrid] = useState(() => 
    Array(GRID_SIZE).fill(null).map(() => 
      Array(GRID_SIZE).fill(TILE_TYPES.EMPTY)
    )
  );
  const [selectedTile, setSelectedTile] = useState(TILE_TYPES.FLOOR);

  const handleTileClick = (row: number, col: number) => {
    const newGrid = [...grid];
    newGrid[row][col] = selectedTile;
    setGrid(newGrid);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <StarBackground />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-4xl font-bold text-center mb-8">
            Dreamscape Builder
          </h1>
          <p className="text-xl text-center text-muted-foreground mb-12">
            Design your personal space
          </p>

          <div className="flex gap-8">
            <div className="flex-1">
              <div className="grid grid-cols-10 gap-1 bg-background p-4 rounded-lg">
                {grid.map((row, rowIndex) => (
                  row.map((tile, colIndex) => (
                    <button
                      key={`${rowIndex}-${colIndex}`}
                      onClick={() => handleTileClick(rowIndex, colIndex)}
                      className={cn(
                        'w-8 h-8 rounded-sm transition-colors',
                        tile === TILE_TYPES.EMPTY && 'bg-muted',
                        tile === TILE_TYPES.WALL && 'bg-primary',
                        tile === TILE_TYPES.FLOOR && 'bg-card',
                        tile === TILE_TYPES.DECORATION && 'bg-secondary',
                      )}
                    />
                  ))
                ))}
              </div>
            </div>

            <div className="w-48 space-y-4">
              <h3 className="font-semibold">Tiles</h3>
              <div className="space-y-2">
                {Object.entries(TILE_TYPES).map(([key, value]) => (
                  <Button
                    key={key}
                    variant={selectedTile === value ? 'default' : 'outline'}
                    className="w-full justify-start"
                    onClick={() => setSelectedTile(value)}
                  >
                    {key.charAt(0) + key.slice(1).toLowerCase()}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
} 