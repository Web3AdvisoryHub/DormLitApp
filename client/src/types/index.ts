import { z } from 'zod';

// User Types
export interface User {
  id: number;
  username: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
  settings: UserSettings;
  isCreator: boolean;
  balance: number;
  followers: number;
  following: number;
  posts: number;
  customItems: number;
  nfts: number;
  scenes: number;
  callHistory: CallRecord[];
  messageHistory: TextMessage[];
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  phoneLineSettings?: PhoneLineSettings;
}

// Avatar Types
export interface Avatar {
  skinTone: string;
  hairStyle: string;
  hairColor: string;
  clothingStyle: string;
  clothingColor: string;
  customItems: CustomItem[];
  nfts: NFTItem[];
}

// Custom Item Types
export interface CustomItem {
  id: number;
  userId: number;
  name: string;
  description: string;
  imageUrl: string;
  type: 'clothing' | 'accessory' | 'background';
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// NFT Types
export interface NFTItem {
  id: number;
  userId: number;
  name: string;
  description: string;
  imageUrl: string;
  tokenId: string;
  contractAddress: string;
  chain: string;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// Scene Types
export interface Scene {
  id: number;
  userId: number;
  name: string;
  description: string;
  imageUrl: string;
  duration: number;
  attachments: SceneAttachment[];
  createdAt: string;
  updatedAt: string;
}

export interface SceneAttachment {
  id: number;
  sceneId: number;
  type: 'image' | 'video' | 'audio' | 'text';
  url: string;
  duration?: number;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// Phone Line Types
export interface PhoneLineSettings {
  callRate: number;
  textRate: number;
  availability: {
    status: 'online' | 'offline' | 'busy';
    hours: {
      start: string;
      end: string;
    };
  };
  platformFee: number;
}

export interface CallRecord {
  id: number;
  userId: number;
  creatorId: number;
  duration: number;
  cost: number;
  platformFee: number;
  status: 'active' | 'completed' | 'missed' | 'rejected';
  startedAt: string;
  endedAt?: string;
  createdAt: string;
}

export interface TextMessage {
  id: number;
  userId: number;
  creatorId: number;
  message: string;
  cost: number;
  platformFee: number;
  status: 'sent' | 'delivered' | 'read';
  createdAt: string;
}

// Social Types
export interface Post {
  id: number;
  userId: number;
  content: string;
  imageUrl?: string;
  likes: number;
  comments: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: number;
  postId: number;
  userId: number;
  content: string;
  likes: number;
  createdAt: string;
  updatedAt: string;
}

export interface Like {
  id: number;
  postId: number;
  userId: number;
  createdAt: string;
}

// Notification Types
export interface Notification {
  id: number;
  userId: number;
  type: 'info' | 'success' | 'warning' | 'error' | 'call' | 'message' | 'follow' | 'like' | 'comment' | 'purchase' | 'custom';
  title: string;
  message: string;
  imageUrl?: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Validation Schemas
export const userSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(8),
  bio: z.string().max(500).optional(),
});

export const avatarSchema = z.object({
  skinTone: z.string(),
  hairStyle: z.string(),
  hairColor: z.string(),
  clothingStyle: z.string(),
  clothingColor: z.string(),
});

export const customItemSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(2000),
  type: z.enum(['clothing', 'accessory', 'background']),
  category: z.string(),
  tags: z.array(z.string().max(20)).max(10),
});

export const nftSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(2000),
  tokenId: z.string(),
  contractAddress: z.string(),
  chain: z.string(),
  metadata: z.record(z.any()),
});

export const sceneSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(2000),
  duration: z.number().min(1).max(300),
  attachments: z.array(z.object({
    type: z.enum(['image', 'video', 'audio', 'text']),
    url: z.string(),
    duration: z.number().optional(),
    metadata: z.record(z.any()),
  })),
});

export const phoneLineSettingsSchema = z.object({
  callRate: z.number().min(0),
  textRate: z.number().min(0),
  availability: z.object({
    status: z.enum(['online', 'offline', 'busy']),
    hours: z.object({
      start: z.string(),
      end: z.string(),
    }),
  }),
  platformFee: z.number().min(0).max(100),
});

export const postSchema = z.object({
  content: z.string().min(1).max(1000),
  imageUrl: z.string().optional(),
});

export const commentSchema = z.object({
  content: z.string().min(1).max(500),
}); 