# Matriz de Trazabilidad e Índice de Historias de Usuario

Este documento sirve como índice central para el andamiaje de Historias de Usuario (User Stories) de **SplitEat**. Mapea cada historia con su documentación técnica, especificación de API, estrategia de pruebas y archivos de código asociados para asegurar una trazabilidad completa de extremo a extremo.

---

## 1. Índice General de Historias de Usuario

| ID | Historia de Usuario | Épica | Estado de Docs | Fichero de Scaffold |
| :--- | :--- | :--- | :---: | :--- |
| **US-01** | Escaneo OCR Inteligente de Tickets | Épica 1: Core Digitalization | 📝 Listo | [US-01.md](./user-stories/epic-1-core/US-01.md) |
| **US-02** | Edición Manual y OCR Fallback | Épica 1: Core Digitalization | 📝 Listo | [US-02.md](./user-stories/epic-1-core/US-02.md) |
| **US-03** | Asignación Unitaria Visual | Épica 1: Core Digitalization | 📝 Listo | [US-03.md](./user-stories/epic-1-core/US-03.md) |
| **US-04** | División de Platos Compartidos (Exactitud) | Épica 2: Advanced Reparto | 📝 Listo | [US-04.md](./user-stories/epic-2-advanced/US-04.md) |
| **US-05** | Asignación Rápida de Comunes / Entrantes | Épica 2: Advanced Reparto | 📝 Listo | [US-05.md](./user-stories/epic-2-advanced/US-05.md) |
| **US-06** | Alertas de Platos Huérfanos y Descuadres | Épica 2: Advanced Reparto | 📝 Listo | [US-06.md](./user-stories/epic-2-advanced/US-06.md) |
| **US-07** | Redondeo Visual y Propinas | Épica 2: Advanced Reparto | 📝 Listo | [US-07.md](./user-stories/epic-2-advanced/US-07.md) |
| **US-08** | Gamificación: La Ruleta del Pagador | Épica 2: Advanced Reparto | 📝 Listo | [US-08.md](./user-stories/epic-2-advanced/US-08.md) |
| **US-09** | Dictado al Camarero e Historial Local | Épica 2: Advanced Reparto | 📝 Listo | [US-09.md](./user-stories/epic-2-advanced/US-09.md) |
| **US-10** | QR Bizum Personalizado y Mensajes | Épica 3: Cloud Convenience | 📝 Listo | [US-10.md](./user-stories/epic-3-cloud/US-10.md) |
| **US-11** | Sincronización Cloud de Amigos y Grupos | Épica 3: Cloud Convenience | 📝 Listo | [US-11.md](./user-stories/epic-3-cloud/US-11.md) |
| **US-12** | Backup Cloud de Tickets e Historial | Épica 3: Cloud Convenience | 📝 Listo | [US-12.md](./user-stories/epic-3-cloud/US-12.md) |
| **US-13** | Exportación Financiera (Excel/PDF) | Épica 4: Analytics (Futuro) | 📝 Listo | [US-13.md](./user-stories/epic-4-analytics/US-13.md) |
| **US-14** | Mapa de Visitas y Analíticas (EXIF Geo) | Épica 4: Analytics (Futuro) | 📝 Listo | [US-14.md](./user-stories/epic-4-analytics/US-14.md) |

---

## 2. Mapa de Referencias de Documentos Generales

La documentación general de arquitectura, stack tecnológico, bases de datos y calidad se encuentra centralizada a nivel del directorio `/docs` para evitar duplicidad y mantener un único punto de verdad. Las historias individuales apuntan a estas secciones:

- **Arquitectura de Software (C4 Model)**: [c4_model.md](./architecture/c4_model.md)
- **Pila Tecnológica y Decisiones**: [tech_stack.md](./tech-lead/tech_stack.md)
- **Estrategias y Esquemas de Base de Datos**: [data_schema.md](./db/data_schema.md)
- **Especificación y Contratos de APIs**: [integration_contracts.md](./api/integration_contracts.md)
- **Estrategia Global de Testing & QA**: [testing_strategy.md](./qa/testing_strategy.md)
- **Despliegue y Ciclo CI/CD**: [deployment_branching.md](./tech-lead/deployment_branching.md)
