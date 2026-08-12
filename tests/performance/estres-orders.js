// RE-02 — Prueba de estrés sobre POST /orders
// Ejecutar: k6 run estres-orders.js
//
// ADVERTENCIA: este script CREA pedidos reales en la base de datos.
// Se recomienda correrlo contra el entorno LOCAL (docker-compose), no contra
// producción, para no ensuciar la base de datos real del negocio:
//   k6 run -e BASE_URL=http://localhost:3000 estres-orders.js
//
// Si de todos modos se corre contra producción (-e BASE_URL=https://api-lenios.onrender.com,
// que es el default), después hay que limpiar los pedidos de prueba generados
// desde el panel de administración.

import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'https://api-lenios.onrender.com';

// Rampa escalonada: sube la carga cada 1 minuto para encontrar el punto de quiebre
// sin que la corrida completa dure más de ~10 minutos.
export const options = {
  stages: [
    { duration: '1m', target: 10 },
    { duration: '1m', target: 50 },
    { duration: '1m', target: 100 },
    { duration: '1m', target: 150 },
    { duration: '1m', target: 200 },
    { duration: '1m', target: 0 },  // enfriamiento
  ],
};

// setup() corre UNA vez al inicio (no por cada VU): obtenemos un productoId real.
export function setup() {
  const res = http.get(`${BASE_URL}/products`);
  const productos = res.json();
  if (!productos || !productos.length) {
    throw new Error('No hay productos disponibles en /products para armar el pedido de prueba.');
  }
  return { productoId: productos[0].id };
}

function randomPhone() {
  let n = '';
  for (let i = 0; i < 10; i++) n += Math.floor(Math.random() * 10);
  return n;
}

export default function (data) {
  const payload = JSON.stringify({
    cliente: {
      nombre: `Prueba Estres ${__VU}-${__ITER}`,
      telefono: randomPhone(),
      direccion: 'Calle de Prueba k6 #123, Col. Rendimiento',
    },
    items: [{ productoId: data.productoId, cantidad: 1 }],
    consentimientoAceptado: true,
  });

  const res = http.post(`${BASE_URL}/orders`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  check(res, {
    'status es 201': (r) => r.status === 201,
    'no es error 5xx': (r) => r.status < 500,
  });

  sleep(1);
}
