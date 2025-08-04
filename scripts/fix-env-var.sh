#!/bin/bash

echo "=== Fixing Environment Variable Issue ==="
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

# Check current docker-compose.yml
echo "2. Checking current docker-compose.yml..."
echo "Current VITE_API_BASE_URL setting:"
grep -A 2 -B 2 "VITE_API_BASE_URL" docker-compose.yml

# Update docker-compose.yml with explicit environment variable
echo "3. Updating docker-compose.yml with explicit environment variable..."
cat > /tmp/frontend-service.yml << 'EOF'
  ticketflow-frontend:
    image: johncarnell/ticketflow-frontend:latest
    container_name: ticketflow-frontend
    restart: unless-stopped
    ports:
      - '80:80'
    environment:
      - NODE_ENV=production
      - VITE_API_BASE_URL=/rest
    networks:
      - ticketflow-network
    depends_on:
      - ticketflow-backend
EOF

# Replace the frontend service section in docker-compose.yml
echo "4. Replacing frontend service configuration..."
sed -i '/ticketflow-frontend:/,/depends_on:/c\'"$(cat /tmp/frontend-service.yml)" docker-compose.yml

# Verify the change
echo "5. Verifying the change..."
echo "Updated VITE_API_BASE_URL setting:"
grep -A 2 -B 2 "VITE_API_BASE_URL" docker-compose.yml

# Remove frontend container to force recreation
echo "6. Removing frontend container..."
docker-compose rm -f ticketflow-frontend 2>/dev/null || true

# Start containers
echo "7. Starting containers..."
docker-compose up -d

# Wait for containers to start
echo "8. Waiting for containers to start..."
sleep 10

# Check environment variables in the running container
echo "9. Checking environment variables in frontend container..."
if docker-compose ps | grep -q "ticketflow-frontend.*Up"; then
    echo "Environment variables in frontend container:"
    docker-compose exec ticketflow-frontend env | grep VITE
else
    echo "Frontend container is not running. Checking logs..."
    docker-compose logs ticketflow-frontend
fi

# Test the API directly
echo "10. Testing API connectivity..."
if curl -s http://localhost:8080/rest/ticket > /dev/null; then
    echo "✅ API is accessible through nginx proxy"
else
    echo "❌ API is not accessible through nginx proxy"
fi

echo ""
echo "=== Fix complete ==="
echo ""
echo "The issue is that the frontend image was built with the old environment variable."
echo "Even though we set VITE_API_BASE_URL=/rest in docker-compose.yml,"
echo "the JavaScript code was already compiled with the old value."
echo ""
echo "To completely fix this, the frontend image needs to be rebuilt with:"
echo "VITE_API_BASE_URL=/rest as a build argument."
echo ""
echo "For now, the nginx proxy should be working correctly at:"
echo "http://your-server-ip:8080"
echo ""
echo "The API calls will go through the nginx proxy to the backend." 