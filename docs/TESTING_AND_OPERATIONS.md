# Testing and Operations

## Required Quality Gates

- Backend unit/integration coverage target: 85%.
- Frontend unit coverage target: 80%.
- E2E coverage: Playwright tests in `frontend/tests/e2e`.
- Accessibility: Playwright plus axe checks for WCAG 2.1 AA tags.
- Vulnerability scanning: Trivy runs in GitHub Actions after container builds.
- Load testing: k6 scenario in `tests/load/k6-checkout.js` ramps to 2000 virtual users.

## Commands

```powershell
docker compose up -d --build
cd frontend
npm run test:coverage
npm run test:e2e
npm run test:a11y
```

```powershell
k6 run tests/load/k6-checkout.js
```

```powershell
kubectl apply -f infrastructure/kubernetes
```

## Observability

Prometheus configuration and alert rules live in `infrastructure/observability`. Spring Boot services expose `/actuator/prometheus`; Grafana is included in Docker Compose for dashboarding.
