# Docker Compose Quick Start Guide

## Prerequisites
- Docker & Docker Compose installed
- 8GB RAM minimum
- Ports 3000, 8080-8085, 5432-5435, 27017 available

## Starting the Application

### 1. Start Infrastructure & Services
```bash
cd infrastructure
docker-compose up -d
```

### 2. Wait for services to be healthy
The application may take 60-90 seconds to fully start. Check status:
```bash
docker-compose ps
```

All services should show "healthy" in the STATUS column.

### 3. Access the Application

#### Frontend
- **URL**: http://localhost:3000
- **Username**: demo@techshop.com
- **Password**: Demo123!

#### API Gateway (Backend)
- **URL**: http://localhost:8080
- **Swagger UI**: http://localhost:8080/swagger-ui.html

#### Admin Panels & Tools

| Tool | URL | Username | Password |
|------|-----|----------|----------|
| Keycloak (Auth) | http://localhost:8180 | admin | admin |
| Kafka UI | http://localhost:8089 | N/A | N/A |
| pgAdmin (PostgreSQL) | http://localhost:5050 | admin@techshop.com | admin |
| Grafana (Monitoring) | http://localhost:3001 | admin | admin |
| Prometheus (Metrics) | http://localhost:9090 | N/A | N/A |
| Mailhog (Email) | http://localhost:8025 | N/A | N/A |

## Service Ports Reference

| Service | Port |
|---------|------|
| Frontend | 3000 |
| API Gateway | 8080 |
| Product Service | 8081 |
| Order Service | 8082 |
| User Service | 8083 |
| Inventory Service | 8084 |
| Notification Service | 8085 |
| PostgreSQL (Product) | 5432 |
| PostgreSQL (Order) | 5433 |
| PostgreSQL (User) | 5434 |
| PostgreSQL (Inventory) | 5435 |
| MongoDB | 27017 |
| Redis | 6379 |
| Zookeeper | 2181 |
| Kafka | 9092 |
| Keycloak | 8180 |

## Useful Commands

### View logs
```bash
docker-compose logs -f api-gateway    # API Gateway logs
docker-compose logs -f product-service  # Product Service logs
docker-compose logs -f frontend         # Frontend logs
```

### Stop all services
```bash
docker-compose down
```

### Clean up volumes
```bash
docker-compose down -v
```

### Scale a service
```bash
docker-compose up -d --scale product-service=2
```

### Rebuild images
```bash
docker-compose build --no-cache
docker-compose up -d
```

## Troubleshooting

### Services failing to start
1. Check Docker daemon is running
2. Check available disk space
3. Clear unused containers: `docker container prune`
4. Rebuild images: `docker-compose build --no-cache`

### Port conflicts
If port is already in use, either:
- Stop the conflicting service
- Modify the port mapping in docker-compose.yml

### Database connection issues
1. Ensure database containers are healthy: `docker-compose ps`
2. Check database logs: `docker-compose logs order-db`
3. Wait longer for database to initialize

### Frontend not connecting to backend
1. Check API Gateway health: http://localhost:8080/actuator/health
2. Check frontend logs: `docker-compose logs frontend`
3. Verify CORS settings in API Gateway configuration

## Example Workflows

### Adding a Product
1. Navigate to http://localhost:3000/admin
2. Click "Add Product"
3. Fill in product details
4. Submit form
5. Product appears in product list

### Placing an Order
1. Navigate to http://localhost:3000
2. Browse products
3. Add items to cart
4. Click "Proceed to Checkout"
5. Fill shipping address
6. Complete payment (demo card: 4111 1111 1111 1111)
7. Order confirmation appears

### Monitoring the System
1. Go to http://localhost:3001 (Grafana)
2. View service metrics and performance
3. Configure alerts for critical thresholds

## Performance Notes
- First start may take 2-3 minutes for all services to initialize
- Redis caching improves response times significantly
- Kafka ensures reliable inter-service communication
- Database query performance improves after first few minutes as caches warm up

## Security Considerations
- Change default passwords in production
- Use environment variables for sensitive data
- Enable HTTPS in production
- Implement API rate limiting (already configured)
- Regular security scans with Trivy

## Next Steps
1. Set up CI/CD pipeline (GitHub Actions)
2. Configure Kubernetes manifests for production
3. Set up monitoring dashboards
4. Configure alerting rules
5. Load test the system with k6 or JMeter
