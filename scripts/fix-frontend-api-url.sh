#!/bin/bash

echo "=== Comprehensive Frontend API URL Fix ==="
echo ""

# Stop containers
echo "1. Stopping containers..."
cd /opt/ticketflow
docker-compose down

# Update the docker-compose.yml file to use relative URL
echo "2. Updating docker-compose.yml..."
if [ -f "/opt/ticketflow/docker-compose.yml" ]; then
    echo "Backing up original docker-compose.yml..."
    cp /opt/ticketflow/docker-compose.yml /opt/ticketflow/docker-compose.yml.backup
    
    echo "Updating VITE_API_BASE_URL to use relative URL..."
    sed -i 's|VITE_API_BASE_URL=http://ticketflow-backend:3001/rest|VITE_API_BASE_URL=/rest|g' /opt/ticketflow/docker-compose.yml
    
    echo "Verifying changes..."
    grep "VITE_API_BASE_URL" /opt/ticketflow/docker-compose.yml
else
    echo "ERROR: docker-compose.yml not found!"
    exit 1
fi

# Remove the frontend container and image to force rebuild
echo "3. Removing frontend container and image..."
docker-compose rm -f ticketflow-frontend
docker rmi johncarnell/ticketflow-frontend:latest || echo "Image not found locally, will pull from registry"

# Pull the latest frontend image
echo "4. Pulling latest frontend image..."
docker pull johncarnell/ticketflow-frontend:latest

# Set proper permissions
echo "5. Setting permissions..."
chown root:root /opt/ticketflow/docker-compose.yml
chmod 644 /opt/ticketflow/docker-compose.yml

# Start containers
echo "6. Starting containers..."
docker-compose up -d

echo ""
echo "7. Checking container status..."
docker-compose ps

echo ""
echo "8. Checking frontend logs..."
docker-compose logs ticketflow-frontend | tail -10

echo ""
echo "9. Testing API connectivity..."
sleep 5
if curl -s http://localhost:8080/rest/ticket > /dev/null; then
    echo "✅ API is accessible through nginx proxy"
else
    echo "❌ API is not accessible through nginx proxy"
fi

echo ""
echo "=== Fix complete ==="
echo "The frontend should now use relative URLs for API calls."
echo "Check the application at http://your-server-ip:8080"
echo ""
echo "To verify the fix:"
echo "1. Open browser developer tools"
echo "2. Go to Network tab"
echo "3. Refresh the page"
echo "4. Check that API calls go to /rest instead of localhost:3001"
echo ""
echo "If the issue persists, the frontend image may need to be rebuilt with the new environment variable." 