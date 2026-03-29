# Tech Stack & Dependencies

## Project Structure
Monorepo using Docker Compose for orchestration.

## Modules

### Backend API (`apps/backend`)
*   **Runtime:** Node.js (v20+)
*   **Language:** TypeScript
*   **Framework:** Express.js
*   **Database ORM:** Prisma
*   **Validation:** Zod
*   **Auth:** JWT, Bcrypt
*   **Async Processing:** BullMQ (Producer)
*   **Real-time:** Socket.io
*   **Documentation:** OpenAPI / Swagger (Required)

### Frontend (`apps/frontend`)
*   **Framework:** Nuxt 3 (Vue 3)
*   **State Management:** Pinia
*   **Styling:** Tailwind CSS, HeadlessUI
*   **Icons:** Heroicons
*   **Real-time:** Socket.io Client
*   **Language:** TypeScript

### Worker Service (`apps/worker`)
*   **Runtime:** Node.js
*   **Language:** TypeScript
*   **Queue Consumer:** BullMQ
*   **Image Processing:** Sharp
*   **PDF Processing:** Ghostscript (ghostscript-node)
*   **Database Access:** Prisma (Shared schema)

## Infrastructure
*   **Database:** PostgreSQL 15
*   **Cache/Queue:** Redis 7
*   **Storage:** MinIO (S3 Compatible)
*   **Orchestration:** Docker Compose
