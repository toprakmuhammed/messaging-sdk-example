# Messaging AI Bot Backend

Backend server for the messaging SDK example app's AI chatbot feature.

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Create a `.env` file with required environment variables:
```env
PORT=3000
# Add other environment variables as needed
```

## Development

Run the development server with hot reload:
```bash
pnpm dev
```

## Build

Build the TypeScript code:
```bash
pnpm build
```

## Production

Run the production server:
```bash
pnpm start
```

## Health Check

The server exposes a health check endpoint at `/health`:
```bash
curl http://localhost:3000/health
```

