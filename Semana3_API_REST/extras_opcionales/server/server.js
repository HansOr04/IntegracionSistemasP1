// server.js · Backend de ejemplo (OPCIONAL) que cumple el contrato openapi.yaml
// El taller NO exige backend. Úsalo solo para probar tu contrato con respuestas reales.
//
//   npm install
//   node server.js                       -> API abierta en http://localhost:8080
//   API_TOKEN=secreto123 node server.js  -> exige Authorization: Bearer secreto123

const express = require('express');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 8080;
const API_TOKEN = process.env.API_TOKEN; // si existe, se activa la autenticación

// ---------- "Base de datos" en memoria ----------
const STOCK = { 'P-500': 10, 'P-501': 0 };
const PRICE = { 'P-500': 64.95, 'P-501': 20.0 };
const orders = new Map([
  ['O-9831', { id: 'O-9831', customerId: 'C-1024', status: 'CREATED', total: 129.9,
               items: [{ productId: 'P-500', quantity: 2 }] }],
]);
let seq = 9831;

// ---------- Utilidades ----------
const fail = (res, status, code, message) =>
  res.status(status).json({ code, message, correlationId: crypto.randomUUID() });

// ---------- Seguridad básica (ver la página «Seguridad de APIs») ----------
app.disable('x-powered-by');                       // no revelar la tecnología
app.use((req, res, next) => {                      // cabecera de seguridad
  res.set('X-Content-Type-Options', 'nosniff');
  next();
});
app.use(express.json({ limit: '10kb' }));          // limita el tamaño del body

const hits = new Map();                            // rate limiting simple: 100 req/min por IP
app.use((req, res, next) => {
  const now = Date.now();
  const list = (hits.get(req.ip) || []).filter((t) => now - t < 60000);
  list.push(now);
  hits.set(req.ip, list);
  if (list.length > 100) {
    res.set('Retry-After', '60');
    return fail(res, 429, 'TOO_MANY_REQUESTS', 'Rate limit exceeded');
  }
  next();
});

app.use((req, res, next) => {                      // autenticación Bearer (opcional)
  if (!API_TOKEN) return next();
  const header = req.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const a = Buffer.from(token);
  const b = Buffer.from(API_TOKEN);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return fail(res, 401, 'UNAUTHORIZED', 'Missing or invalid token');
  }
  next();
});

// ---------- Validaciones ----------
function validateCreate(body) {
  if (!body || typeof body !== 'object') return 'Body must be a JSON object';
  if (typeof body.customerId !== 'string' || !body.customerId.trim()) return 'customerId is required';
  if (!Array.isArray(body.items) || body.items.length === 0) return 'items must be a non-empty array';
  for (const it of body.items) {
    if (!it || typeof it.productId !== 'string' || !it.productId) return 'productId is required in every item';
    if (!Number.isInteger(it.quantity) || it.quantity < 1) return 'quantity must be an integer >= 1';
  }
  return null;
}

// ---------- Endpoints ----------
// POST /orders -> 201 | 400 | 422
app.post('/orders', (req, res) => {
  const problem = validateCreate(req.body);
  if (problem) return fail(res, 400, 'INVALID_REQUEST', problem);

  for (const it of req.body.items) {
    if (STOCK[it.productId] === undefined || STOCK[it.productId] < it.quantity) {
      return fail(res, 422, 'PRODUCT_NOT_AVAILABLE',
        `Product ${it.productId} does not have sufficient stock`);
    }
  }
  let total = 0;
  for (const it of req.body.items) {
    STOCK[it.productId] -= it.quantity;
    total += PRICE[it.productId] * it.quantity;
  }
  const order = {
    id: `O-${++seq}`,
    customerId: req.body.customerId,
    status: 'CREATED',
    total: Math.round(total * 100) / 100,
    items: req.body.items.map(({ productId, quantity }) => ({ productId, quantity })),
  };
  orders.set(order.id, order);
  res.status(201).location(`/orders/${order.id}`).json(order);
});

// GET /orders?customerId=... -> 200
app.get('/orders', (req, res) => {
  let list = [...orders.values()];
  if (req.query.customerId !== undefined) {
    if (typeof req.query.customerId !== 'string' || !req.query.customerId) {
      return fail(res, 400, 'INVALID_REQUEST', 'customerId must be a non-empty string');
    }
    list = list.filter((o) => o.customerId === req.query.customerId);
  }
  res.json(list);
});

// GET /orders/:orderId -> 200 | 404
app.get('/orders/:orderId', (req, res) => {
  const order = orders.get(req.params.orderId);
  if (!order) return fail(res, 404, 'ORDER_NOT_FOUND', `Order ${req.params.orderId} was not found`);
  res.json(order);
});

// PATCH /orders/:orderId -> 200 | 400 | 404 | 409
app.patch('/orders/:orderId', (req, res) => {
  const order = orders.get(req.params.orderId);
  if (!order) return fail(res, 404, 'ORDER_NOT_FOUND', `Order ${req.params.orderId} was not found`);
  const status = req.body && req.body.status;
  if (!['CREATED', 'PAID', 'CANCELLED'].includes(status)) {
    return fail(res, 400, 'INVALID_REQUEST', 'status must be CREATED, PAID or CANCELLED');
  }
  if (order.status === 'CANCELLED') {
    return fail(res, 409, 'ORDER_NOT_MODIFIABLE', `Order ${order.id} is already cancelled`);
  }
  order.status = status;
  res.json(order);
});

// ---------- Rutas inexistentes y errores inesperados ----------
app.use((req, res) => fail(res, 404, 'NOT_FOUND', 'Route not found'));

app.use((err, req, res, next) => {                 // nunca se filtra el stack trace al cliente
  if (err.type === 'entity.parse.failed') return fail(res, 400, 'INVALID_JSON', 'Malformed JSON body');
  if (err.type === 'entity.too.large') return fail(res, 413, 'PAYLOAD_TOO_LARGE', 'Body is too large');
  console.error(err);                              // el detalle queda solo en el log del servidor
  fail(res, 500, 'INTERNAL_ERROR', 'Unexpected error. Use the correlationId to report it');
});

app.listen(PORT, () => console.log(`Orders API en http://localhost:${PORT}` +
  (API_TOKEN ? ' (con autenticación Bearer)' : ' (sin autenticación)')));
