# US-D5 — Búsqueda de Clientes por Correo Electrónico

**Fuente:** `readme.md` → D5 · **Prioridad:** V2 (deseable alta)

## [original] Historia de Usuario

**Como** administrador o mecánico,
**quiero** buscar clientes también por correo electrónico,
**para** localizarlos cuando solo tengo ese dato de contacto.

## [enhanced] Historia de Usuario

**Como** administrador o mecánico,
**quiero** que `GET /api/clients/search?q=` y la barra unificada de `/clients` (y pickers que la reutilizan) busquen también por `email` con `contains` case-insensitive —por dirección completa o fragmento (`@email.com`)—,
**para** encontrar propietarios cuando solo tengo el correo (p. ej. antes de US-D2/US-D4 o al transferir dueño US-D3) sin otra pantalla.

**Alcance V2:**

- Ampliar el `OR` de búsqueda en `ClientsService.search`
- Actualizar placeholder y copy de ayuda en `ClientSearchBar`
- Tests unit + e2e de email y regresión nombre/cédula/teléfono
- Índice opcional `Client.email` si se documenta/necesita

**Fuera de alcance:**

- Fuzzy / typos (Levenshtein)
- Motor de búsqueda externo (Elastic, etc.)
- Endpoint dedicado solo-email
- Hacer `email` único (MVP permite emails duplicados — ambos deben listarse)
- Cambiar el mínimo de 2 caracteres de `q`

**Dependencia:** US-003 (`Client.email` ya existe, opcional/nullable).

**Estado actual (gap):**

```typescript
// clients.service.ts — OR actual (sin email)
OR: [
  { fullName: { contains, mode: 'insensitive' } },
  { nationalId: { contains, mode: 'insensitive' } },
  // phone digits si length >= 2
]
```

- UI placeholder: *“Nombre, identificación o teléfono”* (`ClientSearchBar.tsx`)
- `ClientResultCard` ya muestra email si existe
- Schema: `email String?` **sin** `@@index([email])` (sí hay índices en `fullName`, `phone`)

---

## [original] Criterios de Aceptación

- [ ] La búsqueda acepta correo completo o fragmentos (ej. `@email.com`).
- [ ] Coincidencias insensibles a mayúsculas/minúsculas.
- [ ] Misma barra unificada que hoy usa nombre / identificación / teléfono.
- [ ] El placeholder indica explícitamente correo.

## [enhanced] Criterios de Aceptación

### API — `GET /api/clients/search`

- [ ] Cuando se usa `q` (no el atajo `nationalId=`): el `where.OR` **incluye**:

```typescript
{
  email: {
    contains: searchTerm,
    mode: 'insensitive',
  },
}
```

- [ ] Campo correcto: `email` (no `identification` — en código es `nationalId`).
- [ ] Mismo `searchTerm = query.q.trim()` que nombre/cédula.
- [ ] `contains` substring: `juan@email.com`, `JUAN@`, `@email.com`, `email.com` deben poder coincidir.
- [ ] Clientes con `email = null` no matchean por rama email (siguen pudiendo salir por nombre/tel/cédula).
- [ ] Dos clientes con el mismo email (permitido US-003): ambos en resultados si el término coincide.
- [ ] Sin cambio: `q.length < 2` → `{ items: [], total: 0 }`; `take` = límite existente (20); `orderBy: fullName asc`.
- [ ] Sin cambio: `?nationalId=` exacto sigue siendo el path anti-duplicado (no requiere email).
- [ ] Roles: `ADMIN` | `MECHANIC` (sin cambio).
- [ ] Errores: mismos de US-003 (`400` si falta parámetro de search en controller).

### UI

- [ ] `ClientSearchBar` placeholder → *“Nombre, identificación, teléfono o correo”* (o copy equivalente en español).
- [ ] Label accesible coherente (ej. “Buscar cliente”).
- [ ] Debounce / min 2 chars: sin cambio.
- [ ] Resultados: seguir mostrando correo en tarjeta cuando exista (`ClientResultCard` ya lo hace).
- [ ] Cualquier pantalla que use `ClientSearchBar` hereda el cambio (`/clients`, `ClientPicker` en vehículos / transferencia D3).
- [ ] Sin rediseño de layout.

### Rendimiento / índice (condicional)

- [ ] V2 mínimo: **sin** índice obligatorio (taller pequeño; `contains` sobre nullable text).
- [ ] Si en staging/prod la búsqueda p95 empeora o N clientes > umbral acordado (~5k+): añadir

```prisma
@@index([email])
```

  y migración; documentar en README API.
- [ ] Nota: índice btree no acelera `LIKE '%x%'` igual que prefijo; valorar solo si hay evidencia. No bloquear DoD.

### Casos límite

| Caso | Esperado |
|------|----------|
| `q=ab` sin matches email | Vacío o matches otras ramas |
| `q=@e` (≥2 chars) | Match emails que contengan `@e` |
| `q=A` (1 char) | Lista vacía (regla existente) |
| Email en BD en mayúsculas / búsqueda minúsculas | Match (`insensitive`) |
| Espacios en `q` | Trim; `"  juan@ "` → `juan@` |
| Solo teléfono numérico | Regresión: phone digits branch intacta |

### Tests

- [ ] Unit: search by full email → incluye cliente.
- [ ] Unit: search by domain fragment `@email.com`.
- [ ] Unit: case mix `Juan@Email.COM` vs stored lowercase.
- [ ] Unit: regressions — name, nationalId contains, phone digits.
- [ ] E2E web: escribir correo conocido del seed → ver resultado; placeholder visible.

---

## [original] Roles involucrados

- Administrador
- Mecánico

## [enhanced] Roles involucrados

| Rol | Código | Permisos |
|-----|--------|----------|
| Administrador | `ADMIN` | Buscar por email en `/clients` y pickers |
| Mecánico | `MECHANIC` | Igual |

---

## [original] Notas técnicas

- No requiere cambio estructural del modelo `Client`.

## [enhanced] Especificación técnica

### Cambio de servicio (diff conceptual)

```typescript
OR: [
  { fullName: { contains: searchTerm, mode: 'insensitive' } },
  { nationalId: { contains: searchTerm, mode: 'insensitive' } },
  ...(phoneDigits.length >= 2
    ? [{ phone: { contains: phoneDigits } }]
    : []),
  { email: { contains: searchTerm, mode: 'insensitive' } }, // US-D5
],
```

### Contratos

Sin cambio de URL ni shape de response (`ClientSearchResponseDto` ya incluye `email`).

Ejemplo:

`GET /api/clients/search?q=%40email.com`

```json
{
  "items": [
    {
      "id": "uuid",
      "fullName": "Juan Pérez",
      "nationalId": "1-2345-6789",
      "phone": "88887777",
      "email": "juan@email.com",
      "createdAt": "..."
    }
  ],
  "total": 1
}
```

### Archivos a modificar

**Backend (`apps/api`)**

```
src/modules/clients/clients.service.ts
src/modules/clients/clients.service.spec.ts
test/clients.e2e-spec.ts                    # si existe cobertura search
apps/api/README.md                           # mention email in search criteria
```

**Frontend (`apps/web`)**

```
src/features/clients/components/ClientSearchBar.tsx   # placeholder
e2e/clients.spec.ts                                   # search by email + placeholder assert
```

**Docs / US**

```
us/US-003-registro-clientes.md   # opcional: nota “V2 D5 añade email al OR”
readme.md D5                     # ya describe; verificar coherencia
```

### Flujo de implementación (orden sugerido)

1. Test unitario fallido: search by email (TDD).
2. Añadir rama `email` al `OR`.
3. Actualizar placeholder UI.
4. E2E clients: placeholder + búsqueda por email seed.
5. Actualizar README API (una línea en search).
6. Índice solo si se decide tras medición (opcional).

### Tests requeridos

| Capa | Escenarios |
|------|------------|
| **Unit** | email exact; fragment domain; case-insensitive; null email no false-positive por rama email; name/phone/nationalId regression |
| **E2E API** (si aplica) | `q=juan@` → 200 con ítem |
| **E2E web** | Placeholder incluye “correo”; buscar email seed → card visible |

Cobertura: paths `search` en `clients.service` ≥ 90 % en ramas OR.

### Requisitos no funcionales

| Área | Requisito |
|------|-----------|
| **Compatibilidad** | Clientes API existentes sin cambio; campo response ya presente |
| **UX** | Placeholder claro; debounce 300 ms sin cambio |
| **Seguridad** | Mismos guards; no filtrar PII extra en logs |
| **Performance** | Sin regresión material en N típico; índice opcional documentado |
| **i18n** | Copy UI en español |

### Definition of Done

- [ ] Búsqueda por email (completo y fragmento) funciona en API y `/clients`.
- [ ] Placeholder actualizado en `ClientSearchBar` (y por ende pickers).
- [ ] Regresión nombre / identificación / teléfono en verde.
- [ ] Tests unit (+ e2e) de la matriz arriba.
- [ ] README API menciona correo como criterio de `q`.

### Dependencias

| Relación | Detalle |
|----------|---------|
| **Depende de** | US-003 |
| **Habilita UX de** | US-D2, US-D3, US-D4 (localizar por correo) |
| **No bloquea** | Implementación de mailers D2/D4 |

---

## [original] Prioridad

Alta prioridad V2 (deseable).

## [enhanced] Prioridad

**Alta / Quick win (V2 P0-P1)** — cambio mínimo, alto valor colateral para D2–D4.

**Estimación orientativa:** 0.5–1 día (1 dev) incluyendo tests.

---

## Metadatos

| Campo | Valor |
|-------|-------|
| **ID** | US-D5 |
| **Deseable** | D5 |
| **Módulo** | `clients` |
| **Endpoint** | `GET /api/clients/search?q=` |
| **Estado refinamiento** | Enhanced (local) — sin Jira MCP en este entorno; pendiente sync a tablero si aplica |
| **Archivo** | `us/Deseables/US-D5-busqueda-clientes-correo.md` |
