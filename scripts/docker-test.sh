#!/bin/bash

# Docker Test Script for Ticketing Application
# This script helps verify that Docker is properly configured and can build/run the application

set -e

echo "🐳 Docker Test Script for Ticketing Application"
echo "================================================"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "✅ Docker is installed and running"

# Check if Docker Compose is available
if command -v docker-compose &> /dev/null; then
    echo "✅ Docker Compose is available"
    COMPOSE_CMD="docker-compose"
elif docker compose version &> /dev/null; then
    echo "✅ Docker Compose (v2) is available"
    COMPOSE_CMD="docker compose"
else
    echo "⚠️  Docker Compose not found, will use Docker commands only"
    COMPOSE_CMD=""
fi

# Function to cleanup containers
cleanup() {
    echo "🧹 Cleaning up containers..."
    docker stop tickettaker-test 2>/dev/null || true
    docker rm tickettaker-test 2>/dev/null || true
    docker rmi tickettaker:test 2>/dev/null || true
}

# Set trap to cleanup on exit
trap cleanup EXIT

echo ""
echo "🔨 Testing Docker Build..."
echo "=========================="

# Test development build
echo "Building development image..."
docker build --target development -t tickettaker:test .

if [ $? -eq 0 ]; then
    echo "✅ Development build successful"
else
    echo "❌ Development build failed"
    exit 1
fi

# Test production build
echo "Building production image..."
docker build --target production -t tickettaker:prod-test .

if [ $? -eq 0 ]; then
    echo "✅ Production build successful"
else
    echo "❌ Production build failed"
    exit 1
fi

echo ""
echo "🚀 Testing Docker Run..."
echo "========================"

# Test development container
echo "Starting development container..."
docker run -d --name tickettaker-test \
    -p 3001:3001 \
    -p 5173:5173 \
    -e VITE_WEBHOOK_ENABLED=true \
    -e VITE_WEBHOOK_URL=https://api.example.com/webhook/tickets \
    tickettaker:test

# Wait for container to start
echo "Waiting for container to start..."
sleep 10

# Check if container is running
if docker ps | grep -q tickettaker-test; then
    echo "✅ Development container is running"
else
    echo "❌ Development container failed to start"
    docker logs tickettaker-test
    exit 1
fi

# Test health check
echo "Testing health check..."
if curl -f http://localhost:3001/echo > /dev/null 2>&1; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed"
    docker logs tickettaker-test
    exit 1
fi

# Stop and remove test container
echo "Stopping test container..."
docker stop tickettaker-test
docker rm tickettaker-test

echo ""
echo "🎉 All Docker tests passed!"
echo "=========================="
echo ""
echo "You can now use the following commands:"
echo ""
echo "Development:"
echo "  docker build --target development -t tickettaker:dev ."
echo "  docker run -p 3001:3001 -p 5173:5173 tickettaker:dev"
echo ""
echo "Production:"
echo "  docker build --target production -t tickettaker:prod ."
echo "  docker run -p 80:80 -p 3001:3001 tickettaker:prod"
echo ""

if [ -n "$COMPOSE_CMD" ]; then
    echo "Docker Compose:"
    echo "  $COMPOSE_CMD --profile dev up --build"
    echo "  $COMPOSE_CMD --profile prod up --build"
    echo ""
fi

echo "For more information, see the README.md file." 