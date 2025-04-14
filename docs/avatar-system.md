# DormLit Avatar System Documentation

## Overview
The DormLit avatar system provides two paths for avatar creation:
1. Base Avatar - Simple, customizable avatars built with SVG components
2. Custom Avatar - Advanced avatars using Ready Player Me integration

## Avatar Creation Flow

### Base Avatar Path
1. User selects "Base Avatar" tab in `avatar-selection.tsx`
2. `BaseAvatar` component (`components/avatar/BaseAvatar.tsx`) handles:
   - Skin tone selection
   - Hair style and color
   - Clothing style and color
   - Face features
3. Avatar is rendered using SVG components:
   - `HairStyles.tsx`
   - `Clothing.tsx`
   - `FaceFeatures.tsx`
4. On save, avatar data is stored in user profile

### Custom Avatar Path
1. User selects "Custom Avatar" tab
2. `ReadyPlayerMe` component (`components/avatar/ReadyPlayerMe.tsx`) opens:
   - Uses Ready Player Me iframe
   - Subdomain configured in `.env` (VITE_READY_PLAYER_ME_SUBDOMAIN)
3. On avatar creation:
   - Avatar URL is stored
   - Triggers onboarding flow
   - Navigates to mood selection

## NFT Integration
- Location: `components/avatar/CustomItems.tsx`
- Handles:
  - Custom clothing uploads
  - NFT minting through Creator Room
  - Integration with `components/creator/CreatorRoom.tsx`

## Dependencies

### Ready Player Me
- Package: `@readyplayerme/visage` and `@readyplayerme/visage-react`
- Configuration:
  ```typescript
  const subdomain = import.meta.env.VITE_READY_PLAYER_ME_SUBDOMAIN || 'dormlit';
  ```
- Replacement Strategy:
  1. Remove Ready Player Me components
  2. Implement custom 3D avatar system
  3. Update avatar storage and rendering logic

### NFT Services
- Location: `server/services/nft.ts`
- Handles:
  - NFT minting
  - Metadata storage
  - Blockchain integration

## Component Structure
```
components/avatar/
├── BaseAvatar.tsx        # Base avatar creation
├── ReadyPlayerMe.tsx     # Custom avatar integration
├── AvatarBuilder.tsx     # Avatar construction logic
├── AvatarPreview.tsx     # Live preview component
├── HairStyles.tsx        # Hair customization
├── Clothing.tsx          # Clothing options
├── FaceFeatures.tsx      # Facial features
└── CustomItems.tsx       # NFT and custom items
```

## Data Flow
1. Avatar Selection → Base/Custom Path
2. Customization → Preview Updates
3. Save → Profile Storage
4. NFT Items → Creator Room Integration

## Future Enhancements
1. 3D Avatar System
2. Advanced Customization
3. Marketplace Integration
4. Social Features 