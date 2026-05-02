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

export default function () {
  const home = http.get(BASE_URL)
  check(home, { 'frontend is available': (response) => response.status < 500 })

  const products = http.get(`${API_URL}/api/v1/products?page=0&size=12`)
  check(products, { 'products endpoint responds': (response) => response.status < 500 })

  sleep(1)
}
