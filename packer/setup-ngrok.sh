#!/bin/bash

# ngrok Setup Script for TicketFlow Droplet
# Run this script on the droplet after it's built to configure ngrok

set -e

echo "=== ngrok Setup Script ==="
echo

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "Error: ngrok is not installed. Please run the Packer build first."
    exit 1
fi

# Check if ngrok.yml exists
if [ ! -f /opt/ticketflow/ngrok.yml ]; then
    echo "Error: ngrok.yml not found. Please run the Packer build first."
    exit 1
fi

# Get ngrok auth token
echo "Please enter your ngrok auth token:"
read -s NGROK_AUTH_TOKEN

if [ -z "$NGROK_AUTH_TOKEN" ]; then
    echo "Error: ngrok auth token is required."
    exit 1
fi

# Update ngrok configuration
echo "Updating ngrok configuration..."
sed -i "s/YOUR_NGROK_AUTH_TOKEN_HERE/$NGROK_AUTH_TOKEN/g" /opt/ticketflow/ngrok.yml

# Verify the update
echo "Verifying ngrok configuration..."
if grep -q "YOUR_NGROK_AUTH_TOKEN_HERE" /opt/ticketflow/ngrok.yml; then
    echo "Error: ngrok auth token was not updated properly."
    exit 1
fi

echo "ngrok configuration updated successfully!"

# Test ngrok configuration
echo "Testing ngrok configuration..."
ngrok config check /opt/ticketflow/ngrok.yml

# Restart ngrok service
echo "Restarting ngrok service..."
systemctl restart ngrok

# Check service status
echo "Checking ngrok service status..."
systemctl status ngrok --no-pager

echo
echo "=== ngrok Setup Complete ==="
echo "Your ngrok tunnel should now be available at: https://ticketflow.ngrok.io"
echo
echo "To check ngrok status:"
echo "  sudo systemctl status ngrok"
echo
echo "To view ngrok logs:"
echo "  sudo journalctl -u ngrok -f" 