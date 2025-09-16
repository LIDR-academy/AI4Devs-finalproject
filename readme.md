## Índice

0. [Ficha del proyecto](#0-ficha-del-proyecto)
1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)

---

## 0. Ficha del proyecto

### **0.1. Tu nombre completo:**
Willians Nieves

### **0.2. Nombre del proyecto:**
Spartan Guitar Gym

### **0.3. Descripción breve del proyecto:**
Plataforma web y móvil que lleva la estructura, disciplina y motivación de una rutina de gimnasio al mundo de la práctica de guitarra. Diseñada para guitarristas de todos los niveles, proporciona una experiencia de práctica gamificada, basada en niveles, con recomendaciones impulsadas por IA y seguimiento visual del progreso.

### **0.4. URL del proyecto:**
*En desarrollo - MVP será desplegado en Vercel + Supabase*

> Puede ser pública o privada, en cuyo caso deberás compartir los accesos de manera segura. Puedes enviarlos a [alvaro@lidr.co](mailto:alvaro@lidr.co) usando algún servicio como [onetimesecret](https://onetimesecret.com/).

### 0.5. URL o archivo comprimido del repositorio
https://github.com/williamsnieves/spartanguitargym

> Puedes tenerlo alojado en público o en privado, en cuyo caso deberás compartir los accesos de manera segura. Puedes enviarlos a [alvaro@lidr.co](mailto:alvaro@lidr.co) usando algún servicio como [onetimesecret](https://onetimesecret.com/). También puedes compartir por correo un archivo zip con el contenido


---

## 1. Descripción general del producto

> Describe en detalle los siguientes aspectos del producto:

### **1.1. Objetivo:**

**Spartan Guitar Gym** es una plataforma web y móvil que soluciona la falta de motivación, estructura y disciplina en el aprendizaje de guitarra. 

**Propósito**: Transformar la práctica de guitarra en una experiencia gamificada, similar a un gimnasio, con rutinas estructuradas, progresión por rangos y recomendaciones personalizadas.

**Valor que aporta**:
- Motivación a través de progresión estructurada (rangos Espartanos)
- Disciplina diaria con sesiones cortas y enfocadas (5-10 minutos)
- Rutas de práctica personalizadas con IA básica
- Métricas visuales de progreso y sistema de recompensas XP

**Para quién**:
- Guitarristas principiantes que buscan un camino claro y estructurado
- Músicos intermedios que necesitan motivación y feedback para avanzar
- Guitarristas avanzados que buscan refinar habilidades específicas
- Autodidactas que desean establecer consistencia en su práctica

### **1.2. Características y funcionalidades principales:**

**🎯 Sistema de Rangos y Progresión**:
- 5 niveles: Meirakion → Hilotas → Hoplitas → Hippeisy → Espartano
- Cada nivel: 20 lecciones con 10 ejercicios cada una
- Desbloqueo progresivo basado en completación

**🎮 Gamificación**:
- Sistema XP por ejercicios completados
- Badges y logros por hitos alcanzados
- Racha diaria y semanal con bonificaciones
- Sistema de referidos con recompensas

**📚 Contenido de Ejercicios**:
- Videos demostrativos (30-60 segundos)
- Tablaturas interactivas sincronizadas
- Archivos Guitar Pro descargables (GPX/PDF)
- Etiquetado por estilo, técnica y dificultad

**🤖 IA Instructor (MVP)**:
- Top 5 ejercicios del día personalizados
- Recomendaciones basadas en historial y preferencias
- Feedback loop para mejorar sugerencias

**💳 Modelo Freemium**:
- Tier gratuito: acceso limitado a ejercicios
- Tier Pro: acceso completo + funciones premium
- Integración con Stripe/PayPal

**📊 Dashboard y Analytics**:
- Seguimiento de progreso visual
- Estadísticas de práctica (tiempo, ejercicios, estilos)
- Métricas de rendimiento por técnica

**🔐 Autenticación y Perfiles**:
- Registro email/contraseña y OAuth (Google, Apple)
- Gestión de preferencias y configuración
- Recuperación de contraseña

### **1.3. Diseño y experiencia de usuario:**

**🎨 Principios de Diseño**:
- Inspiración temática espartana (colores, iconografía, terminología)
- UI moderna y minimalista con enfoque en la práctica
- Responsive design para web y mobile
- Diseño orientado a la motivación y el progreso visual

**📱 Flujo de Usuario Principal**:
1. **Landing**: Presentación del concepto "gimnasio para guitarristas"
2. **Registro/Login**: OAuth social o email/contraseña
3. **Onboarding**: Selección de nivel actual y preferencias musicales
4. **Dashboard**: Vista de progreso, ejercicio del día, y recomendaciones
5. **Práctica**: Reproducción de video + tablatura sincronizada
6. **Progreso**: Marcado de completación, XP otorgado, badges desbloqueados
7. **Exploración**: Navegación por niveles, lecciones y estilos
8. **Suscripción**: Upgrade a Pro para contenido premium

**🖼️ Recursos Visuales**:
- Diagramas de arquitectura disponibles en `/documentation/`
- Mockups y wireframes en archivos `.excalidraw` y `.png`
- ERD de base de datos en formato Mermaid
- Diagramas C4 de componentes del sistema

*Nota: Las imágenes y diagramas detallados se encuentran en el directorio `/documentation/` del repositorio.*

### **1.4. Instrucciones de instalación:**

**⚠️ Estado Actual**: El proyecto está en fase de planificación y desarrollo inicial. Las siguientes instrucciones representan la configuración planificada para el MVP.

**📋 Prerrequisitos**:
```bash
# Herramientas requeridas
Node.js >= 18.x
Python >= 3.9
Docker & Docker Compose
Git
```

**🐳 Configuración de Base de Datos (Docker)**:
```bash
# Clonar repositorio
git clone https://github.com/williamsnieves/spartanguitargym.git
cd spartanguitargym

# Levantar PostgreSQL + Redis con Docker
docker-compose up -d postgres redis

# Ejecutar migraciones
npm run db:migrate
npm run db:seed
```

**🖥️ Backend Services**:
```bash
# API Service (Node.js/Express)
cd backend/api-service
npm install
npm run dev

# Recommendation Service (Python/FastAPI)
cd backend/recommendation-service
pip install -r requirements.txt
uvicorn main:app --reload

# Worker Service (Jobs/FFmpeg)
cd backend/worker-service
npm install
npm run dev
```

**🌐 Frontend**:
```bash
# Web App (React/Next.js)
cd frontend/web
npm install
npm run dev

# Mobile App (React Native/Expo)
cd frontend/mobile
npm install
npx expo start
```

**🔑 Variables de Entorno**:
```bash
# .env.example -> .env
DATABASE_URL=postgresql://user:pass@localhost:5432/spartangym
REDIS_URL=redis://localhost:6379
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
STRIPE_SECRET_KEY=your_stripe_key
```

**✅ Verificación**:
- API: `http://localhost:3000/health`
- Web: `http://localhost:3001`
- Mobile: Expo DevTools
- DB: Verificar conexión con `npm run db:status`

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**🏗️ Arquitectura de Microservicios Orientada a MVP**

La arquitectura sigue un patrón de **microservicios simplificado** con separación de responsabilidades, optimizada para el MVP pero escalable a producción.

```mermaid
flowchart LR
  subgraph Clients
    WA[Web App React/Next.js]
    MA[Mobile App React Native/Expo]
  end

  subgraph Edge["CDN/Edge Vercel"]
    VE[Vercel Edge + CDN]
  end

  subgraph Backend["Backend Cluster"]
    API[API Service Node.js/Express]
    REC[Recommendation Service Python/FastAPI]
    WRK[Worker Service Jobs/FFmpeg]
    BWL[Billing Webhook Listener]
  end

  subgraph Data["Data Stores"]
    PG[(PostgreSQL)]
    RD[(Redis)]
    S3[(Supabase Storage)]
  end

  subgraph ThirdParty["Third-Party"]
    AUTH[Supabase Auth]
    STR[Stripe]
    EXPO[Expo Push]
  end

  WA --> VE --> API
  MA --> VE --> API
  WA --> AUTH
  MA --> AUTH
  
  API <--> PG
  API <--> RD
  API --> S3
  API --> REC
  
  WRK <--> RD
  WRK --> S3
  REC --> PG
  
  API --> STR
  STR --> BWL
  BWL --> PG
```

**⚙️ Justificación de la Arquitectura**:

**Beneficios**:
- **Escalabilidad horizontal**: Cada servicio puede escalar independientemente
- **Separación de responsabilidades**: API, recomendaciones, y jobs aislados
- **Tecnologías especializadas**: Python para IA, Node.js para API, FFmpeg para media
- **Deployment independiente**: Actualizaciones sin afectar todo el sistema
- **Costo-efectivo para MVP**: Supabase + Vercel reducen complejidad inicial

**Trade-offs**:
- **Complejidad de orquestación**: Más servicios = más coordinación
- **Latencia de red**: Comunicación inter-servicios añade overhead
- **Debugging distribuido**: Más difícil rastrear errores cross-service
- **Eventual consistency**: Posibles inconsistencias temporales entre servicios


### **2.2. Descripción de componentes principales:**

**🌐 Frontend Applications**:
- **Web App (React/Next.js)**: Dashboard principal, gestión de ejercicios, suscripciones
- **Mobile App (React Native/Expo)**: Experiencia optimizada para práctica móvil, notificaciones push
- **Admin Console (React)**: Gestión de contenido, analytics, configuración de badges

**🖥️ Backend Services**:
- **API Service (Node.js/Express)**: 
  - REST/JSON APIs para autenticación, contenido, progreso
  - Verificación de tokens JWT de Supabase
  - Lógica de negocio: gating de contenido, cálculo XP, triggers de badges
  - Orquestación de suscripciones y pagos

- **Recommendation Service (Python/FastAPI)**:
  - Algoritmos heurísticos para recomendaciones personalizadas
  - Análisis de patrones de uso y preferencias
  - Ranking de ejercicios basado en historial y tags
  - API interna para consultas de recomendación

- **Worker Service (Node.js + FFmpeg)**:
  - Jobs asíncronos: transcodificación de video, procesamiento de media
  - Evaluación de reglas de badges y otorgamiento automático
  - Envío de notificaciones (email, push)
  - Gestión de colas con Redis/BullMQ

- **Billing Webhook Listener**:
  - Procesamiento idempotente de webhooks de Stripe/PayPal
  - Actualización de estados de suscripción y pagos
  - Sincronización con base de datos principal

**📋 Data Layer**:
- **PostgreSQL**: Sistema de registro principal (usuarios, contenido, progreso, gamificación)
- **Redis**: Cache, colas de trabajo, tokens temporales, rate limiting
- **Supabase Storage**: Videos, tablaturas, archivos Guitar Pro con URLs firmadas

**🔗 External Services**:
- **Supabase Auth**: Gestión de identidad, OAuth social, JWTs
- **Stripe**: Procesamiento de pagos y suscripciones
- **Expo Push**: Notificaciones push para aplicación móvil
- **Vercel**: Hosting frontend, CDN, edge functions

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

**📁 Estructura del Proyecto (Planificada)**:

```
spartanguitargym/
├── 📄 documentation/           # PRD, diagramas, especificaciones
│   ├── spartan_guitar_gym_PRD_ES.md
│   ├── spartan_guitar_gym_system_architecture.md
│   ├── spartan_guitar_gym_data_model_updated.md
│   └── *.png, *.excalidraw (diagramas visuales)
│
├── 🖥️ backend/                   # Microservicios backend
│   ├── api-service/            # API principal (Node.js/Express)
│   │   ├── src/
│   │   │   ├── routes/             # Endpoints REST
│   │   │   ├── middleware/         # Auth, validation, logging
│   │   │   ├── services/           # Lógica de negocio
│   │   │   └── models/             # ORM/Database models
│   │   └── package.json
│   │
│   ├── recommendation-service/ # IA/ML (Python/FastAPI)
│   │   ├── app/
│   │   │   ├── algorithms/         # Lógica de recomendación
│   │   │   ├── models/             # Modelos de datos
│   │   │   └── api/                # FastAPI endpoints
│   │   └── requirements.txt
│   │
│   └── worker-service/         # Jobs asíncronos (Node.js)
│       ├── src/
│       │   ├── jobs/               # Definición de trabajos
│       │   ├── processors/         # FFmpeg, media handling
│       │   └── queues/             # Redis queue management
│       └── package.json
│
├── 🌐 frontend/                 # Aplicaciones cliente
│   ├── web/                    # React/Next.js
│   │   ├── src/
│   │   │   ├── components/         # UI components reutilizables
│   │   │   ├── pages/              # Next.js pages/routing
│   │   │   ├── hooks/              # Custom React hooks
│   │   │   ├── context/            # React Context (auth, state)
│   │   │   └── styles/             # Tailwind CSS, global styles
│   │   └── package.json
│   │
│   └── mobile/                 # React Native/Expo
│       ├── src/
│       │   ├── screens/            # Pantallas de la app
│       │   ├── components/         # UI components móviles
│       │   ├── navigation/         # React Navigation
│       │   └── services/           # API clients, push notifications
│       └── package.json
│
├── 🐳 infrastructure/           # DevOps y configuración
│   ├── docker-compose.yml      # PostgreSQL + Redis local
│   ├── migrations/             # Database migrations
│   └── seeds/                  # Datos iniciales
│
└── 📄 README.md
```

**🏗️ Patrón Arquitectónico**:
- **Domain-Driven Design (DDD)**: Separación por dominios (auth, content, gamification, payments)
- **Clean Architecture**: Dependencias apuntan hacia el core de negocio
- **Microservices Pattern**: Servicios independientes con responsabilidades específicas
- **Repository Pattern**: Abstracción de acceso a datos
- **CQRS Light**: Separación de comandos y queries en servicios complejos

### **2.4. Infraestructura y despliegue**

**🌐 Estrategia de Deployment MVP: Vercel + Supabase**

```mermaid
flowchart TB
    subgraph Development
        DEV["Desarrollo Local"]
        DOCKER["Docker PostgreSQL + Redis"]
    end
    
    subgraph Production
        VERCEL["Vercel"]
        SUPABASE["Supabase"]
        RAILWAY["Railway/Render"]
        STRIPE["Stripe"]
    end
    
    subgraph CI_CD["CI/CD Pipeline"]
        GITHUB["GitHub Actions"]
        TESTS["Tests + Linting"]
        BUILD["Build & Deploy"]
    end
    
    DEV --> GITHUB
    GITHUB --> TESTS
    TESTS --> BUILD
    BUILD --> VERCEL
    BUILD --> RAILWAY
    
    VERCEL --> SUPABASE
    RAILWAY --> SUPABASE
    VERCEL --> STRIPE
```

**🚀 Proceso de Despliegue**:

1. **Desarrollo Local**:
   ```bash
   docker-compose up -d  # PostgreSQL + Redis
   npm run dev          # Todos los servicios en paralelo
   ```

2. **CI/CD Pipeline (GitHub Actions)**:
   ```yaml
   # .github/workflows/deploy.yml
   - name: Test & Lint
     run: npm run test && npm run lint
   
   - name: Build Frontend
     run: npm run build
   
   - name: Deploy to Vercel
     uses: amondnet/vercel-action@v20
   
   - name: Deploy Backend to Railway
     run: railway deploy
   ```

3. **Infraestructura de Producción**:
   - **Frontend**: Vercel (SSR/SSG, CDN global, edge functions)
   - **Backend Services**: Railway/Render (contenedores Docker)
   - **Base de Datos**: Supabase PostgreSQL (managed)
   - **Auth**: Supabase Auth (OAuth, JWT)
   - **Storage**: Supabase Storage (S3-compatible)
   - **Cache**: Redis en Railway/Render
   - **Pagos**: Stripe (webhooks a backend)
   - **Monitoring**: Vercel Analytics + Sentry

**🔧 Configuración de Entornos**:
- **Development**: Docker local + variables .env
- **Staging**: Branch `develop` → preview deployments
- **Production**: Branch `main` → automatic deployment

**📊 Monitoreo y Observabilidad**:
- **Logs**: Vercel Functions + Railway logs
- **Errors**: Sentry integration
- **Metrics**: Vercel Analytics + custom metrics
- **Uptime**: Vercel monitoring + health checks

### **2.5. Seguridad**

**🔐 Implementación de Seguridad por Capas**

**Autenticación y Autorización**:
- **JWT Tokens**: Supabase genera y valida tokens seguros
- **OAuth Social**: Google/Apple con scope mínimo necesario
- **Session Management**: Tokens con expiración y refresh automático
- **Role-Based Access**: Free vs Pro users con middleware de verificación

```javascript
// Ejemplo: Middleware de autorización
const requireProSubscription = async (req, res, next) => {
  const user = await verifySupabaseToken(req.headers.authorization);
  if (user.subscription_tier !== 'pro') {
    return res.status(403).json({ error: 'Pro subscription required' });
  }
  next();
};
```

**Protección de APIs**:
- **Rate Limiting**: Redis-based con ventanas deslizantes
- **Input Validation**: Joi/Zod schemas para todos los endpoints
- **SQL Injection**: ORM (Prisma) con prepared statements
- **CORS**: Configuración restrictiva por dominio

```javascript
// Ejemplo: Rate limiting
const rateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por IP
  standardHeaders: true,
  legacyHeaders: false,
});
```

**Protección de Datos**:
- **Encryption at Rest**: Supabase PostgreSQL con encriptación AES-256
- **Encryption in Transit**: HTTPS/TLS 1.3 obligatorio
- **Sensitive Data**: Variables de entorno, no hardcoded
- **PII Protection**: Hash de emails para analytics, GDPR compliance

**Seguridad de Contenido**:
- **Media URLs**: Signed URLs con expiración (Supabase Storage)
- **Content Security Policy**: Headers restrictivos para XSS
- **File Upload**: Validación de tipo MIME y tamaño
- **CDN Security**: Vercel con protección DDoS integrada

**Pagos y Transacciones**:
- **PCI Compliance**: Stripe maneja datos de tarjetas (no almacenamos)
- **Webhook Verification**: Firma criptográfica de Stripe
- **Idempotency**: Claves únicas para evitar doble procesamiento
- **Audit Trail**: Log de todas las transacciones

```javascript
// Ejemplo: Verificación de webhook Stripe
const sig = req.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
```

**Monitoreo de Seguridad**:
- **Error Tracking**: Sentry con sanitización de datos sensibles
- **Anomaly Detection**: Patrones de uso sospechosos
- **Security Headers**: HSTS, X-Frame-Options, X-Content-Type-Options
- **Dependency Scanning**: npm audit y Dependabot

### **2.6. Tests**

**🧪 Estrategia de Testing (Planificada para MVP)**

**Unit Tests (Jest + Testing Library)**:
- **Frontend Components**: Renderizado, interacción, estados
- **Backend Services**: Lógica de negocio, cálculos XP, reglas de badges
- **Utility Functions**: Validaciones, transformaciones de datos
- **Coverage Target**: >80% para lógica crítica

```javascript
// Ejemplo: Test de cálculo XP
describe('XP Calculation Service', () => {
  test('should award correct XP for exercise completion', () => {
    const exercise = { difficulty: 'intermediate', duration_sec: 300 };
    const xp = calculateExerciseXP(exercise);
    expect(xp).toBe(15); // base 10 + 5 por intermediate
  });
  
  test('should apply streak bonus correctly', () => {
    const user = { current_streak: 7 };
    const baseXP = 10;
    const totalXP = applyStreakBonus(baseXP, user);
    expect(totalXP).toBe(12); // 20% bonus por 7-day streak
  });
});
```

**Integration Tests (Supertest + Test DB)**:
- **API Endpoints**: Autenticación, CRUD operations, business flows
- **Database Operations**: Migraciones, constraints, triggers
- **External Services**: Mocks de Stripe, Supabase, Expo Push
- **Worker Jobs**: Procesamiento asíncrono, badge awards

```javascript
// Ejemplo: Test de endpoint de progreso
describe('POST /api/progress', () => {
  test('should mark exercise as completed and award XP', async () => {
    const response = await request(app)
      .post('/api/progress')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ exercise_id: 'test-exercise-id' });
    
    expect(response.status).toBe(201);
    expect(response.body.xp_awarded).toBeGreaterThan(0);
    expect(response.body.badges_unlocked).toBeInstanceOf(Array);
  });
});
```

**End-to-End Tests (Playwright)**:
- **User Journeys**: Registro, login, completar ejercicio, upgrade a Pro
- **Payment Flow**: Stripe checkout, webhook processing
- **Mobile App**: Navegación, offline behavior, push notifications
- **Cross-browser**: Chrome, Firefox, Safari compatibility

```javascript
// Ejemplo: E2E test de user journey
test('complete exercise journey', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[data-testid=email]', 'test@example.com');
  await page.fill('[data-testid=password]', 'password123');
  await page.click('[data-testid=login-btn]');
  
  await page.waitForURL('/dashboard');
  await page.click('[data-testid=exercise-of-the-day]');
  await page.click('[data-testid=mark-completed]');
  
  await expect(page.locator('[data-testid=xp-notification]')).toBeVisible();
});
```

**Performance Tests (Lighthouse CI)**:
- **Core Web Vitals**: LCP < 2.5s, FID < 100ms, CLS < 0.1
- **Mobile Performance**: 4G simulation, device throttling
- **API Load Testing**: Artillery.js para endpoints críticos
- **Database Performance**: Query optimization, index effectiveness

**Security Tests**:
- **OWASP ZAP**: Automated security scanning
- **Dependency Audit**: npm audit, Snyk integration
- **Authentication Tests**: JWT validation, session hijacking
- **Input Validation**: SQL injection, XSS prevention

---

## 3. Modelo de Datos

### **3.1. Diagrama del modelo de datos:**

**📋 Modelo de Datos Relacional (PostgreSQL + UUIDs)**

El modelo sigue principios de normalización con separación clara de dominios: usuarios, contenido, gamificación, pagos y recomendaciones.

```mermaid
erDiagram
  User ||--o{ PracticeSession : has
  User ||--o{ Progress : has
  User ||--o{ UserBadge : earns
  User ||--o{ Subscription : holds
  User ||--o{ Payment : makes
  User ||--o{ RecommendationEvent : triggers
  User ||--o{ Referral : referrer
  User ||--o{ Referral : referred

  Referral ||--o{ ReferralReward : grants
  ReferralReward }o--|| User : granted_to

  Level ||--o{ Lesson : contains
  Lesson ||--o{ Exercise : contains

  Exercise ||--o{ Progress : is_completed_in
  Exercise ||--o{ ExerciseStyle : classified_by
  Exercise ||--o{ ExerciseTechnique : classified_by
  Style ||--o{ ExerciseStyle : maps
  Technique ||--o{ ExerciseTechnique : maps
  Exercise ||--o{ RecommendationEvent : appears_in

  BadgeRule ||--|| Badge : awards
  BadgeRule ||--o{ BadgeRuleEvent : logs
  BadgeRuleEvent }o--|| User : for

  Plan ||--o{ Subscription : includes
  Subscription }o--|| User : belongs_to
  Payment }o--|| User : made_by
  Payment }o--o{ Subscription : for

  User {
    uuid id PK
    string email UK
    string full_name
    string auth_provider
    string auth_uid UK
    string rank
    int xp
    string subscription_tier
    timestamptz created_at
    timestamptz updated_at
  }

  Level {
    uuid id PK
    string name
    text description
    int rank_order
    timestamptz created_at
    timestamptz updated_at
  }

  Lesson {
    uuid id PK
    uuid level_id FK
    string name
    text description
    int lesson_order
    timestamptz created_at
    timestamptz updated_at
  }

  Exercise {
    uuid id PK
    uuid lesson_id FK
    string name
    text description
    string video_url
    string tablature_url
    string guitar_pro_url
    boolean is_free
    string difficulty
    int duration_sec
    int exercise_order
    timestamptz created_at
    timestamptz updated_at
  }

  Style {
    uuid id PK
    string name UK
    text description
  }

  Technique {
    uuid id PK
    string name UK
    text description
  }

  Progress {
    uuid id PK
    uuid user_id FK
    uuid exercise_id FK
    timestamptz completed_at
    int xp_awarded
    string source
  }

  Badge {
    uuid id PK
    string code UK
    string name
    text description
    string icon_url
    int points
  }

  BadgeRule {
    uuid id PK
    string code UK
    string name
    string trigger_type
    jsonb trigger_params
    uuid badge_id FK
    boolean active
    timestamptz created_at
  }

  Plan {
    uuid id PK
    string code UK
    string name
    int price_cents
    string currency
    string billing_interval
    string status
    timestamptz created_at
  }

  Subscription {
    uuid id PK
    uuid user_id FK
    uuid plan_id FK
    string provider
    string status
    timestamptz current_period_start
    timestamptz current_period_end
    boolean cancel_at_period_end
    timestamptz created_at
  }

  Payment {
    uuid id PK
    uuid user_id FK
    uuid subscription_id FK
    string provider_payment_id UK
    int amount_cents
    string currency
    string status
    timestamptz created_at
  }
```


### **3.2. Descripción de entidades principales:**

**👤 Dominio de Usuarios**:

**`User`** - Entidad central del sistema
- `id` (UUID, PK): Identificador único del usuario
- `email` (VARCHAR(255), UK, NOT NULL): Email único para login
- `full_name` (VARCHAR(120), NULLABLE): Nombre completo del usuario
- `auth_provider` (ENUM: 'firebase','supabase'): Proveedor de autenticación
- `auth_uid` (VARCHAR(255), UK): UID del proveedor externo
- `rank` (ENUM: 'Meirakion','Hilotas','Hoplitas','Hippeisy','Espartano'): Rango actual
- `xp` (INT, DEFAULT 0): Puntos de experiencia acumulados
- `subscription_tier` (ENUM: 'free','pro'): Tier de suscripción (cache)
- `created_at`, `updated_at` (TIMESTAMPTZ): Auditoría temporal

**📚 Dominio de Contenido**:

**`Level`** - Niveles de dificultad (5 rangos espartanos)
- `id` (UUID, PK): Identificador del nivel
- `name` (VARCHAR(100), NOT NULL): Nombre del nivel (ej: "Meirakion")
- `description` (TEXT): Descripción del nivel y objetivos
- `rank_order` (INT, UK): Orden jerárquico (1-5)

**`Lesson`** - Lecciones dentro de cada nivel (20 por nivel)
- `id` (UUID, PK): Identificador de la lección
- `level_id` (UUID, FK → Level.id): Nivel padre
- `name` (VARCHAR(120), NOT NULL): Título de la lección
- `lesson_order` (INT): Orden dentro del nivel
- **Relación**: Level 1:N Lesson

**`Exercise`** - Ejercicios prácticos (10 por lección)
- `id` (UUID, PK): Identificador del ejercicio
- `lesson_id` (UUID, FK → Lesson.id): Lección padre
- `name` (VARCHAR(140), NOT NULL): Título del ejercicio
- `video_url` (VARCHAR(1024), NOT NULL): URL del video demostrativo
- `tablature_url` (VARCHAR(1024), NOT NULL): URL de la tablatura
- `guitar_pro_url` (VARCHAR(1024)): URL del archivo GPX (opcional)
- `is_free` (BOOLEAN, DEFAULT false): Acceso gratuito o premium
- `difficulty` (ENUM: 'beginner','intermediate','advanced'): Nivel de dificultad
- `duration_sec` (INT): Duración estimada en segundos
- `exercise_order` (INT): Orden dentro de la lección
- **Relación**: Lesson 1:N Exercise

**`Style`** y **`Technique`** - Taxonomías curatoriales
- `id` (UUID, PK): Identificador
- `name` (VARCHAR(80), UK): Nombre único (ej: "Blues", "Alternate Picking")
- `description` (TEXT): Descripción detallada
- **Relaciones**: Exercise M:N Style, Exercise M:N Technique (vía tablas junction)

**🎮 Dominio de Gamificación**:

**`Progress`** - Seguimiento de ejercicios completados
- `id` (UUID, PK): Identificador del progreso
- `user_id` (UUID, FK → User.id): Usuario que completó
- `exercise_id` (UUID, FK → Exercise.id): Ejercicio completado
- `completed_at` (TIMESTAMPTZ, NOT NULL): Timestamp de completación
- `xp_awarded` (INT, DEFAULT 10): XP otorgado por este ejercicio
- `source` (ENUM: 'manual','auto'): Origen del registro
- **Constraint**: UNIQUE(user_id, exercise_id) - Un ejercicio solo se completa una vez

**`Badge`** - Definición de insignias y logros
- `id` (UUID, PK): Identificador de la insignia
- `code` (VARCHAR(60), UK): Código único (ej: "first_lesson_complete")
- `name` (VARCHAR(120)): Nombre mostrado al usuario
- `description` (TEXT): Descripción del logro
- `icon_url` (VARCHAR(512)): URL del icono de la insignia
- `points` (INT, DEFAULT 0): Puntos de la insignia (puede ser negativo)

**`BadgeRule`** - Reglas automáticas para otorgar badges
- `id` (UUID, PK): Identificador de la regla
- `code` (VARCHAR(60), UK): Código de la regla
- `trigger_type` (ENUM): Tipo de trigger ('lesson_completed', 'streak_reached', etc.)
- `trigger_params` (JSONB): Parámetros de la regla (ej: {"lesson_count": 10})
- `badge_id` (UUID, FK → Badge.id): Badge a otorgar
- `active` (BOOLEAN, DEFAULT true): Regla activa/inactiva

**💳 Dominio de Monetización**:

**`Plan`** - Definición de planes de suscripción
- `id` (UUID, PK): Identificador del plan
- `code` (VARCHAR(50), UK): Código único (ej: "pro_monthly")
- `name` (VARCHAR(120)): Nombre comercial
- `price_cents` (INT, NOT NULL): Precio en centavos
- `currency` (CHAR(3), DEFAULT 'USD'): Moneda ISO
- `billing_interval` (ENUM: 'month','year'): Frecuencia de cobro
- `status` (ENUM: 'active','inactive'): Estado del plan

**`Subscription`** - Suscripciones activas de usuarios
- `id` (UUID, PK): Identificador de la suscripción
- `user_id` (UUID, FK → User.id): Usuario suscriptor
- `plan_id` (UUID, FK → Plan.id): Plan contratado
- `provider` (ENUM: 'stripe','paypal','appstore','playstore'): Proveedor de pago
- `status` (ENUM: 'active','past_due','canceled','incomplete'): Estado
- `current_period_start/end` (TIMESTAMPTZ): Período de facturación actual
- `cancel_at_period_end` (BOOLEAN): Cancelación programada
- **Relación**: User 1:N Subscription, Plan 1:N Subscription

**`Payment`** - Registro de transacciones
- `id` (UUID, PK): Identificador del pago
- `user_id` (UUID, FK → User.id): Usuario que pagó
- `subscription_id` (UUID, FK → Subscription.id): Suscripción relacionada
- `provider_payment_id` (VARCHAR(120), UK): ID del proveedor (Stripe/PayPal)
- `amount_cents` (INT, NOT NULL): Monto en centavos
- `currency` (CHAR(3)): Moneda de la transacción
- `status` (ENUM: 'succeeded','pending','failed','refunded'): Estado del pago

**🤖 Dominio de Recomendaciones**:

**`RecommendationEvent`** - Eventos para el motor de IA
- `id` (UUID, PK): Identificador del evento
- `user_id` (UUID, FK → User.id): Usuario que generó el evento
- `exercise_id` (UUID, FK → Exercise.id): Ejercicio involucrado
- `action` (ENUM: 'impression','click','like','skip'): Acción realizada
- `reason` (VARCHAR(255)): Contexto de la recomendación
- `occurred_at` (TIMESTAMPTZ): Timestamp del evento

**🔗 Restricciones y Índices Importantes**:
- **Índices compuestos**: (user_id, created_at), (exercise_id, difficulty)
- **Constraints CHECK**: xp >= 0, price_cents > 0, rank_order BETWEEN 1 AND 5
- **Foreign Keys**: Todas con ON DELETE CASCADE apropiado
- **Unique Constraints**: email, auth_uid, badge.code, plan.code
- **Partial Indexes**: WHERE is_free = false (ejercicios premium)

---

## 4. Especificación de la API

**📊 API RESTful - Endpoints Principales (Planificados)**

La API sigue principios REST con autenticación JWT y respuestas JSON estandarizadas.

### **4.1. Authentication API**

```yaml
/api/auth/verify:
  post:
    summary: Verificar token JWT de Supabase
    description: Valida token y retorna información del usuario
    security:
      - BearerAuth: []
    responses:
      200:
        description: Token válido
        content:
          application/json:
            schema:
              type: object
              properties:
                user:
                  type: object
                  properties:
                    id: { type: string, format: uuid }
                    email: { type: string }
                    subscription_tier: { type: string, enum: [free, pro] }
                    rank: { type: string }
                    xp: { type: integer }
      401:
        description: Token inválido o expirado
```

**Ejemplo de Petición**:
```bash
curl -X POST https://api.spartanguitargym.com/api/auth/verify \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Ejemplo de Respuesta**:
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "full_name": "Juan Pérez",
    "subscription_tier": "pro",
    "rank": "Hoplitas",
    "xp": 1250
  }
}
```

### **4.2. Progress API**

```yaml
/api/progress:
  post:
    summary: Marcar ejercicio como completado
    description: Registra progreso y otorga XP/badges automáticamente
    security:
      - BearerAuth: []
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required: [exercise_id]
            properties:
              exercise_id: { type: string, format: uuid }
              notes: { type: string, maxLength: 500 }
    responses:
      201:
        description: Progreso registrado exitosamente
        content:
          application/json:
            schema:
              type: object
              properties:
                progress_id: { type: string, format: uuid }
                xp_awarded: { type: integer }
                badges_unlocked: 
                  type: array
                  items:
                    type: object
                    properties:
                      id: { type: string }
                      name: { type: string }
                      points: { type: integer }
                user_stats:
                  type: object
                  properties:
                    total_xp: { type: integer }
                    current_rank: { type: string }
                    next_rank_progress: { type: number, format: float }
      409:
        description: Ejercicio ya completado anteriormente
      403:
        description: Ejercicio requiere suscripción Pro
```

**Ejemplo de Petición**:
```bash
curl -X POST https://api.spartanguitargym.com/api/progress \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "exercise_id": "123e4567-e89b-12d3-a456-426614174000",
    "notes": "Ejercicio completado sin dificultades"
  }'
```

**Ejemplo de Respuesta**:
```json
{
  "progress_id": "987fcdeb-51a2-43d1-b789-123456789abc",
  "xp_awarded": 15,
  "badges_unlocked": [
    {
      "id": "first_blues_exercise",
      "name": "Blues Beginner",
      "points": 50
    }
  ],
  "user_stats": {
    "total_xp": 1265,
    "current_rank": "Hoplitas",
    "next_rank_progress": 0.63
  }
}
```

### **4.3. Recommendations API**

```yaml
/api/recommendations/daily:
  get:
    summary: Obtener recomendaciones personalizadas
    description: Top 5 ejercicios recomendados basados en historial y preferencias
    security:
      - BearerAuth: []
    parameters:
      - name: limit
        in: query
        schema: { type: integer, minimum: 1, maximum: 10, default: 5 }
      - name: difficulty
        in: query
        schema: { type: string, enum: [beginner, intermediate, advanced] }
    responses:
      200:
        description: Lista de ejercicios recomendados
        content:
          application/json:
            schema:
              type: object
              properties:
                recommendations:
                  type: array
                  items:
                    type: object
                    properties:
                      exercise_id: { type: string, format: uuid }
                      title: { type: string }
                      difficulty: { type: string }
                      duration_sec: { type: integer }
                      styles: { type: array, items: { type: string } }
                      techniques: { type: array, items: { type: string } }
                      reason: { type: string }
                      confidence_score: { type: number, format: float }
                      is_free: { type: boolean }
                generated_at: { type: string, format: date-time }
                algorithm_version: { type: string }
```

**Ejemplo de Petición**:
```bash
curl -X GET "https://api.spartanguitargym.com/api/recommendations/daily?limit=3&difficulty=intermediate" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Ejemplo de Respuesta**:
```json
{
  "recommendations": [
    {
      "exercise_id": "456e7890-e12b-34d5-a678-901234567def",
      "title": "Blues Scale Pattern 1 - A Minor",
      "difficulty": "intermediate",
      "duration_sec": 180,
      "styles": ["Blues", "Rock"],
      "techniques": ["Scale Playing", "Alternate Picking"],
      "reason": "Based on your recent blues practice and skill level",
      "confidence_score": 0.87,
      "is_free": false
    },
    {
      "exercise_id": "789a0123-b45c-67d8-e901-234567890abc",
      "title": "Chord Transition: Am to F",
      "difficulty": "intermediate",
      "duration_sec": 120,
      "styles": ["Folk", "Pop"],
      "techniques": ["Chord Changes", "Strumming"],
      "reason": "Improve chord transitions based on your progress",
      "confidence_score": 0.79,
      "is_free": true
    }
  ],
  "generated_at": "2024-01-15T10:30:00Z",
  "algorithm_version": "v1.2.0"
}
```

**🔐 Autenticación y Seguridad**:
- **Bearer Token**: JWT de Supabase en header `Authorization`
- **Rate Limiting**: 100 requests/15min por IP
- **CORS**: Configurado para dominios autorizados
- **Validation**: Joi schemas para todos los inputs
- **Error Handling**: Respuestas consistentes con códigos HTTP estándar

---

## 5. Historias de Usuario

**📋 Estado Actual**: Las historias de usuario han sido definidas y creadas en Jira como parte del backlog del MVP. A continuación se presentan 3 historias principales ya documentadas:

**Historia de Usuario 1: Registro y Autenticación**
- **ID**: CCS-28
- **Como** guitarrista principiante
- **Quiero** registrarme con email/contraseña o Google/Apple
- **Para que** pueda acceder de forma segura a la plataforma y empezar mi práctica
- **Criterios de Aceptación**:
  - Registro exitoso con email válido
  - Login con credenciales correctas
  - Integración OAuth funcional
  - Redirección al dashboard tras autenticación
- **Prioridad**: High
- **Labels**: frontend, backend, auth

**Historia de Usuario 2: Completar Ejercicio Diario**
- **ID**: CCS-32
- **Como** usuario registrado
- **Quiero** completar el ejercicio recomendado del día
- **Para que** pueda mejorar mis habilidades y ganar XP
- **Criterios de Aceptación**:
  - Visualizar video y tablatura sincronizados
  - Marcar ejercicio como completado
  - Recibir XP y posibles badges
  - Actualizar progreso en dashboard
- **Prioridad**: High
- **Labels**: frontend, backend, gamification

**Historia de Usuario 3: Upgrade a Suscripción Pro**
- **ID**: CCS-35
- **Como** usuario gratuito
- **Quiero** suscribirme al plan Pro
- **Para que** pueda acceder a todo el contenido premium
- **Criterios de Aceptación**:
  - Proceso de checkout con Stripe
  - Activación inmediata de beneficios Pro
  - Acceso a ejercicios premium
  - Confirmación por email
- **Prioridad**: High
- **Labels**: payments, frontend, backend

*📌 Nota: El backlog completo con 15+ historias de usuario está disponible en Jira (proyecto CCS).*

---

## 6. Tickets de Trabajo

**🎫 Estado Actual**: Los tickets técnicos han sido creados en Jira con especificaciones detalladas. A continuación 3 tickets críticos ya definidos:

**Ticket 1: Backend - PostgreSQL + Docker Setup (CCS-41)**
- **Tipo**: Task
- **Prioridad**: Highest
- **Story Points**: 8
- **Descripción**: Configurar infraestructura de base de datos local con Docker para desarrollo
- **Tareas Técnicas**:
  - Crear `docker-compose.yml` con PostgreSQL 15 + Redis
  - Implementar migraciones iniciales con schema UUID-based
  - Configurar seeds con datos de prueba (usuarios, niveles, ejercicios)
  - Scripts de setup y verificación de conexión
  - Documentar variables de entorno requeridas
- **Criterios de Aceptación**:
  - `docker-compose up -d` levanta servicios correctamente
  - Migraciones ejecutan sin errores
  - Seeds populan datos de prueba
  - Conexión verificable desde aplicaciones
- **Labels**: infrastructure, database, docker

**Ticket 2: Frontend - Dashboard Base React/Next.js (CCS-43)**
- **Tipo**: Task
- **Prioridad**: High
- **Story Points**: 13
- **Descripción**: Crear estructura base del frontend con Next.js y componentes principales
- **Tareas Técnicas**:
  - Setup Next.js 14 con App Router
  - Configurar Tailwind CSS y componentes UI base
  - Implementar layout principal con navegación
  - Crear páginas: Dashboard, Login, Ejercicios
  - Integrar Supabase Auth SDK
  - Setup de Context para estado global
- **Criterios de Aceptación**:
  - Aplicación renderiza correctamente
  - Navegación funcional entre páginas
  - Responsive design básico
  - Autenticación integrada
- **Labels**: frontend, react, nextjs, ui

**Ticket 3: Backend - API Service Node.js/Express (CCS-42)**
- **Tipo**: Task
- **Prioridad**: High
- **Story Points**: 13
- **Descripción**: Desarrollar API REST principal con autenticación y endpoints básicos
- **Tareas Técnicas**:
  - Setup Express.js con TypeScript
  - Middleware de autenticación JWT (Supabase)
  - Endpoints: /auth, /exercises, /progress, /users
  - Integración con PostgreSQL (Prisma ORM)
  - Validación de requests (Joi/Zod)
  - Rate limiting y CORS
  - Health checks y logging
- **Criterios de Aceptación**:
  - API responde correctamente a requests autenticados
  - Validación de inputs funcional
  - Integración DB sin errores
  - Rate limiting activo
- **Labels**: backend, api, nodejs, express

*📌 Nota: 40+ tickets técnicos adicionales están documentados en Jira con especificaciones completas.*

---

## 7. Pull Requests

**🚧 Estado Actual**: El proyecto está en fase de planificación y setup inicial. Los Pull Requests se documentarán una vez que comience el desarrollo activo.

**📋 Proceso Planificado de Pull Requests**:

**Estructura de Branches**:
- `main`: Producción estable
- `develop`: Integración de features
- `feature/*`: Desarrollo de funcionalidades
- `hotfix/*`: Correcciones críticas

**Template de PR (Planificado)**:
```markdown
## 📝 Descripción
Breve descripción de los cambios realizados

## 🎯 Tipo de cambio
- [ ] Bug fix
- [ ] Nueva funcionalidad
- [ ] Breaking change
- [ ] Documentación

## 🧪 Testing
- [ ] Tests unitarios actualizados
- [ ] Tests de integración passing
- [ ] Testing manual completado

## 📋 Checklist
- [ ] Código revisado y limpio
- [ ] Documentación actualizada
- [ ] Sin conflictos de merge
- [ ] CI/CD pipeline passing
```

**Proceso de Review**:
- Mínimo 1 reviewer requerido
- Checks automáticos: linting, tests, build
- Deploy automático a preview (Vercel)
- Merge solo con approval + CI passing

*📌 Nota: Los PRs reales se documentarán aquí una vez iniciado el desarrollo.*