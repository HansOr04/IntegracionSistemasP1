# Orders API

Contrato de integración REST para la gestión de pedidos, especificado con OpenAPI 3.0.3 y probado con Postman.

## 1. Problema de integración

Una plataforma de comercio electrónico necesita comunicarse con el sistema de gestión de pedidos.
La aplicación cliente debe poder registrar pedidos, consultar su estado y modificarlos (por ejemplo, cancelarlos)
sin conocer cómo está construido el sistema de pedidos por dentro.
La API actúa como contrato: define qué operaciones existen, qué datos se envían y qué respuestas y errores se esperan.

## 2. Sistemas involucrados

| Rol | Sistema |
|-----|---------|
| Proveedor | Sistema de Gestión de Pedidos (expone la API) |
| Consumidor | Aplicación web de comercio electrónico |

## 3. Recursos principales

- **Order**: pedido realizado por un cliente (`/orders`, `/orders/{orderId}`).
- **Customer**: cliente que realiza el pedido (referenciado por `customerId`).
- **Product**: producto solicitado (referenciado por `productId`).

## 4. Endpoints

| Método | Endpoint | Descripción | Éxito | Errores |
|--------|----------|-------------|-------|---------|
| POST | `/orders` | Crear pedido | 201 | 400, 422, 500 |
| GET | `/orders/{orderId}` | Consultar pedido | 200 | 404, 500 |
| GET | `/orders?customerId={customerId}` | Buscar pedidos de un cliente | 200 | 400, 500 |
| PATCH | `/orders/{orderId}` | Modificar pedido (p. ej., cancelar) | 200 | 400, 404, 409, 500 |

## 5. Decisiones de diseño

1. **Recursos en sustantivo plural, sin verbos en la URL.** Se usa `POST /orders` y no `/createOrder`; el método HTTP expresa la intención y la URI identifica el recurso.
2. **`PATCH` para cancelar en lugar de `DELETE`.** El pedido no se borra: cambia de estado. Así se conserva el historial y el consumidor ve el nuevo `status` en la respuesta.
3. **Códigos HTTP con significado.** `201` al crear (con cabecera `Location`), `404` si no existe, `422` si falla una regla de negocio (sin stock) y `409` si el estado actual no permite el cambio. Nunca se responde `200` para todo.
4. **Modelo de error único y reutilizable.** Todos los errores usan `{code, message, correlationId}`. `code` es estable para máquinas, `message` es para personas y `correlationId` permite rastrear la petición entre sistemas. Está declarado una sola vez en `components/schemas/Error` y las respuestas repetidas en `components/responses`.
5. **Schemas reutilizables con `$ref`.** `Order`, `CreateOrderRequest`, `UpdateOrderRequest` y `Error` se declaran en `components/schemas` para evitar duplicar estructuras.

## 6. Modelo de error

```json
{
  "code": "PRODUCT_NOT_AVAILABLE",
  "message": "Product P-500 does not have sufficient stock",
  "correlationId": "ab23f8b1-91c2-45dc"
}
```

## 7. Cómo probar

1. Abrir Postman y elegir **Import**.
2. Seleccionar `openapi.yaml` y verificar que se reconozcan las cuatro operaciones.
3. Revisar o ajustar la colección generada, o importar `postman/API.postman_collection.json`.
4. Definir la variable `baseUrl` (por defecto `http://localhost:8080`).
5. Ejecutar los requests: `POST /orders`, `GET /orders/{orderId}` y `GET /orders?customerId=C-1024`.

No se implementó un backend: las pruebas muestran métodos, URLs, parámetros, headers, request bodies y los ejemplos de response definidos en el contrato.

## 8. Seguridad (fuera del alcance del taller)

La autenticación y autorización (OAuth2, JWT), el API Gateway y el rate limiting no forman parte del alcance.
En una versión productiva, la API se expondría solo por HTTPS, exigiría un token en la cabecera `Authorization` y verificaría que cada cliente solo acceda a sus propios pedidos.

## 9. Reflexión final

**¿Qué ventaja obtiene el sistema consumidor al disponer de un contrato OpenAPI antes de que el proveedor haya terminado de implementar la API?**

El consumidor puede avanzar en paralelo: con el contrato genera mocks y una colección de Postman, desarrolla y prueba su integración contra los ejemplos definidos y detecta ambigüedades del diseño (por ejemplo, un campo faltante o un código de error mal elegido) cuando corregirlas todavía es barato. Además depende menos del cronograma del proveedor y reduce el riesgo de que ambos lados interpreten distinto el mismo servicio.
