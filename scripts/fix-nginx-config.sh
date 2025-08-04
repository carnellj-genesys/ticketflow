#!/bin/bash

echo "=== Fixing Nginx Configuration ==="
echo ""

# Stop containers
echo "1. Stopping containers..."
cd /opt/ticketflow
docker-compose down

# Fix the nginx configuration by removing escaped dollar signs
echo "2. Fixing nginx-proxy.conf..."
if [ -f "/opt/ticketflow/config/nginx-proxy.conf" ]; then
    echo "Backing up original file..."
    cp /opt/ticketflow/config/nginx-proxy.conf /opt/ticketflow/config/nginx-proxy.conf.backup
    
    echo "Fixing escaped dollar signs..."
    sed -i 's/\\\$/\$/g' /opt/ticketflow/config/nginx-proxy.conf
    
    echo "Verifying fix..."
    grep -n "\\$" /opt/ticketflow/config/nginx-proxy.conf || echo "No escaped dollar signs found"
    
    echo "File contents (first 10 lines):"
    head -10 /opt/ticketflow/config/nginx-proxy.conf
else
    echo "ERROR: nginx-proxy.conf not found!"
    exit 1
fi

# Set proper permissions
echo "3. Setting permissions..."
chmod 644 /opt/ticketflow/config/nginx-proxy.conf
chown root:root /opt/ticketflow/config/nginx-proxy.conf

# Test nginx configuration
echo "4. Testing nginx configuration..."
docker run --rm -v /opt/ticketflow/config/nginx-proxy.conf:/etc/nginx/conf.d/default.conf nginx:alpine nginx -t

# Start containers
echo "5. Starting containers..."
docker-compose up -d

echo ""
echo "=== Fix complete ==="
echo "Check container status with: docker-compose ps"
echo "Check nginx logs with: docker-compose logs nginx-proxy" 