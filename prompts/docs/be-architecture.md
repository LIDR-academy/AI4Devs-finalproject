# Backend Architecture Documentation - ShopMefy Platform

**Generated on**: December 2024  
**Project**: AI4Devs Final Project - ShopMefy  
**Architecture Pattern**: Domain-Driven Design (DDD)  
**Technology Stack**: Node.js + TypeScript + Express + Prisma + PostgreSQL  
**Requested by**: Andrea  

---

## 🏗️ Technology Stack Overview

### Core Technologies
- **Node.js**: JavaScript runtime for server-side development
- **TypeScript 5.3.3**: Type-safe JavaScript with advanced type inference
- **Express 4.18.2**: Fast, unopinionated web framework for Node.js
- **Prisma 5.22.0**: Next-generation ORM with type safety
- **PostgreSQL**: Robust, open-source relational database

### AI & Language Processing
- **LangChain 0.3.27**: Framework for developing LLM applications
- **OpenAI 4.29.0**: Integration with OpenAI GPT models
- **@langchain/openai 0.5.11**: OpenAI integration for LangChain
- **@langchain/community 0.3.45**: Community integrations for LangChain

### Security & Authentication
- **bcrypt 5.1.1**: Password hashing library
- **jsonwebtoken 9.0.2**: JWT token implementation
- **helmet 8.1.0**: Security middleware for Express
- **express-rate-limit 7.1.5**: Rate limiting middleware

### File Processing & Storage
- **multer 1.4.5**: Middleware for handling multipart/form-data
- **pdf-parse 1.1.1**: PDF text extraction
- **file-type 18.7.0**: File type detection
- **aws-sdk 2.1692.0**: AWS services integration

### Validation & Utilities
- **zod 3.22.4**: TypeScript-first schema validation
- **express-validator 7.0.1**: Express middleware for validation
- **sanitize-filename 1.6.3**: Filename sanitization

---

## 🚀 Scripts e Comandi Disponibili

### Development Scripts

```bash
# Sviluppo e avvio server
npm run dev              # Avvia server sviluppo con hot reload (ts-node-dev)
npm run start            # Avvia server produzione (node dist/index.js)
npm run build            # Compila TypeScript in JavaScript (dist/)

# Testing completo
npm run test             # Esegue tutti i test (unit + integration)
npm run test:unit        # Esegue solo test unitari
npm run test:integration # Esegue solo test di integrazione
npm run test:chatbot     # Test specifici per chatbot AI

# Database management
npm run db:reset         # Reset completo database (migrate reset + deploy)
npm run db:seed          # Popola database con dati di test
npm run db:setup         # Setup completo (reset + seed)
npm run db:generate      # Genera Prisma client da schema
npm run db:push          # Push schema al database (dev only)
```

### Script di Testing Dettagliati

#### Test Unitari
```bash
# Test base
npm run test:unit                    # Tutti i test unitari
npm run test:unit -- --verbose      # Output dettagliato
npm run test:unit -- --coverage     # Coverage report

# Test specifici
npm run test:unit -- __tests__/unit/controllers/
npm run test:unit -- --testNamePattern="ProductController"
```

#### Test di Integrazione
```bash
# Test integrazione completi
npm run test:integration             # Tutti i test di integrazione
npm run test:integration -- --verbose # Output dettagliato

# Test specifici per modulo
npm run test:integration -- __tests__/integration/product.integration.test.ts
npm run test:integration -- __tests__/integration/auth.integration.test.ts
npm run test:integration -- __tests__/integration/faq.integration.test.ts
```

#### Test Chatbot AI
```bash
# Test AI specifici
npm run test:chatbot                 # Test chatbot completi
npm run test:chatbot -- --verbose   # Output dettagliato con log AI

# Test singoli scenari
npm run test:chatbot -- --testNamePattern="should handle product queries"
npm run test:chatbot -- --testNamePattern="should process document search"
```

### Comandi Database Avanzati

#### Gestione Schema e Migrazioni
```bash
# Sviluppo schema
npm run db:generate                  # Genera client Prisma
npm run db:push                      # Push schema (solo dev)
npx prisma db pull                   # Pull schema da database esistente

# Migrazioni produzione
npx prisma migrate dev               # Crea nuova migrazione
npx prisma migrate deploy            # Deploy migrazioni in produzione
npx prisma migrate reset             # Reset migrazioni (ATTENZIONE!)

# Visualizzazione e debug
npx prisma studio                    # Apre Prisma Studio (GUI database)
npx prisma db seed                   # Esegue seed manualmente
```

#### Backup e Restore Database
```bash
# Backup database
pg_dump -h localhost -U postgres shopmefy > backup.sql

# Restore database
psql -h localhost -U postgres shopmefy < backup.sql

# Export dati specifici
npx prisma db execute --file export-products.sql
```

### Comandi di Sviluppo Avanzati

```bash
# Installazione e dipendenze
npm install                          # Installa dipendenze
npm ci                              # Clean install (CI/CD)
npm audit                           # Controllo vulnerabilità
npm outdated                        # Dipendenze obsolete

# Debug e logging
npm run dev -- --inspect           # Debug mode con inspector
npm run dev -- --trace-warnings    # Trace Node.js warnings
NODE_ENV=development npm run dev    # Modalità development esplicita

# Build e produzione
npm run build                       # Build TypeScript
npm run start                       # Avvia server produzione
NODE_ENV=production npm run start   # Produzione esplicita
```

---

## 🏛️ Domain-Driven Design (DDD) Architecture

### DDD Layers Overview

```
src/
├── domain/                 # Domain Layer (Business Logic)
├── application/            # Application Layer (Use Cases)
├── infrastructure/         # Infrastructure Layer (External Concerns)
├── controllers/            # Presentation Layer (HTTP Controllers)
├── routes/                 # API Route Definitions
├── middlewares/            # Cross-cutting Concerns
└── types/                  # Shared Type Definitions
```

---

## 📁 Detailed Folder Structure & Architecture

### `/src/domain` - Domain Layer (Core Business Logic)

```
domain/
├── entities/               # Domain Entities (Business Objects)
│   ├── Product.ts         # Product business entity
│   ├── FAQ.ts             # FAQ business entity
│   ├── Document.ts        # Document business entity
│   ├── Service.ts         # Service business entity
│   └── User.ts            # User business entity
├── valueObjects/          # Value Objects (Immutable Values)
│   ├── Email.ts           # Email value object
│   ├── Price.ts           # Price value object
│   └── ProductId.ts       # Product identifier
├── repositories/          # Repository Interfaces (Data Access Contracts)
│   ├── IProductRepository.ts
│   ├── IFAQRepository.ts
│   ├── IDocumentRepository.ts
│   └── IServiceRepository.ts
├── services/              # Domain Services (Business Logic)
│   ├── ProductDomainService.ts
│   ├── FAQDomainService.ts
│   └── DocumentDomainService.ts
├── events/                # Domain Events
│   ├── ProductCreated.ts
│   ├── DocumentUploaded.ts
│   └── FAQUpdated.ts
├── dto/                   # Data Transfer Objects
│   ├── ProductDTO.ts
│   ├── FAQDTO.ts
│   └── DocumentDTO.ts
└── interfaces/            # Domain Interfaces
    ├── IEmailService.ts
    ├── IFileService.ts
    └── IAIService.ts
```

### `/src/application` - Application Layer (Use Cases)

```
application/
├── useCases/              # Application Use Cases
│   ├── product/
│   │   ├── CreateProductUseCase.ts
│   │   ├── UpdateProductUseCase.ts
│   │   ├── DeleteProductUseCase.ts
│   │   └── GetProductsUseCase.ts
│   ├── faq/
│   │   ├── CreateFAQUseCase.ts
│   │   ├── UpdateFAQUseCase.ts
│   │   └── GetFAQsUseCase.ts
│   ├── document/
│   │   ├── UploadDocumentUseCase.ts
│   │   ├── ProcessDocumentUseCase.ts
│   │   └── GetDocumentsUseCase.ts
│   └── chatbot/
│       ├── ProcessQueryUseCase.ts
│       └── GenerateResponseUseCase.ts
└── services/              # Application Services
    ├── ProductApplicationService.ts
    ├── FAQApplicationService.ts
    ├── DocumentApplicationService.ts
    └── ChatbotApplicationService.ts
```

### `/src/infrastructure` - Infrastructure Layer (External Concerns)

```
infrastructure/
├── repositories/          # Repository Implementations
│   ├── PrismaProductRepository.ts
│   ├── PrismaFAQRepository.ts
│   ├── PrismaDocumentRepository.ts
│   └── PrismaServiceRepository.ts
├── events/                # Event Handlers
│   ├── ProductEventHandler.ts
│   ├── DocumentEventHandler.ts
│   └── EmailEventHandler.ts
├── external/              # External Service Integrations
│   ├── OpenAIService.ts
│   ├── AWSService.ts
│   └── EmailService.ts
└── persistence/           # Database Configuration
    ├── PrismaClient.ts
    └── migrations/
```

### `/src/controllers` - Presentation Layer (HTTP Controllers)

```
controllers/
├── ProductController.ts    # Product HTTP endpoints
├── FAQController.ts        # FAQ HTTP endpoints
├── DocumentController.ts   # Document HTTP endpoints
├── ServiceController.ts    # Service HTTP endpoints
├── ChatbotController.ts    # Chatbot HTTP endpoints
└── AuthController.ts       # Authentication endpoints
```

### `/src/routes` - API Route Definitions

```
routes/
├── productRoutes.ts       # Product API routes
├── faqRoutes.ts          # FAQ API routes
├── documentRoutes.ts     # Document API routes
├── serviceRoutes.ts      # Service API routes
├── chatbotRoutes.ts      # Chatbot API routes
├── authRoutes.ts         # Authentication routes
└── index.ts              # Route aggregation
```

---

## 🧪 Testing Architecture Completa

### Configurazione Testing

#### Jest Configuration (`jest.config.js`)
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/__tests__'],
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.spec.ts'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts']
}
```

### Test Structure Dettagliata

#### Unit Tests
```
__tests__/
├── unit/                  # Test unitari
│   ├── controllers/
│   │   ├── ProductController.test.ts    # Test controller prodotti
│   │   ├── FAQController.test.ts        # Test controller FAQ
│   │   ├── DocumentController.test.ts   # Test controller documenti
│   │   ├── ServiceController.test.ts    # Test controller servizi
│   │   └── ChatbotController.test.ts    # Test controller chatbot
│   ├── services/
│   │   ├── ProductService.test.ts       # Test servizi prodotti
│   │   ├── FAQService.test.ts           # Test servizi FAQ
│   │   ├── AIService.test.ts            # Test servizi AI
│   │   └── AuthService.test.ts          # Test servizi auth
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── Product.test.ts          # Test entità prodotto
│   │   │   ├── FAQ.test.ts              # Test entità FAQ
│   │   │   └── Document.test.ts         # Test entità documento
│   │   ├── valueObjects/
│   │   │   ├── Email.test.ts            # Test value object email
│   │   │   └── Price.test.ts            # Test value object prezzo
│   │   └── services/
│   │       ├── ProductDomainService.test.ts
│   │       └── FAQDomainService.test.ts
│   └── utils/
│       ├── validators.test.ts           # Test validatori
│       ├── formatters.test.ts           # Test formattatori
│       └── helpers.test.ts              # Test helper functions
```

#### Integration Tests
```
__tests__/
├── integration/           # Test di integrazione
│   ├── api/
│   │   ├── product.integration.test.ts  # Test API prodotti
│   │   ├── faq.integration.test.ts      # Test API FAQ
│   │   ├── document.integration.test.ts # Test API documenti
│   │   ├── service.integration.test.ts  # Test API servizi
│   │   ├── auth.integration.test.ts     # Test API auth
│   │   └── profile.integration.test.ts  # Test API profilo
│   ├── database/
│   │   ├── product.db.test.ts           # Test database prodotti
│   │   ├── faq.db.test.ts               # Test database FAQ
│   │   └── document.db.test.ts          # Test database documenti
│   ├── external-services/
│   │   ├── openai.integration.test.ts   # Test integrazione OpenAI
│   │   ├── aws.integration.test.ts      # Test integrazione AWS
│   │   └── email.integration.test.ts    # Test integrazione email
│   └── chatbot-questions.integration.test.ts # Test chatbot completo
├── fixtures/              # Dati di test
│   ├── products.json      # Dati prodotti test
│   ├── faqs.json          # Dati FAQ test
│   ├── users.json         # Dati utenti test
│   └── documents.json     # Dati documenti test
└── setup.ts               # Setup globale test
```

### Comandi di Testing Specifici

#### Unit Testing Avanzato
```bash
# Test base
npm run test:unit                       # Tutti i test unitari
npm run test:unit -- --watch           # Watch mode
npm run test:unit -- --coverage        # Con coverage

# Test specifici per modulo
npm run test:unit -- __tests__/unit/controllers/
npm run test:unit -- __tests__/unit/services/
npm run test:unit -- __tests__/unit/domain/

# Test singoli file
npm run test:unit -- ProductController.test.ts
npm run test:unit -- --testNamePattern="should create product"

# Debug test
npm run test:unit -- --verbose         # Output dettagliato
npm run test:unit -- --detectOpenHandles # Debug memory leaks
```

#### Integration Testing Avanzato
```bash
# Test integrazione completi
npm run test:integration               # Tutti i test integrazione
npm run test:integration -- --runInBand # Sequenziale (no parallel)

# Test API specifici
npm run test:integration -- product.integration.test.ts
npm run test:integration -- auth.integration.test.ts
npm run test:integration -- chatbot-questions.integration.test.ts

# Test con setup database
NODE_ENV=test npm run db:setup && npm run test:integration

# Debug integrazione
npm run test:integration -- --verbose
npm run test:integration -- --forceExit # Forza uscita
```

#### Chatbot Testing Specifico
```bash
# Test AI completi
npm run test:chatbot                   # Test chatbot specifici
npm run test:chatbot -- --verbose     # Con log AI dettagliati

# Test scenari specifici
npm run test:chatbot -- --testNamePattern="product queries"
npm run test:chatbot -- --testNamePattern="document search"
npm run test:chatbot -- --testNamePattern="FAQ responses"

 
```

### Test Utilities e Setup

#### Setup Tests (`__tests__/setup.ts`)
```typescript
import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'

const prisma = new PrismaClient()

beforeAll(async () => {
  // Setup database test
  process.env.NODE_ENV = 'test'
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/shopmefy_test'
  
  // Reset database
  execSync('npm run db:reset', { stdio: 'inherit' })
  
  // Seed test data
  execSync('npm run db:seed', { stdio: 'inherit' })
})

afterAll(async () => {
  await prisma.$disconnect()
})

beforeEach(async () => {
  // Cleanup tra test se necessario
})
```

#### Test Utilities
```typescript
// __tests__/utils/testHelpers.ts
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

export const createTestUser = async (prisma: PrismaClient) => {
  return await prisma.user.create({
    data: {
      email: 'test@example.com',
      password: 'hashedpassword',
      name: 'Test User'
    }
  })
}

export const generateTestToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '1h' })
}

export const cleanupDatabase = async (prisma: PrismaClient) => {
  await prisma.document.deleteMany()
  await prisma.faq.deleteMany()
  await prisma.product.deleteMany()
  await prisma.user.deleteMany()
}
```

---

## 🗄️ Database Architecture

### Prisma Schema Structure

#### Schema Configuration (`prisma/schema.prisma`)
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  products  Product[]
  faqs      FAQ[]
  documents Document[]
  services  Service[]
  
  @@map("users")
}

model Product {
  id          String   @id @default(cuid())
  name        String
  description String?
  price       Float
  imageUrl    String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  
  @@map("products")
}

// Altri modelli...
```

### Database Management Commands

#### Migrazioni e Schema
```bash
# Sviluppo schema
npx prisma migrate dev --name "add_products_table"    # Nuova migrazione
npx prisma migrate dev --create-only                  # Crea migrazione senza applicare
npx prisma migrate deploy                             # Deploy in produzione

# Gestione schema
npx prisma db push                                    # Push schema (solo dev)
npx prisma db pull                                    # Pull da database esistente
npx prisma generate                                   # Genera client

# Reset e cleanup
npx prisma migrate reset                              # Reset completo
npx prisma db execute --file cleanup.sql             # Esegui SQL custom
```

#### Seeding Database
```bash
# Seed automatico
npm run db:seed                                       # Esegue prisma/seed.ts

# Seed manuale
npx prisma db seed                                    # Diretto Prisma
NODE_ENV=development npm run db:seed                  # Seed development
NODE_ENV=test npm run db:seed                         # Seed test
```

#### Database Utilities
```bash
# Visualizzazione
npx prisma studio                                     # GUI database
npx prisma db execute --file query.sql               # Esegui query

# Backup e restore
pg_dump shopmefy > backup_$(date +%Y%m%d).sql        # Backup
psql shopmefy < backup_20241201.sql                  # Restore

# Monitoring
npx prisma db execute --file "SELECT * FROM _prisma_migrations;" # Stato migrazioni
```

---

## 🔐 Security Implementation

### Authentication & Authorization
```bash
# Test autenticazione
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Test con token
curl -X GET http://localhost:3000/api/products \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Security Testing
```bash
# Test rate limiting
for i in {1..10}; do curl http://localhost:3000/api/auth/login; done

# Test input validation
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"<script>alert(1)</script>"}'
```

---

## 🚀 API Documentation

### Swagger/OpenAPI
```bash
# Genera documentazione
npm run build && node dist/swagger.js              # Genera swagger-schema.json

# Accesso documentazione
# http://localhost:3000/api-docs                   # Swagger UI
```

### API Testing
```bash
# Test endpoint base
curl http://localhost:3000/api/health             # Health check
curl http://localhost:3000/api/products           # Lista prodotti
curl http://localhost:3000/api/faqs               # Lista FAQ

# Test CRUD completo
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"name":"Test Product","price":99.99}'
```

---

## 🔄 AI Integration Architecture

### LangChain Testing
```bash
# Test AI locale
npm run test:chatbot -- --testNamePattern="AI service"

 

# Debug AI responses
NODE_ENV=development npm run dev  # Log AI dettagliati
```

### AI Development Commands
```bash
# Test query AI
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What products do you have?"}'

# Test document search
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What is IMO?"}'
```

---

## 📊 Monitoring & Logging

### Logging Commands
```bash
# Log in tempo reale
tail -f logs/application.log                      # Log applicazione
tail -f logs/error.log                           # Solo errori
tail -f logs/ai.log                              # Log AI specifici

# Analisi log
grep "ERROR" logs/application.log                # Filtra errori
grep "AI_SERVICE" logs/application.log           # Log AI
```

### Performance Monitoring
```bash
# Monitoring memoria
node --inspect dist/index.js                     # Debug inspector
npm run dev -- --trace-warnings                 # Trace warnings

# Profiling
node --prof dist/index.js                        # Profiling V8
node --prof-process isolate-*.log                # Analisi profiling
```

---

## 🚀 Development & Deployment

### Environment Setup
```bash
# Setup completo sviluppo
cp .env.example .env                              # Copia configurazione
npm install                                       # Installa dipendenze
npm run db:setup                                 # Setup database
npm run build                                     # Build iniziale
npm run dev                                       # Avvia sviluppo
```

### Production Deployment
```bash
# Build produzione
npm run build                                     # Compila TypeScript
npm run test                                      # Test finali
npm run db:deploy                                 # Deploy migrazioni

# Avvio produzione
NODE_ENV=production npm run start                 # Server produzione
PM2_HOME=/var/pm2 pm2 start dist/index.js        # Con PM2
```

### Docker Commands
```bash
# Build immagine
docker build -t shopmefy-backend .               # Build immagine

# Run container
docker run -p 3000:3000 shopmefy-backend         # Avvia container
docker-compose up -d                              # Con docker-compose
```

---

## 🔧 Troubleshooting Commands

### Debug Common Issues
```bash
# Database connection
npx prisma db execute --file "SELECT 1;"         # Test connessione
npm run db:reset && npm run db:seed              # Reset completo

# Dependencies issues
rm -rf node_modules package-lock.json            # Pulizia dipendenze
npm ci                                            # Reinstall clean

# TypeScript issues
npx tsc --noEmit                                  # Check TypeScript
npm run build                                     # Build completo

# Test issues
NODE_ENV=test npm run db:setup                   # Setup test DB
npm run test -- --detectOpenHandles              # Debug memory leaks
```

### Performance Issues
```bash
# Memory profiling
node --inspect --max-old-space-size=4096 dist/index.js

# Database performance
npx prisma db execute --file "EXPLAIN ANALYZE SELECT * FROM products;"

# API performance
curl -w "@curl-format.txt" http://localhost:3000/api/products
```

---

**Last Updated**: December 2024  
**Maintained by**: AI Assistant  
**Contact**: Andrea for questions and updates 