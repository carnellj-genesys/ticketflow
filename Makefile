# TicketFlow Makefile
# Provides convenient commands for development, testing, and deployment

.PHONY: help dev build test clean docker-dev docker-prod docker-clean docker-test compose-dev compose-prod compose-down logs-dev logs-prod shell-dev shell-prod

# Default target
help:
	@echo "TicketFlow - Available Commands:"
	@echo ""
	@echo "Development:"
	@echo "  dev              Start development server"
	@echo "  build            Build for production"
	@echo "  test             Run tests"
	@echo "  clean            Clean build artifacts"
	@echo ""
	@echo "Docker:"
	@echo "  docker-dev       Build and run development container"
	@echo "  docker-prod      Build and run production container"
	@echo "  docker-test      Run Docker test script"
	@echo "  docker-clean     Clean Docker images and containers"
	@echo ""
	@echo "Docker Compose:"
	@echo "  compose-dev      Start development with Docker Compose"
	@echo "  compose-prod     Start production with Docker Compose"
	@echo "  compose-down     Stop all Docker Compose services"
	@echo ""
	@echo "Utility:"
	@echo "  logs-dev         View development container logs"
	@echo "  logs-prod        View production container logs"
	@echo "  shell-dev        Open shell in development container"
	@echo "  shell-prod       Open shell in production container"

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
	docker build --target development -t ticketflow:dev .
	docker run -d --name ticketflow-dev \
		-p 3001:3001 \
		-p 5173:5173 \
		-v $(PWD):/app \
		ticketflow:dev
	@echo "✅ Development container started"
	@echo "📱 Frontend: http://localhost:5173"
	@echo "🔧 Backend: http://localhost:3001"

docker-prod:
	@echo "🐳 Building and running production container..."
	docker build --target production -t ticketflow:prod .
	docker run -d --name ticketflow-prod \
		-p 80:80 \
		-p 3001:3001 \
		ticketflow:prod
	@echo "✅ Production container started"
	@echo "🌐 Application: http://localhost"
	@echo "🔧 API: http://localhost:3001"

docker-clean:
	@echo "🧹 Cleaning Docker containers and images..."
	docker stop ticketflow-dev ticketflow-prod 2>/dev/null || true
	docker rm ticketflow-dev ticketflow-prod 2>/dev/null || true
	docker rmi ticketflow:dev ticketflow:prod 2>/dev/null || true
	@echo "✅ Docker cleanup completed"

docker-test:
	@echo "🧪 Running Docker tests..."
	./scripts/docker-test.sh

# Docker Compose commands
compose-dev:
	@echo "🐳 Starting development environment with Docker Compose..."
	docker-compose --profile dev up --build

compose-prod:
	@echo "🐳 Starting production environment with Docker Compose..."
	docker-compose --profile prod up --build

compose-down:
	@echo "🛑 Stopping all Docker Compose services..."
	docker-compose down

# Utility commands
logs-dev:
	@echo "📋 Development container logs:"
	docker logs -f ticketflow-dev

logs-prod:
	@echo "📋 Production container logs:"
	docker logs -f ticketflow-prod

shell-dev:
	@echo "🐚 Opening shell in development container..."
	docker exec -it ticketflow-dev /bin/sh

shell-prod:
	@echo "🐚 Opening shell in production container..."
	docker exec -it ticketflow-prod /bin/sh 