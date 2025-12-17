# RRFinances — Documentación y Arquitectura

## Descripción del Proyecto
RRFinances es una plataforma multi-tenant para la gestión de clientes, usuarios, poderes y reportes en cooperativas. La solución adopta una arquitectura moderna basada en Angular (frontend) y NestJS (backend), con PostgreSQL y Redis, y contempla autenticación JWT, control de acceso por roles y permisos, auditoría y soft delete. Se han elaborado entregables de documentación y una suite de diagramas para asegurar claridad técnica y trazabilidad.

## Índice Rápido
- Documentación principal: [prompts/prd_rrfinances.md](prompts/prd_rrfinances.md)
- Resumen del proyecto: [prompts/PROJECT_SUMMARY.md](prompts/PROJECT_SUMMARY.md)
- Resumen de interacciones: [prompts/prompts.md](prompts/prompts.md)
- Casos de uso (Módulos 1-2 completos): [prompts/casos_de_uso_rrfinances.md](prompts/casos_de_uso_rrfinances.md)
- User Stories: [prompts/user_stories_rrfinances.md](prompts/user_stories_rrfinances.md)
- Modelo de datos (entidades y diagrama): [prompts/ENTIDADES_MODELO_DATOS.md](prompts/ENTIDADES_MODELO_DATOS.md), [prompts/DATA_MODEL_DIAGRAM.md](prompts/DATA_MODEL_DIAGRAM.md)

## Diagramas
- C4 Arquitectura (Contexto y Contenedores): [prompts/DIAGRAMA_ARQUITECTURA_C4.md](prompts/DIAGRAMA_ARQUITECTURA_C4.md)
- Despliegue (Ambientes y CI/CD): [prompts/DIAGRAMA_DESPLIEGUE.md](prompts/DIAGRAMA_DESPLIEGUE.md)
- Componentes Backend (NestJS): [prompts/DIAGRAMA_COMPONENTES_BACKEND.md](prompts/DIAGRAMA_COMPONENTES_BACKEND.md)
- Componentes Frontend (Angular): [prompts/DIAGRAMA_COMPONENTES_FRONTEND.md](prompts/DIAGRAMA_COMPONENTES_FRONTEND.md)
- Secuencia (Flujos críticos): [prompts/DIAGRAMA_SECUENCIA.md](prompts/DIAGRAMA_SECUENCIA.md)
- Seguridad (Capas, mitigaciones OWASP, tokens): [prompts/DIAGRAMA_SEGURIDAD.md](prompts/DIAGRAMA_SEGURIDAD.md)
- Paquetes/Módulos (organización y dependencias): [prompts/DIAGRAMA_PAQUETES_MODULOS.md](prompts/DIAGRAMA_PAQUETES_MODULOS.md)

## User Stories y Work Tickets
- User Stories consolidado: [prompts/user_stories_rrfinances.md](prompts/user_stories_rrfinances.md)
- Work Tickets (427 tickets en 9 bloques):
  - [prompts/work_tickets_bloque_01.md](prompts/work_tickets_bloque_01.md)
  - [prompts/work_tickets_bloque_02.md](prompts/work_tickets_bloque_02.md)
  - [prompts/work_tickets_bloque_03.md](prompts/work_tickets_bloque_03.md)
  - [prompts/work_tickets_bloque_04.md](prompts/work_tickets_bloque_04.md)
  - [prompts/work_tickets_bloque_05.md](prompts/work_tickets_bloque_05.md)
  - [prompts/work_tickets_bloque_06.md](prompts/work_tickets_bloque_06.md)
  - [prompts/work_tickets_bloque_07.md](prompts/work_tickets_bloque_07.md)
  - [prompts/work_tickets_bloque_08.md](prompts/work_tickets_bloque_08.md)
  - [prompts/work_tickets_bloque_09.md](prompts/work_tickets_bloque_09.md)

## Casos de Uso
- Cobertura actual: 18/76 casos (Módulo 1: Autenticación; Módulo 2: Gestión de Usuarios).
- Documento: [prompts/casos_de_uso_rrfinances.md](prompts/casos_de_uso_rrfinances.md)
- Próximo módulo sugerido: Catálogos Maestros (CU-019+), manteniendo formato de 13 secciones y políticas multi-tenant/auditoría.

## Estado y Próximos Pasos
- Diagramas: 7/8 completados; falta un diagrama adicional (p.ej., Estados de Dominio o Flujo de Datos) para cerrar la suite.
- Casos de uso: continuar con Módulo 3 (Catálogos) desde CU-019.

## Notas
- Los diagramas están en formato Mermaid y texto técnico. Se recomienda visualización en VS Code con extensión compatible o en plataformas que soporten Mermaid.
- Este README es el índice maestro para navegar toda la documentación del proyecto.
