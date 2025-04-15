# DormLitApp Deployment Guide

## Prerequisites

Before deploying, ensure you have:
1. Node.js v16+ installed
2. PostgreSQL 12+ installed
3. Redis installed
4. AWS CLI configured (for S3 backups)
5. Required environment variables set (see `.env.example`)

## Deployment Steps

### 1. Server Setup

```bash
# Clone the repository
git clone https://github.com/your-org/dormlit-app.git
cd dormlit-app

# Install dependencies
npm install

# Build the application
npm run build

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

### 2. Database Setup

```bash
# Create database
createdb dormlit

# Run migrations
npm run migrate

# Seed initial data (if needed)
npm run seed
```

### 3. Redis Setup

```bash
# Start Redis server
redis-server

# Verify Redis connection
redis-cli ping
```

### 4. Monitoring Setup

```bash
# Install monitoring agents
# For Datadog
DD_API_KEY=your-api-key DD_APP_KEY=your-app-key bash -c "$(curl -L https://raw.githubusercontent.com/DataDog/datadog-agent/master/cmd/agent/install_script.sh)"

# For Sentry
npm install @sentry/node
```

### 5. Backup Configuration

```bash
# Set up AWS credentials
aws configure

# Test S3 access
aws s3 ls s3://your-backup-bucket

# Set up backup cron job
crontab -e
# Add: 0 0 * * * /path/to/backup.ps1
```

### 6. Security Configuration

```bash
# Generate SSL certificates
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365

# Set up firewall rules
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3000
sudo ufw enable
```

### 7. Start Services

```bash
# Start the application
npm start

# Start monitoring
node scripts/init-monitoring.js

# Start backup service
node scripts/backup.js
```

## Environment Variables

Required environment variables:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dormlit
DB_USER=your_user
DB_PASSWORD=your_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# AWS (for backups)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=your_region
BACKUP_BUCKET=your_bucket

# Monitoring
SENTRY_DSN=your_sentry_dsn
DATADOG_API_KEY=your_datadog_api_key
DATADOG_APP_KEY=your_datadog_app_key

# Security
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key
```

## Monitoring Dashboard

Access monitoring dashboards:
- Datadog: https://app.datadoghq.com
- Sentry: https://sentry.io

## Backup Verification

To verify backups:
```bash
# List backups
aws s3 ls s3://your-backup-bucket

# Test restore
./scripts/restore.ps1 --backup-file your-backup-file
```

## Troubleshooting

Common issues and solutions:

1. **Database Connection Issues**
   - Check PostgreSQL service status
   - Verify connection string in .env
   - Check firewall rules

2. **Redis Connection Issues**
   - Check Redis service status
   - Verify Redis configuration
   - Check network connectivity

3. **Monitoring Issues**
   - Check API keys
   - Verify agent installation
   - Check network connectivity to monitoring services

4. **Backup Issues**
   - Check AWS credentials
   - Verify S3 bucket permissions
   - Check disk space

## Maintenance

Regular maintenance tasks:

1. **Daily**
   - Check monitoring alerts
   - Verify backup completion
   - Review security logs

2. **Weekly**
   - Update dependencies
   - Clean up old logs
   - Verify SSL certificates

3. **Monthly**
   - Review security patches
   - Update monitoring configurations
   - Test disaster recovery

## Support

For deployment support:
- Email: support@dormlit.app
- Slack: #deployment-support
- Documentation: https://docs.dormlit.app 