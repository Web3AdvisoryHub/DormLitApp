# DormLit Server

The backend Node.js server for DormLit, handling real-time communications and AI services.

## Structure

```
server/
├── src/
│   ├── services/      # Core services
│   │   ├── chat.ts    # Chat service
│   │   ├── nft.ts     # NFT service
│   │   └── ...        # Other services
│   ├── routes/        # API routes
│   ├── middleware/    # Express middleware
│   └── utils/         # Utility functions
├── config/           # Configuration files
└── tests/           # Test files
```

## Services

- **Chat Service**: Real-time messaging and room management
- **NFT Service**: Digital collectible management
- **Analytics Service**: User and room analytics
- **Avatar Service**: AI avatar management
- **Event Service**: Real-time event handling

## Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Run tests:
   ```bash
   npm run test
   ```

## API Documentation

Detailed API documentation is available in the [API Documentation](../docs/api.md).

## Environment Variables

Required environment variables are defined in `.env.example`. Copy this file to `.env` and fill in the values:

```bash
cp .env.example .env
``` 