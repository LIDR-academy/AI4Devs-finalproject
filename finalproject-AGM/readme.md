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

### **0.1. Tu nombre completo:** Albert Giménez Morales

### **0.2. Nombre del proyecto:** PatitasFelices

### **0.3. Descripción breve del proyecto:** PatitasFelices es una plataforma para conectar adoptantes con refugios de animales, donde los refugios puede publicar los animales que tienen en adopción y los adoptantes pueden buscar y solicitar adopción, incluyendo búsquedas y recomendaciones personalizadas según sus preferencias y estilo de vida.

### **0.4. URL del proyecto:**

https://patitasfelices.es

### 0.5. URL o archivo comprimido del repositorio

https://github.com/alghimo/patitas-felices

(repo privado, Jorge tiene acceso)

---

## 0.6. Estado Actual del Proyecto ✅

**Última Actualización:** 3 de Marzo 2026
**Estado:** 🟢 MVP Desplegado en producción, funcionando. Actualmente haciendo las adaptaciones necesarias para crear la app de Mobile.
**Tasa de Éxito en Pruebas:** 100% (63 de test unitarios y 50 pruebas E2E adicionales)

### Sistema Implementado

Patitas Felices está completamente operativo con las funcionalidades core del MVP implementadas y verificadas, incluyendo el registro de refugios, publicación de animales, visualización pública con recomendaciones personalizadas y opciones de adopción, así como un panel completo de administración.

### Arquitectura Técnica

- **Backend / API:** NextJS 16 (API Routes + Turborepo para el monorepo)
- **Base de Datos:** Postgres (Supabase) manejada con Prisma ORM
- **Autenticación:** Supabase Auth
- **Email:** Resend
- **Frontend:** NextJS (App Router)
- **Testing:** Vitest (unit) + Playwright (e2e)
- **Almacenamiento:** Supabase Storage
- **Upstash Redis:** Para rate limiting, futuro uso para caching
- **Despliege:** Vercel

### Verificación y Testing

**Cobertura de Pruebas:**
- ✅ 63 ficheros de pruebas funcionales y unitarias (`*.test.ts`) pasando con Vitest.
- ✅ 50 ficheros de pruebas completas end-to-end (`*.spec.ts`) pasando de manera continua con Playwright.

---

## 1. Descripción general del producto

Patitas Felices es una plataforma integral para conectar a adoptantes con múltiples refugios de animales. Sus opciones abarcan el descubrimiento de animales basado en filtros avanzados por especie, edad, tamaño y perfiles de compatibilidad garantizando que haya match con preferencias (algoritmos del panel de favoritos y recomendaciones "Para mí"). Además provee a las protectoras de un dashboard para su gestión privada.

## 2. Arquitectura del sistema

Cuenta con un backend RESTful mediante NextJS, sirviendo actualmente el Frontend también con Next y Server Components (Next.js App Router). Se ha adoptado un modelo Monorepo (Turborepo) separando paquetes compartidos de dominio (`packages/shared`), base de datos (`packages/database`) y las aplicaciones (`apps/web`, `apps/api`), preparándose desde una perspectiva API-First para portar las funcionalidades a una App móvil sin problemas.

## 3. Modelo de datos

La base de datos se maneja a través de PostgreSQL mediante Prisma. Sus principales entidades se dividen en los apartados de:
- **Protectoras y Ubicación** (Shelters/Locations).
- **Animales e Imágenes** (Animals, AnimalImages, atributos de salud y compatibilidad).
- **Adoptantes y Preferencias de Perfil** (Users, Favorites, Recommendations).
Todos los modelos de datos y la implementación completa se ubican bajo el paquete compartido `packages/database/prisma/schema.prisma` dentro del [repositorio privado](https://github.com/alghimo/patitas-felices).

## 4. Especificación de la API

Los endpoints (NextJS API Routes en `apps/api`) y la estructura RESTful del sistema han sido especificadas al dedillo en el repo privado. Las referencias son:
- Fichero autogenerado de la API: [`apps/api/openapi.yaml`](https://github.com/alghimo/patitas-felices/blob/main/apps/api/openapi.yaml)
- Documentación y especificación conceptual: [`memory-bank/others/API_SPECIFICATION.md`](https://github.com/alghimo/patitas-felices/blob/main/memory-bank/others/API_SPECIFICATION.md)

## 5. Historias de usuario

Los diferentes roles funcionales incluyen: Visitantes Anónimos, Adoptantes (Usuarios con preferencias), Responsables de Refugios (Usuarios verificados y atados a organización) y los Administradores Globales. El desglose pormenorizado se ha manejado a nivel issue como User Stories atadas a épicas en el plan general, con iteraciones trazables a funcionalidades puras de cara al diseño MVC general (recogido en `memory-bank/`).

## 6. Tickets de trabajo

Todo el ciclo de vida del proyecto, desde las bases estructuradas y el MVP hasta las ampliaciones y estabilizaciones cuenta con **190 tickets definidos** en un esquema de fases sucesivas (`Phase 0` a `Phase 7`).
- Todas las fases y prioridades de trabajo se reflejan y pueden comprobarse tabuladas en el documento de requerimientos centralizado: [`memory-bank/TICKETS.md`](https://github.com/alghimo/patitas-felices/blob/main/memory-bank/TICKETS.md)
- Las fases incluyen: *Setup de autenticación (0), Manejo UI y Backend de Usuarios y de Animales (1 y 2), Búsqueda Pública, Búsqueda Personalizada y Caching (3 y 4), Panel Admin (5), Pruebas y estabilización globales E2E (6) y Migración API/Mobile First (7).*

## 7. Pull requests

El flujo de trabajo ha sido, en cuanto a pull requests:
- Trabajar sobre un feature branch con el id del ticket, por ejemplo `feature/123-feature-description`
- PR a `dev`.
- Una vez revisado, aprobado y testeado, se hace merge a dev y se crea un PR de `dev` a `master`. Esto despliega a pre-producción (preview).
- Finalmente, cuando se considera estable, se hace merge a `master` y se despliega a producción automáticamente.
- El repo tiene 223 PRs cerradas para 166 issues cerrados.
- Una descripión detallada del flujo de trabajo se encuentra en [workflow.md](workflow.md).
