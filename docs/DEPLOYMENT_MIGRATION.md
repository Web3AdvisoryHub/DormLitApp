# Deployment Migration Guide

## Overview
This guide outlines the steps to migrate DormLit from Vercel to either Netlify or AWS Amplify.

## Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- Supabase project configured
- Filecoin storage credentials
- AWS/Netlify account (depending on target platform)

## Migration Steps

### 1. Environment Setup
```bash
# Clone the repository
git clone https://github.com/your-org/dormlit.git
cd dormlit

# Install dependencies
npm install --legacy-peer-deps --force

# Set up environment variables
cp .env.example .env
# Update .env with your credentials
```

### 2. Database Migration
- Supabase schema is already upgraded
- RLS policies are in place
- Filecoin storage is configured
- Affiliate logic is implemented
- Subscription tiers are set up

### 3. Platform-Specific Setup

#### Netlify
1. Create a new site in Netlify
2. Connect your GitHub repository
3. Configure build settings:
   - Build command: `npm install --legacy-peer-deps --force && npm run build`
   - Publish directory: `dist`
   - Node version: 18

#### AWS Amplify
1. Create a new app in AWS Amplify
2. Connect your GitHub repository
3. Configure build settings:
   - Use the provided `amplify.yml`
   - Enable auto-build on push
   - Configure environment variables

### 4. Post-Migration Steps

1. Update DNS settings if needed
2. Verify environment variables
3. Test all features:
   - User authentication
   - Filecoin storage
   - Room creation/editing
   - Subscription features
   - Affiliate system

### 5. Monitoring Setup

1. Configure error tracking
2. Set up performance monitoring
3. Enable logging
4. Configure alerts

## Rollback Plan

1. Keep Vercel deployment active during migration
2. Test new deployment thoroughly
3. Only switch DNS after successful testing
4. Maintain ability to rollback to Vercel if needed

## Support

For issues during migration:
1. Check deployment logs
2. Verify environment variables
3. Test locally with `npm run dev`
4. Contact support if needed 