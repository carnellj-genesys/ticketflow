# Makefile for Ticketing Application
# Provides convenient commands for development and deployment

.PHONY: help dev build test clean docker-dev docker-prod docker-test docker-clean

# Default target
help:
	@echo "🐳 Ticketing Application - Available Commands"
	@echo "============================================="
	@echo ""
	@echo "Development:"
	@echo "  make dev          - Start development server"
	@echo "  make build        - Build for production"
	@echo "  make test         - Run tests"
	@echo "  make clean        - Clean build artifacts"
	@echo ""
	@echo "Docker:"
	@echo "  make docker-dev   - Build and run development container"
	@echo "  make docker-prod  - Build and run production container"
	@echo "  make docker-test  - Run Docker test script"
	@echo "  make docker-clean - Clean Docker images and containers"
	@echo ""
	@echo "Docker Compose:"
	@echo "  make compose-dev  - Start development with Docker Compose"
	@echo "  make compose-prod - Start production with Docker Compose"
	@echo "  make compose-down - Stop all Docker Compose services"
	@echo ""

# Development commands
dev:
	@echo "🚀 Starting development server..."
	npm run dev

build:
	@echo "🔨 Building for production..."
	npm run build

test:
	@echo "🧪 Running tests..."
	npm run test:run

clean:
	@echo "🧹 Cleaning build artifacts..."
	rm -rf dist
	rm -rf node_modules/.vite

# Docker commands
docker-dev:
	@echo "🐳 Building and running development container..."
	docker build --target development -t tickettaker:dev .
	docker run -d --name tickettaker-dev \
		-p 3001:3001 \
		-p 5173:5173 \
		-e VITE_WEBHOOK_ENABLED=true \
		tickettaker:dev
	@echo "✅ Development container started"
	@echo "   React App: http://localhost:5173"
	@echo "   API Server: http://localhost:3001"

docker-prod:
	@echo "🐳 Building and running production container..."
	docker build --target production -t tickettaker:prod .
	docker run -d --name tickettaker-prod \
		-p 80:80 \
		-p 3001:3001 \
		-e VITE_WEBHOOK_ENABLED=true \
		tickettaker:prod
	@echo "✅ Production container started"
	@echo "   Web App: http://localhost"
	@echo "   API Server: http://localhost:3001"

docker-test:
	@echo "🧪 Running Docker test script..."
	./scripts/docker-test.sh

docker-clean:
	@echo "🧹 Cleaning Docker images and containers..."
	docker stop tickettaker-dev tickettaker-prod 2>/dev/null || true
	docker rm tickettaker-dev tickettaker-prod 2>/dev/null || true
	docker rmi tickettaker:dev tickettaker:prod 2>/dev/null || true
	docker system prune -f

# Docker Compose commands
compose-dev:
	@echo "🐳 Starting development with Docker Compose..."
	docker-compose --profile dev up --build

compose-prod:
	@echo "🐳 Starting production with Docker Compose..."
	docker-compose --profile prod up --build

compose-prod-webhook:
	@echo "🐳 Starting production with webhook enabled..."
	docker-compose --profile prod-webhook up --build

compose-down:
	@echo "🛑 Stopping Docker Compose services..."
	docker-compose down

# Utility commands
logs-dev:
	@echo "📋 Development container logs..."
	docker logs -f tickettaker-dev

logs-prod:
	@echo "📋 Production container logs..."
	docker logs -f tickettaker-prod

shell-dev:
	@echo "🐚 Opening shell in development container..."
	docker exec -it tickettaker-dev /bin/sh

shell-prod:
	@echo "🐚 Opening shell in production container..."
	docker exec -it tickettaker-prod /bin/sh

# Environment setup
setup:
	@echo "🔧 Setting up development environment..."
	npm install
	@echo "✅ Setup complete"

# Full development cycle
full-dev: setup dev

# Full Docker development cycle
full-docker: docker-clean docker-dev 