# Pull Requests - Lexio

**Proyecto:** Lexio — Diccionario personal inteligente de vocabulario en inglés  
**Fecha:** Junio 2026  
**Autor:** Jesus Fredy Vizcarra Garcia  
**Rama de desarrollo:** `feature-entrega2-jfvg`

---

## 7. Pull Requests

> Documenta 3 de las Pull Requests realizadas durante la ejecución del proyecto

---

### Pull Request 1 — Entrega 1: Documentación y planificación del producto

**Rama:** `feature-entrega1-jfvg` → `main`  
**Commit de referencia:** `f3761df Entrega 1 finalproject`  
**Estado:** ✅ Merged

#### Descripción
PR de la primera entrega que incorpora toda la documentación de planificación del producto Lexio: visión del producto, arquitectura del sistema, modelo de datos, especificaciones de la API, historias de usuario y tickets de trabajo. Incluye también el Master PRD y el `readme.md` del proyecto.

#### Archivos incluidos
```
readme.md                                  ← Ficha del proyecto + índice general
master-prd.md                              ← PRD completo con visión, epics y métricas
1-descripcion-general-del-producto.md      ← Objetivo, funcionalidades, instrucciones
2-arquitectura-del-sistema.md              ← Diagrama C4, patrones, justificaciones
3-modelo-de-datos.md                       ← Colecciones Firestore, índices, security rules
4-especificaciones-de-la-api.md            ← OpenAPI 3.0 con 3 endpoints E2E
5-historias-de-usuario.md                  ← LEX-7, LEX-12, LEX-15 con BDD
6-tickets-de-trabajo.md                    ← DB-01, BE-01, FE-01 con criterios de done
prompts.md                                 ← Registro de prompts utilizados con IA
```

#### Tipo de cambio
- [x] Documentación
- [ ] Nueva funcionalidad
- [ ] Bug fix
- [ ] Breaking change

#### Checklist
- [x] Arquitectura definida con justificación de patrones y sacrificios
- [x] Modelo de datos con índices compuestos y security rules de Firestore
- [x] Especificación OpenAPI con los 3 endpoints del flujo E2E prioritario
- [x] Historias de usuario INVEST con criterios BDD (Given/When/Then)
- [x] Tickets técnicos con desglose de tareas y criterios de done
- [x] Historias de usuario creadas en Jira via MCP (LEX-7, LEX-12, LEX-15)

---

### Pull Request 2 — Entrega 2: Implementación completa Backend + Mobile

**Rama:** `feature-entrega2-jfvg` → `main`  
**Estado:** 🔄 Pendiente de merge (esta entrega)

#### Descripción
PR de la segunda entrega que implementa el MVP completo de Lexio de extremo a extremo. Incluye el backend Express + TypeScript con integración a Claude Haiku y Unsplash, la app móvil React Native + Expo con autenticación Firebase, y toda la infraestructura Firestore (reglas, índices, seed). El flujo E2E completo — captura de vocabulario → sesión diaria con IA → racha actualizada — está funcional en el simulador iOS.

#### Archivos incluidos

**Backend (`backend/`)**
```
package.json / tsconfig.json / jest.config.js
.env.example
src/types/index.ts                         ← WordCard, DailySession, Streak, Exercise, User
src/config/firebaseAdmin.ts                ← Admin SDK desde FIREBASE_SERVICE_ACCOUNT
src/middleware/auth.ts                     ← verifyIdToken → req.user
src/middleware/errorHandler.ts             ← AppError, ConflictError, NotFoundError
src/middleware/validate.ts                 ← wrapper Zod
src/integrations/claudeClient.ts           ← generateDefinition + generateMCQ (claude-haiku-4-5)
src/integrations/unsplashClient.ts         ← searchImages (5 resultados)
src/repositories/WordRepository.ts        ← CRUD wordCards + unicidad
src/repositories/SessionRepository.ts     ← CRUD dailySessions
src/repositories/StreakRepository.ts       ← CRUD streaks
src/repositories/UserRepository.ts        ← CRUD users
src/services/WordService.ts               ← Lógica captura + normalización
src/services/SessionService.ts            ← Generación de 10 ejercicios mixtos
src/services/StreakService.ts             ← Lógica de días consecutivos
src/controllers/WordController.ts
src/controllers/SessionController.ts
src/controllers/StreakController.ts
src/routes/words.ts / sessions.ts / streak.ts
src/index.ts                              ← Express + helmet + cors + rate-limit
scripts/seedFirestore.ts                  ← Datos de desarrollo
```

**Mobile (`mobile/`)**
```
package.json / tsconfig.json / app.json
index.ts / App.tsx
types/index.ts                            ← Tipos espejo del backend
constants/config.ts                       ← API_URL + Firebase keys
services/firebase.ts                      ← initializeAuth con AsyncStorage
services/api.ts                           ← Axios + interceptor de token
store/authStore.ts                        ← user, init, login, register, logout
store/wordStore.ts                        ← words[], CRUD completo
store/sessionStore.ts                     ← session, streak, startSession, completeSession
i18n/en.json / es.json / index.ts         ← i18n completo ES/EN
app/_layout.tsx                           ← Root layout + init Firebase Auth
app/index.tsx                             ← Splash con redirección por auth
app/(auth)/login.tsx                      ← Formulario de inicio de sesión
app/(auth)/register.tsx                   ← Formulario de registro
app/(tabs)/home.tsx                       ← Racha + botón de práctica
app/(tabs)/add-word.tsx                   ← Flujo 2 pasos: generar + elegir imagen
app/(tabs)/dictionary.tsx                 ← Lista activas/aprendidas
app/(tabs)/settings.tsx                   ← Selector ES/EN + logout
app/card/[id].tsx                         ← Detalle editable + marcar aprendida
app/practice.tsx                          ← 10 ejercicios con progress bar
app/results.tsx                           ← Puntuación + racha actualizada
```

**Firebase e Infraestructura**
```
firestore.rules                           ← Seguridad: acceso solo por userId
firestore.indexes.json                    ← 3 índices compuestos
.firebaserc                               ← Proyecto Firebase vinculado
firebase.json                             ← Configuración Firebase CLI
.gitignore
7-desarrollo.md                           ← Plan de desarrollo documentado
7-pull-requests.md                        ← Este archivo
```

#### Tipo de cambio
- [x] Nueva funcionalidad (MVP completo)
- [x] Documentación
- [ ] Bug fix
- [ ] Breaking change

#### Testing realizado
- [x] Backend: API arranca sin errores en `npm run dev`
- [x] Endpoint `POST /words`: genera definición con Claude + imágenes con Unsplash ✅
- [x] Endpoint `POST /sessions/daily`: genera 10 ejercicios mixtos ✅
- [x] Endpoint `POST /sessions/:id/complete`: calcula correctAnswers y actualiza racha ✅
- [x] Endpoint `GET /streak`: devuelve racha actualizada ✅
- [x] Mobile: flujo login → add-word → dictionary → practice → results en simulador iOS ✅
- [x] Firebase: reglas e índices desplegados con `firebase deploy --only firestore` ✅

#### Checklist
- [x] TypeScript sin `any` explícitos en backend y mobile
- [x] Errores del backend con mensajes en ES y EN
- [x] Variables de entorno documentadas en `.env.example` (backend) y `app.json` (mobile)
- [x] Claves de Claude y Unsplash nunca expuestas al cliente mobile
- [x] Security Rules validadas: usuarios no pueden acceder a datos de otros
- [x] Índices Firestore en estado `READY` antes de pruebas E2E
- [x] i18n completo: 100% de textos disponibles en español e inglés
- [x] Flujo E2E prioritario funcional: Captura → Ejercicio → Racha ✅

#### Problemas resueltos durante el desarrollo
| Problema | Resolución |
|---|---|
| `model: claude-3-5-haiku-20241022 not found` | Actualizado a `claude-haiku-4-5` |
| `FAILED_PRECONDITION: The query requires an index` | `firebase deploy --only firestore:indexes` |
| `FIREBASE_SERVICE_ACCOUNT` con saltos de línea | Conversión a JSON en una sola línea con Python |
| Expo Go incompatible con SDK 56 | Uso del simulador iOS con tecla `i` |
| `Cannot find module expo-router/internal/routing` | `typedRoutes: false` en `app.json` |

---

### Pull Request 3 — Hotfix: Actualización de modelo Claude y despliegue de índices

**Rama:** `hotfix/claude-model-and-indexes` → `feature-entrega2-jfvg`  
**Estado:** ✅ Integrado en la rama de desarrollo

#### Descripción
Corrección de dos errores críticos detectados durante las pruebas E2E que bloqueaban el flujo completo de práctica. El modelo `claude-3-5-haiku-20241022` fue deprecado por Anthropic y devolvía un 404. Adicionalmente, la consulta de palabras por usuario (`userId + createdAt`) requería un índice compuesto de Firestore que no estaba desplegado, generando un error `FAILED_PRECONDITION` al iniciar la sesión de práctica.

#### Archivos modificados
```
backend/src/integrations/claudeClient.ts   ← Modelo: claude-3-5-haiku-20241022 → claude-haiku-4-5
firestore.indexes.json                     ← Añadido índice userId+createdAt y userId+sessionDate
```

#### Cambios específicos

**`claudeClient.ts`**
```typescript
// Antes (deprecado):
model: 'claude-3-5-haiku-20241022'

// Después (corregido):
model: 'claude-haiku-4-5'
```

**`firestore.indexes.json`**
```json
{
  "indexes": [
    {
      "collectionGroup": "wordCards",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "dailySessions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "sessionDate", "order": "DESCENDING" }
      ]
    }
  ]
}
```

#### Tipo de cambio
- [x] Bug fix (errores críticos bloqueantes)
- [ ] Nueva funcionalidad
- [ ] Documentación
- [ ] Breaking change

#### Testing realizado
- [x] `POST /words` genera definición sin error 404 de Claude ✅
- [x] `POST /sessions/daily` ya no lanza `FAILED_PRECONDITION` ✅
- [x] Índices en estado `READY` tras `firebase deploy --only firestore:indexes` ✅

#### Checklist
- [x] El cambio de modelo es compatible con el mismo contrato de respuesta
- [x] Los índices añadidos cubren todas las consultas con `orderBy` del proyecto
- [x] Desplegado en Firebase sin afectar datos existentes

---

## Template de Pull Request del Proyecto

Para futuros PRs, usar este template:

```markdown
## Descripción
[Descripción breve de los cambios y su propósito]

## Historia de Usuario / Ticket relacionado
- Jira: LEX-XX / DB-XX / BE-XX / FE-XX

## Tipo de cambio
- [ ] Bug fix
- [ ] Nueva funcionalidad
- [ ] Breaking change
- [ ] Documentación

## Testing
- [ ] Backend: `npm run test` pasa sin errores
- [ ] Mobile: flujo probado en simulador iOS
- [ ] TypeScript: `tsc --noEmit` sin errores en backend y mobile
- [ ] Firebase: reglas/índices desplegados si aplica

## Checklist
- [ ] Código sigue la arquitectura por capas (Controller → Service → Repository)
- [ ] Sin claves API expuestas en el cliente mobile
- [ ] Errores con mensajes i18n (ES + EN) si aplica
- [ ] `.env.example` actualizado si se añaden nuevas variables
- [ ] Prueba manual del flujo E2E: Captura → Ejercicio → Racha
```
