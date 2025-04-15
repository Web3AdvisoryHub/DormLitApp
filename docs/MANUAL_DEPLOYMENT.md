# Manual Deployment Guide

## Quick Start

1. **Prepare Your Files**
   - Make sure all your files are in a single folder
   - Create a ZIP file of your entire project

2. **Deploy to Server**
   ```powershell
   # Basic deployment
   .\scripts\sync-and-deploy.ps1

   # Development deployment
   .\scripts\sync-and-deploy.ps1 -Environment "development"

   # Skip certain steps
   .\scripts\sync-and-deploy.ps1 -SkipBackup -SkipDependencies
   ```

## Detailed Steps

### 1. Server Preparation

```powershell
# Create deployment directory
mkdir C:\dormlit

# Create backup directory
mkdir C:\dormlit\backups

# Create logs directory
mkdir C:\dormlit\logs
```

### 2. File Deployment

```powershell
# Copy your ZIP file to the server
# Extract the ZIP file to C:\dormlit
```

### 3. Start Services

```powershell
# Start Redis
Start-Service Redis

# Start the application
cd C:\dormlit
.\scripts\sync-and-deploy.ps1
```

## Script Options

### Environment Selection
- `-Environment "production"` (default)
- `-Environment "development"`

### Skip Options
- `-SkipBackup` - Skip creating backup
- `-SkipDependencies` - Skip npm install
- `-SkipServices` - Skip starting services

### Custom Paths
- `-TargetPath "C:\custom\path"` - Custom deployment path
- `-BackupPath "C:\custom\backups"` - Custom backup path

## Folder Structure

```
C:\dormlit\
├── client\          # Frontend files
├── server\          # Backend files
├── scripts\         # Deployment scripts
├── backups\         # Backup files
│   ├── client.zip  # Client backup
│   ├── server.zip  # Server backup
│   └── env.backup  # Environment backup
└── logs\           # Application logs
    └── deploy.log  # Deployment log
```

## Manual Backup

```powershell
# Create a full backup
.\scripts\sync-and-deploy.ps1 -SkipDependencies -SkipServices

# Create client-only backup
Compress-Archive -Path "C:\dormlit\client\*" -DestinationPath "C:\dormlit\backups\client_$(Get-Date -Format 'yyyyMMdd_HHmmss').zip"

# Create server-only backup
Compress-Archive -Path "C:\dormlit\server\*" -DestinationPath "C:\dormlit\backups\server_$(Get-Date -Format 'yyyyMMdd_HHmmss').zip"
```

## Troubleshooting

### Common Issues

1. **Application Won't Start**
   ```powershell
   # Check if Redis is running
   Get-Service Redis

   # Check deployment logs
   Get-Content C:\dormlit\logs\deploy.log

   # Check process IDs
   Get-Content C:\dormlit\server.pid
   Get-Content C:\dormlit\client.pid
   ```

2. **Missing Dependencies**
   ```powershell
   # Reinstall client dependencies
   cd C:\dormlit\client
   npm install

   # Reinstall server dependencies
   cd C:\dormlit\server
   npm install
   ```

3. **Port Already in Use**
   ```powershell
   # Find process using port 3000
   netstat -ano | findstr :3000

   # Kill the process
   taskkill /PID <process_id> /F
   ```

4. **Deployment Test Failed**
   ```powershell
   # Check endpoint status
   Invoke-WebRequest -Uri "http://localhost:3000/api/health" -UseBasicParsing

   # Check server logs
   Get-Content C:\dormlit\server\logs\server.log
   ```

## Maintenance

### Daily Tasks
- Check deployment logs
- Verify services are running
- Create manual backup if needed
- Monitor endpoint health

### Weekly Tasks
- Clean up old backups
- Update dependencies
- Check disk space
- Review deployment logs

### Monthly Tasks
- Test full deployment process
- Verify backup restoration
- Update deployment scripts
- Review security settings 