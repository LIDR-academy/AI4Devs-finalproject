## Context

`OrderConfigModal` era un placeholder vacío (`return null`) tras CU03-A4. Este change lo implementa completamente. El modal orquesta la configuración de todos los parámetros de una compra simulada antes de llamar a `POST /api/mock/orders`. El backend ya acepta el payload extendido (CU03-A3). El modal vive enteramente en `apps/web-admin` (Next.js 16, React, Shadcn/ui).

## Goals / Non-Goals

**Goals:**
- Implementar el formulario completo del modal con todos los campos en el orden especificado en la US
- Extraer `UserCombobox` como componente reutilizable (Comprador + Destinatario del regalo)
- Añadir `startSimulation()` a `lib/api.ts` con `apiFetch` actualizado para soportar POST
- Añadir tipos `CreateMockOrderPayload` / `StartSimulationResult` en `types/api.ts`

**Non-Goals:**
- Validación de dirección contra Google Maps (eso es responsabilidad del backend en flows reales)
- Persistencia de estado del formulario entre aperturas del modal
- Pruebas E2E (el flujo real se prueba manualmente durante la simulación)
- Cambios en el backend

## Decisions

### 1. Estado del formulario: `useState` local vs librería de formularios

**Decisión**: `useState` local en `OrderConfigModal`.

**Rationale**: Los demás formularios del admin dashboard (filtros, búsqueda) usan estado local directamente con React. Introducir `react-hook-form` o `zod` solo para este modal rompe la consistencia y añade dependencia. La validación es sencilla (campos no vacíos + condicionales por modo) y no requiere el overhead de una librería.

**Alternativa descartada**: `react-hook-form` — añade complejidad innecesaria para ~10 campos con lógica condicional.

### 2. `UserCombobox` como componente reutilizable

**Decisión**: Extraer `user-combobox.tsx` como componente independiente.

**Rationale**: El mismo patrón se usa dos veces en el modal (Comprador y Destinatario del regalo). Compartir el componente garantiza comportamiento idéntico (búsqueda, badges, entrada manual) y reduce superficie de bugs. La interfaz `UserComboboxValue` es el estado mínimo necesario para construir el payload.

### 3. Ubicación de tipos: `types/api.ts` vs `lib/api.ts`

**Decisión**: Los tipos `CreateMockOrderPayload` y `StartSimulationResult` van en `types/api.ts`; la función `startSimulation()` va en `lib/api.ts`.

**Rationale**: Este es el patrón establecido en el proyecto — todos los tipos de dominio de la API viven en `types/api.ts` y las funciones de fetch en `lib/api.ts`. Colocar tipos en `lib/api.ts` mezcla responsabilidades.

### 4. Actualización de `apiFetch`

**Decisión**: Añadir `init?: RequestInit` como segundo parámetro opcional.

**Rationale**: `apiFetch` actualmente solo soporta GET (sin opciones). Para POST necesitamos pasar `method`, `headers` y `body`. La firma `apiFetch<T>(path: string, init?: RequestInit)` es la extensión mínima que no rompe ninguna llamada existente (todas pasan solo `path`).

### 5. Catálogos de datos ficticios en `simulate-data.ts` y estructura de direcciones

**Decisión**: `FAKE_ADDRESSES` usa estructura de dos líneas (`line1`, `line2`) al estilo eCommerce. `toAddressPayload()` construye `street = line1 + ", " + line2` sin normalizar. El campo `full_address` es la concatenación de street + C.P. + Ciudad + Provincia + País. El modal usa `AddressState = { line1, line2, postalCode, city, province, country }` y `buildAddressPayload()` aplica el mismo mapeo.

**Rationale**: Los eCommerce reales (WooCommerce, Shopify) exponen dos campos de dirección libre. Reflejar esa estructura en los datos ficticios hace la simulación más representativa. La normalización (separar `street`, `number`, `floor`, `door`) se delega al backend / Google Maps en producción; en la simulación mock no es necesaria. Usar `line1`/`line2` en `FAKE_ADDRESSES` también permite variedad realista: algunos usuarios ponen el piso en línea 2, otros todo junto en línea 1.

**Alternativa descartada**: Campos individuales (`street`, `number`, `floor`, `door`) — introduce fricción innecesaria en la UI de una herramienta interna de testing y requiere normalización que el mock no necesita.

## Risks / Trade-offs

- **[Riesgo] Formulario largo en pantallas pequeñas** → El modal usa `ScrollArea` de Shadcn o `overflow-y-auto` en el body del Dialog para asegurar scroll interno sin romper el viewport.
- **[Riesgo] Teléfono en formato incorrecto** → `AdminUser.phone.e164` se usa siempre al poblar `UserComboboxValue` desde un usuario de DB; si `phone` es `null`, se usa cadena vacía (el campo queda editable manualmente).
- **[Trade-off] Sin persistencia de estado entre aperturas** → Si el usuario cierra el modal y lo vuelve a abrir, el formulario se reinicia. Aceptable para una herramienta de testing interno.
- **[Riesgo] `gift_recipient` cuando usuario es de DB** → La versión anterior del ticket tenía un bug (condición `existingUserId === undefined`). La implementación correcta envía siempre el objeto `gift_recipient` cuando `isGift = true`, independientemente del origen del usuario.
