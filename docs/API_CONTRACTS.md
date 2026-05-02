# API Contracts

The Spring services expose OpenAPI documentation through springdoc:

- Product Service: `/swagger-ui.html`, `/api-docs`
- Order Service: `/swagger-ui.html`, `/api-docs`
- User Service: `/swagger-ui.html`, `/api-docs`
- Inventory Service: `/swagger-ui.html`, `/api-docs`
- Notification Service: `/swagger-ui.html`, `/api-docs`

Contract tests should be added under each service as Pact provider/consumer tests for these cross-service contracts:

- Gateway to Product: product listing, detail, category filtering, search, reviews.
- Gateway to Order: order creation, status retrieval, cancellation.
- Order to Inventory: stock reservation and release.
- Order to Payment: `payment-commands` and `payment-results` Kafka message schema.
- Order to Notification: order and payment event schema.

Kafka message contracts are versioned using the `schemaVersion` field in order events.
