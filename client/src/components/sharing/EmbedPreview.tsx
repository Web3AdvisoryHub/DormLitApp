import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface EmbedPreviewProps {
  type: 'profile' | 'post' | 'nft';
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  className?: string;
}

const embedSizes = [
  { label: 'Small', value: 'small', width: 300, height: 200 },
  { label: 'Medium', value: 'medium', width: 500, height: 300 },
  { label: 'Large', value: 'large', width: 800, height: 500 }
];

export function EmbedPreview({
  type,
  id,
  title,
  description,
  imageUrl,
  className
}: EmbedPreviewProps) {
  const [size, setSize] = useState('medium');
  const [showCode, setShowCode] = useState(false);
  const { toast } = useToast();

  const selectedSize = embedSizes.find(s => s.value === size) || embedSizes[1];
  const baseUrl = window.location.origin;
  const embedUrl = `${baseUrl}/embed/${type}/${id}`;

  const embedCode = `<iframe 
  src="${embedUrl}"
  width="${selectedSize.width}"
  height="${selectedSize.height}"
  frameborder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowfullscreen>
</iframe>`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      toast({
        title: 'Copied!',
        description: 'Embed code copied to clipboard'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy embed code',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Label htmlFor="size">Size</Label>
          <Select
            id="size"
            value={size}
            onChange={(e) => setSize(e.target.value)}
          >
            {embedSizes.map(size => (
              <option key={size.value} value={size.value}>
                {size.label}
              </option>
            ))}
          </Select>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowCode(!showCode)}
        >
          {showCode ? 'Hide Code' : 'Show Code'}
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <iframe
          src={embedUrl}
          width={selectedSize.width}
          height={selectedSize.height}
          className="w-full"
          title={`Embedded ${type}`}
        />
      </div>

      {showCode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <pre className="p-4 bg-gray-800 rounded-lg overflow-x-auto">
            <code>{embedCode}</code>
          </pre>
          <Button
            variant="outline"
            className="absolute top-2 right-2"
            onClick={handleCopy}
          >
            Copy
          </Button>
        </motion.div>
      )}

      {type === 'nft' && (
        <div className="mt-4 p-4 bg-gray-800 rounded-lg">
          <h4 className="font-bold mb-2">Embedding NFT</h4>
          <p className="text-sm text-gray-400">
            The embedded NFT will show its current owner and allow viewers to view its full details.
            Interactive features like zoom and rotation are preserved in the embed.
          </p>
        </div>
      )}
    </div>
  );
} 