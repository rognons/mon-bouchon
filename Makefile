.PHONY: help build up down logs clean dev

# Default target
help:
	@echo "🐷 Mon Rognon - Docker Commands"
	@echo ""
	@echo "Development commands:"
	@echo "  make build      - Build all Docker images locally"
	@echo "  make up         - Start all services"
	@echo "  make down       - Stop all services"
	@echo "  make logs       - Show logs from all services"
	@echo "  make clean      - Stop and remove all containers/images"
	@echo "  make dev        - Start development environment"
	@echo ""
	@echo "URLs:"
	@echo "  Front: http://localhost:4321"  
	@echo "  API: http://localhost:8000"

# Build all images
build:
	docker-compose build

# Start all services
up:
	docker-compose up -d --build
	@echo "🚀 Services started!"
	@echo "Front: http://localhost:4321"  
	@echo "API: http://localhost:8000"

# Stop all services
down:
	docker-compose down
	docker-compose down 2>/dev/null || true

# Show logs
logs:
	docker-compose logs -f

# Clean everything
clean:
	docker-compose down --rmi all --volumes --remove-orphans
	docker-compose down --rmi all --volumes --remove-orphans 2>/dev/null || true

# Development environment (local)
dev:
	@echo "Starting development environment..."
	@echo "API: http://localhost:8000"
	@echo "Front: http://localhost:4321"
	@echo ""
	@echo "Run in separate terminals:"
	@echo "  cd api && deno task dev"
	@echo "  cd front && npm run dev"
