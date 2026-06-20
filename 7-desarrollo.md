# Plan de Desarrollo - Lexio

**Proyecto:** Lexio — Diccionario personal inteligente de vocabulario en inglés  
**Fecha de Planificación:** Junio 2026  
**Fase:** Implementación Backend + Frontend (MVP E2E)  
**Autor:** Jesus Fredy Vizcarra Garcia

---

## 0. Prompt Utilizado para la Generación

### Contexto del Prompt:
**Fecha:** Junio 2026  
**Proyecto:** Lexio — App móvil de aprendizaje de vocabulario en inglés  
**Objetivo:** Establecer plan de implementación completo para backend y frontend

### Prompt Principal:
```
"Ahora que tenemos todo el proyecto planificado. debemos crear el backend y el frontend
Establece un plan para crear ambas partes.
No escribas nada aun"
```

### Contexto Previo Disponible:
- **Master PRD Completo:** Visión del producto, epics, historias de usuario priorizadas, restricciones técnicas
- **Arquitectura Definida:** Client-Server con BFF, Firebase Auth + Firestore, Claude API, Unsplash API
- **Modelo de Datos:** 4 colecciones Firestore (wordCards, dailySessions, streaks, users) con índices compuestos
- **Especificaciones API:** OpenAPI 3.0 con 3 endpoints E2E documentados
- **Historias de Usuario Aprobadas:** 3 historias INVEST en Jira (LEX-7, LEX-12, LEX-15)
- **Tickets de Trabajo Detallados:** DB-01, BE-01, FE-01 con criterios de done
- **Stack Tecnológico Definido:** React Native + Expo, Node.js + Express, Firebase, Claude Haiku, Unsplash

### Criterios de Planificación Aplicados:
1. **Flujo E2E Prioritario:** Captura de palabra → Generación de ejercicio → Validación de aprendizaje
2. **Backend-First:** Contratos de API definidos antes de implementar el frontend
3. **Dependency Management:** Infraestructura → Backend → Frontend
4. **MVP Focus:** Solo las funcionalidades del flujo principal del MVP
5. **TypeScript End-to-End:** Tipos compartidos entre backend y mobile

### Arquitectura del Sistema:

```
┌─────────────────────┐    ┌─────────────────────┐    ┌──────────────────────┐
│   Mobile (Expo)     │    │   Backend (Express) │    │   Firebase           │
│   React Native      │◄──►│   Node.js + TS      │◄──►│   Auth + Firestore   │
│   expo-router       │    │   BFF Pattern       │    │   (default) DB       │
│   Zustand           │    │   REST API          │    │                      │
└─────────────────────┘    └─────────────────────┘    └──────────────────────┘
                                     │                          
                           ┌─────────┴──────────┐              
                           │                    │              
                  ┌────────▼────────┐  ┌────────▼────────┐    
                  │  Claude Haiku   │  │  Unsplash API   │    
                  │  (Definiciones  │  │  (Imágenes      │    
                  │   + MCQs)       │  │   sugeridas)    │    
                  └─────────────────┘  └─────────────────┘    
```

---

## Índice

0. [Prompt Utilizado para la Generación](#0-prompt-utilizado-para-la-generación)
1. [Análisis de la Situación Actual](#1-análisis-de-la-situación-actual)
2. [Estrategia de Implementación](#2-estrategia-de-implementación)
3. [Stack Tecnológico y Herramientas](#3-stack-tecnológico-y-herramientas)
4. [Estructura de Proyecto](#4-estructura-de-proyecto)
5. [Plan de Ejecución por Fases](#5-plan-de-ejecución-por-fases)
6. [Cronograma de Ejecución](#6-cronograma-de-ejecución)
7. [Estrategias de Desarrollo](#7-estrategias-de-desarrollo)
8. [Criterios de Calidad](#8-criterios-de-calidad)

---

## 1. Análisis de la Situación Actual

### Estado de Documentación
- ✅ **Master PRD:** Visión completa, epics, alcance y restricciones del MVP definidos
- ✅ **Arquitectura del Sistema:** Diagrama C4 con patrones, justificaciones, beneficios y sacrificios
- ✅ **Modelo de Datos:** 4 colecciones Firestore con esquemas, índices y security rules
- ✅ **Especificaciones API:** OpenAPI 3.0 con 3 endpoints críticos del flujo E2E
- ✅ **Historias de Usuario:** 3 historias con BDD (Given/When/Then) cargadas en Jira
- ✅ **Tickets de Trabajo:** DB-01, BE-01, FE-01 con desglose técnico completo

### Recursos Disponibles
- **Team Size:** Desarrollador full-stack individual
- **Timeline:** MVP académico funcional
- **Infraestructura:** Firebase (plan Spark gratuito), APIs externas con claves propias
- **External Dependencies:** Claude Haiku API (Anthropic), Unsplash API (imágenes)

### Funcionalidades Core Definidas (Flujo E2E)
1. **Autenticación:** Registro e inicio de sesión con email/contraseña (Firebase Auth)
2. **Captura de vocabulario:** Añadir palabra → IA genera definición → usuario elige imagen
3. **Diccionario personal:** Lista de tarjetas con filtro activas/aprendidas + detalle editable
4. **Sesión de práctica:** 10 ejercicios diarios (image_match + MCQ) con progreso
5. **Racha y resultados:** Contador de días consecutivos + pantalla de resultados al finalizar
6. **Configuración:** Selector de idioma de UI (ES/EN) con i18n completo

---

## 2. Estrategia de Implementación

### Enfoque: **BFF (Backend for Frontend) + Monorepo**

#### Justificación:
- **Seguridad:** Las claves de Claude y Unsplash nunca llegan al cliente
- **Control centralizado:** La lógica de negocio (generación de ejercicios, rachas) vive en el backend
- **Simplicidad mobile:** La app solo necesita llamadas REST con token Firebase
- **Escalabilidad futura:** El backend puede servir a múltiples clientes sin cambios

### Flujo E2E Prioritario
```
Usuario escribe "serendipity"
        ↓
POST /words → Claude genera definición + Unsplash sugiere imágenes
        ↓
Usuario elige imagen → PUT /words/:id guarda tarjeta completa
        ↓
Tiene ≥4 palabras → POST /sessions/daily crea sesión con 10 ejercicios
        ↓
Usuario responde 10 ejercicios → POST /sessions/:id/complete
        ↓
Racha actualizada → Pantalla de resultados
```

### Fases de Desarrollo

#### **FASE 0 — Infraestructura base**
```
Objetivo: Estructura de proyecto funcional con tooling configurado

Backend:
├── Monorepo inicializado (backend/ + mobile/ en raíz)
├── Node.js + Express + TypeScript configurado
├── Firebase Admin SDK inicializado
├── Middleware: auth, errorHandler, validate (Zod)
└── Endpoint /health funcionando

Mobile:
├── Expo SDK 56 + TypeScript
├── expo-router configurado como entry point
├── Zustand stores: authStore, wordStore, sessionStore
├── API client (Axios + interceptor de token Firebase)
└── i18n: ES/EN con expo-localization

Firebase:
├── firestore.rules desplegado
├── firestore.indexes.json desplegado (3 índices)
└── Script de seed para datos de desarrollo
```

#### **FASE 1 — Backend: captura de vocabulario**
```
Objetivo: POST /words funcionando de extremo a extremo

├── claudeClient.ts: generateDefinition() con claude-haiku-4-5
├── unsplashClient.ts: searchImages() con Unsplash API
├── WordRepository: CRUD + findByNormalizedTerm
├── WordService: lógica de unicidad + orquestación
├── WordController + ruta POST /words
├── WordController + ruta GET /words
└── WordController + ruta PUT /words/:id
```

#### **FASE 2 — Backend: sesión diaria y racha**
```
Objetivo: Flujo de práctica completo en el backend

├── SessionRepository: create, findByDate, complete
├── StreakRepository: findByUser, upsert
├── SessionService: generación de ejercicios (image_match + MCQ)
├── StreakService: lógica de días consecutivos con timezone
├── POST /sessions/daily
├── POST /sessions/:id/complete
└── GET /streak
```

#### **FASE 3 — Frontend: autenticación**
```
Objetivo: Flujo de login/registro funcional con redirección

├── app/index.tsx: splash con redirección por estado de auth
├── app/_layout.tsx: Stack root con inicialización de Firebase
├── app/(auth)/login.tsx: formulario con validación
├── app/(auth)/register.tsx: formulario con validación
└── authStore: signIn, signUp, signOut, onAuthStateChanged
```

#### **FASE 4 — Frontend: captura de vocabulario**
```
Objetivo: Flujo completo de añadir y gestionar palabras

├── app/(tabs)/add-word.tsx: input → generate → select image → save
├── app/(tabs)/dictionary.tsx: lista filtrada activas/aprendidas
├── app/card/[id].tsx: detalle editable + marcar como aprendida
└── wordStore: fetchWords, createWord, updateWord, deleteWord
```

#### **FASE 5 — Frontend: práctica y racha**
```
Objetivo: Sesión de 10 ejercicios con resultados y racha

├── app/(tabs)/home.tsx: StreakBadge + botón de práctica
├── app/practice.tsx: 10 ejercicios con progress bar
├── app/results.tsx: puntuación + racha actualizada
└── sessionStore: startSession, completeSession, fetchStreak
```

#### **FASE 6 — Frontend: ajustes e i18n**
```
Objetivo: Experiencia bilingüe completa

├── app/(tabs)/settings.tsx: selector ES/EN
├── i18n/en.json + i18n/es.json: todos los textos
└── i18n/index.ts: inicialización con expo-localization
```

---

## 3. Stack Tecnológico y Herramientas

### Backend Stack
```yaml
Runtime: Node.js v20.19.5
Framework: Express 4.x + TypeScript 5.x
Validación: Zod 3.x
Autenticación: Firebase Admin SDK 12.x
Base de datos: Cloud Firestore (NoSQL)
IA: @anthropic-ai/sdk — modelo claude-haiku-4-5
Imágenes: Unsplash API (fetch nativo)
Seguridad: helmet, express-rate-limit, cors
Testing: Jest + ts-jest + Supertest

Dependencias principales:
  - express: ^4.19.2
  - firebase-admin: ^12.2.0
  - @anthropic-ai/sdk: ^0.30.0
  - zod: ^3.23.8
  - helmet: ^7.1.0
  - express-rate-limit: ^7.3.1

Scripts:
  - npm run dev       → ts-node-dev (hot reload)
  - npm run build     → tsc (compilar a dist/)
  - npm run test      → jest
  - npm run seed      → poblar Firestore con datos de prueba
```

### Mobile Stack
```yaml
Framework: React Native + Expo SDK 56
Router: expo-router 5.x (file-based routing)
Estado: Zustand 5.x
HTTP: Axios 1.x + interceptor de Firebase ID Token
Auth: Firebase JS SDK 11.x (email/password)
i18n: i18next + react-i18next + expo-localization
Persistencia Auth: @react-native-async-storage/async-storage

Dependencias principales:
  - expo: ~56.0.9
  - expo-router: ~5.0.7
  - firebase: ^11.0.0
  - zustand: ^5.0.0
  - axios: ^1.7.2
  - i18next: ^23.11.5
  - react-i18next: ^15.0.1

Scripts:
  - npx expo start --clear    → desarrollo con caché limpio
  - npx expo start            → desarrollo normal
```

### Infraestructura
```yaml
Base de datos: Cloud Firestore (plan Spark - gratuito)
  Colecciones: wordCards, dailySessions, streaks, users
  Índices compuestos: 3 (userId+normalizedTerm, userId+createdAt, userId+sessionDate)
  Security Rules: acceso restringido por userId

Autenticación: Firebase Authentication
  Proveedor: Email/Password
  Tokens: Firebase ID Tokens (JWT) en header Authorization

APIs Externas:
  Claude Haiku 4.5: definiciones + MCQs (50 RPD gratis)
  Unsplash API: búsqueda de imágenes (50 req/hora gratis)

Desarrollo local:
  - No Docker requerido
  - Firestore en la nube (plan gratuito)
  - Variables de entorno en .env (backend) y app.json (mobile)
```

---

## 4. Estructura de Proyecto

### Estructura de Carpetas (Monorepo)
```
AI4Devs-finalproject/
├── readme.md
├── master-prd.md
├── 1-descripcion-general-del-producto.md
├── 2-arquitectura-del-sistema.md
├── 3-modelo-de-datos.md
├── 4-especificaciones-de-la-api.md
├── 5-historias-de-usuario.md
├── 6-tickets-de-trabajo.md
├── 7-desarrollo.md                         ← este archivo
├── firestore.rules                         ← seguridad Firestore
├── firestore.indexes.json                  ← índices compuestos
├── .firebaserc                             ← proyecto Firebase vinculado
├── firebase.json                           ← config Firebase CLI
├── .gitignore
│
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── jest.config.js
│   ├── .env.example
│   ├── .env                               ← NO en git
│   ├── scripts/
│   │   └── seedFirestore.ts               ← datos de desarrollo
│   └── src/
│       ├── index.ts                       ← Entry point Express
│       ├── types/
│       │   └── index.ts                   ← Tipos compartidos
│       ├── config/
│       │   └── firebaseAdmin.ts           ← Inicialización Admin SDK
│       ├── middleware/
│       │   ├── auth.ts                    ← Verificación token Firebase
│       │   ├── errorHandler.ts            ← AppError + handler global
│       │   └── validate.ts                ← Validación Zod
│       ├── integrations/
│       │   ├── claudeClient.ts            ← generateDefinition + generateMCQ
│       │   └── unsplashClient.ts          ← searchImages
│       ├── repositories/
│       │   ├── WordRepository.ts          ← CRUD wordCards
│       │   ├── SessionRepository.ts       ← CRUD dailySessions
│       │   ├── StreakRepository.ts        ← CRUD streaks
│       │   └── UserRepository.ts          ← CRUD users
│       ├── services/
│       │   ├── WordService.ts             ← Lógica captura de vocabulario
│       │   ├── SessionService.ts          ← Generación de ejercicios
│       │   └── StreakService.ts           ← Lógica de rachas
│       ├── controllers/
│       │   ├── WordController.ts
│       │   ├── SessionController.ts
│       │   └── StreakController.ts
│       └── routes/
│           ├── words.ts                   ← GET/POST/PUT/DELETE /words
│           ├── sessions.ts                ← POST /sessions/daily + complete
│           └── streak.ts                  ← GET /streak
│
└── mobile/
    ├── package.json
    ├── tsconfig.json
    ├── app.json                           ← Config Expo + vars Firebase
    ├── .env.example
    ├── index.ts                           ← Entry point Expo
    ├── App.tsx
    ├── types/
    │   └── index.ts                       ← Tipos (WordCard, Session, Streak...)
    ├── constants/
    │   └── config.ts                      ← API_URL, Firebase keys
    ├── services/
    │   ├── firebase.ts                    ← Init Firebase + Auth con AsyncStorage
    │   └── api.ts                         ← wordsApi, sessionsApi, streakApi
    ├── store/
    │   ├── authStore.ts                   ← Zustand: user, login, logout
    │   ├── wordStore.ts                   ← Zustand: words CRUD
    │   └── sessionStore.ts                ← Zustand: session + streak
    ├── i18n/
    │   ├── en.json                        ← Textos en inglés
    │   ├── es.json                        ← Textos en español
    │   └── index.ts                       ← Configuración i18next
    └── app/
        ├── _layout.tsx                    ← Root layout + init Firebase Auth
        ├── index.tsx                      ← Splash + redirección por auth
        ├── (auth)/
        │   ├── _layout.tsx
        │   ├── login.tsx                  ← Pantalla de inicio de sesión
        │   └── register.tsx               ← Pantalla de registro
        ├── (tabs)/
        │   ├── _layout.tsx                ← Tab bar (Home, Dict, Add, Settings)
        │   ├── home.tsx                   ← Racha + botón de práctica
        │   ├── dictionary.tsx             ← Lista activas/aprendidas
        │   ├── add-word.tsx               ← Flujo captura de vocabulario
        │   └── settings.tsx               ← Selector de idioma + logout
        ├── card/
        │   └── [id].tsx                   ← Detalle + editar + marcar aprendida
        ├── practice.tsx                   ← 10 ejercicios con progress bar
        └── results.tsx                    ← Puntuación + racha actualizada
```

---

## 5. Plan de Ejecución por Fases

### FASE 0: Infraestructura base

#### Backend — Inicialización
```
✅ package.json con dependencias productivas y de desarrollo
✅ tsconfig.json con strict: true
✅ jest.config.js configurado con ts-jest
✅ src/types/index.ts: WordCard, DailySession, Streak, Exercise, User
✅ src/config/firebaseAdmin.ts: inicialización desde FIREBASE_SERVICE_ACCOUNT
✅ src/middleware/auth.ts: verifyIdToken → req.user
✅ src/middleware/errorHandler.ts: AppError, ConflictError, NotFoundError
✅ src/middleware/validate.ts: wrapper Zod
✅ src/index.ts: Express + helmet + cors + rate-limit + rutas + /health
```

#### Mobile — Inicialización
```
✅ Expo SDK 56 + expo-router como entry point (main: "expo-router/entry")
✅ app.json: scheme, plugins [expo-router, expo-localization], extra con Firebase keys
✅ tsconfig.json con strict: true
✅ types/index.ts: tipos espejo del backend
✅ constants/config.ts: API_URL, Firebase keys desde app.json extra
✅ services/firebase.ts: initializeApp + initializeAuth con AsyncStorage
✅ services/api.ts: http Axios + interceptor de token + wordsApi/sessionsApi/streakApi
✅ store/authStore.ts: init(), login(), register(), logout()
✅ store/wordStore.ts: fetchWords(), createWord(), updateWord(), deleteWord()
✅ store/sessionStore.ts: startSession(), completeSession(), fetchStreak()
✅ i18n/en.json + es.json + index.ts: todos los textos en ambos idiomas
```

#### Firebase
```
✅ firestore.rules: match por userId en todas las colecciones
✅ firestore.indexes.json: 3 índices compuestos
✅ firebase deploy --only firestore (reglas + índices)
✅ scripts/seedFirestore.ts: usuario demo + 6 palabras + streak
```

---

### FASE 1: Backend — Captura de vocabulario

#### Integraciones externas
```
✅ claudeClient.ts
   ├── generateDefinition(term, language): string
   │   └── Modelo: claude-haiku-4-5
   │   └── Instrucción: respuesta en ES o EN según parámetro
   └── generateMCQ(term, definition, distractors): {question, options, correctAnswer}
       └── Respuesta JSON estructurada

✅ unsplashClient.ts
   └── searchImages(query, count=5): UnsplashImage[]
       └── Endpoint: /search/photos?orientation=landscape
```

#### Capa de datos
```
✅ WordRepository
   ├── findByNormalizedTerm(userId, normalizedTerm)  ← unicidad
   ├── findById(id, userId)
   ├── findAllByUser(userId)                          ← ordenado por createdAt DESC
   ├── countByUser(userId)                            ← para verificar mínimo de palabras
   ├── create(data: CreateWordDto)
   ├── update(id, userId, data: UpdateWordDto)
   └── delete(id, userId)
```

#### Servicio y controlador
```
✅ WordService
   ├── createWord(userId, body)
   │   ├── Normaliza el término (trim + toLowerCase)
   │   ├── Verifica unicidad → ConflictError 409 si existe
   │   ├── Llama Claude + Unsplash en paralelo (Promise.all)
   │   └── Guarda borrador en Firestore (imageUrl vacío)
   ├── updateWord(userId, wordId, body)  ← usuario elige imagen y edita definición
   ├── listWords(userId)
   └── deleteWord(userId, wordId)

✅ WordController + rutas:
   POST   /words          → createWord
   GET    /words          → listWords
   PUT    /words/:wordId  → updateWord
   DELETE /words/:wordId  → deleteWord
```

---

### FASE 2: Backend — Sesión diaria y racha

#### Capa de datos
```
✅ SessionRepository
   ├── findByDate(userId, sessionDate)  ← para verificar sesión existente
   ├── findById(id, userId)
   ├── create({userId, sessionDate, exercises})
   └── complete(id, userId, answers[])  ← calcula correctAnswers

✅ StreakRepository
   ├── findByUser(userId)   ← devuelve streak vacío si no existe
   └── upsert(streak)
```

#### Servicios
```
✅ SessionService
   ├── createDailySession(userId, body)
   │   ├── Verifica mínimo 4 palabras → ForbiddenError 403
   │   ├── Verifica sesión existente:
   │   │   ├── Si completada → ConflictError 409
   │   │   └── Si en progreso → devuelve la existente
   │   ├── Selecciona hasta 10 palabras aleatorias
   │   ├── Genera imagen_match (sin Claude, usa imageUrl de la tarjeta)
   │   ├── Genera MCQ con Claude para las otras 5
   │   └── Mezcla y ordena ejercicios aleatoriamente
   └── completeSession(userId, sessionId, body)
       ├── Valida 10 respuestas obligatorias
       ├── Calcula correctAnswers comparando con correctAnswer
       └── Llama StreakService.updateAfterSession()

✅ StreakService
   ├── getStreak(userId)
   └── updateAfterSession(userId, timezone?)
       ├── Si lastCompletedDate = hoy → no actualiza (idempotente)
       ├── Si lastCompletedDate = ayer → currentStreak + 1
       └── Si otro día → reset a 1
```

---

### FASE 3: Frontend — Autenticación

```
✅ app/index.tsx
   ├── Si !initialized → ActivityIndicator (spinner)
   ├── Si user → <Redirect href="/(tabs)/home" />
   └── Si !user → <Redirect href="/(auth)/login" />

✅ app/_layout.tsx
   ├── Importa i18n (inicializa idioma)
   ├── useEffect → authStore.init() (onAuthStateChanged)
   └── Stack con screens: index, (auth), (tabs), practice, results, card/[id]

✅ app/(auth)/login.tsx
   ├── Email + Password inputs
   ├── Botón "Iniciar Sesión" → authStore.login()
   └── Link a register

✅ app/(auth)/register.tsx
   ├── Email + Password inputs
   ├── Validación: password ≥ 6 caracteres
   ├── Botón "Registrarse" → authStore.register()
   └── Link a login
```

---

### FASE 4: Frontend — Captura de vocabulario

```
✅ app/(tabs)/add-word.tsx
   Paso 1 (input):
   ├── TextInput para el término
   ├── Selector ES/EN para idioma de definición
   └── Botón "Generate" → wordStore.createWord()
   
   Paso 2 (select_image):
   ├── TextInput editable con la definición generada
   ├── FlatList 2 columnas con imágenes de Unsplash
   ├── Selección visual con borde destacado
   └── Botón "Save Card" → wordStore.updateWord() con imagen elegida

✅ app/(tabs)/dictionary.tsx
   ├── Tabs "Activas" / "Aprendidas"
   ├── FlatList con card = imagen + término + definición truncada
   └── Tap en card → router.push('/card/:id')

✅ app/card/[id].tsx
   ├── Imagen de la tarjeta
   ├── Término en grande
   ├── TextInput editable con la definición
   ├── Botón "Save Changes" → wordStore.updateWord()
   └── Botón "Mark as Learned" / "Mark as Active" → toggle status
```

---

### FASE 5: Frontend — Práctica y racha

```
✅ app/(tabs)/home.tsx
   ├── Racha: sessionStore.streak.currentStreak
   ├── Contador: wordStore.words.length
   ├── Botón "Start Practice" (desactivado si words.length < 4)
   ├── Texto "Completed ✓" si session?.completed
   └── useEffect: fetchWords() + fetchStreak()

✅ app/practice.tsx
   ├── useEffect: startSession() al montar
   ├── Progress bar: current/total
   ├── image_match: imagen + 4 opciones
   ├── mcq: pregunta de texto + 4 opciones
   ├── Selección visual de respuesta
   ├── Botón "Next" / "Finish"
   └── Al finalizar: completeSession() → router.replace('/results')

✅ app/results.tsx
   ├── Puntuación: "8/10 correctas"
   ├── Mensaje especial si 10/10
   ├── Racha: "🔥 5-day streak!"
   ├── Botón "Back to Home"
   └── Botón "View Dictionary"
```

---

### FASE 6: Frontend — Settings e i18n

```
✅ app/(tabs)/settings.tsx
   ├── Selector ES/EN → i18n.changeLanguage(lang)
   ├── Email del usuario logueado
   └── Botón "Log Out" → authStore.logout()

✅ i18n completo (ES/EN):
   Namespaces: common, auth, addWord, home, dictionary,
               cardDetail, practice, results, settings
```

---

## 6. Cronograma de Ejecución

### Diagrama de Fases
```
FASE 0: Infraestructura base
├── Backend: package.json, tsconfig, middleware, index.ts
├── Mobile: expo-router, stores, i18n, api client
└── Firebase: rules, indexes, deploy
         ↓
FASE 1: Backend vocabulario
├── claudeClient + unsplashClient
├── WordRepository → WordService → WordController
└── Rutas: GET/POST/PUT/DELETE /words
         ↓
FASE 2: Backend sesión + racha
├── SessionRepository + StreakRepository
├── SessionService (generación de ejercicios)
└── Rutas: POST /sessions/daily, POST /sessions/:id/complete, GET /streak
         ↓
FASE 3: Frontend autenticación
├── app/index.tsx (splash con redirección)
├── app/(auth)/login.tsx + register.tsx
└── authStore con Firebase Auth
         ↓
FASE 4: Frontend vocabulario
├── add-word.tsx (flujo 2 pasos)
├── dictionary.tsx (lista filtrada)
└── card/[id].tsx (detalle editable)
         ↓
FASE 5: Frontend práctica
├── home.tsx (racha + botón)
├── practice.tsx (10 ejercicios)
└── results.tsx (puntuación + racha)
         ↓
FASE 6: Settings e i18n
├── settings.tsx (selector idioma)
└── i18n completo ES/EN
```

### Notas de Implementación
- Las fases 1 y 2 del backend se desarrollaron en paralelo al ser independientes entre sí
- Las fases 3-6 del frontend se desarrollaron de forma incremental sobre la base de la Fase 0
- Los errores de dependencias de Expo (safe-area, screens, gesture-handler) se resolvieron con `npm install --legacy-peer-deps`
- El modelo Claude se actualizó de `claude-3-5-haiku-20241022` (deprecado) a `claude-haiku-4-5` durante el desarrollo
- Los índices de Firestore se desplegaron con Firebase CLI usando `firebase deploy --only firestore:indexes`

---

## 7. Estrategias de Desarrollo

### Arquitectura por Capas (Backend)

```
Request
   ↓
Router (Zod validation)
   ↓
Controller (HTTP: req/res)
   ↓
Service (lógica de negocio)
   ↓
Repository (acceso a datos Firestore)
   ↓
Firestore / Claude / Unsplash
```

**Beneficios:**
- Cada capa tiene una responsabilidad única
- Los servicios son testables de forma aislada (mockear repositorios)
- Los controladores son delgados (solo HTTP plumbing)

### Estado Global (Mobile — Zustand)

```
authStore     → user, login, register, logout
wordStore     → words[], createWord, updateWord, deleteWord
sessionStore  → session, streak, startSession, completeSession
```

**Beneficios:**
- Un store por dominio, sin acoplamiento
- Estado persistente entre navegaciones
- Fácil de mockear en tests

### Estrategias de Manejo de Errores

#### Backend
```typescript
// Errores tipados con códigos HTTP semánticos
throw new ConflictError('DUPLICATE_TERM', `Ya tienes "${term}"`)
throw new ForbiddenError('INSUFFICIENT_VOCABULARY', 'Necesitas 4 palabras')
throw new NotFoundError('Word card not found')

// Handler global captura y formatea
{ error: 'CONFLICT', message: '...' }
```

#### Mobile
```typescript
// Errores del backend mapeados a textos i18n
if (err.response?.data?.error === 'DUPLICATE_TERM') {
  setError(t('addWord.errorDuplicate', { term }))
}
```

### Seguridad

| Capa | Mecanismo |
|---|---|
| Mobile → Backend | Firebase ID Token en `Authorization: Bearer` |
| Backend | `verifyIdToken()` en cada request protegida |
| Firestore | Security Rules: `request.auth.uid == resource.data.userId` |
| Backend | `helmet()` para headers HTTP seguros |
| Backend | `express-rate-limit`: 100 req/15min por IP |
| Claves API | Solo en backend (Claude, Unsplash nunca llegan al mobile) |

### Internacionalización (i18n)

```
Detección automática: expo-localization → 'es' o 'en'
Fallback: 'es' si el idioma no está soportado
Cambio manual: settings.tsx → i18n.changeLanguage(lang)
Interpolación: "🔥 Racha de {{count}} días" con variables
```

---

## 8. Criterios de Calidad

### Definition of Done por Feature

```
Una funcionalidad se considera DONE cuando:
✅ Implementada según los criterios de aceptación de la Historia de Usuario
✅ Backend: tipos TypeScript sin `any`, compila con tsc --noEmit
✅ Mobile: tipos TypeScript sin `any`, compila con tsc --noEmit
✅ Errores manejados con mensajes de usuario en ES y EN
✅ Flujo probado en simulador iOS o dispositivo físico
✅ Sin errores en la terminal del backend al ejecutar el flujo
```

### Checklist de Variables de Entorno

```
backend/.env:
✅ PORT=3000
✅ NODE_ENV=development
✅ FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...} (JSON en 1 línea)
✅ ANTHROPIC_API_KEY=sk-ant-...
✅ UNSPLASH_ACCESS_KEY=...

mobile/app.json → extra:
✅ EXPO_PUBLIC_API_URL=http://localhost:3000 (o IP local para dispositivo físico)
✅ EXPO_PUBLIC_FIREBASE_API_KEY=...
✅ EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
✅ EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
✅ EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
✅ EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
✅ EXPO_PUBLIC_FIREBASE_APP_ID=...
```

### Métricas de Calidad del MVP

| Métrica | Objetivo |
|---|---|
| Flujo E2E completo | Sin errores de extremo a extremo |
| Tiempo de generación de definición | < 5 segundos |
| Tiempo de carga del diccionario | < 2 segundos |
| Compilación TypeScript | 0 errores en backend y mobile |
| Sesión diaria | Genera exactamente 10 ejercicios |
| Racha | Se actualiza correctamente al completar sesión |
| i18n | 100% de textos disponibles en ES y EN |

### Errores Conocidos y Resoluciones

| Error | Causa | Resolución |
|---|---|---|
| `model: claude-3-5-haiku-20241022 not found` | Modelo deprecado en Anthropic API | Actualizar a `claude-haiku-4-5` |
| `FAILED_PRECONDITION: The query requires an index` | Índices Firestore no desplegados | `firebase deploy --only firestore:indexes` |
| `ERR_STREAM_PREMATURE_CLOSE` | Conflicto de procesos Expo | `pkill -f metro && npx expo start --clear` |
| `Unable to resolve react-native-web` | Dependencia faltante para web bundler | `npm install react-native-web --legacy-peer-deps` |
| `FIREBASE_SERVICE_ACCOUNT must be valid JSON` | JSON con saltos de línea en .env | `python3 -c "import json; print(json.dumps(json.load(open('file.json'))))"` |
| `Project incompatible with Expo Go` | SDK 56 no soportado en Expo Go antiguo | Actualizar Expo Go o usar simulador iOS (tecla `i`) |

---

## Instrucciones de Arranque Local

### Prerequisitos
- Node.js v20+
- Expo Go actualizado (o Xcode para simulador iOS)
- Cuenta Firebase con proyecto creado
- API Keys: Anthropic + Unsplash

### Backend
```bash
cd backend
cp .env.example .env
# Editar .env con las 3 claves (FIREBASE_SERVICE_ACCOUNT, ANTHROPIC_API_KEY, UNSPLASH_ACCESS_KEY)
npm install
npm run dev
# → "Lexio API running on port 3000"
```

### Firebase (primera vez)
```bash
# Desde la raíz del proyecto
npm install -g firebase-tools
firebase login
firebase init firestore   # seleccionar proyecto lexio-dev-xxxxx, NO sobreescribir archivos
firebase deploy --only firestore
# → "Deploy complete!"
# Esperar 2-5 min a que los índices digan "Habilitado"
```

### Mobile
```bash
cd mobile
npm install --legacy-peer-deps
# Editar app.json → extra con las 6 claves EXPO_PUBLIC_FIREBASE_*
npx expo start --clear
# Presionar "i" para simulador iOS o escanear QR con Expo Go
```

### Seed de datos (opcional)
```bash
cd backend
npm run seed
# Crea: usuario demo@lexio.app / demo1234 + 6 palabras + streak de 3 días
```

---

## Conclusión

Lexio implementa un flujo E2E completo de aprendizaje de vocabulario en inglés organizado en **6 fases** de desarrollo que cubren desde la infraestructura base hasta la experiencia completa de usuario. El proyecto utiliza una arquitectura **BFF (Backend for Frontend)** que centraliza la lógica de negocio y protege las claves de las APIs externas, con un frontend móvil React Native que consume los servicios de forma limpia a través de Zustand stores y un cliente Axios con autenticación automática mediante Firebase ID Tokens.

### Próximos Pasos (Post-MVP):
1. Agregar **Google Sign-In** como proveedor adicional de autenticación
2. Implementar **recordatorios push** para mantener la racha
3. Añadir **estadísticas de progreso** (palabras aprendidas por semana, precisión histórica)
4. Soporte para **modo offline** con persistencia local de palabras
5. **Despliegue en producción** del backend (Railway, Render o Cloud Run)
