# Project Structure Rules for latearte

Este documento define la organización detallada de archivos y la estructura de carpetas mandatoria para el proyecto **latearte**, asegurando la separación de responsabilidades y la escalabilidad de microservicios.

## 1. Jerarquía Global de Carpetas
El proyecto debe mantener la siguiente organización sincronizada con el estado actual del scaffolding:

```text
latearte-project/
├── frontend/                 # Proyecto Next.js (React)
│   ├── public/               # Activos estáticos (logos, iconos de acceso 🟢🟡🔵)
│   ├── src/
│   │   ├── app/              # Rutas (App Router): Home, Cinema, Stage, Short List, Watchlist
│   │   ├── components/       # UI: Dial de Tiempo, Card Design, Reproductor Modal
│   │   ├── hooks/            # Lógica compartida y estado global
│   │   ├── services/         # Clientes para consumir la API Gateway interna
│   │   ├── styles/           # Temas y estilos CSS/Tailwind (globals.css, etc.)
│   │   └── utils/            # Formateadores de tiempo y lógica de filtrado
│   ├── next.config.js
│   └── package.json
│
├── backend/                  # Proyecto NestJS (Node.js)
│   ├── src/
│   │   ├── modules/          # Microservicios modulares (aggregator, auth, curated, user)
│   │   ├── common/           # Filtros de excepción, interceptores y DTOs globales
│   │   ├── config/           # Variables de entorno y llaves de APIs externas
│   │   ├── database/         # Migraciones y modelos de PostgreSQL (referencia Prisma)
│   │   └── main.ts           # Punto de entrada de la aplicación
│   ├── docker-compose.yml    # Orquestación de infraestructura local (PG, Redis)
│   ├── prisma/               # Definición de Esquema y Generación de Cliente
│   ├── nest-cli.json
│   └── package.json
│
├── .rules/                   # Reglas técnicas y estándares de desarrollo
└── README.md                 # Documentación técnica general
```

## 2. Responsabilidades por Capa

### Frontend (`/frontend`)
- **`app/`**: Utiliza el **App Router** de Next.js para gestionar las vistas y layouts del negocio.
- **`components/`**: Los componentes visuales de la experiencia (Dial, Cards, Icons) residen aquí.
- **`styles/`**: Centraliza todos los archivos de configuración visual y estilos base.

### Backend (`/backend`)
- **`modules/`**: Cada microservicio debe mantener su lógica aislada para escalar independientemente.
- **`database/`**: Capa de persistencia integrada con los modelos definidos en `backend/prisma/schema.prisma`.
- **`common/`**: Utilidades transversales e interceptores.

## 3. Reglas de Infraestructura
1. **Infraestructura Backend**: El archivo `docker-compose.yml` reside en la carpeta `backend/` para centralizar la configuración de la base de datos y caché compartida por los microservicios.
2. **Independencia**: Los archivos `.env` residen en sus carpetas respectivas para asegurar que cada entorno sea autónomo.

---
**Actualizado**: 23 de marzo de 2026 (Sincronización con Scaffolding actual)
**Fuente**: [Diseño de arquitectura Arteflujo_ Hub Cultural.md](file:///c:/Documentos/Cursos/Lidr/IA4Devs/AI4Devs-finalproject/documentacion/Dise%C3%B1o%20de%20arquitectura%20Arteflujo_%20Hub%20Cultural.md)
