# DormLit Client

The frontend React application for DormLit, featuring real-time interactions and AI-powered avatars.

## Structure

```
client/
├── src/
│   ├── components/     # Reusable React components
│   │   ├── avatar/    # Avatar-related components
│   │   ├── creator/   # Creator room components
│   │   └── shared/    # Shared UI components
│   ├── services/      # API and service functions
│   ├── hooks/         # Custom React hooks
│   ├── utils/         # Utility functions
│   └── types/         # TypeScript type definitions
├── public/            # Static assets
└── styles/           # Global styles and themes
```

## Key Features

- Real-time socket connections
- AI avatar system
- Mood-based interactions
- Room management
- Analytics dashboard
- Chat system

## Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Component Documentation

- [Avatar Components](src/components/avatar/README.md)
- [Creator Room Components](src/components/creator/README.md)
- [Shared Components](src/components/shared/README.md) 