#!/bin/bash

echo "=== Running Packer Build with Enhanced Error Handling ==="
echo ""

# Check if we're in the right directory
if [ ! -f "packer/docker-droplet.pkr.hcl" ]; then
    echo "ERROR: Packer configuration not found."
    echo "Please run this script from the project root directory."
    exit 1
fi

# Check if required environment variables are set
if [ -z "$DOCTL_API_KEY" ]; then
    echo "ERROR: DOCTL_API_KEY environment variable is not set."
    echo "Please set it with: export DOCTL_API_KEY=your_api_key"
    exit 1
fi

if [ -z "$SSH_KEY_ID" ]; then
    echo "ERROR: SSH_KEY_ID environment variable is not set."
    echo "Please set it with: export SSH_KEY_ID=your_ssh_key_id"
    exit 1
fi

# Check if SSH key file exists
if [ ! -f "$HOME/.ssh/id_rsa_do" ]; then
    echo "ERROR: SSH private key file not found at ~/.ssh/id_rsa_do"
    echo "Please ensure your SSH key is available."
    exit 1
fi

echo "✅ Environment variables and SSH key are configured."
echo ""

# Initialize Packer
echo "1. Initializing Packer..."
cd packer
packer init docker-droplet.pkr.hcl

if [ $? -ne 0 ]; then
    echo "❌ Packer initialization failed."
    exit 1
fi

echo "✅ Packer initialized successfully."
echo ""

# Validate Packer configuration
echo "2. Validating Packer configuration..."
packer validate docker-droplet.pkr.hcl

if [ $? -ne 0 ]; then
    echo "❌ Packer validation failed."
    exit 1
fi

echo "✅ Packer configuration is valid."
echo ""

# Run Packer build with retry logic
echo "3. Starting Packer build..."
echo "This may take 10-15 minutes. Please be patient."
echo ""

MAX_RETRIES=3
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    echo "Attempt $((RETRY_COUNT + 1)) of $MAX_RETRIES"
    
    packer build docker-droplet.pkr.hcl
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Packer build completed successfully!"
        echo ""
        echo "Your DigitalOcean droplet has been created and configured."
        echo "You can now deploy your application using the droplet."
        exit 0
    else
        RETRY_COUNT=$((RETRY_COUNT + 1))
        
        if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
            echo ""
            echo "❌ Packer build failed. Retrying in 30 seconds..."
            echo "This is attempt $RETRY_COUNT of $MAX_RETRIES"
            sleep 30
        else
            echo ""
            echo "❌ Packer build failed after $MAX_RETRIES attempts."
            echo "Please check the error messages above and try again."
            exit 1
        fi
    fi
done 