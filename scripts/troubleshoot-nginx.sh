#!/bin/bash

echo "=== TicketFlow Nginx Proxy Troubleshooting Script ==="
echo ""

# Check if we're in the right directory
if [ ! -f "/opt/ticketflow/docker-compose.yml" ]; then
    echo "ERROR: docker-compose.yml not found in /opt/ticketflow/"
    exit 1
fi

echo "1. Checking nginx-proxy.conf file status..."
if [ -d "/opt/ticketflow/config/nginx-proxy.conf" ]; then
    echo "ERROR: nginx-proxy.conf exists as a directory, not a file!"
    echo "Removing the directory..."
    rm -rf /opt/ticketflow/config/nginx-proxy.conf
fi

if [ -f "/opt/ticketflow/config/nginx-proxy.conf" ]; then
    echo "✓ nginx-proxy.conf exists as a file"
    ls -la /opt/ticketflow/config/nginx-proxy.conf
    echo ""
    echo "File contents (first 10 lines):"
    head -10 /opt/ticketflow/config/nginx-proxy.conf
else
    echo "ERROR: nginx-proxy.conf file does not exist!"
    echo "Creating the file..."
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
    echo "✓ nginx-proxy.conf file created"
fi

echo ""
echo "2. Setting proper permissions..."
chmod 644 /opt/ticketflow/config/nginx-proxy.conf
chown root:root /opt/ticketflow/config/nginx-proxy.conf

echo ""
echo "3. Checking Docker Compose configuration..."
cd /opt/ticketflow
docker-compose config

echo ""
echo "4. Stopping any running containers..."
docker-compose down

echo ""
echo "5. Starting containers..."
docker-compose up -d

echo ""
echo "6. Checking container status..."
docker-compose ps

echo ""
echo "7. Checking nginx-proxy container logs..."
docker-compose logs nginx-proxy

echo ""
echo "=== Troubleshooting complete ==="
echo "If the issue persists, check the nginx-proxy container logs above for more details." 