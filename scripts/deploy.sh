#!/bin/bash

# DormLitApp Deployment Script
ENVIRONMENT=${1:-"production"}
VERSION=${2:-"latest"}
SKIP_BACKUP=${3:-"false"}
SKIP_MONITORING=${4:-"false"}

# Configuration
APP_NAME="DormLitApp"
APP_PATH="/opt/dormlit"
BACKUP_PATH="/opt/dormlit/backups"
LOG_PATH="/opt/dormlit/logs"
DATABASE_NAME="dormlit"
DATABASE_USER="dormlit_user"
REDIS_PORT=6379
WEB_PORT=3000

# Functions
function log {
    local timestamp=$(date "+%Y-%m-%d %H:%M:%S")
    echo "[$timestamp] $1"
    echo "[$timestamp] $1" >> "$LOG_PATH/deploy.log"
}

function check_prerequisites {
    log "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log "Error: Node.js is not installed"
        exit 1
    fi
    
    # Check PostgreSQL
    if ! command -v psql &> /dev/null; then
        log "Error: PostgreSQL is not installed"
        exit 1
    fi
    
    # Check Redis
    if ! command -v redis-cli &> /dev/null; then
        log "Error: Redis is not installed"
        exit 1
    fi
    
    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        log "Error: AWS CLI is not installed"
        exit 1
    fi
    
    log "All prerequisites are met"
}

function backup_current_version {
    if [ "$SKIP_BACKUP" = "true" ]; then
        log "Skipping backup as requested"
        return
    fi
    
    log "Creating backup of current version..."
    
    local backup_dir="$BACKUP_PATH/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$backup_dir"
    
    # Backup database
    log "Backing up database..."
    pg_dump -U "$DATABASE_USER" -d "$DATABASE_NAME" > "$backup_dir/database.sql"
    
    # Backup application files
    log "Backing up application files..."
    tar -czf "$backup_dir/app.tar.gz" -C "$APP_PATH" .
    
    # Upload to S3
    log "Uploading backup to S3..."
    aws s3 cp "$backup_dir" "s3://dormlit-backups/$ENVIRONMENT/" --recursive
    
    log "Backup completed successfully"
}

function update_dependencies {
    log "Updating dependencies..."
    
    cd "$APP_PATH"
    npm install
    npm run build
    
    log "Dependencies updated successfully"
}

function update_database {
    log "Updating database..."
    
    cd "$APP_PATH"
    npm run migrate
    
    log "Database updated successfully"
}

function start_services {
    log "Starting services..."
    
    # Start Redis if not running
    if ! redis-cli ping &> /dev/null; then
        systemctl start redis
    fi
    
    # Start application
    cd "$APP_PATH"
    nohup node dist/server.js > "$LOG_PATH/app.log" 2>&1 &
    echo $! > "$APP_PATH/app.pid"
    
    # Start monitoring if enabled
    if [ "$SKIP_MONITORING" = "false" ]; then
        nohup node scripts/init-monitoring.js > "$LOG_PATH/monitoring.log" 2>&1 &
        echo $! > "$APP_PATH/monitoring.pid"
    fi
    
    log "Services started successfully"
}

function test_deployment {
    log "Testing deployment..."
    
    # Wait for application to start
    sleep 10
    
    # Test API endpoints
    local endpoints=(
        "/api/health"
        "/api/auth/status"
        "/api/rooms/list"
    )
    
    for endpoint in "${endpoints[@]}"; do
        local response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$WEB_PORT$endpoint")
        if [ "$response" -ne 200 ]; then
            log "Error: Endpoint $endpoint returned status code $response"
            exit 1
        fi
    done
    
    log "Deployment tests passed successfully"
}

# Main deployment process
main() {
    log "Starting deployment of $APP_NAME version $VERSION to $ENVIRONMENT environment"
    
    # Create necessary directories
    mkdir -p "$BACKUP_PATH" "$LOG_PATH"
    
    # Check prerequisites
    check_prerequisites
    
    # Backup current version
    backup_current_version
    
    # Update application
    update_dependencies
    update_database
    
    # Start services
    start_services
    
    # Test deployment
    test_deployment
    
    log "Deployment completed successfully"
}

# Run main function
main "$@" 