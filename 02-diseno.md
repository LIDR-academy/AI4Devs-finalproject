# Resumen: 2. Diseño

**Carpeta:** `2. diseño/`  
**Propósito:** Documentar CÓMO se va a construir.

---

## Estructura de la carpeta

```
2. diseño/
├── 01-arquitectura/
│   └── 01-Arquitectura-C4.md
├── 02-diagramas/
│   ├── 01-Entidades-Modelo-Datos.md
│   ├── 02-Data-Model-Diagram.md
│   ├── 03-Componentes-Backend.md
│   ├── 04-Componentes-Frontend.md
│   ├── 05-Secuencia.md
│   ├── 06-Despliegue.md
│   ├── 07-Paquetes-Modulos.md
│   └── 08-Seguridad.md
└── README.md
```

---

## Contenido resumido

### Qué se hizo

- **Arquitectura C4** en 4 niveles: contexto, contenedores, componentes y código.
- **Modelo de datos** completo con entidades, relaciones y diagrama ER.
- **Diagramas de componentes** para backend (NestJS) y frontend (Angular).
- **Diagramas de secuencia** para flujos principales.
- **Arquitectura de despliegue** (Docker, Kubernetes, CI/CD).
- **Organización de paquetes** y dependencias.
- **Arquitectura de seguridad** en capas.

### Documentos por carpeta

| Documento | Descripción |
|-----------|-------------|
| **01-Arquitectura-C4.md** | Contexto del sistema, contenedores (Frontend, Backend, BD), componentes |
| **01-Entidades-Modelo-Datos.md** | Entidades, relaciones, descripción de tablas |
| **02-Data-Model-Diagram.md** | Diagrama ER visual de la base de datos |
| **03-Componentes-Backend.md** | Módulos NestJS, arquitectura hexagonal |
| **04-Componentes-Frontend.md** | Rutas Angular, módulos, estructura de componentes |
| **05-Secuencia.md** | Diagramas de flujo de procesos principales |
| **06-Despliegue.md** | Infraestructura, Docker, K8s, CI/CD |
| **07-Paquetes-Modulos.md** | Organización de código y dependencias |
| **08-Seguridad.md** | WAF, IDS/IPS, Vault, seguridad enterprise |

### Topología definida

- **MS-CORE:** API Gateway (puerto 8000)
- **MS-AUTH:** Autenticación (puerto 8001)
- **MS-PERSO:** Personas/Clientes (puerto 8002)
- **MS-CONFI:** Configuración/Catálogos (puerto 8012)

### Stack tecnológico definido

- NestJS 10.x, Angular 17, PostgreSQL 15, Redis 7
- Base de datos compartida con row-level multi-tenancy
- Seguridad: Network, Application, Data, Infrastructure

---

## Resultados que guiaron el desarrollo

- Arquitectura de microservicios definida.
- Modelo de datos listo para implementación.
- Estructura de componentes frontend y backend.
- Infraestructura y seguridad especificadas.

---

*[← Volver al índice](README.md)*
