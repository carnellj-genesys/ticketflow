#!/bin/bash

echo "=== Quick Fix for Nginx Proxy Mount Issue ==="
echo ""

# Stop the containers first
echo "1. Stopping containers..."
cd /opt/ticketflow
docker-compose down

# Check if nginx-proxy.conf is a directory and remove it
echo "2. Checking nginx-proxy.conf..."
if [ -d "/opt/ticketflow/config/nginx-proxy.conf" ]; then
    echo "ERROR: nginx-proxy.conf is a directory! Removing it..."
    rm -rf /opt/ticketflow/config/nginx-proxy.conf
fi

# Create the nginx-proxy.conf file if it doesn't exist
if [ ! -f "/opt/ticketflow/config/nginx-proxy.conf" ]; then
    echo "3. Creating nginx-proxy.conf file..."
    cat > /opt/ticketflow/config/nginx-proxy.conf << 'EOF'
server {
    listen 8080;
    server_name localhost;
    
    # API requests to backend
    location /rest/ {
        proxy_pass http://ticketflow-backend:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        
        # Handle CORS
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization,x-apikey,CORS-API-Key";
        
        # Handle preflight requests
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin *;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
            add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization,x-apikey,CORS-API-Key";
            add_header Access-Control-Max-Age 1728000;
            add_header Content-Type 'text/plain; charset=utf-8';
            add_header Content-Length 0;
            return 204;
        }
    }
    
    # API documentation
    location /api-docs {
        proxy_pass http://ticketflow-backend:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Health check endpoint
    location /echo {
        proxy_pass http://ticketflow-backend:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Frontend requests
    location / {
        proxy_pass http://ticketflow-frontend:80/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF
fi

# Set proper permissions
echo "4. Setting permissions..."
chmod 644 /opt/ticketflow/config/nginx-proxy.conf
chown root:root /opt/ticketflow/config/nginx-proxy.conf

# Verify the file
echo "5. Verifying file..."
ls -la /opt/ticketflow/config/nginx-proxy.conf
echo "File type: $(file /opt/ticketflow/config/nginx-proxy.conf)"

# Start the containers
echo "6. Starting containers..."
docker-compose up -d

echo ""
echo "=== Fix complete ==="
echo "Check container status with: docker-compose ps"
echo "Check logs with: docker-compose logs nginx-proxy" 