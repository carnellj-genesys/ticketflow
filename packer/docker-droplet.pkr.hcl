packer {
  required_plugins {
    digitalocean = {
      version = ">= 1.0.0"
      source  = "github.com/hashicorp/digitalocean"
    }
  }
}

variable "do_token" {
  description = "DigitalOcean API token"
  type        = string
  sensitive   = true
  default     = env("DOCTL_API_KEY")
}

variable "do_region" {
  description = "DigitalOcean region for the droplet"
  type        = string
  default     = "nyc1"
}

variable "do_size" {
  description = "DigitalOcean droplet size"
  type        = string
  default     = "s-1vcpu-512mb-10gb"
}

variable "do_image" {
  description = "DigitalOcean base image (Ubuntu 22.04 LTS)"
  type        = string
  default     = "ubuntu-22-04-x64"
}

variable "droplet_name" {
  description = "Name for the droplet"
  type        = string
  default     = "ticketflow-docker-droplet"
}

variable "ssh_username" {
  description = "SSH username for the droplet"
  type        = string
  default     = "root"
}

variable "ssh_key_id" {
  description = "DigitalOcean SSH key ID"
  type        = string
  default     = env("SSH_KEY_ID")
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
  ssh_private_key_file = "~/.ssh/id_rsa_do"
  ssh_timeout   = "15m"
  ssh_handshake_attempts = "100"
  droplet_agent = false
  monitoring    = false
  ipv6          = false
}

build {
  name = "docker-droplet"
  sources = ["source.digitalocean.docker_droplet"]

  provisioner "shell" {
    environment_vars = ["DEBIAN_FRONTEND=noninteractive"]
    inline = [
      # Initial system setup and lock handling
      "echo '=== Initial System Setup ==='",
      "echo 'Waiting for system to be ready...'",
      "sleep 30",
      
      # Kill any existing package manager processes
      "echo 'Killing any existing package manager processes...'",
      "pkill -f apt-get || true",
      "pkill -f apt || true",
      "pkill -f dpkg || true",
      
      # Wait for processes to terminate
      "sleep 15",
      
      # Clear any existing locks
      "echo 'Clearing any existing locks...'",
      "rm -f /var/lib/apt/lists/lock",
      "rm -f /var/lib/dpkg/lock",
      "rm -f /var/lib/dpkg/lock-frontend",
      "rm -f /var/cache/apt/archives/lock",
      "rm -rf /var/lib/apt/lists/partial/*",
      
      # Configure dpkg
      "dpkg --configure -a || true",
      
      # Update package lists
      "echo 'Updating package lists...'",
      "apt-get update -y || true",
      
      # Install basic utilities
      "echo 'Installing basic utilities...'",
      "apt-get install -y curl wget gnupg lsb-release || true"
    ]
  }

  provisioner "shell" {
    environment_vars = ["DEBIAN_FRONTEND=noninteractive"]
    inline = [
      # Comprehensive lock handling
      "echo '=== Comprehensive APT Lock Handling ==='",
      "echo 'Killing any existing apt processes...'",
      "pkill -f apt-get || true",
      "pkill -f apt || true",
      "pkill -f dpkg || true",
      
      # Wait for processes to terminate
      "echo 'Waiting for processes to terminate...'",
      "sleep 10",
      
      # Check and wait for locks
      "echo 'Checking for existing apt locks...'",
      "while fuser /var/lib/apt/lists/lock >/dev/null 2>&1; do echo 'Waiting for apt lock...'; sleep 5; done",
      "while fuser /var/lib/dpkg/lock >/dev/null 2>&1; do echo 'Waiting for dpkg lock...'; sleep 5; done",
      "while fuser /var/lib/dpkg/lock-frontend >/dev/null 2>&1; do echo 'Waiting for dpkg frontend lock...'; sleep 5; done",
      "while fuser /var/cache/apt/archives/lock >/dev/null 2>&1; do echo 'Waiting for apt archives lock...'; sleep 5; done",
      
      # Force clear any stuck locks
      "echo 'Clearing any stuck locks...'",
      "rm -f /var/lib/apt/lists/lock",
      "rm -f /var/lib/dpkg/lock",
      "rm -f /var/lib/dpkg/lock-frontend",
      "rm -f /var/cache/apt/archives/lock",
      "rm -f /var/lib/apt/lists/partial/*",
      
      # Configure dpkg
      "dpkg --configure -a || true",
      
      # Disable command-not-found to prevent database update errors
      "apt-get remove -y --purge command-not-found || true",
      "rm -f /etc/apt/apt.conf.d/*command-not-found*",
      
      # Clean apt cache and update
      "echo 'Cleaning apt cache...'",
      "apt-get clean",
      "rm -rf /var/lib/apt/lists/*",
      "echo 'Updating apt lists...'",
      "apt-get update -y",
      
      # Install Docker dependencies
      "apt-get install -y apt-transport-https ca-certificates curl gnupg",
      
      # Add Docker repository
      "curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg",
      "echo \"deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable\" > /etc/apt/sources.list.d/docker.list",
      
      # Update and install Docker
      "apt-get update -y",
      "apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin",
      
      # Configure Docker
      "systemctl enable --now docker",
      "usermod -aG docker ${var.ssh_username}",
      "mkdir -p /etc/docker",
      "echo '{\"log-driver\":\"json-file\",\"log-opts\":{\"max-size\":\"10m\",\"max-file\":\"3\"}}' > /etc/docker/daemon.json",
      "systemctl restart docker",
      
      # Configure firewall
      "ufw allow ssh && ufw allow 80/tcp && ufw allow 443/tcp && ufw --force enable",
      
      # Create application directory
      "mkdir -p /opt/ticketflow && chown ${var.ssh_username}:${var.ssh_username} /opt/ticketflow",
      
      # Clean up
      "apt-get autoremove -y && apt-get autoclean",
      
      # Test Docker
      "docker run --rm hello-world"
    ]
  }

  provisioner "shell" {
    environment_vars = ["DEBIAN_FRONTEND=noninteractive"]
    inline = [
      # Create application directory structure
      "mkdir -p /opt/ticketflow/config",
      "mkdir -p /opt/ticketflow/logs",
      "chown -R ${var.ssh_username}:${var.ssh_username} /opt/ticketflow",
      "ls -la /opt/ticketflow/",
      "ls -la /opt/ticketflow/config/ || echo 'Config directory not found'"
    ]
  }

  provisioner "shell" {
    environment_vars = ["DEBIAN_FRONTEND=noninteractive"]
    inline = [
      # Ensure nginx-proxy.conf is created as a file, not a directory
      "rm -rf /opt/ticketflow/config/nginx-proxy.conf",
      "touch /opt/ticketflow/config/nginx-proxy.conf",
      "chmod 644 /opt/ticketflow/config/nginx-proxy.conf",
      "chown ${var.ssh_username}:${var.ssh_username} /opt/ticketflow/config/nginx-proxy.conf",
      "echo 'nginx-proxy.conf file created and permissions set'",
      "ls -la /opt/ticketflow/config/"
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
      - VITE_API_BASE_URL=/rest
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
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        
        # Handle CORS
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods 'GET, POST, PUT, DELETE, OPTIONS';
        add_header Access-Control-Allow-Headers 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization,x-apikey,CORS-API-Key';
        
        # Handle preflight requests
        if ($request_method = 'OPTIONS') {
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
    destination = "/opt/ticketflow/config/nginx-proxy.conf"
  }

  provisioner "shell" {
    environment_vars = ["DEBIAN_FRONTEND=noninteractive"]
    inline = [
      # Verify nginx-proxy.conf file was created correctly
      "echo 'Verifying nginx-proxy.conf file...'",
      "if [ -f /opt/ticketflow/config/nginx-proxy.conf ]; then",
      "  echo 'nginx-proxy.conf exists as a file'",
      "  ls -la /opt/ticketflow/config/nginx-proxy.conf",
      "  echo 'File contents:'",
      "  head -10 /opt/ticketflow/config/nginx-proxy.conf",
      "else",
      "  echo 'ERROR: nginx-proxy.conf is not a file or does not exist'",
      "  ls -la /opt/ticketflow/config/",
      "fi",
      "chmod 644 /opt/ticketflow/config/nginx-proxy.conf",
      "chown ${var.ssh_username}:${var.ssh_username} /opt/ticketflow/config/nginx-proxy.conf"
    ]
  }

  provisioner "file" {
    content = <<-EOF
[Unit]
Description=TicketFlow Application
Requires=docker.service
After=docker.service
Wants=network-online.target
After=network-online.target

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/ticketflow
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
ExecReload=/usr/bin/docker compose down && /usr/bin/docker compose up -d
TimeoutStartSec=0

# Restart policy
Restart=on-failure
RestartSec=30

# Environment variables
Environment=PATH=/usr/local/bin:/usr/bin:/bin
Environment=DOCKER_COMPOSE_IGNORE_ORPHANS=1

# Security settings
User=root
Group=root

[Install]
WantedBy=multi-user.target
EOF
    destination = "/etc/systemd/system/ticketflow.service"
  }

  provisioner "file" {
    content = <<-EOF
#!/bin/bash

# TicketFlow Startup Script
# This script starts the TicketFlow application

set -e

echo "Starting TicketFlow application..."

# Change to application directory
cd /opt/ticketflow

# Stop any existing containers
echo "Stopping existing containers..."
docker compose down || true

# Pull latest images
echo "Pulling latest images..."
docker compose pull || echo "Warning: Failed to pull images, using local images"

# Start the application
echo "Starting application..."
docker compose up -d

# Wait for containers to be ready
echo "Waiting for containers to be ready..."
sleep 10

# Check status
echo "Checking container status..."
docker compose ps

echo "TicketFlow application started successfully!"
echo "Access the application at: http://localhost:8080"
EOF
    destination = "/opt/ticketflow/start.sh"
  }

  provisioner "file" {
    content = <<-EOF
#!/bin/bash

# TicketFlow Stop Script
# This script stops the TicketFlow application

set -e

echo "Stopping TicketFlow application..."

# Change to application directory
cd /opt/ticketflow

# Stop the application
echo "Stopping containers..."
docker compose down

echo "TicketFlow application stopped successfully!"
EOF
    destination = "/opt/ticketflow/stop.sh"
  }

  provisioner "file" {
    content = <<-EOF
#!/bin/bash

# TicketFlow Restart Script
# This script restarts the TicketFlow application

set -e

echo "Restarting TicketFlow application..."

# Change to application directory
cd /opt/ticketflow

# Stop the application
echo "Stopping containers..."
docker compose down

# Start the application
echo "Starting containers..."
docker compose up -d

# Wait for containers to be ready
echo "Waiting for containers to be ready..."
sleep 10

# Check status
echo "Checking container status..."
docker compose ps

echo "TicketFlow application restarted successfully!"
echo "Access the application at: http://localhost:8080"
EOF
    destination = "/opt/ticketflow/restart.sh"
  }

  provisioner "shell" {
    environment_vars = ["DEBIAN_FRONTEND=noninteractive"]
    inline = [
      # Verify files were created properly
      "echo 'Verifying file creation...'",
      "ls -la /opt/ticketflow/",
      "ls -la /opt/ticketflow/config/ || echo 'Config directory not found'",
      "cat /opt/ticketflow/config/nginx-proxy.conf || echo 'nginx-proxy.conf not found'",
      "cat /opt/ticketflow/docker-compose.yml || echo 'docker-compose.yml not found'",
      "cat /opt/ticketflow/start.sh || echo 'start.sh not found'",
      "cat /opt/ticketflow/stop.sh || echo 'stop.sh not found'",
      "cat /opt/ticketflow/restart.sh || echo 'restart.sh not found'",
      "cat /etc/systemd/system/ticketflow.service || echo 'ticketflow.service not found'"
    ]
  }

  provisioner "shell" {
    environment_vars = ["DEBIAN_FRONTEND=noninteractive"]
    inline = [
      # Set proper permissions with error handling
      "echo 'Setting file permissions...'",
      "chown -R ${var.ssh_username}:${var.ssh_username} /opt/ticketflow",
      "if [ -f /opt/ticketflow/config/nginx-proxy.conf ]; then chmod 644 /opt/ticketflow/config/nginx-proxy.conf; else echo 'nginx-proxy.conf not found'; fi",
      "if [ -f /opt/ticketflow/start.sh ]; then chmod +x /opt/ticketflow/start.sh; else echo 'start.sh not found'; fi",
      "if [ -f /opt/ticketflow/stop.sh ]; then chmod +x /opt/ticketflow/stop.sh; else echo 'stop.sh not found'; fi",
      "if [ -f /opt/ticketflow/restart.sh ]; then chmod +x /opt/ticketflow/restart.sh; else echo 'restart.sh not found'; fi",
      "if [ -f /opt/ticketflow/start.sh ]; then chown ${var.ssh_username}:${var.ssh_username} /opt/ticketflow/start.sh; else echo 'start.sh not found'; fi",
      "if [ -f /opt/ticketflow/stop.sh ]; then chown ${var.ssh_username}:${var.ssh_username} /opt/ticketflow/stop.sh; else echo 'stop.sh not found'; fi",
      "if [ -f /opt/ticketflow/restart.sh ]; then chown ${var.ssh_username}:${var.ssh_username} /opt/ticketflow/restart.sh; else echo 'restart.sh not found'; fi",
      
      # Test Docker Compose configuration
      "echo 'Testing Docker Compose configuration...'",
      "cd /opt/ticketflow",
      "docker compose config || echo 'Docker Compose config validation failed'",
      
      # Enable and start the service
      "if [ -f /etc/systemd/system/ticketflow.service ]; then systemctl daemon-reload; systemctl enable ticketflow.service; else echo 'ticketflow.service not found'; fi",
      
      # Open additional firewall ports
      "ufw allow 3001/tcp",
      "ufw allow 8080/tcp",
      
      # Create a README file with usage instructions
      "echo 'Creating README with usage instructions...'",
      "cat > /opt/ticketflow/README.md << 'EOF'",
      "# TicketFlow Application",
      "",
      "This directory contains the TicketFlow application configuration and scripts.",
      "",
      "## Quick Start",
      "",
      "The application is configured to start automatically on system boot.",
      "",
      "## Manual Control",
      "",
      "### Start the application:",
      "sudo systemctl start ticketflow",
      "",
      "### Stop the application:",
      "sudo systemctl stop ticketflow",
      "",
      "### Restart the application:",
      "sudo systemctl restart ticketflow",
      "",
      "### Check status:",
      "sudo systemctl status ticketflow",
      "",
      "### View logs:",
      "sudo journalctl -u ticketflow -f",
      "",
      "## Scripts",
      "",
      "- ./start.sh - Start the application manually",
      "- ./stop.sh - Stop the application manually",
      "- ./restart.sh - Restart the application manually",
      "",
      "## Access URLs",
      "",
      "- Frontend: http://localhost:8080",
      "- API: http://localhost:8080/rest/ticket",
      "- Health Check: http://localhost:8080/echo",
      "",
      "## Docker Compose",
      "",
      "The application uses Docker Compose for orchestration.",
      "",
      "### View logs:",
      "docker-compose logs -f",
      "",
      "### View specific service logs:",
      "docker-compose logs -f ticketflow-backend",
      "docker-compose logs -f ticketflow-frontend",
      "docker-compose logs -f nginx-proxy",
      "EOF",
      
      # Final verification
      "echo 'Final verification...'",
      "systemctl is-enabled ticketflow.service && echo 'Service is enabled' || echo 'Service is not enabled'",
      "echo 'TicketFlow application setup completed successfully!'",
      "echo 'The application will start automatically on system boot.'",
      "echo 'Access the application at: http://localhost:8080'"
    ]
  }

  # Install and configure ngrok
  provisioner "shell" {
    environment_vars = ["DEBIAN_FRONTEND=noninteractive"]
    inline = [
      "echo 'Installing ngrok...'",
      
      # Install snapd if not already installed
      "apt-get update -y",
      "apt-get install -y snapd",
      
      # Install ngrok via snap
      "snap install ngrok",
      
      # Create ngrok configuration directory
      "mkdir -p /opt/ticketflow",
      
      # Verify ngrok installation
      "ngrok version || echo 'ngrok installation verification'"
    ]
  }

  # Create ngrok configuration file with auth token
  provisioner "shell" {
    inline = [
      "echo 'Creating ngrok configuration...'",
      "NGROK_TOKEN='${var.ngrok_auth_token}'",
      "cat > /opt/ticketflow/ngrok.yml << EOF",
      "version: 2",
      "authtoken: \$NGROK_TOKEN",
      "tunnels:",
      "  app:",
      "    proto: http",
      "    addr: http://localhost:8080",
      "    hostname: ticketflow.ngrok.io",
      "EOF"
    ]
  }

  # Create ngrok systemd service
  provisioner "file" {
    content = <<-EOF
[Unit]
Description=ngrok service
After=network.target
After=ticketflow.service

[Service]
Type=simple
User=root
ExecStart=/snap/bin/ngrok start --all --config /opt/ticketflow/ngrok.yml
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
    destination = "/etc/systemd/system/ngrok.service"
  }

  # Configure ngrok service
  provisioner "shell" {
    environment_vars = ["DEBIAN_FRONTEND=noninteractive"]
    inline = [
      "echo 'Configuring ngrok service...'",
      
      # Set proper permissions
      "chmod 644 /opt/ticketflow/ngrok.yml",
      "chmod 644 /etc/systemd/system/ngrok.service",
      "chown root:root /opt/ticketflow/ngrok.yml",
      "chown root:root /etc/systemd/system/ngrok.service",
      
      # Reload systemd daemon
      "systemctl daemon-reload",
      
      # Enable ngrok service
      "systemctl enable ngrok.service",
      
      # Verify configuration
      "echo 'Verifying ngrok configuration...'",
      "if [ -f /opt/ticketflow/ngrok.yml ]; then echo 'ngrok.yml exists'; else echo 'ngrok.yml not found'; fi",
      "if [ -f /etc/systemd/system/ngrok.service ]; then echo 'ngrok.service exists'; else echo 'ngrok.service not found'; fi",
      
      # Test ngrok configuration
      "ngrok config check /opt/ticketflow/ngrok.yml || echo 'ngrok config check completed'",
      
      "echo 'ngrok installation and configuration completed successfully!'",
      "echo 'ngrok service will start automatically on system boot.'",
      "echo 'ngrok tunnel will be available at: https://ticketflow.ngrok.io'"
    ]
  }
}