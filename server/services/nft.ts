import { ethers } from 'ethers';
import { IStorage } from '../storage';
import { NFTItem } from '@shared/schema';

export class NFTService {
  private provider: ethers.providers.JsonRpcProvider;
  private contract: ethers.Contract;
  private storage: IStorage;

  constructor(storage: IStorage) {
    this.provider = new ethers.providers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL || 'http://localhost:8545');
    this.contract = new ethers.Contract(
      process.env.NFT_CONTRACT_ADDRESS || '',
      process.env.NFT_CONTRACT_ABI || '',
      this.provider
    );
    this.storage = storage;
  }

  async mintNFT(data: {
    name: string;
    description: string;
    imageUrl: string;
    ownerId: number;
  }): Promise<{ tokenId: string; contractAddress: string }> {
    try {
      // Connect to the contract with the owner's wallet
      const wallet = new ethers.Wallet(process.env.OWNER_PRIVATE_KEY || '', this.provider);
      const contractWithSigner = this.contract.connect(wallet);

      // Mint the NFT
      const tx = await contractWithSigner.mint(
        data.name,
        data.description,
        data.imageUrl
      );
      await tx.wait();

      // Get the token ID from the transaction receipt
      const receipt = await this.provider.getTransactionReceipt(tx.hash);
      const tokenId = receipt.logs[0].topics[3];

      return {
        tokenId,
        contractAddress: this.contract.address,
      };
    } catch (error) {
      console.error('Error minting NFT:', error);
      throw new Error('Failed to mint NFT');
    }
  }

  async purchaseNFT(data: {
    tokenId: string;
    contractAddress: string;
    buyerId: number;
    price: string;
  }): Promise<void> {
    try {
      // Get the buyer's wallet
      const buyer = await this.storage.getUser(data.buyerId);
      if (!buyer || !buyer.walletAddress) {
        throw new Error('Buyer wallet not found');
      }

      // Connect to the contract with the buyer's wallet
      const wallet = new ethers.Wallet(buyer.privateKey || '', this.provider);
      const contractWithSigner = this.contract.connect(wallet);

      // Execute the purchase
      const tx = await contractWithSigner.purchase(
        data.tokenId,
        { value: ethers.utils.parseEther(data.price) }
      );
      await tx.wait();
    } catch (error) {
      console.error('Error purchasing NFT:', error);
      throw new Error('Failed to purchase NFT');
    }
  }

  async getNFTMetadata(tokenId: string): Promise<NFTItem> {
    try {
      const metadata = await this.contract.tokenURI(tokenId);
      return {
        id: tokenId,
        name: metadata.name,
        description: metadata.description,
        imageUrl: metadata.image,
        tokenId,
        contractAddress: this.contract.address,
        ownerId: 0, // Will be updated from storage
        price: '0.1', // Default price
      };
    } catch (error) {
      console.error('Error getting NFT metadata:', error);
      throw new Error('Failed to get NFT metadata');
    }
  }
} 