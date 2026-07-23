# PR — Entrega Final

## Título del PR

```
[RACC] INKSPIRE — Marketplace premium de tatuajes en Chile 🇨🇱✨
```

---

## Body del PR

```markdown
# 🎨 INKSPIRE — La vitrina digital del tatuaje

> **Autor:** Rodrigo A. Chamy Cruz (RACC)
> **Proyecto final — AI4Devs Master**

---

## 🚀 ¿Qué es INKSPIRE?

INKSPIRE es un **marketplace premium de tatuajes** que conecta clientes con artistas certificados en Chile. Desde la búsqueda hasta el pago del depósito, todo en una sola plataforma — sin DMs, sin sorpresas.

## 🏗️ Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | **Angular 20** · TypeScript · SCSS · Material M3 (tema oscuro/dorado) |
| Backend | **.NET 10** Web API · Entity Framework Core · PostgreSQL 16 + PostGIS |
| Pagos | **Flow.cl** (sandbox validado e2e con Webpay) |
| Infraestructura | Docker Compose · GitHub Actions CI |
| IA | Chatbot cotizador con estimación de precios en tiempo real |

## ✨ Funcionalidades implementadas (13 US · 80 Story Points)

### 🔐 Autenticación
- Login/registro con JWT · Roles cliente/artista

### 🔍 Descubrimiento
- **Vitrina principal** con artistas destacados, estilos populares y carruseles
- **Búsqueda y filtros avanzados**: estilo, comuna, precio, rating, certificación, premios
- **Mapa interactivo** con geolocalización (Leaflet + PostGIS)
- **Favoritos** con persistencia local

### 💬 Cotización inteligente
- **Chatbot IA** de cotización por pasos (zona, tamaño, estilo, color, cover-up)
- Modo general (promedio de artistas) y modo específico por artista
- Estimación instantánea con factores de precio desglosados

### 📅 Reserva y pago
- Calendario semanal con slots disponibles en tiempo real
- Hold de 5 minutos con TTL automático
- **Pago de depósito vía Flow** (integración real validada contra sandbox Webpay)
- Resumen de reserva y confirmación

### ⭐ Post-sesión
- Historial de reservas con estados (pendiente → confirmada → completada)
- Confirmación de asistencia
- **Calificación en 4 dimensiones** (técnica, higiene, trato, puntualidad)
- Badges: verificado, certificación sanitaria, premiado, auspiciado

## 📊 Métricas del proyecto

| Métrica | Valor |
|---|---|
| User Stories completadas | **13/13** (9 Must-Have + 4 Should-Have) |
| Story Points entregados | **80 SP** |
| Tests backend | **109 ✅** |
| Tests frontend | **126 ✅** |
| Artistas seed | 14 (con coordenadas reales en Santiago) |
| Issues resueltos | 19 documentados en `fixs/` |
| PRs internos | 25 |

## 🎨 Diseño

Rediseño completo basado en prototipo Figma con tema oscuro premium:
- Paleta: `#0D0D0D` fondo · `#D4AF37` dorado · `#161616` tarjetas
- Tipografía: Inter + Geist
- Mobile-first responsive
- Navegación con blur y nav inferior móvil

## 📁 Estructura del repositorio

```
├── backend/          # .NET 10 Web API
├── frontend/         # Angular 20 SPA
├── docs/             # Documentación técnica, US, estándares
├── fixs/             # Issues documentados + diseño Figma de referencia
├── prompts/          # Registro completo de prompts IA utilizados
├── ai-specs/         # Skills y agentes IA del proyecto
└── docker-compose.yml
```

## 🏃 Cómo ejecutar

```bash
# 1. Infraestructura (PostgreSQL + PostGIS)
docker-compose up -d

# 2. Backend (migra + seed + API en :5000)
cd backend && dotnet run --seed

# 3. Frontend (SPA en :4200)
cd frontend && npm ci && npm start
```

**Login de prueba:** `camila.rojas@example.cl` / `Test1234!`

## 📚 Documentación completa

- `readme.md` — Ficha del proyecto y guía de entrega
- `ARCHITECTURE.md` — Arquitectura del sistema
- `docs/documentacion.md` — Lean Canvas, casos de uso, C4
- `docs/api-spec.yml` — Especificación OpenAPI 3.0
- `docs/data-model.md` — Modelo de datos (13 entidades)
- `PROJECT_STATUS.md` — Estado actual del proyecto
- `prompts/00-all-prompts.md` — Registro de prompts IA

---

*Desarrollado con 💛 y mucha IA por **Rodrigo A. Chamy Cruz (RACC)** — AI4Devs 2026*
```
