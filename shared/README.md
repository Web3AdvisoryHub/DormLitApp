# Shared Resources

This directory contains shared TypeScript types, interfaces, and utilities used across both the client and server applications.

## Structure

```
shared/
├── types/           # TypeScript type definitions
│   ├── avatar.ts    # Avatar-related types
│   ├── room.ts      # Room-related types
│   └── user.ts      # User-related types
├── constants/       # Shared constants
└── utils/          # Shared utility functions
```

## Key Types

### Avatar Types
- `AvatarState`: Avatar mood and state
- `AvatarFeatures`: Customizable avatar features
- `AvatarInteraction`: Avatar interaction events

### Room Types
- `RoomSettings`: Room configuration
- `RoomState`: Current room state
- `RoomEvent`: Room-related events

### User Types
- `UserProfile`: User profile information
- `UserPreferences`: User settings and preferences
- `UserActivity`: User activity tracking

## Usage

Import types and utilities in your code:

```typescript
import { AvatarState, RoomSettings } from '@/shared/types';
import { formatTime } from '@/shared/utils';
```

## Adding New Types

1. Create a new file in the appropriate directory
2. Export your types/interfaces
3. Update the index.ts file to export the new types
4. Update this README if necessary 