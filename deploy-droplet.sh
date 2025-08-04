#!/bin/bash

# TicketFlow Droplet Deployment Script
# This script builds and deploys the TicketFlow application on a droplet server

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
DOCKER_USERNAME=${DOCKER_USERNAME:-"your-dockerhub-username"}
VERSION=${VERSION:-"latest"}
API_BASE_URL=${API_BASE_URL:-"/rest"}

print_status "Starting TicketFlow deployment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

print_success "Docker and Docker Compose found"

# Stop any existing containers
print_status "Stopping existing containers..."
docker-compose down || true

# Build and start the application
print_status "Building and starting TicketFlow application..."
print_status "API Base URL: $API_BASE_URL"

# Build with the correct API base URL
docker-compose up --build -d

# Wait for containers to be healthy
print_status "Waiting for containers to be ready..."
sleep 10

# Check container status
print_status "Checking container status..."
docker-compose ps

# Test the application
print_status "Testing application endpoints..."

# Test frontend
if curl -f http://localhost:8080 > /dev/null 2>&1; then
    print_success "Frontend is accessible at http://localhost:8080"
else
    print_error "Frontend is not accessible"
fi

# Test API
if curl -f http://localhost:8080/rest/ticket > /dev/null 2>&1; then
    print_success "API is accessible at http://localhost:8080/rest/ticket"
else
    print_error "API is not accessible"
fi

# Test health check
if curl -f http://localhost:8080/echo > /dev/null 2>&1; then
    print_success "Health check is accessible at http://localhost:8080/echo"
else
    print_error "Health check is not accessible"
fi

print_success "TicketFlow deployment completed!"
print_status "Application URLs:"
print_status "  - Frontend: http://localhost:8080"
print_status "  - API: http://localhost:8080/rest/ticket"
print_status "  - Health Check: http://localhost:8080/echo"

# Optional: Push images to Docker Hub
if [ "$PUSH_TO_HUB" = "true" ]; then
    print_status "Pushing images to Docker Hub..."
    
    # Tag images
    docker tag ticketflow_ticketflow-backend $DOCKER_USERNAME/ticketflow-backend:$VERSION
    docker tag ticketflow_ticketflow-frontend $DOCKER_USERNAME/ticketflow-frontend:$VERSION
    
    # Push images
    docker push $DOCKER_USERNAME/ticketflow-backend:$VERSION
    docker push $DOCKER_USERNAME/ticketflow-frontend:$VERSION
    
    print_success "Images pushed to Docker Hub"
fi 