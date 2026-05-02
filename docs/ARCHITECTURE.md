# TechShop Architecture

## System Context

```mermaid
flowchart LR
  Customer["Customer browser"] --> Frontend["React frontend"]
  Frontend --> Gateway["Spring Cloud Gateway"]
  Gateway --> Product["Product Service"]
  Gateway --> Order["Order Service"]
  Gateway --> User["User Service"]
  Gateway --> Inventory["Inventory Service"]
  Gateway --> Notification["Notification Service"]
  Order --> Kafka["Kafka"]
  Kafka --> Payment["Mock Payment Service"]
  Kafka --> Notification
  Product --> ProductDb["PostgreSQL product-db"]
  Order --> OrderDb["PostgreSQL order-db"]
  User --> UserDb["PostgreSQL user-db"]
  Inventory --> InventoryDb["PostgreSQL inventory-db"]
  Notification --> Mongo["MongoDB"]
  Gateway --> Redis["Redis"]
  Gateway --> Keycloak["Keycloak"]
```

## Bounded Contexts

- Product Catalog owns product identity, categorization, pricing, reviews, and search projections.
- Ordering owns carts converted to orders, order items, status transitions, and order event history.
- Inventory owns sellable quantity, reservation, release, restock, and low-stock policy.
- Identity owns users, roles, profiles, token issuance, refresh, and social identity provider mapping.
- Notification owns customer-facing messages for order, payment, shipping, and restock events.
- Payment owns gateway interaction and publishes payment outcomes back to Ordering.

## Critical Flow: Place Order

```mermaid
sequenceDiagram
  participant UI as React UI
  participant GW as API Gateway
  participant OS as Order Service
  participant K as Kafka
  participant PS as Payment Service
  participant NS as Notification Service

  UI->>GW: POST /api/v1/orders
  GW->>OS: Create order
  OS->>OS: Persist order and ORDER_CREATED event
  OS->>K: payment-commands
  PS->>K: consume payment command
  PS->>K: payment-results
  OS->>K: consume payment result
  OS->>OS: Confirm or cancel order
  OS->>K: PAYMENT_COMPLETED or PAYMENT_FAILED
  NS->>K: consume order/payment events
```

## Deployment

Local development uses the root `docker-compose.yml`. Kubernetes deployment artifacts live in `infrastructure/kubernetes` and include namespace, secrets, configmaps, stateful services, stateless services, ingress, and HPA.

## Production Security Notes

- Keycloak realm import lives in `infrastructure/keycloak/techshop-realm.json`.
- Social login providers are declared but disabled until provider client IDs and secrets are supplied.
- Kubernetes secrets are represented as development placeholders; production deployments should replace them with sealed secrets, External Secrets Operator, or Vault.
- Ingress is configured for TLS; a real cluster must provide `techshop-tls`.
