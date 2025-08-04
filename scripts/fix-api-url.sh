#!/bin/bash

echo "=== Fixing API Base URL Configuration ==="
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

# Set proper permissions
echo "3. Setting permissions..."
chown root:root /opt/ticketflow/docker-compose.yml
chmod 644 /opt/ticketflow/docker-compose.yml

# Start containers
echo "4. Starting containers..."
docker-compose up -d

echo ""
echo "5. Checking container status..."
docker-compose ps

echo ""
echo "6. Checking frontend logs..."
docker-compose logs ticketflow-frontend | tail -10

echo ""
echo "=== Fix complete ==="
echo "The frontend should now use relative URLs for API calls."
echo "Check the application at http://your-server-ip:8080"
echo ""
echo "To verify the fix, check the browser's network tab to see if API calls"
echo "are now going to /rest instead of localhost:3001" 