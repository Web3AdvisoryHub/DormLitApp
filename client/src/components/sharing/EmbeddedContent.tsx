import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { apiRequest } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface EmbeddedContentProps {
  className?: string;
}

interface ContentData {
  type: 'profile' | 'post' | 'nft';
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  owner?: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  createdAt?: string;
  metadata?: Record<string, any>;
}

export function EmbeddedContent({ className }: EmbeddedContentProps) {
  const { type, id } = useParams<{ type: string; id: string }>();
  const [content, setContent] = useState<ContentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await apiRequest(`/api/embed/${type}/${id}`);
        setContent(response.data);
      } catch (err) {
        setError('Failed to load content');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [type, id]);

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <p className="text-red-500">{error || 'Content not found'}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn('p-4 bg-white rounded-lg shadow-lg', className)}
    >
      {content.type === 'profile' && (
        <div className="flex flex-col items-center gap-4">
          <Avatar
            src={content.imageUrl}
            alt={content.title}
            className="w-24 h-24"
          />
          <h2 className="text-xl font-bold">{content.title}</h2>
          {content.description && (
            <p className="text-gray-600 text-center">{content.description}</p>
          )}
          <Button
            variant="outline"
            onClick={() => window.open(`/profile/${content.id}`, '_blank')}
          >
            View Profile
          </Button>
        </div>
      )}

      {content.type === 'post' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {content.owner && (
              <Avatar
                src={content.owner.avatarUrl}
                alt={content.owner.username}
                className="w-10 h-10"
              />
            )}
            <div>
              {content.owner && (
                <p className="font-semibold">{content.owner.username}</p>
              )}
              {content.createdAt && (
                <p className="text-sm text-gray-500">
                  {new Date(content.createdAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          <h2 className="text-xl font-bold">{content.title}</h2>
          {content.description && (
            <p className="text-gray-600">{content.description}</p>
          )}
          {content.imageUrl && (
            <img
              src={content.imageUrl}
              alt={content.title}
              className="w-full rounded-lg"
            />
          )}
          <Button
            variant="outline"
            onClick={() => window.open(`/post/${content.id}`, '_blank')}
          >
            View Post
          </Button>
        </div>
      )}

      {content.type === 'nft' && (
        <div className="space-y-4">
          <div className="aspect-square rounded-lg overflow-hidden">
            <img
              src={content.imageUrl}
              alt={content.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold">{content.title}</h2>
            {content.description && (
              <p className="text-gray-600">{content.description}</p>
            )}
            {content.owner && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Owned by</span>
                <Avatar
                  src={content.owner.avatarUrl}
                  alt={content.owner.username}
                  className="w-6 h-6"
                />
                <span className="font-semibold">{content.owner.username}</span>
              </div>
            )}
            {content.metadata && (
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(content.metadata).map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <span className="text-gray-500">{key}</span>
                    <p className="font-medium">{String(value)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Button
            variant="outline"
            onClick={() => window.open(`/nft/${content.id}`, '_blank')}
          >
            View NFT
          </Button>
        </div>
      )}
    </motion.div>
  );
} 