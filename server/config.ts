export const config = {
  // ... existing config ...
  
  filecoin: {
    enabled: process.env.FILECOIN_ENABLED === 'true',
    web3StorageToken: process.env.WEB3_STORAGE_TOKEN || '',
    nftStorageToken: process.env.NFT_STORAGE_TOKEN || '',
    premiumFeatures: {
      roomArchives: true,
      encryptedVault: true,
      nftStorage: true
    }
  }
}; 