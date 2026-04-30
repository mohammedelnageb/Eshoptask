#!/bin/bash
# Docker Compose Quick Start Script for TechShop

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configurations
COMPOSE_FILE="docker-compose.yml"
COMPOSE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${GREEN}==================================${NC}"
echo -e "${GREEN}TechShop Docker Compose Manager${NC}"
echo -e "${GREEN}==================================${NC}"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

# Main menu
echo "Select an option:"
echo "1. Start all services (docker-compose up -d)"
echo "2. Stop all services (docker-compose down)"
echo "3. View service status"
echo "4. View logs (all)"
echo "5. View logs (specific service)"
echo "6. Rebuild images and start"
echo "7. Clean up volumes (WARNING: data loss)"
echo "8. Scale a service"
echo "9. Exit"
echo ""
read -p "Enter your choice [1-9]: " choice

case $choice in
    1)
        echo -e "${YELLOW}Starting all services...${NC}"
        cd "$COMPOSE_DIR"
        docker-compose up -d
        echo -e "${GREEN}Services started!${NC}"
        echo ""
        echo "Waiting for services to be healthy..."
        sleep 30
        docker-compose ps
        echo ""
        echo "Access the application:"
        echo "  Frontend: http://localhost:3000"
        echo "  API Gateway: http://localhost:8080"
        echo "  Keycloak: http://localhost:8180 (admin/admin)"
        echo "  Grafana: http://localhost:3001 (admin/admin)"
        ;;
    2)
        echo -e "${YELLOW}Stopping all services...${NC}"
        cd "$COMPOSE_DIR"
        docker-compose down
        echo -e "${GREEN}Services stopped!${NC}"
        ;;
    3)
        echo -e "${YELLOW}Service Status:${NC}"
        cd "$COMPOSE_DIR"
        docker-compose ps
        ;;
    4)
        echo -e "${YELLOW}Fetching logs...${NC}"
        cd "$COMPOSE_DIR"
        docker-compose logs -f --tail=100
        ;;
    5)
        echo "Available services:"
        echo "1. api-gateway"
        echo "2. product-service"
        echo "3. order-service"
        echo "4. user-service"
        echo "5. inventory-service"
        echo "6. notification-service"
        echo "7. frontend"
        echo "8. postgresql databases"
        echo "9. mongodb"
        echo "10. redis"
        echo "11. kafka"
        read -p "Enter service name: " service_name
        cd "$COMPOSE_DIR"
        docker-compose logs -f --tail=50 "$service_name"
        ;;
    6)
        echo -e "${YELLOW}Rebuilding images and starting services...${NC}"
        cd "$COMPOSE_DIR"
        docker-compose build --no-cache
        docker-compose up -d
        echo -e "${GREEN}Services rebuilt and started!${NC}"
        sleep 30
        docker-compose ps
        ;;
    7)
        echo -e "${RED}WARNING: This will delete all volumes and data!${NC}"
        read -p "Are you sure? (yes/no): " confirm
        if [ "$confirm" = "yes" ]; then
            echo -e "${YELLOW}Removing volumes...${NC}"
            cd "$COMPOSE_DIR"
            docker-compose down -v
            echo -e "${GREEN}Volumes removed!${NC}"
        else
            echo "Cancelled."
        fi
        ;;
    8)
        read -p "Enter service name to scale: " service_name
        read -p "Enter number of replicas: " replicas
        cd "$COMPOSE_DIR"
        docker-compose up -d --scale "$service_name=$replicas"
        echo -e "${GREEN}Service scaled!${NC}"
        docker-compose ps
        ;;
    9)
        echo "Exiting..."
        exit 0
        ;;
    *)
        echo -e "${RED}Invalid option. Please try again.${NC}"
        exit 1
        ;;
esac
