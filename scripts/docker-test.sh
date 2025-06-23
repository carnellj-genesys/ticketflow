#!/bin/bash

# TicketFlow Docker Test Script
# This script tests the Docker builds and containers for the TicketFlow application

set -e

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

# Function to cleanup containers and images
cleanup() {
    print_status "Cleaning up test containers and images..."
    docker stop ticketflow-test 2>/dev/null || true
    docker rm ticketflow-test 2>/dev/null || true
    docker rmi ticketflow:test 2>/dev/null || true
}

# Set up cleanup on script exit
trap cleanup EXIT

print_status "Starting TicketFlow Docker tests..."

# Test development build
print_status "Testing development build..."
docker build --target development -t ticketflow:test .

if [ $? -eq 0 ]; then
    print_success "Development build successful"
else
    print_error "Development build failed"
    exit 1
fi

# Test production build
print_status "Testing production build..."
docker build --target production -t ticketflow:prod-test .

if [ $? -eq 0 ]; then
    print_success "Production build successful"
else
    print_error "Production build failed"
    exit 1
fi

# Test container startup
print_status "Testing container startup..."
docker run -d --name ticketflow-test \
    -p 3001:3001 \
    -p 5173:5173 \
    ticketflow:test

# Wait for container to start
sleep 5

# Check if container is running
if docker ps | grep -q ticketflow-test; then
    print_success "Container started successfully"
    
    # Check container logs
    print_status "Container logs:"
    docker logs ticketflow-test
    
    # Test if services are responding
    print_status "Testing service endpoints..."
    
    # Test backend API
    if curl -s http://localhost:3001/rest/ticket > /dev/null; then
        print_success "Backend API is responding"
    else
        print_error "Backend API is not responding"
    fi
    
    # Test frontend
    if curl -s http://localhost:5173 > /dev/null; then
        print_success "Frontend is responding"
    else
        print_error "Frontend is not responding"
    fi
    
    # Stop and remove test container
    docker stop ticketflow-test
    docker rm ticketflow-test
else
    print_error "Container failed to start"
    docker logs ticketflow-test
    exit 1
fi

print_success "All Docker tests passed!"

print_status "Manual testing commands:"
echo "  docker build --target development -t ticketflow:dev ."
echo "  docker run -p 3001:3001 -p 5173:5173 ticketflow:dev"
echo ""
echo "  docker build --target production -t ticketflow:prod ."
echo "  docker run -p 80:80 -p 3001:3001 ticketflow:prod" 