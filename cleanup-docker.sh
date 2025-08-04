#!/bin/bash

echo "🧹 Starting Docker cleanup process..."

echo "📦 Stopping and removing all containers, networks, and volumes..."
docker-compose down --volumes --remove-orphans

echo "🗑️  Removing all unused Docker resources..."
docker system prune -f

echo "🔍 Finding ticketflow images..."
docker images | grep ticketflow

echo "🗑️  Removing ticketflow images..."
docker images | grep ticketflow | awk '{print $3}' | xargs -r docker rmi

echo "✅ Docker cleanup completed!"
echo ""
echo "🚀 You can now run: docker-compose up --build" 