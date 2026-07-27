# Cactify

Plataforma web para gestionar colecciones de cactus y pequeños viveros: registro de plantas por especie, lecturas de cultivo (manuales en el MVP) y recomendaciones de cuidado generadas por IA a partir de los rangos de la especie y el historial de cada planta.

Contexto y decisiones de producto completas en [README.md](README.md). Historial de las conversaciones que originaron el proyecto en [chats/](chats/).

## Dónde está cada cosa

| Qué | Dónde |
|---|---|
| Descripción de producto, arquitectura, modelo de datos, API | [README.md](README.md) |
| Historias de usuario (una por archivo; `0.x` = en alcance del MVP, `F.x` = fuera de alcance/roadmap) | [docs/user-stories/](docs/user-stories/README.md) |
| Tickets de trabajo (uno por archivo, `T-01`…`T-07`) | [docs/tickets/](docs/tickets/README.md) |
| Diagramas (modelo de datos y flujo E2E, en Mermaid) | [docs/diagramas/](docs/diagramas/) |
| Backend | [backend/](backend/) |
| Frontend | [frontend/](frontend/) |
| Infraestructura local (Docker Compose) | [iac/local/](iac/local/) |

## Stack

* **Backend**: Kotlin + Spring Boot 3 (Spring Web, Spring Data JPA) + PostgreSQL + OpenAI API.
* **Frontend**: Nuxt 3 + Vue 3 + Pinia.
* **Entidades principales**: `Species`, `Plant`, `CareRecord`, `AIRecommendation` (ver [docs/diagramas/modelo-datos.md](docs/diagramas/modelo-datos.md)).

## Arrancar en local

```bash
cd iac/local
cp .env.example .env   # y ajusta las variables si hace falta
docker compose up --build
```

Levanta PostgreSQL, el backend (`:8080`) y el frontend (`:3000`). Ver [iac/local/README.md](iac/local/README.md).

## Estado del proyecto

Solo hay documentación y esqueleto de infraestructura (Dockerfiles, docker-compose). Backend y frontend aún no tienen código de aplicación.
