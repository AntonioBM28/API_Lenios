// RE-01 — Carga sostenida sobre GET /products
// Ejecutar: k6 run carga-products.js
// Contra otro entorno: k6 run -e BASE_URL=http://localhost:3000 carga-products.js
//
// Seguro de correr contra producción: es un GET de solo lectura, no escribe datos.

import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'https://api-lenios.onrender.com';

export const options = {
  vus: 50,          // 50 usuarios virtuales constantes
  duration: '1m',   // durante 1 minuto
  thresholds: {
    http_req_duration: ['p(95)<800'],   // p95 de latencia < 800ms
    http_req_failed: ['rate<0.01'],     // 0% (tolerancia 1%) de respuestas 5xx/erróneas
  },
};

export default function () {
  const res = http.get(`${BASE_URL}/products`);

  check(res, {
    'status es 200': (r) => r.status === 200,
    'respuesta es JSON': (r) => r.headers['Content-Type']?.includes('application/json'),
  });

  sleep(1);
}
