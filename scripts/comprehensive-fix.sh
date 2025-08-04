#!/bin/bash

echo "=== Comprehensive Frontend API URL Fix ==="
echo ""

# Check if we're in the right directory
if [ ! -f "/opt/ticketflow/docker-compose.yml" ]; then
    echo "ERROR: docker-compose.yml not found in /opt/ticketflow/"
    echo "Please run this script on the droplet where the application is deployed."
    exit 1
fi

# Stop all containers
echo "1. Stopping all containers..."
cd /opt/ticketflow
docker-compose down

# Backup current configuration
echo "2. Backing up current configuration..."
cp /opt/ticketflow/docker-compose.yml /opt/ticketflow/docker-compose.yml.backup.$(date +%Y%m%d_%H%M%S)

# Update docker-compose.yml to use relative URL
echo "3. Updating docker-compose.yml..."
sed -i 's|VITE_API_BASE_URL=http://ticketflow-backend:3001/rest|VITE_API_BASE_URL=/rest|g' /opt/ticketflow/docker-compose.yml
sed -i 's|VITE_API_BASE_URL=.*localhost.*3001.*rest|VITE_API_BASE_URL=/rest|g' /opt/ticketflow/docker-compose.yml

# Verify the change
echo "4. Verifying docker-compose.yml changes..."
grep "VITE_API_BASE_URL" /opt/ticketflow/docker-compose.yml

# Remove frontend container and image completely
echo "5. Removing frontend container and image..."
docker-compose rm -f ticketflow-frontend 2>/dev/null || true
docker rmi johncarnell/ticketflow-frontend:latest 2>/dev/null || true

# Pull fresh images
echo "6. Pulling fresh images..."
docker pull johncarnell/ticketflow-frontend:latest
docker pull johncarnell/ticketflow-backend:latest

# Set proper permissions
echo "7. Setting permissions..."
chown root:root /opt/ticketflow/docker-compose.yml
chmod 644 /opt/ticketflow/docker-compose.yml

# Start containers
echo "8. Starting containers..."
docker-compose up -d

# Wait for containers to start
echo "9. Waiting for containers to start..."
sleep 10

# Check container status
echo "10. Checking container status..."
docker-compose ps

# Check environment variables in running container
echo "11. Checking environment variables in frontend container..."
if docker-compose ps | grep -q "ticketflow-frontend.*Up"; then
    docker-compose exec ticketflow-frontend env | grep VITE
else
    echo "Frontend container is not running. Checking logs..."
    docker-compose logs ticketflow-frontend
fi

# Test API connectivity
echo "12. Testing API connectivity..."
sleep 5
if curl -s http://localhost:8080/rest/ticket > /dev/null; then
    echo "✅ API is accessible through nginx proxy"
else
    echo "❌ API is not accessible through nginx proxy"
    echo "Checking nginx logs..."
    docker-compose logs nginx-proxy | tail -10
fi

# Check frontend logs
echo "13. Checking frontend logs..."
docker-compose logs ticketflow-frontend | tail -10

echo ""
echo "=== Comprehensive fix complete ==="
echo ""
echo "If the frontend is still trying to access localhost:3001, the issue is that"
echo "the frontend image was built with the old environment variable and needs to be rebuilt."
echo ""
echo "To rebuild the frontend image with the correct environment variable:"
echo "1. The image needs to be rebuilt with VITE_API_BASE_URL=/rest as a build argument"
echo "2. This requires rebuilding the Docker image and pushing it to Docker Hub"
echo ""
echo "For now, you can test the API directly:"
echo "curl http://localhost:8080/rest/ticket"
echo ""
echo "The nginx proxy should be working correctly and routing /rest requests to the backend." 