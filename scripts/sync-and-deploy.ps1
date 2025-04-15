# Enhanced Sync and Deploy Script
param(
    [string]$TargetPath = "C:\dormlit",
    [string]$BackupPath = "C:\dormlit\backups",
    [switch]$SkipBackup = $false,
    [switch]$SkipDependencies = $false,
    [switch]$SkipServices = $false,
    [string]$Environment = "production"
)

# Create necessary directories
New-Item -ItemType Directory -Path $TargetPath -Force
New-Item -ItemType Directory -Path $BackupPath -Force
New-Item -ItemType Directory -Path "$TargetPath\logs" -Force

# Function to log messages
function Write-Log {
    param($Message)
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogMessage = "[$Timestamp] $Message"
    Write-Host $LogMessage
    Add-Content -Path "$TargetPath\logs\deploy.log" -Value $LogMessage
}

# Function to backup current version
function Backup-Current {
    if ($SkipBackup) {
        Write-Log "Skipping backup as requested"
        return
    }
    
    Write-Log "Creating backup of current version..."
    
    $BackupDir = "$BackupPath\$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    New-Item -ItemType Directory -Path $BackupDir -Force
    
    # Backup application files
    if (Test-Path $TargetPath) {
        # Backup client
        if (Test-Path "$TargetPath\client") {
            Compress-Archive -Path "$TargetPath\client\*" -DestinationPath "$BackupDir\client.zip"
        }
        
        # Backup server
        if (Test-Path "$TargetPath\server") {
            Compress-Archive -Path "$TargetPath\server\*" -DestinationPath "$BackupDir\server.zip"
        }
        
        # Backup configuration
        if (Test-Path "$TargetPath\.env") {
            Copy-Item "$TargetPath\.env" "$BackupDir\env.backup"
        }
        
        Write-Log "Backup created at $BackupDir"
    }
}

# Function to sync specific folders
function Sync-Folders {
    param(
        [string]$SourcePath,
        [string]$DestinationPath,
        [string[]]$ExcludeFolders = @("node_modules", ".git", "dist", "build")
    )
    
    Write-Log "Syncing $SourcePath to $DestinationPath..."
    
    # Create destination if it doesn't exist
    if (-not (Test-Path $DestinationPath)) {
        New-Item -ItemType Directory -Path $DestinationPath -Force
    }
    
    # Get all items in source directory
    $Items = Get-ChildItem -Path $SourcePath -Recurse
    
    foreach ($Item in $Items) {
        $RelativePath = $Item.FullName.Substring($SourcePath.Length)
        $DestinationItem = Join-Path $DestinationPath $RelativePath
        
        # Skip excluded folders
        $ShouldExclude = $false
        foreach ($Exclude in $ExcludeFolders) {
            if ($Item.FullName -like "*\$Exclude*") {
                $ShouldExclude = $true
                break
            }
        }
        
        if (-not $ShouldExclude) {
            if ($Item.PSIsContainer) {
                # Create directory
                New-Item -ItemType Directory -Path $DestinationItem -Force | Out-Null
            } else {
                # Copy file
                Copy-Item -Path $Item.FullName -Destination $DestinationItem -Force
            }
        }
    }
    
    Write-Log "Folder sync completed"
}

# Function to install dependencies
function Install-Dependencies {
    if ($SkipDependencies) {
        Write-Log "Skipping dependency installation as requested"
        return
    }
    
    Write-Log "Installing dependencies..."
    
    # Install client dependencies
    if (Test-Path "$TargetPath\client") {
        Write-Log "Installing client dependencies..."
        Set-Location "$TargetPath\client"
        npm install
    }
    
    # Install server dependencies
    if (Test-Path "$TargetPath\server") {
        Write-Log "Installing server dependencies..."
        Set-Location "$TargetPath\server"
        npm install
    }
    
    Write-Log "Dependencies installed"
}

# Function to start services
function Start-Services {
    if ($SkipServices) {
        Write-Log "Skipping service start as requested"
        return
    }
    
    Write-Log "Starting services..."
    
    # Start Redis if not running
    if ((Get-Service Redis -ErrorAction SilentlyContinue).Status -ne "Running") {
        Start-Service Redis
        Write-Log "Redis service started"
    }
    
    # Start application
    Set-Location "$TargetPath\server"
    $Proc = Start-Process node -ArgumentList "dist/server.js" -PassThru
    $Proc.Id | Out-File "$TargetPath\server.pid"
    Write-Log "Server started with PID $($Proc.Id)"
    
    # Start client if in development
    if ($Environment -eq "development") {
        Set-Location "$TargetPath\client"
        $ClientProc = Start-Process npm -ArgumentList "start" -PassThru
        $ClientProc.Id | Out-File "$TargetPath\client.pid"
        Write-Log "Client started with PID $($ClientProc.Id)"
    }
    
    Write-Log "Services started"
}

# Function to verify deployment
function Test-Deployment {
    Write-Log "Testing deployment..."
    
    # Wait for services to start
    Start-Sleep -Seconds 10
    
    # Test server endpoints
    $Endpoints = @(
        "/api/health",
        "/api/auth/status",
        "/api/rooms/list"
    )
    
    foreach ($Endpoint in $Endpoints) {
        try {
            $Response = Invoke-WebRequest -Uri "http://localhost:3000$Endpoint" -UseBasicParsing
            if ($Response.StatusCode -eq 200) {
                Write-Log "Endpoint $Endpoint is working"
            } else {
                Write-Log "Warning: Endpoint $Endpoint returned status $($Response.StatusCode)"
            }
        } catch {
            Write-Log "Error testing endpoint $Endpoint : $_"
        }
    }
    
    Write-Log "Deployment tests completed"
}

# Main deployment process
try {
    Write-Log "Starting deployment process for $Environment environment..."
    
    # Backup current version
    Backup-Current
    
    # Sync folders
    Sync-Folders -SourcePath "." -DestinationPath $TargetPath
    
    # Install dependencies
    Install-Dependencies
    
    # Start services
    Start-Services
    
    # Test deployment
    Test-Deployment
    
    Write-Log "Deployment completed successfully"
}
catch {
    Write-Log "Deployment failed: $_"
    throw
} 