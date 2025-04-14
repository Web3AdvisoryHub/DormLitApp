import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { StarBackground } from '@/components/StarBackground';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface Item {
  id: string;
  name: string;
  description: string;
  image: string;
  position: { x: number; y: number };
  rotation: number;
  scale: number;
}

export default function CreatorRoom() {
  const [activeTab, setActiveTab] = useState('create');
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.DragEvent, item: Item) => {
    setIsDragging(true);
    setSelectedItem(item);
    e.dataTransfer.setData('text/plain', item.id);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setSelectedItem(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    const item = items.find((i) => i.id === id);
    if (item && dropZoneRef.current) {
      const rect = dropZoneRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setItems((prev) =>
        prev.map((i) =>
          i.id === id ? { ...i, position: { x, y } } : i
        )
      );
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateItem = async () => {
    if (!previewImage || !itemName) {
      toast({
        title: "Error",
        description: "Please provide an image and name for your item",
        variant: "destructive",
      });
      return;
    }

    const newItem: Item = {
      id: Math.random().toString(36).substring(7),
      name: itemName,
      description: itemDescription,
      image: previewImage,
      position: { x: 0, y: 0 },
      rotation: 0,
      scale: 1,
    };

    setItems((prev) => [...prev, newItem]);
    setItemName('');
    setItemDescription('');
    setPreviewImage(null);

    toast({
      title: "Success",
      description: "Item created successfully",
    });
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
          className="max-w-6xl mx-auto"
        >
          <h1 className="text-4xl font-bold text-center mb-8">
            Creator Room
          </h1>
          <p className="text-xl text-center text-muted-foreground mb-12">
            Design and mint your unique items
          </p>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="create">Create</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="gallery">Gallery</TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Item Name
                    </label>
                    <Input
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      placeholder="Enter item name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Description
                    </label>
                    <Textarea
                      value={itemDescription}
                      onChange={(e) => setItemDescription(e.target.value)}
                      placeholder="Describe your item"
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Upload Image
                    </label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </div>

                  {previewImage && (
                    <div className="mt-4">
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="max-w-full h-auto rounded-lg"
                      />
                    </div>
                  )}

                  <Button
                    onClick={handleCreateItem}
                    className="w-full"
                  >
                    Create Item
                  </Button>
                </div>

                <div
                  ref={dropZoneRef}
                  className={cn(
                    "border-2 border-dashed rounded-lg p-4 min-h-[400px]",
                    isDragging ? "border-primary" : "border-muted"
                  )}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  <div className="relative w-full h-full">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="absolute cursor-move"
                        style={{
                          left: item.position.x,
                          top: item.position.y,
                          transform: `rotate(${item.rotation}deg) scale(${item.scale})`,
                        }}
                        draggable
                        onDragStart={(e) => handleDragStart(e, item)}
                        onDragEnd={handleDragEnd}
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-card rounded-lg p-4 shadow-lg"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                    <h3 className="text-lg font-semibold mb-2">{item.name}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="gallery" className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {items.map((item) => (
                  <Button
                    key={item.id}
                    variant="outline"
                    className="flex flex-col items-center p-4"
                    onClick={() => {
                      setSelectedItem(item);
                      setActiveTab('preview');
                    }}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-lg mb-2"
                    />
                    <span>{item.name}</span>
                  </Button>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
} 