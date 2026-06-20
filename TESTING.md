# Testing Strategy - Lexio

**Proyecto:** Lexio — Diccionario personal inteligente de vocabulario en inglés  
**Stack de testing:** Jest + ts-jest (backend) · Manual E2E en simulador iOS (mobile)  
**Cobertura actual:** 29 tests — 3 suites — todos pasando ✅

---

## Ejecutar los tests

```bash
cd backend

# Ejecutar todos los tests
npm test

# Tests en modo watch (re-ejecuta al guardar)
npm run test:watch

# Tests con informe de cobertura
npm test -- --coverage
```

**Resultado esperado:**
```
PASS src/tests/SessionService.test.ts
PASS src/tests/WordService.test.ts
PASS src/tests/StreakService.test.ts

Test Suites: 3 passed, 3 total
Tests:       29 passed, 29 total
Time:        ~1.8s
```

---

## Configuración Jest

```javascript
// backend/jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
  collectCoverageFrom: ['src/**/*.ts', '!src/types/**'],
};
```

---

## Tests implementados

### `WordService.test.ts` — 10 tests

Mockea: `WordRepository`, `claudeClient`, `unsplashClient`

| Test | Descripción |
|---|---|
| ✅ crea tarjeta con definición e imágenes | Flujo completo: repo.create + Claude + Unsplash |
| ✅ normaliza término a minúsculas | `"  Serendipity  "` → normalizedTerm `"serendipity"` |
| ✅ lanza ConflictError si la palabra existe | `findByNormalizedTerm` devuelve resultado |
| ✅ código de error es DUPLICATE_TERM | `statusCode: 409, errorCode: 'DUPLICATE_TERM'` |
| ✅ Claude y Unsplash se llaman en paralelo | Ambos mockeados se invocan exactamente 1 vez |
| ✅ updateWord actualiza correctamente | `repo.update` devuelve tarjeta actualizada |
| ✅ updateWord lanza NotFoundError | `repo.update` devuelve `null` |
| ✅ listWords devuelve todas las palabras | Array de 2 tarjetas |
| ✅ listWords devuelve array vacío | Sin palabras en repo |
| ✅ deleteWord lanza NotFoundError | `repo.delete` devuelve `false` |

---

### `StreakService.test.ts` — 6 tests

Mockea: `StreakRepository` · Usa: `jest.useFakeTimers()` para controlar la fecha actual

| Test | Descripción |
|---|---|
| ✅ getStreak delega al repositorio | Devuelve la racha sin modificar |
| ✅ idempotente: no actualiza si ya fue hoy | `lastCompletedDate === today` → no llama a `upsert` |
| ✅ incrementa racha en día consecutivo | `streak 3` + día siguiente → `streak 4` |
| ✅ resetea racha si saltó un día | `streak 3` + 2 días después → `streak 1` |
| ✅ inicia racha en 1 la primera vez | Usuario sin historial → `currentStreak: 1` |
| ✅ actualiza longestStreak cuando la supera | `currentStreak 5 + 1 = 6` → `longestStreak 6` |

---

### `SessionService.test.ts` — 13 tests

Mockea: `SessionRepository`, `WordRepository`, `StreakService`, `claudeClient`

| Test | Descripción |
|---|---|
| ✅ ForbiddenError con < 4 palabras | `wordCount = 3` → error 403 |
| ✅ código INSUFFICIENT_VOCABULARY | `statusCode: 403, errorCode: 'INSUFFICIENT_VOCABULARY'` |
| ✅ ConflictError si sesión ya completada | `session.completed = true` → error 409 |
| ✅ código SESSION_ALREADY_COMPLETED | Verifica el errorCode exacto |
| ✅ devuelve sesión existente en progreso | `completed: false` → devuelve sin crear nueva |
| ✅ crea sesión con exactamente 10 ejercicios | `exercises.length === 10` |
| ✅ genera ejercicios image_match y mcq | Ambos tipos presentes en la sesión |
| ✅ no llama a repo si pocas palabras | `SessionRepository.create` no se invoca |
| ✅ NotFoundError si sesión no existe | `findById` devuelve `null` |
| ✅ ConflictError si sesión ya completada | No se puede completar dos veces |
| ✅ AppError 400 con < 10 respuestas | 7 respuestas → `VALIDATION_ERROR` |
| ✅ completa sesión y actualiza racha | `completed: true` + `StreakService.updateAfterSession` llamado |
| ✅ pasa las respuestas al repositorio | `complete(id, userId, answers)` con args correctos |

---

## Estrategia de mocking

```typescript
// Repositorios: jest.Mocked<typeof Repository>
jest.mock('../repositories/WordRepository');
const mockRepo = WordRepository as jest.Mocked<typeof WordRepository>;
mockRepo.findByNormalizedTerm.mockResolvedValue(null);

// Integraciones externas: evitar llamadas reales a Claude/Unsplash
jest.mock('../integrations/claudeClient');
const mockGenDef = generateDefinition as jest.MockedFunction<typeof generateDefinition>;
mockGenDef.mockResolvedValue('Un hallazgo afortunado e inesperado');

// Fechas: jest.useFakeTimers() para tests de racha
jest.useFakeTimers();
jest.setSystemTime(new Date('2026-06-14T12:00:00Z'));
```

---

## Checklist de calidad

### Completado ✅
- [x] 29 tests pasan en ~1.8 segundos
- [x] 3 suites: `WordService`, `StreakService`, `SessionService`
- [x] Mocks de repositorios: sin llamadas reales a Firestore
- [x] Mocks de APIs externas: sin llamadas reales a Claude ni Unsplash
- [x] Tests de errores tipados: se verifica `statusCode` y `errorCode`
- [x] Tests de idempotencia en StreakService
- [x] Fechas controladas con `jest.useFakeTimers()`
- [x] TypeScript `strict: true` en los archivos de test
- [x] Flujo E2E completo verificado manualmente en simulador iOS

### Recomendaciones futuras
- [ ] Integration tests con Supertest + Firestore Emulator para los endpoints REST
- [ ] React Native Testing Library para componentes del mobile
- [ ] Tests de middleware `auth.ts` (token válido / inválido / ausente)
- [ ] Tests de validación Zod en `validate.ts`

---

## Recursos

- [Jest Docs](https://jestjs.io/docs/getting-started)
- [ts-jest](https://kulshekhar.github.io/ts-jest/)
- [jest.useFakeTimers](https://jestjs.io/docs/timer-mocks)
- [Firebase Local Emulator](https://firebase.google.com/docs/emulator-suite)
