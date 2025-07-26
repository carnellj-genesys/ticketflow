# TicketFlow Deployment Guide

## Simple Configuration

The application now uses a simple environment variable approach. You only need to set one environment variable to deploy to different environments.

## Environment Variables

### Required
- `VITE_API_BASE_URL` - The base URL for the API server

### Optional
- `VITE_API_KEY` - API key (defaults to development key)
- `VITE_CORS_API_KEY` - CORS API key (defaults to development key)
- `VITE_WEBHOOK_ENABLED` - Enable/disable webhooks (defaults to true)
- `VITE_WEBHOOK_URL` - Webhook URL (defaults to Genesys Cloud webhook)
- `VITE_WEBHOOK_TIMEOUT` - Webhook timeout in ms (defaults to 5000)

## Deployment Examples

### Local Development
```bash
# Start the server
npm run dev:server

# Start the client (in another terminal)
VITE_API_BASE_URL="http://localhost:3001/rest" npm run dev:client
```

### Remote Server
```bash
# Start the server on your remote server
npm run dev:server

# Start the client with remote API URL
VITE_API_BASE_URL="http://your-server-ip:3001/rest" npm run dev:client
```

### Production
```bash
# Build the client
VITE_API_BASE_URL="https://api.yourdomain.com/rest" npm run build

# Start the server
npm run dev:server
```

## Docker Deployment

```bash
# Build and run with Docker
docker build -t ticketflow .
docker run -p 3001:3001 -p 5173:5173 ticketflow
```

## Environment File (.env)

You can also create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:3001/rest
VITE_API_KEY=your-api-key
VITE_CORS_API_KEY=your-cors-key
VITE_WEBHOOK_ENABLED=true
VITE_WEBHOOK_URL=https://your-webhook-url.com
```

## That's It!

The configuration is now much simpler. Just set `VITE_API_BASE_URL` to point to your API server and you're ready to go! 