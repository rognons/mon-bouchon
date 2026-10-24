.PHONY: help build up down logs clean dev release

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
	@echo "URL:"
	@echo "  Front: http://localhost:4321"

# Build all images
build:
	docker-compose build

# Start all services
up:
	docker-compose up --build --remove-orphans --force-recreate
	@echo "🚀 Services started!"
	@echo "Front: http://localhost:4321"

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
	@echo "Front: http://localhost:4321"
	@echo ""
	@echo "Run:"
	@echo "  cd front && npm run dev"
