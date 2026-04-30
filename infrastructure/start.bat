@echo off
REM Docker Compose Quick Start Script for TechShop (Windows)

setlocal enabledelayedexpansion
set COMPOSE_FILE=docker-compose.yml

echo.
echo ===================================
echo TechShop Docker Compose Manager
echo ===================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo Error: Docker is not running. Please start Docker and try again.
    exit /b 1
)

REM Main menu
echo Select an option:
echo 1. Start all services (docker-compose up -d)
echo 2. Stop all services (docker-compose down)
echo 3. View service status
echo 4. View logs (all)
echo 5. View logs (specific service)
echo 6. Rebuild images and start
echo 7. Clean up volumes (WARNING: data loss)
echo 8. Scale a service
echo 9. Exit
echo.
set /p choice="Enter your choice [1-9]: "

if "%choice%"=="1" (
    echo Starting all services...
    docker-compose up -d
    echo Services started!
    echo.
    echo Waiting for services to be healthy...
    timeout /t 30
    docker-compose ps
    echo.
    echo Access the application:
    echo   Frontend: http://localhost:3000
    echo   API Gateway: http://localhost:8080
    echo   Keycloak: http://localhost:8180 ^(admin/admin^)
    echo   Grafana: http://localhost:3001 ^(admin/admin^)
) else if "%choice%"=="2" (
    echo Stopping all services...
    docker-compose down
    echo Services stopped!
) else if "%choice%"=="3" (
    echo Service Status:
    docker-compose ps
) else if "%choice%"=="4" (
    echo Fetching logs...
    docker-compose logs -f --tail=100
) else if "%choice%"=="5" (
    echo Available services:
    echo 1. api-gateway
    echo 2. product-service
    echo 3. order-service
    echo 4. user-service
    echo 5. inventory-service
    echo 6. notification-service
    echo 7. frontend
    echo 8. postgresql databases
    echo 9. mongodb
    echo 10. redis
    echo 11. kafka
    set /p service_name="Enter service name: "
    docker-compose logs -f --tail=50 !service_name!
) else if "%choice%"=="6" (
    echo Rebuilding images and starting services...
    docker-compose build --no-cache
    docker-compose up -d
    echo Services rebuilt and started!
    timeout /t 30
    docker-compose ps
) else if "%choice%"=="7" (
    echo WARNING: This will delete all volumes and data!
    set /p confirm="Are you sure? (yes/no): "
    if /i "%confirm%"=="yes" (
        echo Removing volumes...
        docker-compose down -v
        echo Volumes removed!
    ) else (
        echo Cancelled.
    )
) else if "%choice%"=="8" (
    set /p service_name="Enter service name to scale: "
    set /p replicas="Enter number of replicas: "
    docker-compose up -d --scale !service_name!=!replicas!
    echo Service scaled!
    docker-compose ps
) else if "%choice%"=="9" (
    echo Exiting...
    exit /b 0
) else (
    echo Invalid option. Please try again.
    exit /b 1
)

endlocal
