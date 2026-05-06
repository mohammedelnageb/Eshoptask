import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  scenarios: {
    browse_and_checkout_pressure: {
      executor: 'ramping-vus',
      stages: [
        { duration: '2m', target: 250 },
        { duration: '5m', target: 2000 },
        { duration: '2m', target: 2000 },
        { duration: '2m', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.02'],
    http_req_duration: ['p(95)<750'],
  },
}

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000'
const API_URL = __ENV.API_URL || 'http://localhost:8080'
const TENANT_ID = __ENV.TENANT_ID || 'default'

function pickProduct(productsResponse) {
  try {
    const body = productsResponse.json()
    const products = body.content || body.products || body.data || body
    if (Array.isArray(products) && products.length > 0) {
      return products[0]
    }
  } catch (error) {
    // The check below reports the failed parse through the order creation path.
  }

  return {
    id: 1,
    sku: 'LOAD-TEST-SKU',
    name: 'Load Test Product',
    price: 99.99,
    discountedPrice: null,
  }
}

function createOrderPayload(product) {
  const unitPrice = Number(product.discountedPrice || product.price || 99.99)
  const quantity = 1

  return JSON.stringify({
    tenantId: TENANT_ID,
    userId: 1000 + __VU,
    userEmail: `load-user-${__VU}@techshop.test`,
    currency: 'USD',
    shippingAddress: `${__VU} Load Street, Cairo, EG 11511, Egypt`,
    billingAddress: `${__VU} Load Street, Cairo, EG 11511, Egypt`,
    paymentMethod: 'MOCK_CARD',
    items: [
      {
        productId: Number(product.id || 1),
        productSku: product.sku || `LOAD-${__VU}`,
        productName: product.name || 'Load Test Product',
        productImageUrl: product.thumbnailUrl || product.imageUrl,
        quantity,
        unitPrice,
        totalPrice: unitPrice * quantity,
      },
    ],
  })
}

export default function () {
  const home = http.get(BASE_URL)
  check(home, { 'frontend is available': (response) => response.status < 500 })

  const products = http.get(`${API_URL}/api/v1/products?page=0&size=12`)
  check(products, {
    'products endpoint responds': (response) => response.status < 500,
    'products endpoint returns data': (response) => response.status >= 200 && response.status < 300,
  })

  const product = pickProduct(products)
  const order = http.post(`${API_URL}/api/v1/orders`, createOrderPayload(product), {
    headers: {
      'Content-Type': 'application/json',
      'X-Tenant-ID': TENANT_ID,
    },
  })
  check(order, {
    'checkout order is accepted': (response) => response.status === 201 || response.status === 200,
    'checkout order returns order id': (response) => {
      try {
        const body = response.json()
        return Boolean(body.id || body.orderNumber)
      } catch (error) {
        return false
      }
    },
  })

  sleep(1)
}

export function handleSummary(data) {
  const durationP95 = data.metrics.http_req_duration?.values?.['p(95)']
  const failedRate = data.metrics.http_req_failed?.values?.rate
  const iterations = data.metrics.iterations?.values?.count

  const markdown = `# TechShop k6 Checkout Load Test Report

## Scenario

- Executor: ramping virtual users
- Peak load: 2000 concurrent virtual users
- Flow: frontend availability, product browsing, checkout order creation, mock payment saga trigger
- Base URL: ${BASE_URL}
- API URL: ${API_URL}

## Thresholds

- HTTP failure rate must be below 2%
- p95 HTTP request duration must be below 750 ms

## Result Summary

- Iterations: ${iterations ?? 'n/a'}
- HTTP failure rate: ${failedRate ?? 'n/a'}
- p95 HTTP duration: ${durationP95 ?? 'n/a'} ms

## Command

\`\`\`powershell
k6 run tests/load/k6-checkout.js
\`\`\`
`

  return {
    stdout: markdown,
    'performance-report.json': JSON.stringify(data, null, 2),
    'performance-report.md': markdown,
  }
}
