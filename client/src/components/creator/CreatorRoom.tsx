import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { apiRequest } from '@/lib/api';
import { cn } from '@/lib/utils';
import { CustomItems } from '../avatar/CustomItems';

interface CreatorRoomProps {
  className?: string;
}

interface RoomMessage {
  id: string;
  userId: string;
  username: string;
  avatarUrl: string;
  content: string;
  timestamp: string;
}

interface NFTItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  tokenId: string;
  contractAddress: string;
  ownerId: string;
  price: string;
}

export function CreatorRoom({ className }: CreatorRoomProps) {
  const { roomId } = useParams();
  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [nftItems, setNftItems] = useState<NFTItem[]>([]);
  const [isMinting, setIsMinting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Connect to WebSocket for real-time chat
    const ws = new WebSocket(`ws://localhost:5000/ws/room/${roomId}`);
    
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages((prev) => [...prev, message]);
    };

    // Load NFT items
    loadNFTItems();

    return () => {
      ws.close();
    };
  }, [roomId]);

  const loadNFTItems = async () => {
    try {
      const response = await apiRequest(`/api/rooms/${roomId}/items`);
      if (response.success) {
        setNftItems(response.data);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load NFT items',
        variant: 'destructive',
      });
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await apiRequest('/api/chat/message', {
        method: 'POST',
        body: JSON.stringify({
          roomId,
          content: newMessage,
        }),
      });
      setNewMessage('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    }
  };

  const handleMintNFT = async (item: CustomItem) => {
    setIsMinting(true);
    try {
      const response = await apiRequest('/api/nft/mint', {
        method: 'POST',
        body: JSON.stringify({
          name: item.name,
          description: `Custom ${item.type} item`,
          imageUrl: item.imageUrl,
          roomId,
        }),
      });

      if (response.success) {
        toast({
          title: 'Success',
          description: 'NFT minted successfully',
        });
        loadNFTItems();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mint NFT',
        variant: 'destructive',
      });
    } finally {
      setIsMinting(false);
    }
  };

  const handlePurchaseNFT = async (item: NFTItem) => {
    try {
      const response = await apiRequest('/api/nft/purchase', {
        method: 'POST',
        body: JSON.stringify({
          tokenId: item.tokenId,
          contractAddress: item.contractAddress,
          price: item.price,
        }),
      });

      if (response.success) {
        toast({
          title: 'Success',
          description: 'NFT purchased successfully',
        });
        loadNFTItems();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to purchase NFT',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className={cn('grid grid-cols-3 gap-4 h-screen', className)}>
      {/* Chat Section */}
      <div className="col-span-2 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="flex items-start space-x-2">
              <img
                src={message.avatarUrl}
                alt={message.username}
                className="w-8 h-8 rounded-full"
              />
              <div>
                <p className="font-semibold">{message.username}</p>
                <p>{message.content}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button onClick={handleSendMessage}>Send</Button>
          </div>
        </div>
      </div>

      {/* NFT Items Section */}
      <div className="border-l p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">NFT Items</h2>
        <CustomItems
          onItemAdded={handleMintNFT}
          className="mb-4"
        />
        <div className="space-y-4">
          {nftItems.map((item) => (
            <div key={item.id} className="border rounded-lg p-4">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-32 object-cover rounded-lg mb-2"
              />
              <h3 className="font-semibold">{item.name}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
              <p className="text-sm font-semibold mt-2">Price: {item.price} ETH</p>
              <Button
                className="w-full mt-2"
                onClick={() => handlePurchaseNFT(item)}
                disabled={isMinting}
              >
                Purchase
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 