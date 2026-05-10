# Testing — MotoCiudad

> Estrategia y herramientas de test para la app móvil y el backend Supabase.
> Apoya a `arquitectura.md` y `prd.md` definiendo qué se prueba, cómo y con qué cobertura.

**Versión**: 0.1
**Última actualización**: Mayo 2026

---

## 1. Principios

- **Confianza, no porcentaje**: el objetivo no es maximizar coverage sino que un cambio en lógica de Octanos, geofencing o RLS no llegue a producción si rompe algo.
- **Pirámide invertida controlada**: muchos tests unitarios sobre funciones puras, suficientes tests de integración sobre lógica de dominio, pocos E2E sobre los happy paths críticos.
- **Tests deterministas**: nada que dependa de la red real o del reloj del sistema sin control. `vi.useFakeTimers()` y mocks explícitos.
- **CI bloqueante**: todo PR debe pasar tests + typecheck + lint para mergear a `main`.

---

## 2. Stack de testing

| Capa | Herramienta | Rol |
|---|---|---|
| App móvil — unit / integración | **Vitest** | Tests rápidos de lógica pura y hooks |
| App móvil — componentes | **React Native Testing Library** | Tests de componentes y pantallas |
| App móvil — E2E | **Maestro** | Flujos end-to-end en dispositivos reales/simuladores |
| Backend — Edge Functions | **Vitest** + Deno test | Lógica de funciones serverless |
| Backend — SQL / RLS | **pgTAP** | Validar políticas RLS y funciones SQL |
| Backend — integración | **Supabase CLI local** + scripts | Migraciones aplicadas, schema válido |
| Tipado | **TypeScript strict + tsc --noEmit** | Errores de tipo bloquean CI |
| Linting / formato | **ESLint + Prettier** | Consistencia |

---

## 3. Cobertura objetivo

| Área | Cobertura mínima | Prioridad |
|---|---|---|
| Lógica de Octanos (cálculo, validación, anti-abuso) | **90%** | Crítica |
| Geofencing y validación de verificaciones | **90%** | Crítica |
| RLS policies (lectura/escritura permitida según rol) | **100% de las policies escritas** | Crítica |
| Reglas de subida de nivel | **100%** | Crítica |
| Evaluación de insignias | **80%** | Alta |
| Hooks de data fetching | **70%** | Media |
| Componentes UI puros | **60%** | Media |
| Pantallas completas | **flujos críticos cubiertos en E2E** | — |

---

## 4. Tests unitarios — App móvil

### 4.1 Qué testear

- Funciones puras de `lib/` y `utils/`: parseo de coordenadas, cálculo de distancia, formato de Octanos, validación de inputs Zod.
- Hooks personalizados (`useNearbyParkings`, `useUserOctanos`, etc.) con TanStack Query mock.
- Reducers / stores Zustand.

### 4.2 Patrones

```typescript
// lib/distance.ts
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

// __tests__/distance.test.ts
import { describe, expect, it } from 'vitest';
import { formatDistance } from '../lib/distance';

describe('formatDistance', () => {
  it('formatea metros bajo 1km', () => {
    expect(formatDistance(180)).toBe('180m');
  });

  it('formatea kilómetros con un decimal', () => {
    expect(formatDistance(2100)).toBe('2.1km');
  });

  it('redondea a la baja en metros', () => {
    expect(formatDistance(180.7)).toBe('181m');
  });
});
```

---

## 5. Tests de componentes — RN Testing Library

### 5.1 Qué testear

- Renderizado correcto según props.
- Interacciones (tap, swipe) que disparan callbacks esperados.
- Accesibilidad: roles, labels, hint text.
- Estados de loading / error / empty.

### 5.2 Lo que NO se testea aquí

- Layout pixel-perfect (es responsabilidad del diseño y de Maestro / snapshots).
- Llamadas reales a Supabase (mockear `@supabase/supabase-js`).

### 5.3 Ejemplo

```tsx
// __tests__/components/ParkingCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ParkingCard } from '@/components/ParkingCard';

const fixture = {
  id: 'abc',
  name: 'Plaza Pedro Zerolo',
  type: 'public',
  district: 'Malasaña',
  capacity: 24,
  distance_meters: 180,
};

describe('ParkingCard', () => {
  it('muestra nombre, distancia y capacidad', () => {
    render(<ParkingCard parking={fixture} onPress={() => {}} />);
    expect(screen.getByText('Plaza Pedro Zerolo')).toBeOnTheScreen();
    expect(screen.getByText('180m')).toBeOnTheScreen();
    expect(screen.getByText(/24 plazas/)).toBeOnTheScreen();
  });

  it('llama a onPress al pulsar', () => {
    const onPress = vi.fn();
    render(<ParkingCard parking={fixture} onPress={onPress} />);
    fireEvent.press(screen.getByRole('button', { name: /plaza pedro zerolo/i }));
    expect(onPress).toHaveBeenCalledWith('abc');
  });
});
```

---

## 6. Tests E2E — Maestro

**Por qué Maestro y no Detox**: Maestro tiene flows YAML, no requiere recompilar para cada test, ejecuta en simuladores y dispositivos reales, y es muy adecuado para que Claude Code los genere/mantenga.

### 6.1 Flujos cubiertos en MVP

| Flow | Archivo | Frecuencia |
|---|---|---|
| Onboarding completo (registro hasta mapa) | `onboarding.yaml` | Cada release |
| Buscar parking y abrir Apple/Google Maps | `find-and-navigate.yaml` | Cada release |
| Proponer parking nuevo (sin foto real) | `propose-parking.yaml` | Cada release |
| Verificar parking (mock cámara + GPS) | `verify-parking.yaml` | Cada release |
| Ver perfil, insignias y ranking | `profile-and-ranking.yaml` | Cada release |

### 6.2 Estructura de un flow

```yaml
# .maestro/onboarding.yaml
appId: com.motociudad.app
name: Onboarding completo
---
- launchApp:
    clearState: true
- assertVisible: "Aparcar la moto"
- tapOn: "EMPEZAR"
- assertVisible:
    text: "Permiso de ubicación"
- tapOn: "Permitir"
- inputText: "test+e2e@motociudad.app"
- tapOn: "Continuar"
- assertVisible:
    text: "Plaza Pedro Zerolo"
    timeout: 10000
```

### 6.3 Ejecución

- En local: `maestro test .maestro/`
- En CI: ejecutados en EAS Build tras build exitoso, con dispositivo virtual.

---

## 7. Tests del backend — Edge Functions

### 7.1 `validate-verification` — el más crítico

Cubre las reglas anti-abuso de `gamificacion.md` §2.2.

```typescript
// supabase/functions/validate-verification/__tests__/validate.test.ts
import { describe, it, expect } from 'vitest';
import { validateVerification } from '../index.ts';

describe('validate-verification', () => {
  const baseInput = {
    user_id: 'u1',
    parking_id: 'p1',
    user_lat: 40.4231,
    user_lng: -3.7036,
    parking_lat: 40.4232,
    parking_lng: -3.7037,
    photo_taken_at: new Date().toISOString(),
  };

  it('acepta verificación dentro de 100m y con foto reciente', async () => {
    const result = await validateVerification(baseInput);
    expect(result.success).toBe(true);
  });

  it('rechaza si la distancia es mayor de 100m', async () => {
    const result = await validateVerification({
      ...baseInput,
      user_lat: 40.5, // ~8 km
    });
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('GEOFENCE_FAIL');
  });

  it('rechaza si la foto tiene más de 5 minutos', async () => {
    const result = await validateVerification({
      ...baseInput,
      photo_taken_at: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
    });
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('STALE_PHOTO');
  });

  it('rechaza si el usuario ya verificó este parking', async () => {
    // ... mock supabase para devolver verificación existente
    const result = await validateVerification(baseInput);
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('ALREADY_VERIFIED');
  });

  it('rechaza si supera el cap diario de 200 Octanos', async () => {
    // ... mock supabase para devolver suma 200 hoy
    const result = await validateVerification(baseInput);
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('DAILY_CAP_REACHED');
  });
});
```

### 7.2 Cálculo de subida de nivel

```typescript
describe('check_level_up', () => {
  it.each([
    [0,    1, 'Pipiolo'],
    [100,  1, 'Pipiolo'],
    [101,  2, 'Rodador'],
    [500,  2, 'Rodador'],
    [501,  3, 'Buscaplazas'],
    [1500, 3, 'Buscaplazas'],
    [1501, 4, 'Cartógrafo'],
    [25000,6, 'Maestro Motero'],
    [25001,7, 'Leyenda del Asfalto'],
  ])('con %i Octanos, nivel = %i (%s)', (octanos, expectedLevel) => {
    expect(computeLevel(octanos)).toBe(expectedLevel);
  });
});
```

---

## 8. Tests de RLS con pgTAP

Las policies de RLS son **lógica de seguridad**. Probarlas es no negociable.

### 8.1 Setup

```sql
-- supabase/tests/rls/parkings.test.sql
BEGIN;
SELECT plan(6);

-- Setup: dos usuarios, uno con un parking pending
INSERT INTO auth.users(id, email) VALUES
  ('00000000-0000-0000-0000-000000000001', 'a@test.com'),
  ('00000000-0000-0000-0000-000000000002', 'b@test.com');

INSERT INTO public.users(id, username, display_name) VALUES
  ('00000000-0000-0000-0000-000000000001', 'a', 'A'),
  ('00000000-0000-0000-0000-000000000002', 'b', 'B');

INSERT INTO parkings(id, proposed_by, name, type, status, location, city)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000001',
  'Test', 'public', 'pending',
  ST_MakePoint(-3.7, 40.4)::geography, 'Madrid'
);

-- Test 1: B no debe ver el parking pending de A
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims TO '{"sub":"00000000-0000-0000-0000-000000000002"}';

SELECT is_empty(
  $$ SELECT id FROM parkings WHERE id = '11111111-1111-1111-1111-111111111111' $$,
  'B no puede leer parking pending de A'
);

-- Test 2: A sí debe ver su propio parking pending
SET LOCAL request.jwt.claims TO '{"sub":"00000000-0000-0000-0000-000000000001"}';
SELECT isnt_empty(
  $$ SELECT id FROM parkings WHERE id = '11111111-1111-1111-1111-111111111111' $$,
  'A puede leer su parking pending'
);

-- ... más tests

SELECT * FROM finish();
ROLLBACK;
```

### 8.2 Ejecución

`supabase test db` corre todos los tests pgTAP en un Postgres efímero.

---

## 9. Tests de funciones SQL

### 9.1 `nearby_parkings`

```sql
-- supabase/tests/sql/nearby_parkings.test.sql
BEGIN;
SELECT plan(3);

-- Setup: parkings en Madrid centro (40.42, -3.70) a distintas distancias
INSERT INTO parkings (id, proposed_by, name, type, status, location, city) VALUES
  ('aaa...', 'user1', 'Cerca',   'public', 'verified', ST_MakePoint(-3.7000, 40.4200)::geography, 'Madrid'),
  ('bbb...', 'user1', 'Medio',   'public', 'verified', ST_MakePoint(-3.7100, 40.4300)::geography, 'Madrid'),
  ('ccc...', 'user1', 'Lejos',   'public', 'verified', ST_MakePoint(-3.8000, 40.5000)::geography, 'Madrid');

SELECT results_eq(
  $$ SELECT id::text FROM nearby_parkings(40.4200, -3.7000, 5000) $$,
  $$ VALUES ('aaa...'), ('bbb...') $$,
  'Solo devuelve parkings dentro del radio'
);

SELECT * FROM finish();
ROLLBACK;
```

---

## 10. Configuración de CI

### 10.1 GitHub Actions — `mobile-ci.yml`

```yaml
name: Mobile CI
on: [pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck
      - run: pnpm lint
      - run: pnpm test --coverage
      - uses: codecov/codecov-action@v4
        with:
          files: ./coverage/coverage-final.json
```

### 10.2 GitHub Actions — `supabase-ci.yml`

```yaml
name: Supabase CI
on: [pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: supabase/setup-cli@v1
      - run: supabase start
      - run: supabase test db                       # pgTAP
      - run: deno test supabase/functions/**/*.test.ts
      - run: supabase stop
```

---

## 11. Datos de prueba (fixtures)

### 11.1 Factory pattern

```typescript
// tests/factories/parking.ts
import { faker } from '@faker-js/faker';

export function makeParking(overrides: Partial<Parking> = {}): Parking {
  return {
    id: faker.string.uuid(),
    name: `Parking ${faker.location.street()}`,
    type: 'public',
    status: 'verified',
    location: {
      lat: 40.4 + faker.number.float({ min: -0.05, max: 0.05 }),
      lng: -3.7 + faker.number.float({ min: -0.05, max: 0.05 }),
    },
    city: 'Madrid',
    capacity: faker.number.int({ min: 4, max: 50 }),
    features: { covered: false, cameras: false, free: true, h24: true },
    verifications_count: faker.number.int({ min: 0, max: 30 }),
    ...overrides,
  };
}
```

### 11.2 Seed para tests

`supabase/seed.sql` se carga automáticamente en `supabase start`. Datos consistentes entre desarrollo y tests.

---

## 12. Mocks externos

### 12.1 Supabase client

```typescript
// tests/mocks/supabase.ts
export function createSupabaseMock(overrides = {}) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }),
      signInWithOAuth: vi.fn(),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
    rpc: vi.fn().mockResolvedValue({ data: [], error: null }),
    ...overrides,
  };
}
```

### 12.2 Geolocalización

```typescript
// tests/mocks/location.ts
export function mockUserLocation(lat: number, lng: number) {
  vi.spyOn(Location, 'getCurrentPositionAsync').mockResolvedValue({
    coords: { latitude: lat, longitude: lng, accuracy: 5, altitude: null,
              altitudeAccuracy: null, heading: null, speed: null },
    timestamp: Date.now(),
  });
}
```

### 12.3 Cámara

En E2E con Maestro: usar la opción `inputImage` para inyectar imagen de prueba en lugar de tomar foto real.

---

## 13. Estrategia de regresión visual (post-MVP)

Para v1.1 considerar añadir:

- **Maestro snapshots** en pantallas críticas.
- O **Storybook** + Chromatic si el equipo crece.

No incluido en MVP para no inflar tooling antes de tiempo.

---

## 14. Reglas de oro

1. **Un test que falla intermitente se desactiva o se arregla en ≤ 24h**. Tests flaky destruyen confianza.
2. **Si un bug llega a producción, primero se escribe el test que lo reproduce**, después se arregla.
3. **Lógica de Octanos y RLS jamás se mergea sin test acompañante**.
4. **Tests son código de primera clase**: revisión por pares igual que el código de producción.

---

## 15. Decisiones cerradas

- ✅ Vitest como runner unitario.
- ✅ React Native Testing Library para componentes.
- ✅ Maestro para E2E.
- ✅ pgTAP para RLS.
- ✅ Coverage como guía, no como objetivo.

## 16. Decisiones pendientes

- ⏳ Visual regression: ¿Maestro snapshots, Storybook + Chromatic, o nada hasta v1.1?
- ⏳ Tests de carga: ¿k6 contra entornos staging? Probablemente sí cuando lleguemos a 1k usuarios reales.
- ⏳ Mocks de Supabase Realtime para tests de ranking en tiempo real.

---

## 17. Documentos relacionados

- `arquitectura.md`, `modelo-datos.md`, `gamificacion.md`, `infraestructura.md`.
