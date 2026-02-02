# API Specification - TravelSplit MVP

**Version:** 1.0  
**Status:** Definitive Technical Specification  
**Last Updated:** 2026-02-02

---

## 1. Informacion General

### 1.1 Version y Base URL

| Campo | Valor |
|-------|-------|
| **Version API** | 1.0 |
| **Base URL** | `[TODO: Pendiente definir en documentacion - ej: /api o https://api.travelsplit.com/v1]` |
| **Protocolo** | HTTP/HTTPS REST |
| **Content-Type** | `application/json` |

### 1.2 Autenticacion

| Metodo | Descripcion |
|--------|-------------|
| **JWT (JSON Web Token)** | Token emitido tras login exitoso. Incluido en header `Authorization: Bearer <token>`. |
| **Token Payload** | `{ sub: user.id, email: user.email }` |
| **Validacion** | `JwtAuthGuard` y `JwtStrategy` (Passport) en cada peticion protegida. |

**Nota:** No se usa Auth0, API Keys ni OAuth externo. Autenticacion propia con JWT.

### 1.3 Rutas Publicas vs Protegidas

| Rutas Publicas | Rutas Protegidas (requieren JWT) |
|----------------|----------------------------------|
| `POST /auth/register` | Todas las demas rutas |
| `POST /auth/login` | |
| `GET /health` | |

---

## 2. Glosario de Modelos

### 2.1 User

Usuario registrado en el sistema. Requerido para participar en viajes (Strict User Policy).

```json
{
  "id": "uuid",
  "email": "string",
  "nombre": "string",
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `id` | UUID | Identificador unico. |
| `email` | string | Email unico. Max 255 caracteres. |
| `nombre` | string | Nombre del usuario. Max 255 caracteres. |
| `createdAt` | ISO8601 | Fecha de creacion. |
| `updatedAt` | ISO8601 | Fecha de ultima actualizacion. |

**Nota:** `password_hash` nunca se expone en respuestas.

### 2.2 Trip

Viaje que agrupa gastos y participantes.

```json
{
  "id": "uuid",
  "name": "string",
  "currency": "COP",
  "status": "ACTIVE",
  "code": "string",
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601",
  "userRole": "CREATOR",
  "participantCount": 3
}
```

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `id` | UUID | Identificador unico. |
| `name` | string | Nombre del viaje. Max 255 caracteres. |
| `currency` | string | Moneda fija. Valores: `COP`, `USD` (TCK-TRIP-008 pendiente, default COP). |
| `status` | enum | `ACTIVE`, `CLOSED`. [TODO: ER diagrama menciona COMPLETED, CANCELLED - validar convencion] |
| `code` | string | Codigo alfanumerico unico para unirse al viaje. Max 20 caracteres. |
| `userRole` | enum | Rol del usuario autenticado: `CREATOR`, `MEMBER`. |
| `participantCount` | number | Cantidad de participantes. Solo en listados. |

### 2.3 TripParticipant

Participante de un viaje con rol contextual.

```json
{
  "id": "uuid",
  "tripId": "uuid",
  "userId": "uuid",
  "role": "CREATOR",
  "user": {
    "id": "uuid",
    "nombre": "string",
    "email": "string"
  },
  "createdAt": "ISO8601"
}
```

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `id` | UUID | Identificador unico. |
| `tripId` | UUID | ID del viaje. |
| `userId` | UUID | ID del usuario. |
| `role` | enum | `CREATOR`, `MEMBER`. |
| `user` | object | Datos basicos del usuario (opcional en respuestas). |

### 2.4 Expense

Gasto registrado en un viaje.

```json
{
  "id": "uuid",
  "tripId": "uuid",
  "payerId": "uuid",
  "categoryId": 1,
  "title": "string",
  "amount": 50000.00,
  "receiptUrl": "string | null",
  "expenseDate": "YYYY-MM-DD",
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601",
  "payer": {
    "id": "uuid",
    "nombre": "string"
  },
  "beneficiaries": [
    {
      "userId": "uuid",
      "amountOwed": 25000.00,
      "user": { "id": "uuid", "nombre": "string" }
    }
  ]
}
```

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `id` | UUID | Identificador unico. |
| `tripId` | UUID | ID del viaje. |
| `payerId` | UUID | ID del usuario que pago. |
| `categoryId` | integer | ID de categoria (ExpenseCategory). |
| `title` | string | Titulo del gasto. Max 255 caracteres. |
| `amount` | decimal | Monto en moneda del viaje (COP/USD). Precision 12,2. |
| `receiptUrl` | string \| null | URL de foto de recibo. Opcional. |
| `expenseDate` | date | Fecha del gasto. |
| `payer` | object | Datos del pagador (opcional en respuestas). |
| `beneficiaries` | array | Lista de beneficiarios con amount_owed. |

### 2.5 ExpenseSplit

Division del gasto entre beneficiarios (tabla de relacion).

```json
{
  "id": "uuid",
  "expenseId": "uuid",
  "userId": "uuid",
  "amountOwed": 25000.00,
  "createdAt": "ISO8601"
}
```

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `id` | UUID | Identificador unico. |
| `expenseId` | UUID | ID del gasto. |
| `userId` | UUID | ID del beneficiario. |
| `amountOwed` | decimal | Cuota que debe este usuario. Precision 12,2. |

### 2.6 ExpenseCategory

Categorias predefinidas de gastos.

```json
{
  "id": 1,
  "name": "Comida",
  "icon": "string",
  "isActive": true
}
```

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `id` | integer | Identificador unico. |
| `name` | string | Nombre de la categoria. Valores: Comida, Transporte, Alojamiento, Entretenimiento, Varios. |
| `icon` | string | [TODO: Pendiente definir en documentacion] |
| `isActive` | boolean | Si la categoria esta activa. |

### 2.7 Balance / Debt

Representacion de deuda "quien debe a quien".

```json
{
  "debtorId": "uuid",
  "creditorId": "uuid",
  "amount": 50000.00,
  "debtor": { "id": "uuid", "nombre": "string" },
  "creditor": { "id": "uuid", "nombre": "string" }
}
```

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `debtorId` | UUID | Usuario que debe. |
| `creditorId` | UUID | Usuario al que se le debe. |
| `amount` | decimal | Monto de la deuda. |
| `debtor` | object | Datos del deudor. |
| `creditor` | object | Datos del acreedor. |

### 2.8 PaginationMetadata

Metadatos de paginacion para listados.

```json
{
  "total": 25,
  "page": 1,
  "limit": 20,
  "hasMore": true
}
```

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `total` | number | Total de registros. |
| `page` | number | Pagina actual (1-based). |
| `limit` | number | Registros por pagina. |
| `hasMore` | boolean | Si hay mas paginas. |

---

## 3. Catalogo de Endpoints

### 3.1 Autenticacion (Auth)

#### POST /auth/register

Registra un nuevo usuario.

**Body:**

```json
{
  "email": "user@example.com",
  "nombre": "Juan Perez",
  "contraseña": "password123"
}
```

| Campo | Tipo | Requerido | Descripcion |
|-------|------|-----------|-------------|
| `email` | string | Si | Email unico. Formato valido. |
| `nombre` | string | Si | Nombre del usuario. |
| `contraseña` | string | Si | Minimo 6 caracteres (PRD) / 7 caracteres (user-stories). [TODO: Unificar criterio] |

**Respuesta 201 Created:**

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "nombre": "Juan Perez",
  "createdAt": "2026-01-15T10:00:00.000Z",
  "updatedAt": "2026-01-15T10:00:00.000Z"
}
```

**Errores:**

| Codigo | Condicion |
|--------|-----------|
| 400 | Validacion fallida (email invalido, password corto). |
| 409 | Email ya registrado. |

---

#### POST /auth/login

Inicia sesion y obtiene JWT.

**Body:**

```json
{
  "email": "user@example.com",
  "contraseña": "password123"
}
```

| Campo | Tipo | Requerido |
|-------|------|-----------|
| `email` | string | Si |
| `contraseña` | string | Si |

**Respuesta 200 OK:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "nombre": "Juan Perez"
  }
}
```

**Errores:**

| Codigo | Condicion |
|--------|-----------|
| 400 | Credenciales faltantes o invalidas. |
| 401 | Credenciales incorrectas. Mensaje generico (no revelar si fallo email o password). |

---

### 3.2 Usuarios (Users)

#### PUT /users/:id

Actualiza el perfil del usuario. Solo el propio usuario puede actualizar su perfil.

**Path Parameters:**

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `id` | UUID | ID del usuario. Debe coincidir con `req.user.id`. |

**Body:**

```json
{
  "nombre": "Juan Perez Actualizado",
  "contraseña": "nuevaPassword123"
}
```

| Campo | Tipo | Requerido | Descripcion |
|-------|------|-----------|-------------|
| `nombre` | string | No | Nuevo nombre. |
| `contraseña` | string | No | Nueva contraseña. Min 6-7 caracteres. Si se envia, se hashea. |

**Respuesta 200 OK:**

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "nombre": "Juan Perez Actualizado",
  "createdAt": "2026-01-15T10:00:00.000Z",
  "updatedAt": "2026-01-15T12:00:00.000Z"
}
```

**Errores:**

| Codigo | Condicion |
|--------|-----------|
| 400 | Validacion fallida. |
| 401 | No autenticado. |
| 403 | Intento de actualizar perfil ajeno (`req.user.id !== id`). |
| 404 | Usuario no encontrado. |

---

### 3.3 Viajes (Trips)

#### GET /trips

Lista viajes donde el usuario es CREATOR o MEMBER.

**Query Parameters:**

| Parametro | Tipo | Requerido | Default | Descripcion |
|-----------|------|-----------|---------|-------------|
| `status` | string | No | - | Filtrar por estado: `ACTIVE`, `CLOSED`. |

**Respuesta 200 OK:**

```json
[
  {
    "id": "uuid",
    "name": "Viaje a Cartagena",
    "currency": "COP",
    "status": "ACTIVE",
    "code": "ABC123",
    "userRole": "CREATOR",
    "participantCount": 3,
    "createdAt": "2026-01-15T10:00:00.000Z",
    "updatedAt": "2026-01-15T10:00:00.000Z"
  }
]
```

**Errores:**

| Codigo | Condicion |
|--------|-----------|
| 401 | No autenticado. |

---

#### POST /trips

Crea un nuevo viaje. El usuario creador queda como CREATOR. Permite invitar miembros por email en el mismo request.

**Body:**

```json
{
  "name": "Viaje a Cartagena",
  "currency": "COP",
  "memberEmails": ["friend1@example.com", "friend2@example.com"]
}
```

| Campo | Tipo | Requerido | Descripcion |
|-------|------|-----------|-------------|
| `name` | string | Si | Nombre del viaje. |
| `currency` | string | No | `COP` (default) o `USD`. TCK-TRIP-008 pendiente. |
| `memberEmails` | string[] | No | Emails de usuarios ya registrados. Strict User Policy: si no existe, se rechaza. |

**Respuesta 201 Created:**

```json
{
  "id": "uuid",
  "name": "Viaje a Cartagena",
  "currency": "COP",
  "status": "ACTIVE",
  "code": "ABC123",
  "userRole": "CREATOR",
  "participantCount": 3,
  "createdAt": "2026-01-15T10:00:00.000Z",
  "updatedAt": "2026-01-15T10:00:00.000Z"
}
```

**Errores:**

| Codigo | Condicion |
|--------|-----------|
| 400 | Validacion fallida. Email no registrado en memberEmails. |
| 401 | No autenticado. |

---

#### GET /trips/:id

Obtiene detalle completo del viaje incluyendo participantes paginados.

**Path Parameters:**

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `id` | UUID | ID del viaje. |

**Query Parameters:**

| Parametro | Tipo | Requerido | Default | Descripcion |
|-----------|------|-----------|---------|-------------|
| `participantsPage` | number | No | 1 | Pagina de participantes. |
| `participantsLimit` | number | No | 20 | Limite por pagina. Max 100. |

**Respuesta 200 OK:**

```json
{
  "id": "uuid",
  "name": "Viaje a Cartagena",
  "currency": "COP",
  "status": "ACTIVE",
  "code": "ABC123",
  "userRole": "CREATOR",
  "participants": {
    "data": [
      {
        "id": "uuid",
        "tripId": "uuid",
        "userId": "uuid",
        "role": "CREATOR",
        "user": {
          "id": "uuid",
          "nombre": "Juan Perez",
          "email": "juan@example.com"
        }
      }
    ],
    "total": 3,
    "page": 1,
    "limit": 20,
    "hasMore": false
  },
  "createdAt": "2026-01-15T10:00:00.000Z",
  "updatedAt": "2026-01-15T10:00:00.000Z"
}
```

**Errores:**

| Codigo | Condicion |
|--------|-----------|
| 401 | No autenticado. |
| 403 | Usuario no es participante del viaje. |
| 404 | Viaje no encontrado. |

---

#### PATCH /trips/:id

[PENDIENTE - TCK-TRIP-006] Edita configuracion del viaje. Solo CREATOR.

**Path Parameters:**

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `id` | UUID | ID del viaje. |

**Body (propuesto):**

```json
{
  "name": "Viaje a Cartagena - Actualizado"
}
```

**Errores esperados:**

| Codigo | Condicion |
|--------|-----------|
| 403 | Usuario no es CREATOR del viaje. |

---

#### POST /trips/join

Permite a un usuario autenticado unirse a un viaje mediante codigo.

**Body:**

```json
{
  "code": "ABC123"
}
```

| Campo | Tipo | Requerido | Descripcion |
|-------|------|-----------|-------------|
| `code` | string | Si | Codigo alfanumerico del viaje. |

**Respuesta 200 OK:**

```json
{
  "id": "uuid",
  "name": "Viaje a Cartagena",
  "currency": "COP",
  "status": "ACTIVE",
  "code": "ABC123",
  "userRole": "MEMBER",
  "participantCount": 4,
  "createdAt": "2026-01-15T10:00:00.000Z",
  "updatedAt": "2026-01-15T10:00:00.000Z"
}
```

**Errores:**

| Codigo | Condicion |
|--------|-----------|
| 400 | Codigo invalido o vacio. |
| 401 | No autenticado. |
| 403 | Usuario ya es participante. Viaje cerrado (status=CLOSED). |
| 404 | Codigo no existe. |

---

#### POST /trips/:id/invite

[DEPRECADO] La invitacion se realiza via `memberEmails` en POST /trips. Si se implementa endpoint separado, aplicar Strict User Policy.

---

#### POST /trips/:id/close

[PENDIENTE - TCK-BAL-003] Cierra el viaje. Solo CREATOR. Marca status=CLOSED y bloquea nuevos gastos.

**Path Parameters:**

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `id` | UUID | ID del viaje. |

**Respuesta esperada 200 OK:**

```json
{
  "id": "uuid",
  "name": "Viaje a Cartagena",
  "status": "CLOSED",
  "updatedAt": "2026-01-15T14:00:00.000Z"
}
```

**Errores esperados:**

| Codigo | Condicion |
|--------|-----------|
| 403 | Usuario no es CREATOR. |

---

### 3.4 Gastos (Expenses)

#### POST /trips/:trip_id/expenses

Crea un gasto en el viaje. Cualquier participante (CREATOR o MEMBER) puede crear.

**Path Parameters:**

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `trip_id` | UUID | ID del viaje. |

**Body:**

```json
{
  "title": "Cena en restaurante",
  "amount": 150000.00,
  "payer_id": "uuid",
  "category_id": 1,
  "expense_date": "2026-01-15",
  "receipt_url": "https://storage.example.com/receipt.jpg",
  "beneficiaries": [
    { "user_id": "uuid", "amount_owed": 50000.00 },
    { "user_id": "uuid", "amount_owed": 50000.00 },
    { "user_id": "uuid", "amount_owed": 50000.00 }
  ]
}
```

| Campo | Tipo | Requerido | Descripcion |
|-------|------|-----------|-------------|
| `title` | string | Si | Titulo del gasto. |
| `amount` | number | Si | Monto positivo. Moneda del viaje (COP/USD). |
| `payer_id` | UUID | Si | ID del usuario que pago. Debe ser participante. |
| `category_id` | integer | Si | ID de ExpenseCategory valida. |
| `expense_date` | date | Si | Fecha del gasto. Formato YYYY-MM-DD. |
| `receipt_url` | string | No | URL de foto de recibo. Opcional. |
| `beneficiaries` | array | Si | Lista de beneficiarios. Cada uno debe ser participante. `amount_owed` por persona. |

**Respuesta 201 Created:**

```json
{
  "id": "uuid",
  "tripId": "uuid",
  "payerId": "uuid",
  "categoryId": 1,
  "title": "Cena en restaurante",
  "amount": 150000.00,
  "receiptUrl": null,
  "expenseDate": "2026-01-15",
  "createdAt": "2026-01-15T12:00:00.000Z",
  "updatedAt": "2026-01-15T12:00:00.000Z",
  "payer": { "id": "uuid", "nombre": "Juan Perez" },
  "beneficiaries": [
    { "userId": "uuid", "amountOwed": 50000.00, "user": { "id": "uuid", "nombre": "Maria" } }
  ]
}
```

**Errores:**

| Codigo | Condicion |
|--------|-----------|
| 400 | Validacion fallida. Monto negativo. Categoria invalida. Beneficiario no participante. |
| 401 | No autenticado. |
| 403 | Usuario no es participante del viaje. |
| 404 | Viaje no encontrado. Viaje no activo (CLOSED). |

---

#### GET /trips/:trip_id/expenses

Lista gastos del viaje ordenados por fecha descendente. Paginado.

**Path Parameters:**

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `trip_id` | UUID | ID del viaje. |

**Query Parameters:**

| Parametro | Tipo | Requerido | Default | Descripcion |
|-----------|------|-----------|---------|-------------|
| `page` | number | No | 1 | Pagina. |
| `limit` | number | No | 20 | Registros por pagina. Max 100. |
| `category_id` | integer | No | - | Filtrar por categoria. |

**Orden:** `expense_date DESC`, `createdAt DESC`. Excluye soft-deleted.

**Respuesta 200 OK:**

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Cena en restaurante",
      "amount": 150000.00,
      "expenseDate": "2026-01-15",
      "payer": { "id": "uuid", "nombre": "Juan Perez" },
      "categoryId": 1
    }
  ],
  "total": 10,
  "page": 1,
  "limit": 20,
  "hasMore": false
}
```

**Errores:**

| Codigo | Condicion |
|--------|-----------|
| 401 | No autenticado. |
| 403 | Usuario no es participante. |
| 404 | Viaje no encontrado. |

---

#### GET /trips/:trip_id/expenses/:expense_id

Obtiene detalle de un gasto.

**Path Parameters:**

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `trip_id` | UUID | ID del viaje. |
| `expense_id` | UUID | ID del gasto. |

**Respuesta 200 OK:**

```json
{
  "id": "uuid",
  "tripId": "uuid",
  "payerId": "uuid",
  "categoryId": 1,
  "title": "Cena en restaurante",
  "amount": 150000.00,
  "receiptUrl": "https://storage.example.com/receipt.jpg",
  "expenseDate": "2026-01-15",
  "createdAt": "2026-01-15T12:00:00.000Z",
  "updatedAt": "2026-01-15T12:00:00.000Z",
  "payer": { "id": "uuid", "nombre": "Juan Perez" },
  "beneficiaries": [
    { "userId": "uuid", "amountOwed": 50000.00, "user": { "id": "uuid", "nombre": "Maria" } }
  ]
}
```

**Errores:**

| Codigo | Condicion |
|--------|-----------|
| 401 | No autenticado. |
| 403 | Usuario no es participante. |
| 404 | Viaje o gasto no encontrado. |

---

#### PATCH /trips/:trip_id/expenses/:expense_id

[PENDIENTE - TCK-EXP-005] Edita un gasto. Solo CREATOR del viaje.

**Path Parameters:**

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `trip_id` | UUID | ID del viaje. |
| `expense_id` | UUID | ID del gasto. |

**Body (propuesto):** Mismos campos que POST, todos opcionales.

**Errores esperados:**

| Codigo | Condicion |
|--------|-----------|
| 403 | Usuario no es CREATOR. |

---

#### DELETE /trips/:trip_id/expenses/:expense_id

[PENDIENTE - TCK-EXP-005] Soft delete de un gasto. Solo CREATOR del viaje.

**Path Parameters:**

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `trip_id` | UUID | ID del viaje. |
| `expense_id` | UUID | ID del gasto. |

**Respuesta esperada 200 OK:** Sin body o confirmacion.

**Errores esperados:**

| Codigo | Condicion |
|--------|-----------|
| 403 | Usuario no es CREATOR. |
| 404 | Gasto no encontrado. |

---

### 3.5 Saldos (Balances)

#### GET /trips/:id/balances

Obtiene saldos de todos los participantes del viaje. Lista de deudas "quien debe a quien".

**Path Parameters:**

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `id` | UUID | ID del viaje. |

**Respuesta 200 OK:**

```json
{
  "debts": [
    {
      "debtorId": "uuid",
      "creditorId": "uuid",
      "amount": 50000.00,
      "debtor": { "id": "uuid", "nombre": "Juan" },
      "creditor": { "id": "uuid", "nombre": "Pedro" }
    }
  ],
  "totalSpentByUser": {
    "uuid": 150000.00
  },
  "fairShare": 100000.00
}
```

**Errores:**

| Codigo | Condicion |
|--------|-----------|
| 401 | No autenticado. |
| 403 | Usuario no es participante. |
| 404 | Viaje no encontrado. |

---

#### GET /trips/:id/balance/me

[PENDIENTE - TCK-BAL-002] Resumen personal de saldo del usuario autenticado.

**Path Parameters:**

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `id` | UUID | ID del viaje. |

**Respuesta esperada 200 OK:**

```json
{
  "totalOwed": 50000.00,
  "totalOwedToMe": 20000.00,
  "netBalance": -30000.00,
  "debts": [
    {
      "creditorId": "uuid",
      "amount": 50000.00,
      "creditor": { "id": "uuid", "nombre": "Pedro" }
    }
  ],
  "credits": [
    {
      "debtorId": "uuid",
      "amount": 20000.00,
      "debtor": { "id": "uuid", "nombre": "Maria" }
    }
  ]
}
```

**Errores esperados:**

| Codigo | Condicion |
|--------|-----------|
| 403 | Usuario no es participante. |

---

### 3.6 Subida de Archivos (Receipts)

#### POST /trips/:trip_id/expenses/upload-receipt

[PENDIENTE - TCK-EXP-003] Sube foto de recibo. Retorna URL para asociar en `receipt_url` del gasto.

**Content-Type:** `multipart/form-data`

**Path Parameters:**

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `trip_id` | UUID | ID del viaje. |

**Body:** Archivo de imagen (formato/peso [TODO: Pendiente definir en documentacion]).

**Respuesta esperada 201 Created:**

```json
{
  "url": "https://storage.example.com/receipts/abc123.jpg"
}
```

---

### 3.7 Health

#### GET /health

Verifica estado de la aplicacion y conexion a base de datos.

**Respuesta 200 OK:**

```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2026-01-15T10:00:00.000Z"
}
```

---

## 4. Rate Limiting y Cuotas

[TODO: Pendiente definir en documentacion]

| Recurso | Limite | Ventana |
|---------|--------|---------|
| - | - | - |

**Nota:** No se menciona rate limiting en PRD, technical-backlog ni stack. Definir en fase de operaciones.

---

## 5. Codigos de Error Estándar

| Codigo | Significado |
|--------|-------------|
| 400 | Bad Request - Validacion fallida o datos invalidos. |
| 401 | Unauthorized - Token ausente, invalido o expirado. |
| 403 | Forbidden - Sin permisos para la accion (ej: MEMBER intentando editar gasto). |
| 404 | Not Found - Recurso no encontrado. |
| 409 | Conflict - Recurso ya existe (ej: email duplicado). |
| 500 | Internal Server Error - Error no controlado. |

---

## 6. Resumen de Estado de Endpoints

| Endpoint | Estado |
|----------|--------|
| POST /auth/register | Implementado |
| POST /auth/login | Implementado |
| PUT /users/:id | Implementado |
| GET /trips | Implementado |
| POST /trips | Implementado |
| GET /trips/:id | Implementado |
| PATCH /trips/:id | Pendiente |
| POST /trips/join | Implementado |
| POST /trips/:id/close | Pendiente |
| POST /trips/:id/invite | Deprecado |
| POST /trips/:trip_id/expenses | Implementado |
| GET /trips/:trip_id/expenses | Implementado |
| GET /trips/:trip_id/expenses/:expense_id | Implementado |
| PATCH /trips/:trip_id/expenses/:expense_id | Pendiente |
| DELETE /trips/:trip_id/expenses/:expense_id | Pendiente |
| GET /trips/:id/balances | Implementado |
| GET /trips/:id/balance/me | Pendiente |
| POST /trips/:trip_id/expenses/upload-receipt | Pendiente |
| GET /health | Implementado |

---

## 7. Referencias

- PRD.md - Product Requirements Document
- technical-backlog.md - Technical Backlog (TCK-*)
- user-stories.md - User Stories (US-*)
- stack.md - Stack tecnologico
- docs/diagrams/er/01-er-diagram.puml - Modelo de datos
