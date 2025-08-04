#!/bin/bash

echo "=== Rebuilding Frontend with Correct API URL ==="
echo ""

# Check if we're in the right directory
if [ ! -f "Dockerfile" ]; then
    echo "ERROR: Dockerfile not found. Please run this script from the project root."
    exit 1
fi

# Stop containers
echo "1. Stopping containers..."
docker-compose down

# Build the frontend image with the correct environment variable
echo "2. Building frontend image with VITE_API_BASE_URL=/rest..."
docker build \
    --build-arg VITE_API_BASE_URL=/rest \
    --build-arg NODE_ENV=production \
    -t johncarnell/ticketflow-frontend:latest \
    --target production .

# Tag the image for Docker Hub
echo "3. Tagging image..."
docker tag johncarnell/ticketflow-frontend:latest johncarnell/ticketflow-frontend:latest

# Push to Docker Hub (optional - uncomment if you want to push)
# echo "4. Pushing to Docker Hub..."
# docker push johncarnell/ticketflow-frontend:latest

# Update docker-compose.yml to use the rebuilt image
echo "5. Updating docker-compose.yml..."
if [ -f "docker-compose.yml" ]; then
    echo "Updating VITE_API_BASE_URL to use relative URL..."
    sed -i 's|VITE_API_BASE_URL=http://ticketflow-backend:3001/rest|VITE_API_BASE_URL=/rest|g' docker-compose.yml
    
    echo "Verifying changes..."
    grep "VITE_API_BASE_URL" docker-compose.yml
else
    echo "ERROR: docker-compose.yml not found!"
    exit 1
fi

# Start containers
echo "6. Starting containers..."
docker-compose up -d

echo ""
echo "7. Checking container status..."
docker-compose ps

echo ""
echo "8. Testing API connectivity..."
sleep 5
if curl -s http://localhost:8080/rest/ticket > /dev/null; then
    echo "✅ API is accessible through nginx proxy"
else
    echo "❌ API is not accessible through nginx proxy"
fi

echo ""
echo "=== Rebuild complete ==="
echo "The frontend has been rebuilt with the correct API base URL."
echo "Check the application at http://localhost:8080"
echo ""
echo "To verify the fix:"
echo "1. Open browser developer tools"
echo "2. Go to Network tab"
echo "3. Refresh the page"
echo "4. Check that API calls go to /rest instead of localhost:3001" 