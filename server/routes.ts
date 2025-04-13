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

  const httpServer = createServer(app);
  return httpServer;
}
