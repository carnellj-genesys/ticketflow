#!/bin/bash

echo "=== Deploying Fixed Frontend Version ==="
echo ""

# Check if we're in the right directory
if [ ! -f "/opt/ticketflow/docker-compose.yml" ]; then
    echo "ERROR: docker-compose.yml not found in /opt/ticketflow/"
    echo "Please run this script on the droplet where the application is deployed."
    exit 1
fi

cd /opt/ticketflow

# Stop containers
echo "1. Stopping containers..."
docker-compose down

# Remove old frontend container and image
echo "2. Removing old frontend container and image..."
docker-compose rm -f ticketflow-frontend 2>/dev/null || true
docker rmi johncarnell/ticketflow-frontend:latest 2>/dev/null || true

# Pull the fixed frontend image
echo "3. Pulling fixed frontend image..."
docker pull johncarnell/ticketflow-frontend:latest

# Update docker-compose.yml to use relative URL
echo "4. Updating docker-compose.yml..."
sed -i 's|VITE_API_BASE_URL=http://ticketflow-backend:3001/rest|VITE_API_BASE_URL=/rest|g' docker-compose.yml
sed -i 's|VITE_API_BASE_URL=.*localhost.*3001.*rest|VITE_API_BASE_URL=/rest|g' docker-compose.yml

# Verify the change
echo "5. Verifying docker-compose.yml changes..."
grep "VITE_API_BASE_URL" docker-compose.yml

# Start containers
echo "6. Starting containers..."
docker-compose up -d

# Wait for containers to start
echo "7. Waiting for containers to start..."
sleep 15

# Check container status
echo "8. Checking container status..."
docker-compose ps

# Test API connectivity
echo "9. Testing API connectivity..."
if curl -s http://localhost:8080/rest/ticket > /dev/null; then
    echo "✅ API is accessible through nginx proxy"
else
    echo "❌ API is not accessible through nginx proxy"
    echo "Checking nginx logs..."
    docker-compose logs nginx-proxy | tail -10
fi

# Check frontend logs for environment variable
echo "10. Checking frontend logs..."
docker-compose logs ticketflow-frontend | grep -i "baseurl\|api.*url" | tail -5

echo ""
echo "=== Deployment complete ==="
echo ""
echo "The fixed frontend version has been deployed."
echo "Check the application at: http://your-server-ip:8080"
echo ""
echo "To verify the fix:"
echo "1. Open browser developer tools"
echo "2. Go to Network tab"
echo "3. Refresh the page"
echo "4. Check that API calls go to /rest instead of localhost:3001"
echo ""
echo "If you still see localhost:3001 in the logs, the image may not have been updated yet."
echo "Wait a few minutes and try pulling the image again." 