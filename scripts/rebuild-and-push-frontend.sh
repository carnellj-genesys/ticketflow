#!/bin/bash

echo "=== Rebuilding Frontend Image with Correct Environment Variable ==="
echo ""

# Check if we're in the right directory
if [ ! -f "Dockerfile" ]; then
    echo "ERROR: Dockerfile not found. Please run this script from the project root."
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "ERROR: Docker is not running. Please start Docker and try again."
    exit 1
fi

# Stop any running containers
echo "1. Stopping any running containers..."
docker-compose down 2>/dev/null || true

# Build the frontend image with the correct environment variable
echo "2. Building frontend image with VITE_API_BASE_URL=/rest..."
docker build \
    --build-arg VITE_API_BASE_URL=/rest \
    --build-arg NODE_ENV=production \
    -t johncarnell/ticketflow-frontend:latest \
    --target production .

# Check if build was successful
if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please check the error messages above."
    exit 1
fi

echo "✅ Build successful!"

# Tag the image for Docker Hub
echo "3. Tagging image for Docker Hub..."
docker tag johncarnell/ticketflow-frontend:latest johncarnell/ticketflow-frontend:latest

# Push to Docker Hub
echo "4. Pushing to Docker Hub..."
echo "You may be prompted to log in to Docker Hub."
docker push johncarnell/ticketflow-frontend:latest

if [ $? -ne 0 ]; then
    echo "❌ Push failed. Please check your Docker Hub credentials."
    echo "You can manually push the image later with:"
    echo "docker push johncarnell/ticketflow-frontend:latest"
    exit 1
fi

echo "✅ Image pushed to Docker Hub successfully!"

# Update local docker-compose.yml
echo "5. Updating local docker-compose.yml..."
sed -i 's|VITE_API_BASE_URL=http://ticketflow-backend:3001/rest|VITE_API_BASE_URL=/rest|g' docker-compose.yml
sed -i 's|VITE_API_BASE_URL=.*localhost.*3001.*rest|VITE_API_BASE_URL=/rest|g' docker-compose.yml

# Test the build locally
echo "6. Testing the build locally..."
docker-compose up -d

# Wait for containers to start
echo "7. Waiting for containers to start..."
sleep 10

# Test API connectivity
echo "8. Testing API connectivity..."
if curl -s http://localhost:8080/rest/ticket > /dev/null; then
    echo "✅ API is accessible through nginx proxy"
else
    echo "❌ API is not accessible through nginx proxy"
fi

# Stop local containers
echo "9. Stopping local containers..."
docker-compose down

echo ""
echo "=== Rebuild complete ==="
echo ""
echo "The frontend image has been rebuilt with VITE_API_BASE_URL=/rest"
echo "and pushed to Docker Hub."
echo ""
echo "To deploy the fixed version on your droplet:"
echo "1. SSH to your droplet"
echo "2. Run: cd /opt/ticketflow"
echo "3. Run: docker-compose down"
echo "4. Run: docker pull johncarnell/ticketflow-frontend:latest"
echo "5. Run: docker-compose up -d"
echo ""
echo "The frontend should now use relative URLs (/rest) instead of localhost:3001" 