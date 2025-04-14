import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  displayName: text("display_name").notNull(),
  avatarType: text("avatar_type").default("default"),
  avatarSettings: json("avatar_settings").default({}),
  bio: text("bio").default(""),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  displayName: true,
});

// Profile links table
export const profileLinks = pgTable("profile_links", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  icon: text("icon").default("link"),
  order: integer("order").default(0),
});

export const insertProfileLinkSchema = createInsertSchema(profileLinks).pick({
  userId: true,
  title: true,
  url: true,
  icon: true,
  order: true,
});

// Creator store items
export const storeItems = pgTable("store_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // Price in cents
  imageUrl: text("image_url"),
  type: text("type").default("digital"), // digital, physical, service
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertStoreItemSchema = createInsertSchema(storeItems).pick({
  userId: true,
  title: true,
  description: true,
  price: true,
  imageUrl: true,
  type: true,
});

// Fan wall posts
export const fanPosts = pgTable("fan_posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // Fan user ID
  creatorId: integer("creator_id").notNull(), // Creator user ID
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFanPostSchema = createInsertSchema(fanPosts).pick({
  userId: true,
  creatorId: true,
  content: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type ProfileLink = typeof profileLinks.$inferSelect;
export type InsertProfileLink = z.infer<typeof insertProfileLinkSchema>;

export type StoreItem = typeof storeItems.$inferSelect;
export type InsertStoreItem = z.infer<typeof insertStoreItemSchema>;

export type FanPost = typeof fanPosts.$inferSelect;
export type InsertFanPost = z.infer<typeof insertFanPostSchema>;

export interface CustomItem {
  id: string;
  userId: number;
  name: string;
  type: 'clothing' | 'accessory';
  imageUrl: string;
  isNFT: boolean;
  tokenId?: string;
  contractAddress?: string;
}

export interface NFTItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  tokenId: string;
  contractAddress: string;
  ownerId: number;
  roomId: string;
  price: string;
}

export interface RoomMessage {
  id: string;
  userId: number;
  username: string;
  avatarUrl: string;
  content: string;
  timestamp: string;
}
