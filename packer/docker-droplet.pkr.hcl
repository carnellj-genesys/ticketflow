packer {
  required_plugins {
    digitalocean = {
      version = ">= 1.0.0"
      source  = "github.com/hashicorp/digitalocean"
    }
  }
}

source "digitalocean" "docker_droplet" {
  api_token     = var.do_token
  image         = var.do_image
  region        = var.do_region
  size          = var.do_size
  ssh_username  = var.ssh_username
  droplet_name  = var.droplet_name
  snapshot_name = "${var.droplet_name}-snapshot-${formatdate("YYYYMMDD-hhmm", timestamp())}"
  ssh_key_id    = var.ssh_key_id
}

build {
  name = "docker-droplet"
  sources = ["source.digitalocean.docker_droplet"]

  provisioner "shell" {
    environment_vars = ["DEBIAN_FRONTEND=noninteractive"]
    inline = [
      # Wait for and clear any stuck apt/dpkg locks
      "for i in {1..30}; do if ! fuser /var/lib/dpkg/lock-frontend >/dev/null 2>&1; then break; fi; echo 'Waiting for dpkg lock release...'; sleep 2; done",
      "if fuser /var/lib/dpkg/lock-frontend >/dev/null 2>&1; then echo 'Force clearing stuck lock...'; kill -9 $(fuser /var/lib/dpkg/lock-frontend 2>/dev/null) || true; rm -f /var/lib/dpkg/lock-frontend; dpkg --configure -a; fi",
      # Disable command-not-found to prevent database update errors
      "apt-get remove -y --purge command-not-found || true",
      "rm -f /etc/apt/apt.conf.d/*command-not-found*",
      # Clean apt cache to avoid stale lists
      "apt-get clean",
      "rm -rf /var/lib/apt/lists/*",
      "apt-get update -y",
      "apt-get upgrade -y",
      "apt-get install -y apt-transport-https ca-certificates curl gnupg",
      "curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg",
      "echo \"deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable\" > /etc/apt/sources.list.d/docker.list",
      "apt-get update -y",
      "apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin",
      "systemctl enable --now docker",
      "usermod -aG docker ${var.ssh_username}",
      "mkdir -p /etc/docker",
      "echo '{\"log-driver\":\"json-file\",\"log-opts\":{\"max-size\":\"10m\",\"max-file\":\"3\"}}' > /etc/docker/daemon.json",
      "systemctl restart docker",
      "ufw allow ssh && ufw allow 80/tcp && ufw allow 443/tcp && ufw --force enable",
      "mkdir -p /opt/ticketflow && chown ${var.ssh_username}:${var.ssh_username} /opt/ticketflow",
      "apt-get autoremove -y && apt-get autoclean",
      "docker run --rm hello-world"
    ]
  }

  provisioner "shell" {
    environment_vars = ["DEBIAN_FRONTEND=noninteractive"]
    inline = [
      # Create application directory structure
      "mkdir -p /opt/ticketflow/{config,logs}",
      "chown -R ${var.ssh_username}:${var.ssh_username} /opt/ticketflow"
    ]
  }

  provisioner "file" {
    content = <<-EOF
services:
  ticketflow-backend:
    image: johncarnell/ticketflow-backend:latest
    container_name: ticketflow-backend
    restart: unless-stopped
    ports:
      - '3001:3001'
    environment:
      - NODE_ENV=production
      - PORT=3001
      - VITE_WEBHOOK_ENABLED=false
      - VITE_WEBHOOK_URL=https://api.usw2.pure.cloud/platform/api/v2/integrations/webhooks/9ae130307f25ce9d294f6891f38d04d36f44638f1e3cc59f85fcf0eef8bdcb5907a9434291c69c93ccabb6f598ba7fb4/events
      - VITE_WEBHOOK_TIMEOUT=5000
    networks:
      - ticketflow-network
    volumes:
      - /opt/ticketflow/logs:/app/logs

  ticketflow-frontend:
    image: johncarnell/ticketflow-frontend:latest
    container_name: ticketflow-frontend
    restart: unless-stopped
    ports:
      - '80:80'
    environment:
      - NODE_ENV=production
      - VITE_API_BASE_URL=http://ticketflow-backend:3001/rest
    networks:
      - ticketflow-network
    depends_on:
      - ticketflow-backend

  nginx-proxy:
    image: nginx:alpine
    container_name: ticketflow-nginx-proxy
    restart: unless-stopped
    ports:
      - '8080:8080'
    volumes:
      - /opt/ticketflow/config/nginx-proxy.conf:/etc/nginx/conf.d/default.conf
    networks:
      - ticketflow-network
    depends_on:
      - ticketflow-backend
      - ticketflow-frontend

networks:
  ticketflow-network:
    driver: bridge
EOF
    destination = "/opt/ticketflow/docker-compose.yml"
  }

  provisioner "file" {
    content = <<-EOF
server {
    listen 8080;
    server_name localhost;
    
    # API requests to backend
    location /rest/ {
        proxy_pass http://ticketflow-backend:3001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_set_header X-Forwarded-Port \$server_port;
        
        # Handle CORS
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods 'GET, POST, PUT, DELETE, OPTIONS';
        add_header Access-Control-Allow-Headers 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization,x-apikey,CORS-API-Key';
        
        # Handle preflight requests
        if (\$request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin *;
            add_header Access-Control-Allow-Methods 'GET, POST, PUT, DELETE, OPTIONS';
            add_header Access-Control-Allow-Headers 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization,x-apikey,CORS-API-Key';
            add_header Access-Control-Max-Age 1728000;
            add_header Content-Type 'text/plain; charset=utf-8';
            add_header Content-Length 0;
            return 204;
        }
    }
    
    # API documentation
    location /api-docs {
        proxy_pass http://ticketflow-backend:3001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Health check endpoint
    location /echo {
        proxy_pass http://ticketflow-backend:3001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Frontend requests
    location / {
        proxy_pass http://ticketflow-frontend:80/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_set_header X-Forwarded-Port \$server_port;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF
    destination = "/opt/ticketflow/config/nginx-proxy.conf"
  }

  provisioner "file" {
    content = <<-EOF
[Unit]
Description=TicketFlow Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/ticketflow
ExecStart=/usr/bin/docker-compose up -d
ExecStop=/usr/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF
    destination = "/etc/systemd/system/ticketflow.service"
  }

  provisioner "file" {
    content = <<-EOF
#!/bin/bash
cd /opt/ticketflow
docker-compose down
docker-compose pull
docker-compose up -d
EOF
    destination = "/opt/ticketflow/start.sh"
  }

  provisioner "shell" {
    environment_vars = ["DEBIAN_FRONTEND=noninteractive"]
    inline = [
      # Set proper permissions
      "chown -R ${var.ssh_username}:${var.ssh_username} /opt/ticketflow",
      "chmod 644 /opt/ticketflow/config/nginx-proxy.conf",
      "chmod +x /opt/ticketflow/start.sh",
      "chown ${var.ssh_username}:${var.ssh_username} /opt/ticketflow/start.sh",
      
      # Enable and start the service
      "systemctl daemon-reload",
      "systemctl enable ticketflow.service",
      
      # Open additional firewall ports
      "ufw allow 3001/tcp",
      "ufw allow 8080/tcp"
    ]
  }
}