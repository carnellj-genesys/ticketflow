# TicketFlow Deployment Guide

## Simple Configuration

The application now uses a simple environment variable approach. You only need to set one environment variable to deploy to different environments.

## Environment Variables

### Frontend (Client)
- `VITE_API_BASE_URL` - The base URL for the API server (required)
- `VITE_API_KEY` - API key (optional, defaults to development key)
- `VITE_CORS_API_KEY` - CORS API key (optional, defaults to development key)

### Backend (Server)
- `VITE_WEBHOOK_ENABLED` - Enable/disable webhooks (optional, defaults to true)
- `VITE_WEBHOOK_URL` - Webhook URL (optional, defaults to Genesys Cloud webhook)
- `VITE_WEBHOOK_TIMEOUT` - Webhook timeout in ms (optional, defaults to 5000)

## Docker Compose Deployment

The application now uses separate containers for frontend and backend services with proper networking.

### Development Environment

```bash
# Start both frontend and backend in development mode
docker-compose up

# Or start specific services
docker-compose up ticketflow-backend    # Backend API only
docker-compose up ticketflow-frontend   # Frontend only
```

**Services:**
- **Backend**: `http://localhost:3001` (API server with hot reload)
- **Frontend**: `http://localhost:5173` (Vite dev server with hot reload)

### Production Environment

```bash
# Start production services
docker-compose --profile prod up

# Or start specific production services
docker-compose --profile prod up ticketflow-backend-prod
docker-compose --profile prod up ticketflow-frontend-prod
```

**Services:**
- **Backend**: `http://localhost:3001` (Production API server)
- **Frontend**: `http://localhost:80` (Nginx serving built React app)

### Production with Webhooks

```bash
# Start production services with webhooks enabled
docker-compose --profile prod-webhook up
```

**Services:**
- **Backend**: `http://localhost:3002` (Production API server with webhooks)
- **Frontend**: `http://localhost:8080` (Nginx serving built React app)

## Manual Deployment Examples

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

## Webhook Architecture

Webhooks are handled by the backend server, which eliminates CORS issues when deploying the frontend to different domains. The frontend includes a toggle that controls whether the backend sends webhook notifications:

- **Toggle Enabled**: Backend sends webhook notifications for ticket operations
- **Toggle Disabled**: Backend skips webhook notifications for ticket operations

The webhook status is controlled via the frontend toggle and stored on the backend server.

## Docker Compose Service Architecture

### Development Services
- **ticketflow-backend**: Node.js API server with hot reload
- **ticketflow-frontend**: Vite dev server with hot reload

### Production Services
- **ticketflow-backend-prod**: Production Node.js API server
- **ticketflow-frontend-prod**: Nginx serving built React app
- **ticketflow-backend-prod-webhook**: Production API with webhooks enabled
- **ticketflow-frontend-prod-webhook**: Nginx serving built React app

### Networking
- All services use the `ticketflow-network` bridge network
- Frontend services automatically connect to backend services
- Health checks ensure proper startup order

### Volumes
- Development services mount source code for hot reload
- Production services use built artifacts
- Node modules are cached in anonymous volumes

## Docker Hub Deployment

This section covers how to build and push your TicketFlow application images to Docker Hub for distribution and deployment.

### Prerequisites

1. **Docker Hub Account**: Create an account at [hub.docker.com](https://hub.docker.com)
2. **Docker CLI**: Ensure Docker is installed and running
3. **Login to Docker Hub**: `docker login`

### Building Images for Docker Hub

#### 1. Build Individual Service Images

```bash
# Build backend image
docker build -t your-dockerhub-username/ticketflow-backend:latest --target production .

# Build frontend image  
docker build -t your-dockerhub-username/ticketflow-frontend:latest --target production .

# Build with specific tags
docker build -t your-dockerhub-username/ticketflow-backend:v1.0.0 --target production .
docker build -t your-dockerhub-username/ticketflow-frontend:v1.0.0 --target production .
```

#### 2. Build All Images with Script

Create a build script (`build-images.sh`):

```bash
#!/bin/bash

# Configuration
DOCKER_USERNAME="your-dockerhub-username"
VERSION=${1:-latest}

echo "Building TicketFlow images version: $VERSION"

# Build backend image
echo "Building backend image..."
docker build -t $DOCKER_USERNAME/ticketflow-backend:$VERSION --target production .

# Build frontend image
echo "Building frontend image..."
docker build -t $DOCKER_USERNAME/ticketflow-frontend:$VERSION --target production .

echo "Build complete!"
echo "Images created:"
echo "  - $DOCKER_USERNAME/ticketflow-backend:$VERSION"
echo "  - $DOCKER_USERNAME/ticketflow-frontend:$VERSION"
```

Make it executable and run:
```bash
chmod +x build-images.sh
./build-images.sh v1.0.0
```

### Pushing Images to Docker Hub

#### 1. Push Individual Images

```bash
# Push backend image
docker push your-dockerhub-username/ticketflow-backend:latest
docker push your-dockerhub-username/ticketflow-backend:v1.0.0

# Push frontend image
docker push your-dockerhub-username/ticketflow-frontend:latest
docker push your-dockerhub-username/ticketflow-frontend:v1.0.0
```

#### 2. Push All Images with Script

Create a push script (`push-images.sh`):

```bash
#!/bin/bash

# Configuration
DOCKER_USERNAME="your-dockerhub-username"
VERSION=${1:-latest}

echo "Pushing TicketFlow images version: $VERSION"

# Push backend image
echo "Pushing backend image..."
docker push $DOCKER_USERNAME/ticketflow-backend:$VERSION

# Push frontend image
echo "Pushing frontend image..."
docker push $DOCKER_USERNAME/ticketflow-frontend:$VERSION

echo "Push complete!"
echo "Images pushed:"
echo "  - $DOCKER_USERNAME/ticketflow-backend:$VERSION"
echo "  - $DOCKER_USERNAME/ticketflow-frontend:$VERSION"
```

Make it executable and run:
```bash
chmod +x push-images.sh
./push-images.sh v1.0.0
```

### Using Docker Hub Images

#### 1. Update docker-compose.yml

Create a production docker-compose file (`docker-compose.prod.yml`):

```yaml
version: '3.8'

services:
  # Backend API Server
  ticketflow-backend:
    image: your-dockerhub-username/ticketflow-backend:latest
    container_name: ticketflow-backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - VITE_WEBHOOK_ENABLED=false
      - VITE_WEBHOOK_URL=https://api.usw2.pure.cloud/platform/api/v2/integrations/webhooks/your-webhook-id/events
      - VITE_WEBHOOK_TIMEOUT=5000
    networks:
      - ticketflow-network

  # Frontend (Nginx)
  ticketflow-frontend:
    image: your-dockerhub-username/ticketflow-frontend:latest
    container_name: ticketflow-frontend
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
      - VITE_API_BASE_URL=http://ticketflow-backend:3001/rest
    networks:
      - ticketflow-network
    depends_on:
      - ticketflow-backend

networks:
  ticketflow-network:
    driver: bridge
```

#### 2. Deploy from Docker Hub

```bash
# Pull and run from Docker Hub
docker-compose -f docker-compose.prod.yml up -d

# Or pull specific versions
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

### Automated Build and Push

#### 1. GitHub Actions Workflow

Create `.github/workflows/docker-build.yml`:

```yaml
name: Build and Push Docker Images

on:
  push:
    tags:
      - 'v*'
  workflow_dispatch:

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
      
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2
      
    - name: Login to Docker Hub
      uses: docker/login-action@v2
      with:
        username: ${{ secrets.DOCKER_USERNAME }}
        password: ${{ secrets.DOCKER_PASSWORD }}
        
    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v4
      with:
        images: |
          ${{ secrets.DOCKER_USERNAME }}/ticketflow-backend
          ${{ secrets.DOCKER_USERNAME }}/ticketflow-frontend
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=semver,pattern={{version}}
          type=semver,pattern={{major}}.{{minor}}
          type=sha
          
    - name: Build and push backend
      uses: docker/build-push-action@v4
      with:
        context: .
        file: ./Dockerfile
        target: production
        push: true
        tags: ${{ secrets.DOCKER_USERNAME }}/ticketflow-backend:${{ steps.meta.outputs.version }}
        cache-from: type=gha
        cache-to: type=gha,mode=max
        
    - name: Build and push frontend
      uses: docker/build-push-action@v4
      with:
        context: .
        file: ./Dockerfile
        target: production
        push: true
        tags: ${{ secrets.DOCKER_USERNAME }}/ticketflow-frontend:${{ steps.meta.outputs.version }}
        cache-from: type=gha
        cache-to: type=gha,mode=max
```

#### 2. Set up GitHub Secrets

In your GitHub repository settings, add these secrets:
- `DOCKER_USERNAME`: Your Docker Hub username
- `DOCKER_PASSWORD`: Your Docker Hub access token

### Best Practices

#### 1. Image Tagging Strategy

```bash
# Use semantic versioning
docker tag ticketflow-backend:latest your-username/ticketflow-backend:v1.2.3

# Use git commit SHA for traceability
docker tag ticketflow-backend:latest your-username/ticketflow-backend:$(git rev-parse --short HEAD)

# Use environment-specific tags
docker tag ticketflow-backend:latest your-username/ticketflow-backend:staging
docker tag ticketflow-backend:latest your-username/ticketflow-backend:production
```

#### 2. Multi-Architecture Builds

```bash
# Build for multiple architectures
docker buildx build --platform linux/amd64,linux/arm64 \
  -t your-username/ticketflow-backend:latest \
  --target production \
  --push .
```

#### 3. Security Scanning

```bash
# Scan images for vulnerabilities
docker scan your-username/ticketflow-backend:latest
docker scan your-username/ticketflow-frontend:latest
```

### Troubleshooting

#### Common Issues

1. **Authentication Failed**
   ```bash
   # Re-login to Docker Hub
   docker logout
   docker login
   ```

2. **Push Permission Denied**
   - Ensure you're logged in with the correct account
   - Check if the repository exists on Docker Hub
   - Verify you have write permissions

3. **Image Size Too Large**
   ```bash
   # Use multi-stage builds (already implemented in Dockerfile)
   # Consider using .dockerignore to exclude unnecessary files
   ```

4. **Build Context Issues**
   ```bash
   # Ensure you're in the correct directory
   # Check .dockerignore file
   # Verify all required files are present
   ```

## That's It!

The configuration is now much simpler. Just set `VITE_API_BASE_URL` to point to your API server and you're ready to go! 