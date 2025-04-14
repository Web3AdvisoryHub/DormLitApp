# DormLit

A social platform for dorm residents to connect and share experiences.

## Deployment Instructions for Replit

1. **Environment Setup**:
   - Create a new Replit project
   - Upload your project files
   - Set up the following environment variables in Replit's Secrets:
     - `NODE_ENV=production`
     - `PORT=5000`
     - `REPLIT_DB_URL` (your Replit database URL)
     - `VITE_READY_PLAYER_ME_SUBDOMAIN` (your Ready Player Me subdomain)

2. **Installation**:
   ```bash
   npm install
   ```

3. **Building**:
   ```bash
   npm run build
   ```

4. **Running**:
   ```bash
   npm start
   ```

5. **Development**:
   ```bash
   npm run dev
   ```

## Features

- User authentication
- Avatar creation with Ready Player Me
- Profile customization
- Social feed
- Mood tracking
- Store for virtual items

## Tech Stack

- React
- TypeScript
- Vite
- Express
- Ready Player Me SDK
- Tailwind CSS
- Shadcn UI 