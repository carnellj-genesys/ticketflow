# TicketFlow Systemd Service Guide

This guide explains how the TicketFlow application is configured to run as a systemd service on the droplet.

## Overview

The Packer build creates a systemd service called `ticketflow.service` that automatically starts the TicketFlow application on system boot.

## Service Configuration

The service is located at `/etc/systemd/system/ticketflow.service` and includes:

- **Automatic startup**: Service starts when the system boots
- **Dependency management**: Waits for Docker service and network to be ready
- **Restart policy**: Automatically restarts on failure
- **Proper logging**: All output is captured by systemd

## Service Management Commands

### Check Service Status
```bash
sudo systemctl status ticketflow
sudo systemctl status ngrok
```

### Start the Service
```bash
sudo systemctl start ticketflow
sudo systemctl start ngrok
```

### Stop the Service
```bash
sudo systemctl stop ticketflow
sudo systemctl stop ngrok
```

### Restart the Service
```bash
sudo systemctl restart ticketflow
sudo systemctl restart ngrok
```

### Enable/Disable Auto-Start
```bash
# Enable auto-start on boot
sudo systemctl enable ticketflow
sudo systemctl enable ngrok

# Disable auto-start on boot
sudo systemctl disable ticketflow
sudo systemctl disable ngrok
```

### View Service Logs
```bash
# View recent logs
sudo journalctl -u ticketflow
sudo journalctl -u ngrok

# Follow logs in real-time
sudo journalctl -u ticketflow -f
sudo journalctl -u ngrok -f

# View logs from last boot
sudo journalctl -u ticketflow -b
sudo journalctl -u ngrok -b
```

## Manual Scripts

The Packer build also creates convenient scripts in `/opt/ticketflow/`:

### Start Script
```bash
cd /opt/ticketflow
./start.sh
```

### Stop Script
```bash
cd /opt/ticketflow
./stop.sh
```

### Restart Script
```bash
cd /opt/ticketflow
./restart.sh
```

## Application Access

Once the service is running, the application is accessible at:

- **Frontend**: http://localhost:8080
- **API**: http://localhost:8080/rest/ticket
- **Health Check**: http://localhost:8080/echo
- **ngrok Tunnel**: https://ticketflow.ngrok.io (if ngrok is configured)

## Troubleshooting

### Service Won't Start
1. Check service status: `sudo systemctl status ticketflow`
2. View logs: `sudo journalctl -u ticketflow -n 50`
3. Check Docker: `sudo systemctl status docker`
4. Verify files: `ls -la /opt/ticketflow/`

### Application Not Accessible
1. Check if containers are running: `docker ps`
2. Check container logs: `docker-compose logs`
3. Verify firewall: `sudo ufw status`
4. Test connectivity: `curl http://localhost:8080/echo`

### Service Not Starting on Boot
1. Check if enabled: `sudo systemctl is-enabled ticketflow`
2. Enable if needed: `sudo systemctl enable ticketflow`
3. Check dependencies: `sudo systemctl list-dependencies ticketflow`

## Service Configuration Details

The systemd service configuration includes:

```ini
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
ExecStart=/usr/bin/docker-compose up -d
ExecStop=/usr/bin/docker-compose down
ExecReload=/usr/bin/docker-compose down && /usr/bin/docker-compose up -d
TimeoutStartSec=0
Restart=on-failure
RestartSec=30

[Install]
WantedBy=multi-user.target
```

## Security Considerations

- The service runs as root (required for Docker operations)
- Firewall rules are configured to allow necessary ports
- Application files are owned by the configured user
- Service logs are captured by systemd for audit purposes

## Monitoring

To monitor the application:

1. **Service health**: `sudo systemctl status ticketflow`
2. **Container status**: `docker ps`
3. **Application logs**: `docker-compose logs -f`
4. **System resources**: `htop` or `docker stats` 