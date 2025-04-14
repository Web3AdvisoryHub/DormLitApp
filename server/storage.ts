import { 
  users, type User, type InsertUser,
  profileLinks, type ProfileLink, type InsertProfileLink,
  storeItems, type StoreItem, type InsertStoreItem,
  fanPosts, type FanPost, type InsertFanPost,
  customItems, type CustomItem,
  nftItems, type NFTItem
} from "@shared/schema";

// Storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;
  updateUserAvatar(id: number, avatarUrl: string): Promise<User | undefined>;
  
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

  // Custom Items
  createCustomItem(data: {
    userId: number;
    name: string;
    type: 'clothing' | 'accessory';
    imageUrl: string;
    isNFT: boolean;
  }): Promise<CustomItem>;
  
  getCustomItems(userId: number): Promise<CustomItem[]>;
  
  deleteCustomItem(id: string): Promise<void>;

  // NFT Items
  createNFTItem(data: {
    name: string;
    description: string;
    imageUrl: string;
    tokenId: string;
    contractAddress: string;
    ownerId: number;
    roomId: string;
    price: string;
  }): Promise<NFTItem>;
  
  getNFTItems(roomId: string): Promise<NFTItem[]>;
  
  updateNFTOwnership(tokenId: string, newOwnerId: number): Promise<void>;
  
  getNFTItem(tokenId: string): Promise<NFTItem | undefined>;

  // File Storage
  uploadFile(file: File): Promise<string>;

  // Phone line methods
  getPhoneLineCreators(): Promise<User[]>;
  updateUserBalance(userId: number, amount: number): Promise<User | undefined>;
  createCallRecord(record: CallRecord): Promise<CallRecord>;
  createTextMessage(message: TextMessage): Promise<TextMessage>;
  updatePhoneLineSettings(userId: number, settings: PhoneLineSettings): Promise<User | undefined>;
  getCallHistory(userId: number): Promise<CallRecord[]>;
  getMessageHistory(userId: number): Promise<TextMessage[]>;
  getActiveCalls(): Promise<CallRecord[]>;
  endCall(callId: number): Promise<CallRecord | undefined>;

  updateUserPlan(userId: number, plan: 'free' | 'paid' | 'pro'): Promise<User | undefined>;
  getPlatformEarnings(): Promise<{ totalEarnings: number; callEarnings: number; textEarnings: number }>;

  // Follow system methods
  followUser(followerId: number, followingId: number): Promise<Follow>;
  unfollowUser(followerId: number, followingId: number): Promise<boolean>;
  getFollowers(userId: number): Promise<User[]>;
  getFollowing(userId: number): Promise<User[]>;
  getFollowerCount(userId: number): Promise<number>;
  getFollowingCount(userId: number): Promise<number>;
  isFollowing(followerId: number, followingId: number): Promise<boolean>;
  
  // Room access methods
  requestRoomAccess(userId: number, roomId: string, accessType: 'creator' | 'dreamstate'): Promise<RoomAccess | undefined>;
  grantRoomAccess(userId: number, roomId: string): Promise<RoomAccess>;
  revokeRoomAccess(userId: number, roomId: string): Promise<boolean>;
  hasRoomAccess(userId: number, roomId: string): Promise<boolean>;
  getRoomVisitors(roomId: string): Promise<User[]>;
}

export interface PhoneLineSettings {
  callRate: number;
  textRate: number;
  isAvailable: boolean;
  availabilityHours: {
    start: string;
    end: string;
  };
  isEnabled: boolean;
  platformFee: number;
}

export interface CallRecord {
  id: number;
  userId: number;
  creatorId: number;
  duration: number;
  cost: number;
  platformFee: number;
  status: 'active' | 'completed' | 'failed';
  startedAt: Date;
  endedAt?: Date;
}

export interface TextMessage {
  id: number;
  userId: number;
  creatorId: number;
  message: string;
  cost: number;
  platformFee: number;
  status: 'sent' | 'delivered' | 'failed';
  createdAt: Date;
}

interface Follow {
  id: number;
  followerId: number;
  followingId: number;
  createdAt: Date;
}

interface RoomAccess {
  id: number;
  userId: number;
  roomId: string;
  accessType: 'creator' | 'dreamstate';
  createdAt: Date;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private links: Map<number, ProfileLink>;
  private items: Map<number, StoreItem>;
  private posts: Map<number, FanPost>;
  private customItems: Map<string, CustomItem>;
  private nftItems: Map<string, NFTItem>;
  private callRecords: Map<number, CallRecord> = new Map();
  private textMessages: Map<number, TextMessage> = new Map();
  private phoneLineSettings: Map<number, PhoneLineSettings> = new Map();
  private activeCalls: Map<number, CallRecord> = new Map();
  private callTimers: Map<number, NodeJS.Timeout> = new Map();
  private follows: Map<number, Follow> = new Map();
  private roomAccess: Map<number, RoomAccess> = new Map();
  private nextCallRecordId = 1;
  private nextTextMessageId = 1;
  private nextFollowId = 1;
  private nextRoomAccessId = 1;
  
  private userId: number = 1;
  private linkId: number = 1;
  private itemId: number = 1;
  private postId: number = 1;

  private platformEarnings = {
    totalEarnings: 0,
    callEarnings: 0,
    textEarnings: 0
  };

  constructor() {
    this.users = new Map();
    this.links = new Map();
    this.items = new Map();
    this.posts = new Map();
    this.customItems = new Map();
    this.nftItems = new Map();
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

  async updateUserAvatar(id: number, avatarUrl: string): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { 
      ...user, 
      avatarType: "readyplayerme",
      avatarSettings: { url: avatarUrl }
    };
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

  // Custom Items
  async createCustomItem(data: {
    userId: number;
    name: string;
    type: 'clothing' | 'accessory';
    imageUrl: string;
    isNFT: boolean;
  }): Promise<CustomItem> {
    const id = generateId();
    const item: CustomItem = {
      id,
      ...data,
    };
    this.customItems.set(id, item);
    return item;
  }

  async getCustomItems(userId: number): Promise<CustomItem[]> {
    return Array.from(this.customItems.values())
      .filter(item => item.userId === userId);
  }

  async deleteCustomItem(id: string): Promise<void> {
    this.customItems.delete(id);
  }

  // NFT Items
  async createNFTItem(data: {
    name: string;
    description: string;
    imageUrl: string;
    tokenId: string;
    contractAddress: string;
    ownerId: number;
    roomId: string;
    price: string;
  }): Promise<NFTItem> {
    const id = generateId();
    const item: NFTItem = {
      id,
      ...data,
    };
    this.nftItems.set(id, item);
    return item;
  }

  async getNFTItems(roomId: string): Promise<NFTItem[]> {
    return Array.from(this.nftItems.values())
      .filter(item => item.roomId === roomId);
  }

  async updateNFTOwnership(tokenId: string, newOwnerId: number): Promise<void> {
    for (const item of this.nftItems.values()) {
      if (item.tokenId === tokenId) {
        item.ownerId = newOwnerId;
        break;
      }
    }
  }

  async getNFTItem(tokenId: string): Promise<NFTItem | undefined> {
    return Array.from(this.nftItems.values())
      .find(item => item.tokenId === tokenId);
  }

  // File Storage
  async uploadFile(file: File): Promise<string> {
    // In a real implementation, this would upload to IPFS, S3, etc.
    // For now, we'll just return a mock URL
    return `https://storage.example.com/${file.name}`;
  }

  // Phone line methods
  async getPhoneLineCreators(): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.isCreator);
  }

  async updateUserBalance(userId: number, amount: number): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;

    user.balance += amount;
    this.users.set(userId, user);
    return user;
  }

  async createCallRecord(record: CallRecord): Promise<CallRecord> {
    const id = this.nextCallRecordId++;
    const newRecord = { ...record, id, startedAt: new Date() };
    
    // Start the call timer
    const timer = setInterval(async () => {
      const call = this.activeCalls.get(id);
      if (call) {
        call.duration += 1;
        const settings = this.phoneLineSettings.get(call.creatorId);
        if (settings) {
          call.cost = call.duration * settings.callRate;
        }
      }
    }, 60000); // Update every minute

    this.callTimers.set(id, timer);
    this.activeCalls.set(id, newRecord);
    this.callRecords.set(id, newRecord);
    
    return newRecord;
  }

  async createTextMessage(message: TextMessage): Promise<TextMessage> {
    const id = this.nextTextMessageId++;
    const newMessage = { ...message, id, createdAt: new Date() };
    
    // Calculate platform fee and update balances
    const settings = this.phoneLineSettings.get(message.creatorId);
    if (settings) {
      const platformFee = message.cost * settings.platformFee;
      const creatorEarnings = message.cost - platformFee;

      await this.updateUserBalance(message.userId, -message.cost);
      await this.updateUserBalance(message.creatorId, creatorEarnings);
    }

    this.textMessages.set(id, newMessage);
    return newMessage;
  }

  async updatePhoneLineSettings(userId: number, settings: PhoneLineSettings): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;

    this.phoneLineSettings.set(userId, settings);
    return user;
  }

  async getCallHistory(userId: number): Promise<CallRecord[]> {
    return Array.from(this.callRecords.values())
      .filter(record => record.userId === userId || record.creatorId === userId)
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
  }

  async getMessageHistory(userId: number): Promise<TextMessage[]> {
    return Array.from(this.textMessages.values())
      .filter(message => message.userId === userId || message.creatorId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getActiveCalls(): Promise<CallRecord[]> {
    return Array.from(this.activeCalls.values());
  }

  async endCall(callId: number): Promise<CallRecord | undefined> {
    const call = this.activeCalls.get(callId);
    if (!call) return undefined;

    // Clear the timer
    const timer = this.callTimers.get(callId);
    if (timer) {
      clearInterval(timer);
      this.callTimers.delete(callId);
    }

    // Update call record
    call.status = 'completed';
    call.endedAt = new Date();
    this.activeCalls.delete(callId);
    this.callRecords.set(callId, call);

    // Update balances
    const platformFee = call.cost * call.platformFee;
    const creatorEarnings = call.cost - platformFee;

    await this.updateUserBalance(call.userId, -call.cost);
    await this.updateUserBalance(call.creatorId, creatorEarnings);

    return call;
  }

  async updateUserPlan(userId: number, plan: 'free' | 'paid' | 'pro'): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;

    const updatedUser = { ...user, plan };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async getPlatformEarnings(): Promise<{ totalEarnings: number; callEarnings: number; textEarnings: number }> {
    return this.platformEarnings;
  }

  // Follow system methods
  async followUser(followerId: number, followingId: number): Promise<Follow> {
    const follow: Follow = {
      id: this.nextFollowId++,
      followerId,
      followingId,
      createdAt: new Date()
    };
    this.follows.set(follow.id, follow);
    return follow;
  }

  async unfollowUser(followerId: number, followingId: number): Promise<boolean> {
    const follow = Array.from(this.follows.values()).find(
      f => f.followerId === followerId && f.followingId === followingId
    );
    if (!follow) return false;
    return this.follows.delete(follow.id);
  }

  async getFollowers(userId: number): Promise<User[]> {
    const followerIds = Array.from(this.follows.values())
      .filter(f => f.followingId === userId)
      .map(f => f.followerId);
    return Array.from(this.users.values())
      .filter(u => followerIds.includes(u.id));
  }

  async getFollowing(userId: number): Promise<User[]> {
    const followingIds = Array.from(this.follows.values())
      .filter(f => f.followerId === userId)
      .map(f => f.followingId);
    return Array.from(this.users.values())
      .filter(u => followingIds.includes(u.id));
  }

  async getFollowerCount(userId: number): Promise<number> {
    return Array.from(this.follows.values())
      .filter(f => f.followingId === userId)
      .length;
  }

  async getFollowingCount(userId: number): Promise<number> {
    return Array.from(this.follows.values())
      .filter(f => f.followerId === userId)
      .length;
  }

  async isFollowing(followerId: number, followingId: number): Promise<boolean> {
    return Array.from(this.follows.values())
      .some(f => f.followerId === followerId && f.followingId === followingId);
  }

  // Room access methods
  async requestRoomAccess(userId: number, roomId: string, accessType: 'creator' | 'dreamstate'): Promise<RoomAccess | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;

    const roomOwner = Array.from(this.users.values()).find(u => 
      u.isCreator && (u.creatorRoomId === roomId || u.dreamStateRoomId === roomId)
    );
    if (!roomOwner) return undefined;

    const isFollowing = await this.isFollowing(userId, roomOwner.id);
    if (!isFollowing) {
      throw new Error('Must follow creator to access room');
    }

    const access: RoomAccess = {
      id: this.nextRoomAccessId++,
      userId,
      roomId,
      accessType,
      createdAt: new Date()
    };
    this.roomAccess.set(access.id, access);
    return access;
  }

  async grantRoomAccess(userId: number, roomId: string): Promise<RoomAccess> {
    const access = Array.from(this.roomAccess.values())
      .find(a => a.userId === userId && a.roomId === roomId);
    if (!access) {
      throw new Error('No access request found');
    }
    return access;
  }

  async revokeRoomAccess(userId: number, roomId: string): Promise<boolean> {
    const access = Array.from(this.roomAccess.values())
      .find(a => a.userId === userId && a.roomId === roomId);
    if (!access) return false;
    return this.roomAccess.delete(access.id);
  }

  async hasRoomAccess(userId: number, roomId: string): Promise<boolean> {
    return Array.from(this.roomAccess.values())
      .some(a => a.userId === userId && a.roomId === roomId);
  }

  async getRoomVisitors(roomId: string): Promise<User[]> {
    const visitorIds = Array.from(this.roomAccess.values())
      .filter(a => a.roomId === roomId)
      .map(a => a.userId);
    return Array.from(this.users.values())
      .filter(u => visitorIds.includes(u.id));
  }
}

// Export storage instance
export const storage = new MemStorage();
