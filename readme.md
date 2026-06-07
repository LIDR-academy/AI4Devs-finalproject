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
Pedro San Román Pacheco

### **0.2. Nombre del proyecto:**
Aura Planning

### **0.3. Descripción breve del proyecto:**
Aura Planning is a SaaS platform that replaces paper wedding invitations with an interactive digital ecosystem. It combines customizable invitation design, centralized guest management with real-time RSVP tracking, and a **Live Guest Journey** — real-time event-day storytelling via WhatsApp managed by a trusted "accomplice" (best man/maid of honor). The business model is a one-time payment (EUR 19-29) with free draft-mode access, initially targeting the Spanish wedding market with future expansion to LATAM and other celebration types.
### **0.4. URL del proyecto:**

> Puede ser pública o privada, en cuyo caso deberás compartir los accesos de manera segura. Puedes enviarlos a [alvaro@lidr.co](mailto:alvaro@lidr.co) usando algún servicio como [onetimesecret](https://onetimesecret.com/).

### 0.5. URL o archivo comprimido del repositorio

> Puedes tenerlo alojado en público o en privado, en cuyo caso deberás compartir los accesos de manera segura. Puedes enviarlos a [alvaro@lidr.co](mailto:alvaro@lidr.co) usando algún servicio como [onetimesecret](https://onetimesecret.com/). También puedes compartir por correo un archivo zip con el contenido


---

## 1. Descripción general del producto

> Describe en detalle los siguientes aspectos del producto:

### **1.1. Objetivo:**

Aura Planning replaces paper wedding invitations with an **interactive digital ecosystem** that eliminates logistical stress and generates anticipation among guests. It delivers three core capabilities:

1. **Design** — Beautiful, customizable invitation templates requiring no design skills
2. **Logistics** — Centralized guest management, RSVP tracking, dietary/transport coordination
3. **Communication** — Multi-channel invitations (email + WhatsApp) with automated reminders and real-time event-day storytelling

**Value proposition:**
| Problem | Aura's Solution |
|---------|-----------------|
| Paper invitations cost EUR 800-1,200 for 120 guests | One-time EUR 29.99 payment — 97% cost savings |
| RSVP tracking via WhatsApp/phone is chaotic | Real-time dashboard with dietary/transport tracking |
| Guests lack real-time event updates | Live narrative via WhatsApp managed by an accomplice |
| Couples manage logistics on their wedding day | Accomplice handles all guest communication |

**Target audience:** Millennials (28-40) and Gen Z (22-28) planning weddings in Spain, tech-savvy, mobile-first, WhatsApp-native.

**Slogan:** *"Design your event's narrative, manage the logistics effortlessly."*

### **1.2. Características y funcionalidades principales:**

#### A. Host Management Panel (Angular 22 SPA)
- **Template Editor:** Visual customization of 3 preset wedding templates — colors, typography, hero images with real-time preview and auto-save
- **Guest Manager:** Manual entry + CSV import with validation, categorization (family/friends/colleagues), search/filter/pagination, free mode limited to 5 guests
- **Control Dashboard:** Real-time RSVP statistics (confirmed/declined/pending), dietary restrictions list, transportation needs count, plus-one tracking, CSV export

#### B. Guest Microsite (JAMstack Static Site)
- Ultra-fast mobile-first invitation page served via CDN (< 2s load on 3G)
- Embedded Google Maps venue with directions links (Google Maps / Waze)
- Smart RSVP form: attendance (yes/no/maybe), dietary restrictions, transport needs, plus-one, personal message — no account required
- Add-to-calendar buttons (Google Calendar, Apple Calendar)

#### C. Communication System
- **Multichannel Invitations:** Email (AWS SES) + WhatsApp (Meta Cloud API) with personalized templates and delivery tracking
- **Automated Reminders:** Configurable schedule for non-responders, same channel as original invitation, manual trigger option
- **Post-Event Thank You Cards:** Automated digital cards sent 1 day after event with optional external photo gallery links

#### D. Live Guest Journey (Killer Feature)
- **Accomplice Mode:** Secure magic-link access for a trusted person (best man/maid of honor), no password required
- **Swipe-to-Send Panel:** Pre-configured narrative buttons ("The bride is leaving!", "They said YES!", "Let the dancing begin!") requiring swipe gesture to prevent accidental sends
- **WhatsApp Delivery:** Real-time message dispatch via WhatsApp Business API with delivery status tracking
- **Access Control:** Permissions scoped to event, expires EventDate + 1 day, revocable by host

#### E. Registration & Onboarding
- Passwordless authentication via email magic links (15-min expiry, JWT sessions)
- Two-step flow: Register account → Create event
- Guided onboarding wizard: template selection → event basics → guest import → dashboard
- Publishing paywall: Stripe one-time payment to activate public URL and RSVP system

### **1.3. Diseño y experiencia de usuario:**

#### User Journey — Host (Couple)
```
Landing Page → Enter Email → Magic Link Email → Click Link → Profile Setup
→ Onboarding Wizard (Template → Event Basics → Guest Import) → Dashboard
→ Customize Template → Add Guests → Publish (Stripe Payment) → Send Invitations
→ Track RSVPs in Real-Time → Grant Accomplice Access → Enjoy Event Day
```

#### User Journey — Guest
```
Receive Invitation (Email/WhatsApp) → Click RSVP Link → View Event Microsite
→ Fill RSVP Form (Attendance + Dietary + Transport) → Submit → Confirmation
→ Add to Calendar → Get Directions → Receive Live Updates on Event Day
```

#### User Journey — Accomplice
```
Receive Magic Link via Email → Click Link → Open Accomplice Panel
→ View RSVP Summary → Swipe Message Button → Send Live Update via WhatsApp
→ Monitor Delivery Status
```

#### Design Principles
- **Minimalist & elegant** — Interface conveys the peace suggested by the name "Aura"
- **Mobile-first** — Guest microsite optimized for mobile browsers, no app download required
- **Passwordless** — Magic link authentication for hosts and accomplices, zero friction
- **Accessible** — WCAG 2.1 AA compliance target

> **Note:** UI screenshots and video tutorials will be added once the frontend is implemented. Wireframes and design system tokens are defined in the PRD (see [07-work-breakdown.md](business-documentation/prd/07-work-breakdown.md) for UI workstreams).

### **1.4. Instrucciones de instalación:**

> **Status:** Project scaffolding is in progress. The following describes the planned setup.

#### Prerequisites
- .NET 10 SDK
- Node.js 20+ and npm
- SQLite (bundled, no separate installation needed)

#### Backend (.NET 10 API)
```bash
cd backend/src/Aura.Api
dotnet restore
dotnet ef database update    # Apply migrations, creates SQLite database
dotnet run                   # Starts API on https://localhost:5001
```

#### Frontend (Angular 22)
```bash
cd frontend
npm install
ng serve                     # Starts dev server on http://localhost:4200
```

#### Configuration
Copy `appsettings.json` and configure the following keys:
| Key | Purpose |
|-----|---------|
| `ConnectionStrings:DefaultConnection` | SQLite database path |
| `Jwt:Key` | 256-bit key for JWT signing |
| `MagicLink:BaseUrl` | Base URL for magic link emails |
| `WhatsApp:ApiKey` | Meta Cloud API key |
| `Aws:AccessKey` / `Aws:SecretKey` | AWS SES credentials |
| `Stripe:SecretKey` | Stripe API key |
| `GoogleMaps:ApiKey` | Google Maps API key |

#### Database
- SQLite with EF Core migrations
- Migrations are versioned and reversible
- Run `dotnet ef database update` to apply
- Seed data: templates are seeded on first run

#### Running Tests
```bash
dotnet test    # Backend unit + integration tests
npm test       # Frontend unit tests
```

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**
> Usa el formato que consideres más adecuado para representar los componentes principales de la aplicación y las tecnologías utilizadas. Explica si sigue algún patrón predefinido, justifica por qué se ha elegido esta arquitectura, y destaca los beneficios principales que aportan al proyecto y justifican su uso, así como sacrificios o déficits que implica.


### **2.2. Descripción de componentes principales:**

> Describe los componentes más importantes, incluyendo la tecnología utilizada

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

> Representa la estructura del proyecto y explica brevemente el propósito de las carpetas principales, así como si obedece a algún patrón o arquitectura específica.

### **2.4. Infraestructura y despliegue**

> Detalla la infraestructura del proyecto, incluyendo un diagrama en el formato que creas conveniente, y explica el proceso de despliegue que se sigue

### **2.5. Seguridad**

> Enumera y describe las prácticas de seguridad principales que se han implementado en el proyecto, añadiendo ejemplos si procede

### **2.6. Tests**

> Describe brevemente algunos de los tests realizados

---

## 3. Modelo de Datos

### **3.1. Diagrama del modelo de datos:**

> Recomendamos usar mermaid para el modelo de datos, y utilizar todos los parámetros que permite la sintaxis para dar el máximo detalle, por ejemplo las claves primarias y foráneas.


### **3.2. Descripción de entidades principales:**

> Recuerda incluir el máximo detalle de cada entidad, como el nombre y tipo de cada atributo, descripción breve si procede, claves primarias y foráneas, relaciones y tipo de relación, restricciones (unique, not null…), etc.

---

## 4. Especificación de la API

> Si tu backend se comunica a través de API, describe los endpoints principales (máximo 3) en formato OpenAPI. Opcionalmente puedes añadir un ejemplo de petición y de respuesta para mayor claridad

---

## 5. Historias de Usuario

> Documenta 3 de las historias de usuario principales utilizadas durante el desarrollo, teniendo en cuenta las buenas prácticas de producto al respecto.

**Historia de Usuario 1**

**Historia de Usuario 2**

**Historia de Usuario 3**

---

## 6. Tickets de Trabajo

> Documenta 3 de los tickets de trabajo principales del desarrollo, uno de backend, uno de frontend, y uno de bases de datos. Da todo el detalle requerido para desarrollar la tarea de inicio a fin teniendo en cuenta las buenas prácticas al respecto. 

**Ticket 1**

**Ticket 2**

**Ticket 3**

---

## 7. Pull Requests

> Documenta 3 de las Pull Requests realizadas durante la ejecución del proyecto

**Pull Request 1**

### feat(agents): add AI agent system for Aura Planning [PSRP-1]
- **URL:** https://github.com/pedrosrp/AI4Devs-finalproject/pull/2
- **Ticket:** #1 - AI Agent System for Aura Planning
- **Date:** 2026-06-06
- **Summary:** Implement multi-agent AI system using opencode with 6 specialized agents (po-assistant, tech-design, project-scaffolder, feature-dev, doc-writer, doc-reviewer)
- **Files Changed:** 11 files, 1895 insertions

**Pull Request 2**

**Pull Request 3**

