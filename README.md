# TechShop E-Commerce Microservices

TechShop is a Docker Compose based e-commerce demo built with a React frontend, a Spring Cloud API gateway, and several Spring Boot microservices. It includes product browsing, category filtering, search, product reviews, registration/login, cart, checkout, order creation, inventory, notifications, Kafka messaging, PostgreSQL, MongoDB, Redis, Keycloak, and basic monitoring tools.

This README explains the architecture, each part of the project, how to run it, how to use the app, and how to troubleshoot the common problems.

## Current Status

The root `docker-compose.yml` is the main way to run the project.

Working user-facing flows:

- Product listing with seeded demo products
- Product detail pages
- Category filtering
- Product search
- Product reviews
- Registration and login with demo auth endpoints
- Cart
- Checkout and order placement

Demo login:

```text
Email: demo@techshop.com
Password: Demo123!
```

You can also create a new account from the Register page.

## Architecture

```text
Browser
  |
  | http://localhost:3000
  v
Frontend: React + Vite + Nginx
  |
  | /api/* proxied by Nginx
  v
API Gateway: Spring Cloud Gateway
  |
  +--> Product Service       --> PostgreSQL product-db
  +--> Order Service         --> PostgreSQL order-db
  +--> User Service          --> PostgreSQL user-db
  +--> Inventory Service     --> PostgreSQL inventory-db
  +--> Notification Service  --> MongoDB
  |
  +--> Redis
  +--> Kafka + Zookeeper
  +--> Keycloak
```

The frontend never calls backend containers directly. In the browser it uses relative URLs such as `/api/v1/products`. Nginx inside the frontend container proxies those requests to `api-gateway:8080`, and the gateway routes requests to the correct service.

## Project Layout

```text
.
|-- docker-compose.yml
|-- README.md
|-- frontend/
|   |-- Dockerfile
|   |-- nginx.conf
|   |-- package.json
|   `-- src/
|       |-- pages/
|       |-- services/
|       |-- store/
|       `-- components/
|-- microservices/
|   |-- api-gateway/
|   |-- product-service/
|   |-- order-service/
|   |-- user-service/
|   |-- inventory-service/
|   `-- notification-service/
|-- infrastructure/
|   |-- docker-compose.yml
|   |-- DOCKER_COMPOSE_GUIDE.md
|   |-- start.bat
|   `-- start.sh
`-- src/
```

The root `docker-compose.yml` is recommended. The `infrastructure/` folder contains an additional compose file and helper scripts from the original project structure.

## Services

| Service | Container port | Host port | Purpose | Storage |
| --- | ---: | ---: | --- | --- |
| frontend | 80 | 3000 | React app served by Nginx | none |
| api-gateway | 8080 | 8080 | Routes `/api/v1/*` to services | Redis |
| product-service | 8081 | 8081 | Products, categories, search, reviews | PostgreSQL |
| order-service | 8082 | 8082 | Orders, order items, order events | PostgreSQL |
| user-service | 8083 | 8083 | Users, registration, login, refresh/logout | PostgreSQL |
| inventory-service | 8084 | 8084 | Stock, reservations, restock | PostgreSQL |
| notification-service | 8085 | 8085 | Notifications and email events | MongoDB |
| product-db | 5432 | 5432 | Product database | volume |
| order-db | 5432 | 5433 | Order database | volume |
| user-db | 5432 | 5434 | User database | volume |
| inventory-db | 5432 | 5435 | Inventory database | volume |
| mongodb | 27017 | 27017 | Notification database | volume |
| redis | 6379 | 6379 | Cache/session support | volume |
| zookeeper | 2181 | 2181 | Kafka coordination | none |
| kafka | 29092/9092 | 9092 | Event broker | none |
| keycloak | 8080 | 8180 | OAuth/OIDC server | volume |
| kafka-ui | 8080 | 8089 | Kafka web UI | none |
| pgadmin | 80 | 5050 | PostgreSQL admin UI | volume |
| mailhog | 1025/8025 | 1025/8025 | Local email testing | none |
| prometheus | 9090 | 9090 | Metrics | volume |
| grafana | 3000 | 3001 | Dashboards | volume |

## Technology Stack

Frontend:

- React 18
- TypeScript
- Vite
- Redux Toolkit
- Material UI
- Axios
- Nginx for production serving and API proxying

Backend:

- Java 21
- Spring Boot 3.2
- Spring Cloud Gateway
- Spring Data JPA
- Spring Security
- PostgreSQL
- MongoDB
- Redis
- Kafka
- Maven

Infrastructure:

- Docker Compose
- Keycloak
- Kafka UI
- pgAdmin
- Mailhog
- Prometheus
- Grafana

## Quick Start With Docker Compose

From the project root:

```powershell
docker compose up -d --build
```

The first build can take several minutes because Maven and npm dependencies are downloaded inside Docker builds.

Check status:

```powershell
docker compose ps
```

Follow logs:

```powershell
docker compose logs -f
```

Open the app:

```text
http://localhost:3000
```

Useful management URLs:

```text
Frontend:       http://localhost:3000
API Gateway:    http://localhost:8080/actuator/health
Kafka UI:       http://localhost:8089
pgAdmin:        http://localhost:5050
Mailhog:        http://localhost:8025
Prometheus:     http://localhost:9090
Grafana:        http://localhost:3001
Keycloak:       http://localhost:8180
```

Default tool credentials:

```text
pgAdmin:  admin@techshop.com / admin
Grafana:  admin / admin
Keycloak: admin / admin
Redis:    redispass
Postgres: techshop / techshop
MongoDB:  admin / admin
```

## How To Use The Application

1. Open `http://localhost:3000`.
2. Go to Products.
3. Use the search box to find products by name, description, or brand.
4. Use the category dropdown to filter products.
5. Click a product card to open the detail page.
6. Add the product to the cart.
7. Write a review from the product detail page.
8. Register a new account or log in with `demo@techshop.com` / `Demo123!`.
9. Go to the cart, then checkout.
10. Enter any demo shipping address and card information.
11. Place the order.
12. You should be redirected to the order confirmation page.

The card fields are demo-only. No real payment is processed.

## Rebuild Or Restart After Code Changes

Rebuild one service:

```powershell
docker compose build product-service
docker compose up -d --no-deps --force-recreate product-service
```

Rebuild frontend:

```powershell
docker compose build frontend
docker compose up -d --no-deps --force-recreate frontend
```

After recreating backend containers, recreate the gateway if the frontend sees stale network failures:

```powershell
docker compose up -d --no-deps --force-recreate api-gateway
```

Rebuild everything:

```powershell
docker compose up -d --build
```

Stop everything:

```powershell
docker compose down
```

Stop and delete all persisted data:

```powershell
docker compose down -v
```

Use `down -v` when you want a clean database seed.

## API Gateway Routes

The gateway maps these paths:

| Path | Target |
| --- | --- |
| `/api/v1/products/**` | product-service |
| `/api/v1/orders/**` | order-service |
| `/api/v1/users/**` | user-service |
| `/api/v1/auth/**` | user-service |
| `/api/v1/inventory/**` | inventory-service |
| `/api/v1/notifications/**` | notification-service |

The frontend calls these through `http://localhost:3000/api/...`, and Nginx proxies them to the gateway.

## Main API Endpoints

Product service:

```text
GET    /api/v1/products
GET    /api/v1/products?category=Laptops
GET    /api/v1/products?search=galaxy
GET    /api/v1/products/{id}
GET    /api/v1/products/sku/{sku}
GET    /api/v1/products/category/{category}
GET    /api/v1/products/brand/{brand}
GET    /api/v1/products/featured
GET    /api/v1/products/search?query=phone
GET    /api/v1/products/categories
GET    /api/v1/products/categories/{category}/brands
GET    /api/v1/products/{id}/reviews
POST   /api/v1/products/{id}/reviews
POST   /api/v1/products
PUT    /api/v1/products/{id}
DELETE /api/v1/products/{id}
POST   /api/v1/products/batch
```

User/auth service:

```text
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
GET    /api/v1/users/{id}
GET    /api/v1/users/email/{email}
GET    /api/v1/users
POST   /api/v1/users
PUT    /api/v1/users/{id}
DELETE /api/v1/users/{id}
PATCH  /api/v1/users/{id}/role
```

Order service:

```text
GET    /api/v1/orders/{id}
GET    /api/v1/orders/number/{orderNumber}
GET    /api/v1/orders/user/{userId}
GET    /api/v1/orders
POST   /api/v1/orders
PATCH  /api/v1/orders/{id}/status
POST   /api/v1/orders/{id}/cancel
POST   /api/v1/orders/{id}/payment/success
POST   /api/v1/orders/{id}/payment/failure
GET    /api/v1/orders/{id}/events
```

Inventory service:

```text
GET    /api/v1/inventory/product/{productId}
POST   /api/v1/inventory/batch
GET    /api/v1/inventory
GET    /api/v1/inventory/low-stock
POST   /api/v1/inventory
PUT    /api/v1/inventory/{id}
POST   /api/v1/inventory/reserve
POST   /api/v1/inventory/release
POST   /api/v1/inventory/restock
```

Notification service:

```text
GET    /api/v1/notifications/{id}
GET    /api/v1/notifications/user/{userId}
GET    /api/v1/notifications
POST   /api/v1/notifications
POST   /api/v1/notifications/order-confirmation
POST   /api/v1/notifications/order-shipped
POST   /api/v1/notifications/payment-confirmation
POST   /api/v1/notifications/restock-alert
```

## Example API Calls

List products:

```powershell
Invoke-RestMethod http://localhost:3000/api/v1/products?page=0&size=12
```

Filter by category:

```powershell
Invoke-RestMethod "http://localhost:3000/api/v1/products?page=0&size=12&category=Laptops"
```

Search:

```powershell
Invoke-RestMethod "http://localhost:3000/api/v1/products?page=0&size=12&search=galaxy"
```

Create a review:

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:3000/api/v1/products/6/reviews" `
  -ContentType "application/json" `
  -Body '{"rating":5,"title":"Works great","comment":"Demo review"}'
```

Register:

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:3000/api/v1/auth/register" `
  -ContentType "application/json" `
  -Body '{"email":"new@techshop.com","password":"Demo123!","firstName":"New","lastName":"User"}'
```

Login:

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:3000/api/v1/auth/login" `
  -ContentType "application/json" `
  -Body '{"email":"demo@techshop.com","password":"Demo123!"}'
```

Place an order:

```powershell
$body = @{
  userId = 1
  userEmail = "demo@techshop.com"
  shippingAddress = "1 Test St, Cairo, Cairo 12345, Egypt"
  paymentMethod = "CREDIT_CARD"
  items = @(
    @{
      productId = 6
      productSku = "WCH-GALAXY-6"
      productName = "Galaxy Watch 6"
      quantity = 1
      unitPrice = 299.99
      totalPrice = 299.99
    }
  )
} | ConvertTo-Json -Depth 5

Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:3000/api/v1/orders" `
  -ContentType "application/json" `
  -Body $body
```

## Frontend Parts

Important frontend files:

| File/folder | Purpose |
| --- | --- |
| `frontend/src/pages/ProductList.tsx` | Product listing, category filter, search, pagination |
| `frontend/src/pages/ProductDetail.tsx` | Product detail, add to cart, reviews |
| `frontend/src/pages/Cart.tsx` | Cart item display and quantity changes |
| `frontend/src/pages/Checkout.tsx` | Shipping, payment demo form, order creation |
| `frontend/src/pages/Login.tsx` | Login form |
| `frontend/src/pages/Register.tsx` | Registration form |
| `frontend/src/pages/OrderConfirmation.tsx` | Confirmation after placing an order |
| `frontend/src/pages/Orders.tsx` | Order list page |
| `frontend/src/pages/Profile.tsx` | User profile page |
| `frontend/src/pages/AdminDashboard.tsx` | Admin dashboard shell |
| `frontend/src/services/api.ts` | Axios instance and API helper functions |
| `frontend/src/store/slices/productSlice.ts` | Product state and async fetch actions |
| `frontend/src/store/slices/cartSlice.ts` | Local cart state |
| `frontend/src/store/slices/authSlice.ts` | Auth state and token persistence |
| `frontend/src/store/slices/orderSlice.ts` | Order-related Redux state |
| `frontend/nginx.conf` | Serves React app and proxies API requests |

Run frontend locally outside Docker:

```powershell
cd frontend
npm install
npm run dev
```

When using the local Vite server, the frontend may need API proxy configuration or direct API URLs. Docker Compose is the most reliable mode for this project.

## Backend Parts

### API Gateway

Location: `microservices/api-gateway`

Responsibilities:

- Receives all frontend API calls
- Routes service paths to internal Docker service names
- Uses Redis configuration
- In this demo setup, permits requests so the lightweight auth flow works without full Keycloak setup

Important config:

- `src/main/resources/application.yml`
- `src/main/resources/application-docker.yml`
- `src/main/java/com/techshop/gateway/config/SecurityConfig.java`

### Product Service

Location: `microservices/product-service`

Responsibilities:

- Product catalog
- Product detail
- Category list
- Brand list by category
- Search
- Featured products
- Product reviews
- Demo product seeding

Database:

- PostgreSQL database `techshop_product`
- Host port `5432`

Important classes:

- `ProductController`
- `ProductService`
- `ProductRepository`
- `Product`
- `ProductReview`
- `ProductReviewService`
- `ProductDataInitializer`

### User Service

Location: `microservices/user-service`

Responsibilities:

- User CRUD
- Demo registration
- Demo login
- Refresh/logout endpoints
- Demo user seeding

Database:

- PostgreSQL database `techshop_user`
- Host port `5434`

Important classes:

- `AuthController`
- `UserController`
- `UserDataInitializer`
- `SecurityConfig`

### Order Service

Location: `microservices/order-service`

Responsibilities:

- Create orders
- Store order items
- Calculate totals
- Generate order numbers
- Record order events
- Publish order/payment events to Kafka
- Default tenant support for the demo frontend

Database:

- PostgreSQL database `techshop_order`
- Host port `5433`

Important classes:

- `OrderController`
- `OrderService`
- `Order`
- `OrderItem`
- `OrderEvent`
- `TenantFilter`
- `PaymentSagaListener`

### Inventory Service

Location: `microservices/inventory-service`

Responsibilities:

- Product stock records
- Stock lookups
- Batch stock checks
- Reserve/release stock
- Restock
- Low-stock reporting

Database:

- PostgreSQL database `techshop_inventory`
- Host port `5435`

### Notification Service

Location: `microservices/notification-service`

Responsibilities:

- Notification records
- Order confirmation notification
- Shipping notification
- Payment notification
- Restock alert notification
- Mailhog SMTP integration in Docker

Database:

- MongoDB database `techshop_notifications`
- Host port `27017`

## Data And Seeding

On startup, the product service seeds demo products if the product table is empty. The user service seeds:

```text
demo@techshop.com / Demo123!
```

If the database volumes already exist, seeders usually do not run again. To start from a clean state:

```powershell
docker compose down -v
docker compose up -d --build
```

## Kafka Events

Kafka is used for event-driven communication between services.

Known topics used by the code include:

```text
order-events
payment-commands
```

Open Kafka UI:

```text
http://localhost:8089
```

Order creation publishes an order-created event and a payment command. The payment flow is demo-oriented and may not represent a full production payment gateway.

## Databases

PostgreSQL databases:

```text
product-db     localhost:5432  techshop_product
order-db       localhost:5433  techshop_order
user-db        localhost:5434  techshop_user
inventory-db   localhost:5435  techshop_inventory
```

Credentials:

```text
Username: techshop
Password: techshop
```

MongoDB:

```text
Host: localhost:27017
Database: techshop_notifications
Username: admin
Password: admin
Auth source: admin
```

pgAdmin is available at:

```text
http://localhost:5050
```

When adding a PostgreSQL server in pgAdmin from inside Docker, use service names such as `product-db`, `order-db`, `user-db`, or `inventory-db`. From host tools, use `localhost` and the mapped host ports.

## Health Checks

Service health URLs:

```text
http://localhost:8080/actuator/health
http://localhost:8081/actuator/health
http://localhost:8082/actuator/health
http://localhost:8083/actuator/health
http://localhost:8084/actuator/health
http://localhost:8085/actuator/health
```

Check with Docker:

```powershell
docker compose ps
```

Watch one service:

```powershell
docker compose logs -f product-service
docker compose logs -f order-service
docker compose logs -f api-gateway
```

## Troubleshooting

### Frontend says Network Error

Check that the frontend and gateway are healthy:

```powershell
docker compose ps frontend api-gateway
```

If you recreated a backend service, recreate the gateway too:

```powershell
docker compose up -d --no-deps --force-recreate api-gateway
```

### Products are missing

Check product service and database:

```powershell
docker compose ps product-service product-db
docker compose logs --tail=200 product-service
```

If you want seed data again:

```powershell
docker compose down -v
docker compose up -d --build
```

### Product page says Product not found

Call the detail endpoint directly:

```powershell
Invoke-WebRequest -UseBasicParsing http://localhost:3000/api/v1/products/6
```

If it returns `500`, check product-service logs:

```powershell
docker compose logs --tail=300 product-service
```

### Category or search does not work

Verify the API:

```powershell
Invoke-RestMethod "http://localhost:3000/api/v1/products?page=0&size=12&category=Laptops"
Invoke-RestMethod "http://localhost:3000/api/v1/products?page=0&size=12&search=galaxy"
```

### Review submission does not work

Verify review POST:

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:3000/api/v1/products/6/reviews" `
  -ContentType "application/json" `
  -Body '{"rating":5,"title":"Test","comment":"Test review"}'
```

### Registration or login fails

Check user-service and gateway:

```powershell
docker compose ps user-service api-gateway
docker compose logs --tail=200 user-service
```

Try the demo login:

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:3000/api/v1/auth/login" `
  -ContentType "application/json" `
  -Body '{"email":"demo@techshop.com","password":"Demo123!"}'
```

### Placing order fails

Check order-service logs:

```powershell
docker compose logs --tail=300 order-service
```

Verify a direct order call:

```powershell
$body = @{
  userId = 1
  userEmail = "demo@techshop.com"
  shippingAddress = "1 Test St, Cairo, Cairo 12345, Egypt"
  paymentMethod = "CREDIT_CARD"
  items = @(
    @{
      productId = 6
      productSku = "WCH-GALAXY-6"
      productName = "Galaxy Watch 6"
      quantity = 1
      unitPrice = 299.99
      totalPrice = 299.99
    }
  )
} | ConvertTo-Json -Depth 5

Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:3000/api/v1/orders" `
  -ContentType "application/json" `
  -Body $body
```

### Port already in use

Stop anything already using the port, or edit `docker-compose.yml` port mappings.

Common ports:

```text
3000 frontend
8080 gateway
8081 product-service
8082 order-service
8083 user-service
8084 inventory-service
8085 notification-service
5432-5435 postgres databases
27017 mongodb
6379 redis
9092 kafka
8180 keycloak
```

### PowerShell profile warning

On some Windows machines, PowerShell prints:

```text
Microsoft.PowerShell_profile.ps1 cannot be loaded because running scripts is disabled
```

This warning comes from the local PowerShell profile policy. Docker commands can still run. It is not a project failure.

## Development Notes

Backend services are independent Maven projects. To build a service locally:

```powershell
cd microservices/product-service
mvn clean package
```

To run a service locally outside Docker, make sure its database, Kafka, and Redis dependencies are running and update the service configuration or environment variables to point at localhost.

Frontend local build:

```powershell
cd frontend
npm install
npm run build
```

Frontend local dev server:

```powershell
cd frontend
npm run dev
```

Docker is recommended because service discovery depends on Docker DNS names such as `product-service`, `order-service`, and `api-gateway`.

## Security Notes

This project is currently configured for local demo use.

- Demo auth endpoints are implemented in user-service.
- Gateway/order/product service security is permissive enough for the demo frontend.
- Keycloak is included in compose, but the working demo flow does not require full Keycloak realm setup.
- Do not use the current demo passwords, permissive security config, or generated demo tokens in production.

For production, restore strict JWT validation, configure Keycloak realms/clients, use HTTPS, move secrets to a secret manager, and restrict service-to-service access.

## Useful Commands

```powershell
# Start everything
docker compose up -d --build

# Stop everything
docker compose down

# Stop and remove volumes
docker compose down -v

# See containers
docker compose ps

# See logs for one service
docker compose logs -f product-service

# Rebuild one service
docker compose build order-service
docker compose up -d --no-deps --force-recreate order-service

# Recreate gateway after backend changes
docker compose up -d --no-deps --force-recreate api-gateway

# Check frontend health
Invoke-WebRequest -UseBasicParsing http://localhost:3000

# Check gateway health
Invoke-WebRequest -UseBasicParsing http://localhost:8080/actuator/health
```

## What To Improve Next

- Add automated integration tests for the main browser flows.
- Add full Keycloak realm import and use real JWT tokens everywhere.
- Add request validation DTOs for all services.
- Add frontend route guards and better error messages.
- Add OpenAPI examples for all services.
- Add Prometheus scrape configuration for the Spring Boot actuator endpoints.
- Add CI builds for frontend and each microservice.
