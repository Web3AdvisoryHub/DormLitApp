# Create backup directory
$backupDir = "dormlit_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
New-Item -ItemType Directory -Path $backupDir

# Copy important directories
Copy-Item -Path "client" -Destination $backupDir -Recurse
Copy-Item -Path "server" -Destination $backupDir -Recurse
Copy-Item -Path "shared" -Destination $backupDir -Recurse
Copy-Item -Path "docs" -Destination $backupDir -Recurse

# Copy important files
Copy-Item -Path "*.json" -Destination $backupDir
Copy-Item -Path "*.ts" -Destination $backupDir
Copy-Item -Path "*.md" -Destination $backupDir
Copy-Item -Path "*.js" -Destination $backupDir
Copy-Item -Path ".env.example" -Destination $backupDir
Copy-Item -Path ".env.backup" -Destination $backupDir

# Create zip file
Compress-Archive -Path $backupDir -DestinationPath "dormlit_backup.zip" -Force

# Clean up
Remove-Item -Path $backupDir -Recurse -Force

Write-Host "Backup completed successfully! The backup is saved as dormlit_backup.zip" 