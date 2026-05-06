# TechShop Performance Report

## Objective

Demonstrate that the system can be tested against a 2000-concurrent-user target using a repeatable k6 scenario.

## Scenario

The load test in `tests/load/k6-checkout.js` uses a ramping virtual-user scenario:

- Ramp to 250 virtual users over 2 minutes.
- Ramp to 2000 virtual users over 5 minutes.
- Hold 2000 virtual users for 2 minutes.
- Ramp down to 0 over 2 minutes.

The scenario exercises:

- Frontend availability.
- Product browsing through `/api/v1/products`.
- Checkout order creation through `/api/v1/orders`.
- Mock payment saga trigger through the order-created payment command.

## Thresholds

- `http_req_failed`: less than 2%.
- `http_req_duration`: p95 below 750 ms.

## How To Run

```powershell
k6 run tests/load/k6-checkout.js
```

Optional environment overrides:

```powershell
$env:BASE_URL = "http://localhost:3000"
$env:API_URL = "http://localhost:8080"
$env:TENANT_ID = "default"
k6 run tests/load/k6-checkout.js
```

## Output

The k6 script writes:

- `performance-report.md`
- `performance-report.json`

These files contain the measured iteration count, HTTP failure rate, and p95 duration for the executed run.

