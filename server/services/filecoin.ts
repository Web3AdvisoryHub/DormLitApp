import { Web3Storage } from 'web3.storage';
import { NFTStorage } from 'nft.storage';
import { DatabaseService } from './database';
import { CacheService } from './cache';
import { config } from '../config';

export class FilecoinService {
  private static instance: FilecoinService;
  private web3Storage: Web3Storage | null = null;
  private nftStorage: NFTStorage | null = null;
  private isEnabled: boolean = false;

  private constructor(
    private database: DatabaseService,
    private cache: CacheService
  ) {
    this.initialize();
  }

  public static getInstance(
    database: DatabaseService,
    cache: CacheService
  ): FilecoinService {
    if (!FilecoinService.instance) {
      FilecoinService.instance = new FilecoinService(database, cache);
    }
    return FilecoinService.instance;
  }

  private async initialize() {
    // Check if Filecoin is enabled in config
    this.isEnabled = config.filecoin.enabled;

    if (this.isEnabled) {
      try {
        // Initialize Web3.Storage for general file storage
        this.web3Storage = new Web3Storage({ token: config.filecoin.web3StorageToken });
        
        // Initialize NFT.Storage for NFT metadata
        this.nftStorage = new NFTStorage({ token: config.filecoin.nftStorageToken });
        
        console.log('Filecoin services initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Filecoin services:', error);
        this.isEnabled = false;
      }
    }
  }

  // Avatar Storage
  public async storeAvatar(userId: string, avatarData: any): Promise<string | null> {
    if (!this.isEnabled || !this.web3Storage) return null;

    try {
      const file = new File([JSON.stringify(avatarData)], `avatar_${userId}.json`, {
        type: 'application/json',
      });

      const cid = await this.web3Storage.put([file]);
      await this.database.updateUser(userId, { avatarCid: cid });
      return cid;
    } catch (error) {
      console.error('Failed to store avatar on Filecoin:', error);
      return null;
    }
  }

  // Room Asset Storage
  public async storeRoomAsset(roomId: string, assetData: any): Promise<string | null> {
    if (!this.isEnabled || !this.web3Storage) return null;

    try {
      const file = new File([JSON.stringify(assetData)], `room_${roomId}_asset.json`, {
        type: 'application/json',
      });

      const cid = await this.web3Storage.put([file]);
      await this.database.updateRoom(roomId, { assetCid: cid });
      return cid;
    } catch (error) {
      console.error('Failed to store room asset on Filecoin:', error);
      return null;
    }
  }

  // Room Layout Archive (Premium Feature)
  public async archiveRoomLayout(roomId: string, layoutData: any): Promise<string | null> {
    if (!this.isEnabled || !this.web3Storage) return null;

    try {
      const file = new File([JSON.stringify(layoutData)], `room_${roomId}_layout.json`, {
        type: 'application/json',
      });

      const cid = await this.web3Storage.put([file]);
      await this.database.updateRoom(roomId, { layoutArchiveCid: cid });
      return cid;
    } catch (error) {
      console.error('Failed to archive room layout on Filecoin:', error);
      return null;
    }
  }

  // Encrypted User Data Vault
  public async storeEncryptedData(userId: string, encryptedData: any): Promise<string | null> {
    if (!this.isEnabled || !this.web3Storage) return null;

    try {
      const file = new File([JSON.stringify(encryptedData)], `user_${userId}_vault.json`, {
        type: 'application/json',
      });

      const cid = await this.web3Storage.put([file]);
      await this.database.updateUser(userId, { dataVaultCid: cid });
      return cid;
    } catch (error) {
      console.error('Failed to store encrypted data on Filecoin:', error);
      return null;
    }
  }

  // Retrieve stored data
  public async retrieveData(cid: string): Promise<any | null> {
    if (!this.isEnabled || !this.web3Storage) return null;

    try {
      const res = await this.web3Storage.get(cid);
      if (!res) return null;

      const files = await res.files();
      if (files.length === 0) return null;

      const file = files[0];
      const content = await file.text();
      return JSON.parse(content);
    } catch (error) {
      console.error('Failed to retrieve data from Filecoin:', error);
      return null;
    }
  }

  // Check if user has premium features enabled
  private async hasPremiumAccess(userId: string): Promise<boolean> {
    const user = await this.database.getUser(userId);
    return user?.subscriptionTier === 'premium';
  }
} 