import { 
  users, type User, type InsertUser,
  profileLinks, type ProfileLink, type InsertProfileLink,
  storeItems, type StoreItem, type InsertStoreItem,
  fanPosts, type FanPost, type InsertFanPost
} from "@shared/schema";

// Storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;
  
  // Profile link methods
  getProfileLinks(userId: number): Promise<ProfileLink[]>;
  createProfileLink(link: InsertProfileLink): Promise<ProfileLink>;
  updateProfileLink(id: number, data: Partial<ProfileLink>): Promise<ProfileLink | undefined>;
  deleteProfileLink(id: number): Promise<boolean>;
  
  // Store items methods
  getStoreItems(userId: number): Promise<StoreItem[]>;
  getStoreItem(id: number): Promise<StoreItem | undefined>;
  createStoreItem(item: InsertStoreItem): Promise<StoreItem>;
  updateStoreItem(id: number, data: Partial<StoreItem>): Promise<StoreItem | undefined>;
  deleteStoreItem(id: number): Promise<boolean>;
  
  // Fan posts methods
  getFanPosts(creatorId: number): Promise<FanPost[]>;
  getFanPostsWithUserInfo(creatorId: number): Promise<(FanPost & { user: Partial<User> })[]>;
  createFanPost(post: InsertFanPost): Promise<FanPost>;
  deleteFanPost(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private links: Map<number, ProfileLink>;
  private items: Map<number, StoreItem>;
  private posts: Map<number, FanPost>;
  
  private userId: number = 1;
  private linkId: number = 1;
  private itemId: number = 1;
  private postId: number = 1;

  constructor() {
    this.users = new Map();
    this.links = new Map();
    this.items = new Map();
    this.posts = new Map();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      avatarType: "default", 
      avatarSettings: {}, 
      bio: "", 
      createdAt: now
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Profile link methods
  async getProfileLinks(userId: number): Promise<ProfileLink[]> {
    return Array.from(this.links.values())
      .filter(link => link.userId === userId)
      .sort((a, b) => a.order - b.order);
  }
  
  async createProfileLink(link: InsertProfileLink): Promise<ProfileLink> {
    const id = this.linkId++;
    const newLink: ProfileLink = { ...link, id };
    this.links.set(id, newLink);
    return newLink;
  }
  
  async updateProfileLink(id: number, data: Partial<ProfileLink>): Promise<ProfileLink | undefined> {
    const link = this.links.get(id);
    if (!link) return undefined;
    
    const updatedLink = { ...link, ...data };
    this.links.set(id, updatedLink);
    return updatedLink;
  }
  
  async deleteProfileLink(id: number): Promise<boolean> {
    return this.links.delete(id);
  }

  // Store items methods
  async getStoreItems(userId: number): Promise<StoreItem[]> {
    return Array.from(this.items.values())
      .filter(item => item.userId === userId && item.active);
  }
  
  async getStoreItem(id: number): Promise<StoreItem | undefined> {
    return this.items.get(id);
  }
  
  async createStoreItem(item: InsertStoreItem): Promise<StoreItem> {
    const id = this.itemId++;
    const now = new Date();
    const newItem: StoreItem = { ...item, id, active: true, createdAt: now };
    this.items.set(id, newItem);
    return newItem;
  }
  
  async updateStoreItem(id: number, data: Partial<StoreItem>): Promise<StoreItem | undefined> {
    const item = this.items.get(id);
    if (!item) return undefined;
    
    const updatedItem = { ...item, ...data };
    this.items.set(id, updatedItem);
    return updatedItem;
  }
  
  async deleteStoreItem(id: number): Promise<boolean> {
    const item = this.items.get(id);
    if (!item) return false;
    
    // Soft delete by setting active to false
    item.active = false;
    this.items.set(id, item);
    return true;
  }

  // Fan posts methods
  async getFanPosts(creatorId: number): Promise<FanPost[]> {
    return Array.from(this.posts.values())
      .filter(post => post.creatorId === creatorId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getFanPostsWithUserInfo(creatorId: number): Promise<(FanPost & { user: Partial<User> })[]> {
    const posts = await this.getFanPosts(creatorId);
    
    return posts.map(post => {
      const user = this.users.get(post.userId);
      return {
        ...post,
        user: user ? { id: user.id, username: user.username, displayName: user.displayName, avatarType: user.avatarType, avatarSettings: user.avatarSettings } : { id: 0, username: "deleted", displayName: "Deleted User" }
      };
    });
  }
  
  async createFanPost(post: InsertFanPost): Promise<FanPost> {
    const id = this.postId++;
    const now = new Date();
    const newPost: FanPost = { ...post, id, createdAt: now };
    this.posts.set(id, newPost);
    return newPost;
  }
  
  async deleteFanPost(id: number): Promise<boolean> {
    return this.posts.delete(id);
  }
}

// Export storage instance
export const storage = new MemStorage();
