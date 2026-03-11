# Mock Orders - CU-01 Procesar Compra

## Descripción

Endpoint y flujo para simular compras desde eCommerce (entrada manual JSON). Implementa el Caso de Uso 1 (CU-01) con flujo principal (modo Adresles) y FA-2 (modo tradicional).

## Requisitos

- Node.js 20+
- pnpm
- PostgreSQL (o Supabase)
- Redis

## Inicio rápido

### 1. Instalar dependencias

```bash
pnpm install
```

### 2. Base de datos

**Opción A: Docker (PostgreSQL + Redis)**

```bash
cd infrastructure/docker
docker compose up -d
```

**Opción B: Supabase**

Configura `DATABASE_URL` en `apps/api/.env` con tu conexión Supabase.

### 3. Migraciones

```bash
pnpm db:migrate
# o: cd apps/api && npx prisma migrate dev
```

### 4. Seeds (store mock)

```bash
pnpm db:seed
# o: cd apps/api && npx prisma db seed
```

### 5. Iniciar API

```bash
pnpm --filter api dev
```

La API estará en http://localhost:3000/api

### 6. Iniciar Worker (opcional, para procesar conversaciones)

```bash
pnpm --filter worker dev
```

### 7. Probar con Mock UI

Abre `docs/mock-orders-ui.html` en el navegador o usa curl:

```bash
curl -X POST http://localhost:3000/api/mock/orders \
  -H "Content-Type: application/json" \
  -d '{
    "store": { "name": "Tienda Mock", "url": "https://tiendamock.example.com" },
    "external_order_id": "wc_12345",
    "external_order_number": "#12345",
    "buyer": { "first_name": "Juan", "last_name": "Pérez", "phone": "+34612345678", "email": "juan@example.com" },
    "mode": "adresles",
    "items": [{ "name": "Producto", "quantity": 1, "price": 25 }],
    "total_amount": 25,
    "currency": "EUR"
  }'
```

## Esquema JSON

| Campo | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| store | object | Sí | name, url |
| external_order_id | string | Sí | ID del pedido en eCommerce |
| external_order_number | string | No | Número visible (#12345) |
| buyer | object | Sí | first_name, last_name, phone, email (opcional) |
| mode | "adresles" \| "tradicional" | Sí | Modo de checkout |
| address | object | Si mode=tradicional | full_address, street, postal_code, city, country |
| items | array | No | [{ name, quantity, price }] |
| total_amount | number | Sí | Importe total |
| currency | string | Sí | EUR, USD, etc. |

## Respuesta

```json
{
  "order_id": "uuid",
  "conversation_id": "uuid"
}
```
