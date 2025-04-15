# DormLitApp Deployment Script
param(
    [string]$Environment = "production",
    [string]$Version = "latest",
    [switch]$SkipBackup = $false,
    [switch]$SkipMonitoring = $false
)

# Configuration
$Config = @{
    AppName = "DormLitApp"
    AppPath = "C:\dormlit"
    BackupPath = "C:\dormlit\backups"
    LogPath = "C:\dormlit\logs"
    DatabaseName = "dormlit"
    DatabaseUser = "dormlit_user"
    RedisPort = 6379
    WebPort = 3000
}

# Functions
function Write-Log {
    param($Message)
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogMessage = "[$Timestamp] $Message"
    Write-Host $LogMessage
    Add-Content -Path "$($Config.LogPath)\deploy.log" -Value $LogMessage
}

function Test-Prerequisites {
    Write-Log "Checking prerequisites..."
    
    # Check Node.js
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        throw "Node.js is not installed"
    }
    
    # Check PostgreSQL
    if (-not (Get-Command psql -ErrorAction SilentlyContinue)) {
        throw "PostgreSQL is not installed"
    }
    
    # Check Redis
    if (-not (Get-Service Redis -ErrorAction SilentlyContinue)) {
        throw "Redis is not installed"
    }
    
    # Check AWS CLI
    if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
        throw "AWS CLI is not installed"
    }
    
    Write-Log "All prerequisites are met"
}

function Backup-CurrentVersion {
    if ($SkipBackup) {
        Write-Log "Skipping backup as requested"
        return
    }
    
    Write-Log "Creating backup of current version..."
    
    $BackupDir = "$($Config.BackupPath)\$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
    
    # Backup database
    Write-Log "Backing up database..."
    pg_dump -U $Config.DatabaseUser -d $Config.DatabaseName | Out-File "$BackupDir\database.sql"
    
    # Backup application files
    Write-Log "Backing up application files..."
    Compress-Archive -Path "$($Config.AppPath)\*" -DestinationPath "$BackupDir\app.zip"
    
    # Upload to S3
    Write-Log "Uploading backup to S3..."
    aws s3 cp "$BackupDir" "s3://dormlit-backups/$Environment/" --recursive
    
    Write-Log "Backup completed successfully"
}

function Update-Dependencies {
    Write-Log "Updating dependencies..."
    
    Set-Location $Config.AppPath
    npm install
    npm run build
    
    Write-Log "Dependencies updated successfully"
}

function Update-Database {
    Write-Log "Updating database..."
    
    Set-Location $Config.AppPath
    npm run migrate
    
    Write-Log "Database updated successfully"
}

function Start-Services {
    Write-Log "Starting services..."
    
    # Start Redis if not running
    if ((Get-Service Redis).Status -ne "Running") {
        Start-Service Redis
    }
    
    # Start application
    $Proc = Start-Process node -ArgumentList "dist/server.js" -PassThru
    $Proc.Id | Out-File "$($Config.AppPath)\app.pid"
    
    # Start monitoring if enabled
    if (-not $SkipMonitoring) {
        Start-Process node -ArgumentList "scripts/init-monitoring.js"
    }
    
    Write-Log "Services started successfully"
}

function Test-Deployment {
    Write-Log "Testing deployment..."
    
    # Wait for application to start
    Start-Sleep -Seconds 10
    
    # Test API endpoints
    $Endpoints = @(
        "/api/health",
        "/api/auth/status",
        "/api/rooms/list"
    )
    
    foreach ($Endpoint in $Endpoints) {
        $Response = Invoke-WebRequest -Uri "http://localhost:$($Config.WebPort)$Endpoint" -UseBasicParsing
        if ($Response.StatusCode -ne 200) {
            throw "Endpoint $Endpoint returned status code $($Response.StatusCode)"
        }
    }
    
    Write-Log "Deployment tests passed successfully"
}

# Main deployment process
try {
    Write-Log "Starting deployment of $($Config.AppName) version $Version to $Environment environment"
    
    # Check prerequisites
    Test-Prerequisites
    
    # Create necessary directories
    New-Item -ItemType Directory -Path $Config.BackupPath -Force | Out-Null
    New-Item -ItemType Directory -Path $Config.LogPath -Force | Out-Null
    
    # Backup current version
    Backup-CurrentVersion
    
    # Update application
    Update-Dependencies
    Update-Database
    
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