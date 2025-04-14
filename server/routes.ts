import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertProfileLinkSchema, 
  insertStoreItemSchema, 
  insertFanPostSchema
} from "@shared/schema";
import { z } from "zod";
import { WebSocket } from "ws";
import { Router } from 'express';
import { supabase } from './lib/supabase';
import { SubscriptionService } from './services/subscription.service';
import { WalletService } from './services/wallet.service';

const router = Router();

export async function registerRoutes(app: Express): Promise<Server> {
  // === AUTH ROUTES ===
  // Register a new user
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }
      
      // Check if email exists
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already in use" });
      }
      
      const newUser = await storage.createUser(userData);
      
      // Don't return password in response
      const { password, ...userWithoutPassword } = newUser;
      return res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create user" });
    }
  });
  
  // Login user
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Don't return password in response
      const { password: _, ...userWithoutPassword } = user;
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      return res.status(500).json({ message: "Failed to login" });
    }
  });
  
  // === USER ROUTES ===
  // Get user profile
  app.get("/api/users/:username", async (req: Request, res: Response) => {
    try {
      const { username } = req.params;
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't return password in response
      const { password, ...userWithoutPassword } = user;
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      return res.status(500).json({ message: "Failed to get user" });
    }
  });
  
  // Update user profile
  app.patch("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Only allow certain fields to be updated
      const updateSchema = z.object({
        displayName: z.string().optional(),
        bio: z.string().optional(),
        avatarType: z.string().optional(),
        avatarSettings: z.record(z.any()).optional(),
      });
      
      const userData = updateSchema.parse(req.body);
      const updatedUser = await storage.updateUser(userId, userData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't return password in response
      const { password, ...userWithoutPassword } = updatedUser;
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to update user" });
    }
  });
  
  // Update user avatar
  app.post("/api/users/avatar", async (req: Request, res: Response) => {
    try {
      const { avatarUrl } = req.body;
      const userId = req.session.userId; // Assuming you have session middleware

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (!avatarUrl) {
        return res.status(400).json({ message: "Avatar URL is required" });
      }

      await storage.updateUserAvatar(userId, avatarUrl);
      return res.status(200).json({ message: "Avatar updated successfully" });
    } catch (error) {
      return res.status(500).json({ message: "Failed to update avatar" });
    }
  });
  
  // === PROFILE LINKS ROUTES ===
  // Get all links for a user
  app.get("/api/users/:userId/links", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const links = await storage.getProfileLinks(userId);
      return res.status(200).json(links);
    } catch (error) {
      return res.status(500).json({ message: "Failed to get profile links" });
    }
  });
  
  // Create a new profile link
  app.post("/api/users/:userId/links", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const linkData = insertProfileLinkSchema.parse({ ...req.body, userId });
      const newLink = await storage.createProfileLink(linkData);
      
      return res.status(201).json(newLink);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid link data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create profile link" });
    }
  });
  
  // Update a profile link
  app.patch("/api/links/:id", async (req: Request, res: Response) => {
    try {
      const linkId = parseInt(req.params.id);
      
      if (isNaN(linkId)) {
        return res.status(400).json({ message: "Invalid link ID" });
      }
      
      // Only allow certain fields to be updated
      const updateSchema = z.object({
        title: z.string().optional(),
        url: z.string().optional(),
        icon: z.string().optional(),
        order: z.number().optional(),
      });
      
      const linkData = updateSchema.parse(req.body);
      const updatedLink = await storage.updateProfileLink(linkId, linkData);
      
      if (!updatedLink) {
        return res.status(404).json({ message: "Link not found" });
      }
      
      return res.status(200).json(updatedLink);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid link data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to update profile link" });
    }
  });
  
  // Delete a profile link
  app.delete("/api/links/:id", async (req: Request, res: Response) => {
    try {
      const linkId = parseInt(req.params.id);
      
      if (isNaN(linkId)) {
        return res.status(400).json({ message: "Invalid link ID" });
      }
      
      const success = await storage.deleteProfileLink(linkId);
      
      if (!success) {
        return res.status(404).json({ message: "Link not found" });
      }
      
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: "Failed to delete profile link" });
    }
  });
  
  // === STORE ITEMS ROUTES ===
  // Get all store items for a user
  app.get("/api/users/:userId/store", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const items = await storage.getStoreItems(userId);
      return res.status(200).json(items);
    } catch (error) {
      return res.status(500).json({ message: "Failed to get store items" });
    }
  });
  
  // Get a single store item
  app.get("/api/store/:id", async (req: Request, res: Response) => {
    try {
      const itemId = parseInt(req.params.id);
      
      if (isNaN(itemId)) {
        return res.status(400).json({ message: "Invalid item ID" });
      }
      
      const item = await storage.getStoreItem(itemId);
      
      if (!item) {
        return res.status(404).json({ message: "Store item not found" });
      }
      
      return res.status(200).json(item);
    } catch (error) {
      return res.status(500).json({ message: "Failed to get store item" });
    }
  });
  
  // Create a new store item
  app.post("/api/users/:userId/store", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const itemData = insertStoreItemSchema.parse({ ...req.body, userId });
      const newItem = await storage.createStoreItem(itemData);
      
      return res.status(201).json(newItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid item data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create store item" });
    }
  });
  
  // Update a store item
  app.patch("/api/store/:id", async (req: Request, res: Response) => {
    try {
      const itemId = parseInt(req.params.id);
      
      if (isNaN(itemId)) {
        return res.status(400).json({ message: "Invalid item ID" });
      }
      
      // Only allow certain fields to be updated
      const updateSchema = z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        price: z.number().optional(),
        imageUrl: z.string().optional(),
        type: z.string().optional(),
        active: z.boolean().optional(),
      });
      
      const itemData = updateSchema.parse(req.body);
      const updatedItem = await storage.updateStoreItem(itemId, itemData);
      
      if (!updatedItem) {
        return res.status(404).json({ message: "Store item not found" });
      }
      
      return res.status(200).json(updatedItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid item data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to update store item" });
    }
  });
  
  // Delete a store item
  app.delete("/api/store/:id", async (req: Request, res: Response) => {
    try {
      const itemId = parseInt(req.params.id);
      
      if (isNaN(itemId)) {
        return res.status(400).json({ message: "Invalid item ID" });
      }
      
      const success = await storage.deleteStoreItem(itemId);
      
      if (!success) {
        return res.status(404).json({ message: "Store item not found" });
      }
      
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: "Failed to delete store item" });
    }
  });
  
  // === FAN POSTS ROUTES ===
  // Get all fan posts for a creator
  app.get("/api/users/:creatorId/fanposts", async (req: Request, res: Response) => {
    try {
      const creatorId = parseInt(req.params.creatorId);
      
      if (isNaN(creatorId)) {
        return res.status(400).json({ message: "Invalid creator ID" });
      }
      
      const posts = await storage.getFanPostsWithUserInfo(creatorId);
      return res.status(200).json(posts);
    } catch (error) {
      return res.status(500).json({ message: "Failed to get fan posts" });
    }
  });
  
  // Create a new fan post
  app.post("/api/users/:creatorId/fanposts", async (req: Request, res: Response) => {
    try {
      const creatorId = parseInt(req.params.creatorId);
      
      if (isNaN(creatorId)) {
        return res.status(400).json({ message: "Invalid creator ID" });
      }
      
      const postData = insertFanPostSchema.parse({ ...req.body, creatorId });
      const newPost = await storage.createFanPost(postData);
      
      // Get the user info for the response
      const user = await storage.getUser(postData.userId);
      const postWithUser = {
        ...newPost,
        user: user ? { 
          id: user.id, 
          username: user.username, 
          displayName: user.displayName, 
          avatarType: user.avatarType, 
          avatarSettings: user.avatarSettings 
        } : { 
          id: 0, 
          username: "deleted", 
          displayName: "Deleted User" 
        }
      };
      
      return res.status(201).json(postWithUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid post data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create fan post" });
    }
  });
  
  // Delete a fan post
  app.delete("/api/fanposts/:id", async (req: Request, res: Response) => {
    try {
      const postId = parseInt(req.params.id);
      
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      const success = await storage.deleteFanPost(postId);
      
      if (!success) {
        return res.status(404).json({ message: "Fan post not found" });
      }
      
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: "Failed to delete fan post" });
    }
  });

  // Custom Items Routes
  app.post('/api/items/upload', sessionMiddleware, async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    try {
      const { file, name, type } = req.body;
      // Upload file to storage (e.g., IPFS, S3)
      const imageUrl = await storage.uploadFile(file);
      
      const item = await storage.createCustomItem({
        userId,
        name,
        type,
        imageUrl,
        isNFT: false,
      });

      res.json({ success: true, data: item });
    } catch (error) {
      console.error('Error uploading item:', error);
      res.status(500).json({ success: false, error: 'Failed to upload item' });
    }
  });

  // NFT Routes
  app.post('/api/nft/mint', sessionMiddleware, async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    try {
      const { name, description, imageUrl, roomId } = req.body;
      
      // Mint NFT using smart contract
      const { tokenId, contractAddress } = await nftService.mintNFT({
        name,
        description,
        imageUrl,
        ownerId: userId,
      });

      const nftItem = await storage.createNFTItem({
        name,
        description,
        imageUrl,
        tokenId,
        contractAddress,
        ownerId: userId,
        roomId,
        price: '0.1', // Default price in ETH
      });

      res.json({ success: true, data: nftItem });
    } catch (error) {
      console.error('Error minting NFT:', error);
      res.status(500).json({ success: false, error: 'Failed to mint NFT' });
    }
  });

  app.post('/api/nft/purchase', sessionMiddleware, async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    try {
      const { tokenId, contractAddress, price } = req.body;
      
      // Execute NFT purchase using smart contract
      await nftService.purchaseNFT({
        tokenId,
        contractAddress,
        buyerId: userId,
        price,
      });

      // Update ownership in database
      await storage.updateNFTOwnership(tokenId, userId);

      res.json({ success: true });
    } catch (error) {
      console.error('Error purchasing NFT:', error);
      res.status(500).json({ success: false, error: 'Failed to purchase NFT' });
    }
  });

  // Chat Routes
  app.post('/api/chat/message', sessionMiddleware, async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    try {
      const { roomId, content } = req.body;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      const message = {
        id: generateId(),
        userId,
        username: user.username,
        avatarUrl: user.avatarUrl,
        content,
        timestamp: new Date().toISOString(),
      };

      // Broadcast message to room
      chatService.broadcastMessage(roomId, message);

      res.json({ success: true, data: message });
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ success: false, error: 'Failed to send message' });
    }
  });

  // WebSocket setup for real-time chat
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws, req) => {
    const roomId = req.url?.split('/').pop();
    if (!roomId) {
      ws.close();
      return;
    }

    chatService.addClient(roomId, ws);

    ws.on('close', () => {
      chatService.removeClient(roomId, ws);
    });
  });

  // Phone line routes
  app.post('/api/phone-lines/settings', sessionMiddleware, async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const settings = req.body;
      await storage.updatePhoneLineSettings(userId, settings);
      res.json({ success: true });
    } catch (error) {
      console.error('Error updating phone line settings:', error);
      res.status(500).json({ error: 'Failed to update settings' });
    }
  });

  app.get('/api/phone-lines/creators', async (req, res) => {
    try {
      const creators = await storage.getPhoneLineCreators();
      res.json({ creators });
    } catch (error) {
      console.error('Error fetching phone line creators:', error);
      res.status(500).json({ error: 'Failed to fetch creators' });
    }
  });

  app.post('/api/phone-lines/call', sessionMiddleware, async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const { creatorId } = req.body;
      const creator = await storage.getUser(creatorId);
      if (!creator) {
        return res.status(404).json({ error: 'Creator not found' });
      }

      const settings = await storage.getPhoneLineSettings(creatorId);
      if (!settings || !settings.isAvailable) {
        return res.status(400).json({ error: 'Creator is not available' });
      }

      const callRecord = await storage.createCallRecord({
        userId,
        creatorId,
        duration: 0,
        cost: 0,
        platformFee: settings.platformFee,
        status: 'active'
      });

      res.json({ success: true, callId: callRecord.id });
    } catch (error) {
      console.error('Error initiating call:', error);
      res.status(500).json({ error: 'Failed to initiate call' });
    }
  });

  app.post('/api/phone-lines/end-call', sessionMiddleware, async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const { callId } = req.body;
      const call = await storage.endCall(callId);
      if (!call) {
        return res.status(404).json({ error: 'Call not found' });
      }

      res.json({ success: true, call });
    } catch (error) {
      console.error('Error ending call:', error);
      res.status(500).json({ error: 'Failed to end call' });
    }
  });

  app.post('/api/phone-lines/message', sessionMiddleware, async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const { creatorId, message } = req.body;
      const creator = await storage.getUser(creatorId);
      if (!creator) {
        return res.status(404).json({ error: 'Creator not found' });
      }

      const settings = await storage.getPhoneLineSettings(creatorId);
      if (!settings) {
        return res.status(400).json({ error: 'Creator phone line not configured' });
      }

      const textMessage = await storage.createTextMessage({
        userId,
        creatorId,
        message,
        cost: settings.textRate,
        platformFee: settings.platformFee,
        status: 'sent'
      });

      res.json({ success: true, message: textMessage });
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  });

  app.get('/api/phone-lines/history', sessionMiddleware, async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const [calls, messages] = await Promise.all([
        storage.getCallHistory(userId),
        storage.getMessageHistory(userId)
      ]);

      res.json({ calls, messages });
    } catch (error) {
      console.error('Error fetching history:', error);
      res.status(500).json({ error: 'Failed to fetch history' });
    }
  });

  // Signup route with grandfathered status check
  router.post('/auth/signup', async (req, res) => {
    try {
      const { email, password, username } = req.body;

      // Check if within first week of launch
      const launchDate = new Date('2024-03-01'); // Set your launch date
      const now = new Date();
      const isWithinFirstWeek = (now.getTime() - launchDate.getTime()) <= 7 * 24 * 60 * 60 * 1000;

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      // Create profile with grandfathered status if applicable
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user?.id,
          username,
          is_grandfathered: isWithinFirstWeek,
          subscription_status: isWithinFirstWeek ? 'grandfathered' : 'inactive',
          subscription_tier: isWithinFirstWeek ? 'pro_creator' : 'explorer'
        })
        .select()
        .single();

      if (profileError) throw profileError;

      res.json({ user: authData.user, profile });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Subscription routes
  router.post('/subscriptions/create', async (req, res) => {
    try {
      const { userId, tier } = req.body;
      const profile = await SubscriptionService.createSubscription(userId, tier);
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/subscriptions/cancel', async (req, res) => {
    try {
      const { userId } = req.body;
      const profile = await SubscriptionService.cancelSubscription(userId);
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Wallet routes
  router.post('/wallets/link', async (req, res) => {
    try {
      const { userId, address, provider } = req.body;
      const wallet = await WalletService.linkWallet(userId, address, provider);
      res.json(wallet);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/wallets/verify', async (req, res) => {
    try {
      const { userId, signature } = req.body;
      const wallet = await WalletService.verifyWallet(userId, signature);
      res.json(wallet);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/wallets/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const wallet = await WalletService.getWallet(userId);
      res.json(wallet);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Revenue routes
  router.post('/revenue/track', async (req, res) => {
    try {
      const { userId, amount, source } = req.body;
      const revenue = await WalletService.trackRevenue(userId, amount, source);
      res.json(revenue);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/revenue/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const revenue = await WalletService.getRevenueHistory(userId);
      res.json(revenue);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

export default router;
