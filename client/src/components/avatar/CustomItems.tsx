import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { apiRequest } from '@/lib/api';
import { cn } from '@/lib/utils';

interface CustomItem {
  id: string;
  name: string;
  type: 'clothing' | 'accessory';
  imageUrl: string;
  isNFT: boolean;
  tokenId?: string;
  contractAddress?: string;
}

interface CustomItemsProps {
  onItemAdded: (item: CustomItem) => void;
  className?: string;
}

export function CustomItems({ onItemAdded, className }: CustomItemsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemType, setItemType] = useState<'clothing' | 'accessory'>('clothing');
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', itemName);
      formData.append('type', itemType);

      const response = await apiRequest('/api/items/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.success) {
        onItemAdded({
          id: response.data.id,
          name: itemName,
          type: itemType,
          imageUrl: response.data.url,
          isNFT: false,
        });
        setIsOpen(false);
        toast({
          title: 'Success',
          description: 'Item uploaded successfully',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload item',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  }, [itemName, itemType, onItemAdded, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.svg'],
    },
    maxFiles: 1,
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={className}>
          Add Custom Item
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Custom Item</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="itemName">Item Name</Label>
            <Input
              id="itemName"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="Enter item name"
            />
          </div>
          <div className="space-y-2">
            <Label>Item Type</Label>
            <div className="flex gap-2">
              <Button
                variant={itemType === 'clothing' ? 'default' : 'outline'}
                onClick={() => setItemType('clothing')}
              >
                Clothing
              </Button>
              <Button
                variant={itemType === 'accessory' ? 'default' : 'outline'}
                onClick={() => setItemType('accessory')}
              >
                Accessory
              </Button>
            </div>
          </div>
          <div
            {...getRootProps()}
            className={cn(
              'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer',
              isDragActive ? 'border-primary' : 'border-muted'
            )}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Drop the image here...</p>
            ) : (
              <p>Drag and drop an image here, or click to select</p>
            )}
          </div>
          {isUploading && (
            <div className="text-center">
              <p>Uploading...</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 