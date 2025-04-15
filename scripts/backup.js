const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');
const crypto = require('crypto');
const config = require('../security.config');
const FilecoinService = require('../services/FilecoinService');
const { File } = require('ipfs-http-client');

// Initialize AWS S3
const s3 = new AWS.S3({
  region: config.backup.storage.region,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

// Create backup directory if it doesn't exist
const backupDir = path.join(__dirname, '../backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Generate backup filename with timestamp
function generateBackupFilename(type) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `${type}-backup-${timestamp}.tar.gz`;
}

// Encrypt backup file
async function encryptBackup(filePath) {
  if (!config.backup.encryption.enabled) return filePath;

  const key = crypto.scryptSync(config.backup.encryption.key, 'salt', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  const input = fs.createReadStream(filePath);
  const output = fs.createWriteStream(`${filePath}.enc`);

  input.pipe(cipher).pipe(output);

  return new Promise((resolve, reject) => {
    output.on('finish', () => {
      fs.unlinkSync(filePath);
      resolve(`${filePath}.enc`);
    });
    output.on('error', reject);
  });
}

// Upload backup to S3
async function uploadToS3(filePath, filename) {
  const fileStream = fs.createReadStream(filePath);
  const params = {
    Bucket: config.backup.storage.bucket,
    Key: `backups/${filename}`,
    Body: fileStream
  };

  await s3.upload(params).promise();
  fs.unlinkSync(filePath);
}

// Backup database
async function backupDatabase() {
  const filename = generateBackupFilename('database');
  const filePath = path.join(backupDir, filename);

  return new Promise((resolve, reject) => {
    const command = `pg_dump -U ${process.env.DB_USER} -h ${process.env.DB_HOST} ${process.env.DB_NAME} | gzip > ${filePath}`;
    
    exec(command, (error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(filePath);
    });
  });
}

// Backup files
async function backupFiles() {
  const filename = generateBackupFilename('files');
  const filePath = path.join(backupDir, filename);

  return new Promise((resolve, reject) => {
    const command = `tar -czf ${filePath} -C ${path.join(__dirname, '../uploads')} .`;
    
    exec(command, (error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(filePath);
    });
  });
}

// Clean up old backups
async function cleanupOldBackups() {
  const params = {
    Bucket: config.backup.storage.bucket,
    Prefix: 'backups/'
  };

  const objects = await s3.listObjectsV2(params).promise();
  const now = new Date();
  
  for (const object of objects.Contents) {
    const lastModified = new Date(object.LastModified);
    const daysOld = (now - lastModified) / (1000 * 60 * 60 * 24);
    
    if (daysOld > config.backup.retention) {
      await s3.deleteObject({
        Bucket: config.backup.storage.bucket,
        Key: object.Key
      }).promise();
    }
  }
}

// Add Filecoin backup function
async function backupToFilecoin(filePath, type) {
  if (!config.filecoin.enabled) {
    console.log('Filecoin backup skipped - not enabled');
    return;
  }

  try {
    const filecoinService = FilecoinService.getInstance(database, cache);
    const fileContent = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);

    const file = new File([fileContent], fileName);
    const cid = await filecoinService.web3Storage.put([file]);

    console.log(`Backup uploaded to Filecoin with CID: ${cid}`);
    return cid;
  } catch (error) {
    console.error('Filecoin backup failed:', error);
    return null;
  }
}

// Update performBackup function
async function performBackup() {
  try {
    console.log('Starting backup process...');
    
    // Create local backup
    const dbBackupPath = await backupDatabase();
    const filesBackupPath = await backupFiles();
    
    // Upload to Filecoin if enabled
    if (config.filecoin.enabled) {
      await backupToFilecoin(dbBackupPath, 'database');
      await backupToFilecoin(filesBackupPath, 'files');
    }
    
    // Clean up old backups
    await cleanupOldBackups();
    
    console.log('Backup process completed successfully');
  } catch (error) {
    console.error('Backup process failed:', error);
    process.exit(1);
  }
}

// Run backup if script is executed directly
if (require.main === module) {
  performBackup();
}

module.exports = {
  performBackup
}; 