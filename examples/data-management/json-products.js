// Data-Driven Load Test with JSON
// Load product data from JSON file and test product API
// Usage: k6 run --env DATA_FILE=products.json json-products.js

import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';

const jsonFilePath = __ENV.DATA_FILE || './data/products.json';
const baseUrl = __ENV.BASE_URL || 'https://httpbin.org';

// Load JSON data using SharedArray to prevent memory duplication per VU
// JSON format expected: { "products": [ { "id": 1, "name": "...", "price": 99.99 }, ... ] }
const products = new SharedArray('products', function () {
  const fileContent = JSON.parse(open(jsonFilePath));
  return fileContent.products || [];
});

export const options = {
  stages: [
    { duration: '2m', target: 20 },   // Ramp up
    { duration: '5m', target: 20 },   // Steady load
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<400'],
    'http_req_failed': ['rate<0.01'],
    'checks': ['rate>0.95'],
  },
};

export default function jsonDataDrivenTest() {
  // Per-VU assignment: Each VU works with a specific product
  // VU IDs are 1-based, so subtract 1
  const vuIndex = (__VU - 1) % products.length;
  const product = products[vuIndex];

  if (!product) {
    console.error(`No product assigned for VU ${__VU}`);
    return;
  }

  // Test product details endpoint with JSON data
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'X-Product-Category': product.category || 'general',
    },
    tags: { name: 'get-product' },
    timeout: '30s',
  };

  const response = http.get(
    `${baseUrl}/get?product_id=${product.id}&price=${product.price}`,
    params
  );

  check(response, {
    'status is 200': (r) => r.status === 200,
    'product data received': (r) => r.body.includes(product.id),
    'price is valid': (r) => Number.parseFloat(product.price) > 0,
  });

  sleep(1);
}
