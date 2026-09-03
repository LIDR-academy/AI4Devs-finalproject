# Prompts utilizados — Entrega 2

> Esta sección documenta los principales prompts utilizados durante la implementación y validación de la segunda entrega de AI Business Presence Builder.  
> 
> A diferencia de la Entrega 1, centrada principalmente en la definición del producto, arquitectura y requisitos, los prompts de esta fase se utilizaron para transformar la especificación en una implementación funcional, validar su comportamiento y corregir inconsistencias o defectos detectados durante el desarrollo.
>
> Se incluyen únicamente los prompts considerados más relevantes para justificar el uso de asistentes de IA durante el ciclo de desarrollo. Se priorizan aquellos que dieron lugar a decisiones técnicas, implementación de funcionalidades significativas, validaciones reproducibles o correcciones relevantes.
>
> El proceso seguido mantuvo un enfoque **human-in-the-loop**: las propuestas generadas por el asistente fueron revisadas, contrastadas con los requisitos del proyecto y, cuando fue necesario, corregidas o restringidas antes de incorporarse al código.

## Índice

1. [Auditoría inicial y análisis de discrepancias](#1-auditoría-inicial-y-análisis-de-discrepancias)
2. [Contrato de implementación y delimitación del MVP](#2-contrato-de-implementación-y-delimitación-del-mvp)
3. [Implementación del backend y modelo de datos](#3-implementación-del-backend-y-modelo-de-datos)
4. [Implementación de la arquitectura de generación mediante IA](#4-implementación-de-la-arquitectura-de-generación-mediante-ia)
5. [Implementación del frontend y flujo end-to-end](#5-implementación-del-frontend-y-flujo-end-to-end)
6. [Testing, seguridad y validación](#6-testing-seguridad-y-validación)
7. [Hardening, correcciones y preparación de la entrega](#7-hardening-correcciones-y-preparación-de-la-entrega)
8. [Notas finales](#8-notas-finales)

---

## 1. Auditoría inicial y análisis de discrepancias

### **Prompt 1: Auditoría técnica del repositorio**

**Contexto: Fase inicial de la Entrega 2 — Evaluación del punto de partida**

> Actúa como responsable técnico y realiza una auditoría completa del repositorio antes de implementar la Entrega 2. Comprueba qué partes de la arquitectura, backend, frontend, base de datos, tests, infraestructura y configuración existen realmente y cuáles son únicamente documentación.
>
> Contrasta el estado real del repositorio con los requisitos de la Entrega 2 y proporciona una lista explícita de gaps. No asumas que una funcionalidad existe porque esté descrita en el README, PRD o documentación.
>
> Para cada gap indica:
> - requisito esperado;
> - estado real;
> - evidencia en el repositorio;
> - impacto sobre la Entrega 2;
> - prioridad;
> - recomendación de implementación.
>
> No modifiques ningún fichero durante esta auditoría.

**Resultado:** Se determinó que el repositorio partía esencialmente de una base documental y que era necesario implementar desde cero la aplicación ejecutable de la Entrega 2: backend NestJS, frontend React, persistencia PostgreSQL/Prisma, autenticación, flujo de descubrimiento, BusinessProfile, generación de activos, tests e infraestructura local.

---

### **Prompt 2: Resolución de inconsistencias entre documentación y requisitos de implementación**

**Contexto: Arquitectura — Alineación entre Entrega 1 y Entrega 2**

> Compara la documentación existente del proyecto con los requisitos explícitos de la Entrega 2. Identifica cualquier contradicción en tecnologías, modelo de datos, endpoints, número de activos, flujo funcional, estrategia de generación mediante IA o infraestructura.
>
> Establece una regla de precedencia para resolver las contradicciones y selecciona la implementación mínima viable que permita cumplir la Entrega 2 sin ampliar innecesariamente el alcance.
>
> No introduzcas funcionalidades futuras que no sean necesarias para el MVP. Documenta las decisiones resultantes y los elementos que deben quedar explícitamente aplazados.

**Resultado:** Se identificaron discrepancias como FastAPI frente a NestJS, un modelo de datos excesivamente amplio frente al modelo MVP, y una especificación inicial de activos inferior a los cinco exigidos finalmente. Se estableció una estrategia de implementación mínima y se documentaron los elementos aplazados.

---

## 2. Contrato de implementación y delimitación del MVP

### **Prompt 1: Definición del contrato técnico de implementación**

**Contexto: Planificación — Conversión de requisitos en contrato ejecutable**

> A partir de los requisitos de la Entrega 2 y de las inconsistencias detectadas en la documentación, define un contrato técnico de implementación que pueda utilizarse como fuente de verdad durante el desarrollo.
>
> El contrato debe fijar:
> - stack tecnológico;
> - estructura general del sistema;
> - entidades persistentes;
> - flujo funcional principal;
> - endpoints necesarios;
> - reglas de autenticación y autorización;
> - reglas de ownership;
> - estados de BusinessProfile y Asset;
> - los cinco tipos de activos obligatorios;
> - arquitectura de generación mediante IA;
> - estrategia de persistencia de AIGeneration;
> - estrategia de testing;
> - elementos explícitamente fuera de alcance.
>
> Prioriza la implementación mínima necesaria para disponer de un MVP funcional y verificable.

**Resultado:** Se creó `ENTREGA2-IMPLEMENTATION-CONTRACT.md`, utilizado como referencia durante la implementación y validación de la entrega.

---

### **Prompt 2: Plan de implementación incremental**

**Contexto: Desarrollo — Organización de la implementación**

> Descompón la implementación de la Entrega 2 en incrementos técnicos que permitan mantener el sistema ejecutable y verificable en cada etapa.
>
> Ordena las tareas de forma que primero se establezcan la infraestructura y persistencia, después el dominio y API, posteriormente la integración de IA, el frontend y finalmente las pruebas y validaciones.
>
> Para cada incremento indica:
> - objetivo;
> - componentes afectados;
> - dependencias;
> - criterios de finalización;
> - riesgos.
>
> Evita implementar funcionalidades fuera del alcance del contrato.

**Resultado:** La implementación se estructuró progresivamente en foundation, dominio, IA, frontend, testing/seguridad y documentación.

---

## 3. Implementación del backend y modelo de datos

### **Prompt 1: Implementación del backend y persistencia**

**Contexto: Backend — Implementación del MVP**

> Implementa el backend de AI Business Presence Builder utilizando NestJS, TypeScript, Prisma y PostgreSQL, siguiendo estrictamente el contrato de implementación de la Entrega 2.
>
> Debe incluir como mínimo:
> - autenticación mediante registro y login;
> - gestión de negocios;
> - ownership por usuario;
> - captura y persistencia de DiscoveryResponses;
> - normalización determinista de BusinessProfile;
> - revisión y aprobación del perfil;
> - generación y gestión de los cinco activos;
> - persistencia de AIGeneration;
> - validación de DTOs;
> - protección de endpoints mediante JWT;
> - comprobaciones de autorización y ownership.
>
> Mantén la separación entre controllers, services, dominio y persistencia. No implementes funcionalidades que estén fuera del MVP.

**Resultado:** Se implementó el backend NestJS con PostgreSQL y Prisma, incluyendo autenticación, negocio, descubrimiento, BusinessProfile, activos y registros de generación.

---

### **Prompt 2: Validación del modelo de datos frente al flujo funcional**

**Contexto: Datos — Coherencia entre dominio, persistencia y casos de uso**

> Revisa el modelo Prisma implementado y comprueba que soporta completamente el flujo de la Entrega 2.
>
> Verifica especialmente:
> - relaciones entre User y Business;
> - relación Business–DiscoveryResponses;
> - relación Business–BusinessProfile;
> - relación Business–Asset;
> - persistencia independiente de AIGeneration;
> - posibilidad de conservar el historial de generaciones;
> - restricciones de enums;
> - claves foráneas;
> - ownership;
> - timestamps y campos de auditoría.
>
> Comprueba también que el modelo no introduce entidades innecesarias del roadmap futuro.
>
> Si detectas problemas, propón únicamente los cambios necesarios para cumplir el contrato.

**Resultado:** Se validó el modelo compacto de seis entidades persistentes y se comprobó su correspondencia con el flujo MVP y la trazabilidad de generaciones.

---

## 4. Implementación de la arquitectura de generación mediante IA

### **Prompt 1: Implementación de un pipeline de IA desacoplado**

**Contexto: IA — Integración controlada y reproducible**

> Implementa una arquitectura de generación de contenidos basada en un pipeline desacoplado:
>
> `DiscoveryResponses → BusinessProfile → ContextBuilder → PromptBuilder → LLMGateway → Validation → Asset/AIGeneration`
>
> La regla fundamental es que `BusinessProfile` sea la única fuente canónica de información utilizada por la generación de IA.
>
> Las respuestas originales del wizard no deben enviarse directamente al LLM.
>
> Implementa interfaces claras para:
> - construcción del contexto;
> - construcción del prompt;
> - gateway del modelo;
> - validación de la respuesta.
>
> Utiliza una implementación mock determinista del `LLMGateway` para que el MVP pueda ejecutarse y validarse sin depender de un proveedor externo.
>
> Persiste snapshots del contexto, prompt y respuesta generados para permitir trazabilidad y auditoría.

**Resultado:** Se implementó el pipeline desacoplado y síncrono, con `MockLLMGateway`, validación antes de persistencia y snapshots asociados a `AIGeneration`.

---

### **Prompt 2: Validación de las garantías de grounding de la IA**

**Contexto: IA — Control de la fuente de conocimiento**

> Audita la implementación de la generación de activos y comprueba que la IA únicamente recibe información derivada del BusinessProfile aprobado.
>
> Revisa todo el flujo desde DiscoveryResponses hasta LLMGateway e identifica cualquier punto donde datos sin normalizar puedan llegar directamente al modelo.
>
> Verifica también que:
> - ContextBuilder recibe BusinessProfile;
> - PromptBuilder trabaja únicamente con el contexto canónico;
> - LLMGateway recibe prompt/contexto y no DiscoveryResponses;
> - las respuestas se validan antes de persistirse;
> - AIGeneration conserva snapshots suficientes para reconstruir qué contexto y prompt se utilizaron.
>
> Si existe alguna violación de estas garantías, corrígela sin cambiar el alcance funcional del MVP.

**Resultado:** Se verificó la propiedad de `BusinessProfile` como fuente canónica y se corrigieron/hardene​aron los puntos necesarios para impedir el acceso directo de la capa LLM a `DiscoveryResponses`.

---

## 5. Implementación del frontend y flujo end-to-end

### **Prompt 1: Implementación del flujo funcional completo**

**Contexto: Frontend — Experiencia MVP**

> Implementa el frontend del MVP utilizando React, TypeScript y Vite.
>
> El usuario debe poder completar el flujo:
>
> `REGISTER → LOGIN → CREATE BUSINESS → COMPLETE DISCOVERY → REVIEW PROFILE → APPROVE PROFILE → GENERATE DIGITAL PRESENCE → REVIEW ASSETS`
>
> El wizard debe cubrir las seis áreas definidas en el contrato. El frontend debe comunicarse con la API real, gestionar autenticación y estados de carga/error y permitir revisar y editar los activos generados.
>
> No simules respuestas de backend en el frontend: utiliza los endpoints reales implementados.

**Resultado:** Se implementó la interfaz React conectada al backend real, incluyendo autenticación, wizard de seis pasos, revisión/aprobación del perfil y gestión de los cinco activos.

---

### **Prompt 2: Implementación de edición y regeneración**

**Contexto: Frontend — Ciclo de revisión humana**

> Amplía el flujo de gestión de activos para que el usuario pueda:
> - revisar cada activo;
> - editar título y contenido;
> - guardar los cambios;
> - regenerar un activo;
> - visualizar correctamente los estados del activo;
> - evitar acciones duplicadas mientras una operación está en curso.
>
> La regeneración debe utilizar nuevamente el BusinessProfile aprobado y no debe eliminar el historial de AIGeneration anterior.
>
> Mantén el comportamiento coherente con el backend y no añadas una interfaz de historial si no existe un endpoint específico para ello.

**Resultado:** Se implementó el ciclo de revisión humana, edición y regeneración, preservando las generaciones anteriores.

---

## 6. Testing, seguridad y validación

### **Prompt 1: Diseño de una prueba E2E real con persistencia**

**Contexto: Testing — Validación del sistema completo**

> Diseña e implementa una prueba E2E que valide el flujo principal de la Entrega 2 utilizando el AppModule real, Prisma y una instancia real de PostgreSQL.
>
> La prueba debe cubrir:
>
> `REGISTER → LOGIN → CREATE BUSINESS → DISCOVERY → APPROVE PROFILE → GENERATE FIVE ASSETS → VERIFY DATABASE PERSISTENCE`
>
> No utilices repositories mockeados ni sustituyas la persistencia real.
>
> Comprueba además:
> - autenticación;
> - relaciones entre entidades;
> - existencia de exactamente cinco tipos de Asset;
> - persistencia de AIGeneration;
> - snapshots de prompt, contexto y respuesta;
> - uso del BusinessProfile como contexto canónico.
>
> La prueba debe ser reproducible en un entorno local.

**Resultado:** Se implementó una prueba E2E basada en la aplicación real y PostgreSQL, verificando persistencia, cinco tipos de activos y snapshots de generación.

---

### **Prompt 2: Auditoría de seguridad y aislamiento por ownership**

**Contexto: Seguridad — Autorización y aislamiento de datos**

> Realiza una auditoría de seguridad del MVP centrada en autenticación, autorización y aislamiento de recursos por usuario.
>
> Comprueba:
> - hashing de contraseñas;
> - firma y expiración del JWT;
> - validación del payload JWT;
> - protección de endpoints;
> - validación de DTOs;
> - UUIDs;
> - comprobaciones server-side de ownership;
> - ausencia de passwordHash y secretos en respuestas;
> - ausencia de claves de proveedores IA en frontend o código;
> - exclusión de `.env` del repositorio.
>
> Diseña pruebas que demuestren que un usuario no puede acceder, modificar o regenerar recursos pertenecientes a otro usuario.

**Resultado:** Se verificó el aislamiento por ownership y se incorporaron validaciones adicionales sobre JWT, DTOs, UUIDs, secretos y respuestas de API.

---

### **Prompt 3: Auditoría completa previa a la entrega**

**Contexto: QA — Criterio de aceptación de la Entrega 2**

> Realiza una auditoría final de la Entrega 2 sin modificar código inicialmente.
>
> Contrasta:
> 1. requisitos de la Entrega 2;
> 2. contrato de implementación;
> 3. documentación;
> 4. implementación real;
> 5. tests;
> 6. persistencia;
> 7. seguridad;
> 8. flujo funcional E2E.
>
> No des por implementada una funcionalidad únicamente porque aparezca documentada.
>
> Clasifica los resultados como:
> - PASS;
> - PASS WITH NOTES;
> - FAIL.
>
> Para cada problema indica evidencia, impacto y acción recomendada.

**Resultado:** La auditoría final concluyó `PASS WITH NOTES`, sin defectos críticos, identificando únicamente aspectos de documentación, cobertura adicional y deuda técnica.

---

## 7. Hardening, correcciones y preparación de la entrega

### **Prompt 1: Corrección de defectos detectados durante la validación**

**Contexto: Hardening — Corrección sin ampliación de alcance**

> A partir de los problemas detectados durante las pruebas y la auditoría, corrige únicamente los defectos que puedan afectar a la robustez, seguridad, reproducibilidad o cumplimiento del contrato de la Entrega 2.
>
> Prioriza:
> - errores de validación;
> - errores de tipos;
> - respuestas controladas ante entradas inválidas;
> - validación del JWT;
> - validación de UUIDs;
> - normalización de inputs;
> - configuración reproducible;
> - exclusión de secretos y artefactos generados.
>
> No introduzcas funcionalidades nuevas ni modifiques el alcance del producto.

**Resultado:** Se realizaron correcciones de robustez en validación de respuestas de IA, JWT, DTOs, UUIDs, inputs, configuración y control de artefactos generados.

---

### **Prompt 2: Auditoría final de packaging y trazabilidad**

**Contexto: Entrega — Preparación de PR**

> Realiza una auditoría final del repositorio antes de abrir la PR de la Entrega 2.
>
> Comprueba:
> - estado de Git;
> - cambios incluidos;
> - ausencia de secretos;
> - consistencia de README;
> - coherencia entre documentación e implementación;
> - tests y builds;
> - Prisma schema y migraciones;
> - configuración Docker;
> - estructura de commits;
> - separación entre documentación histórica de Entrega 1 e implementación de Entrega 2.
>
> Ejecuta las validaciones disponibles y proporciona un veredicto final.
>
> No realices cambios destructivos, no hagas push y no modifiques main.

**Resultado:** Se verificó el estado final del repositorio y se preparó la rama `feature-entrega2-MGB` para revisión mediante PR, manteniendo separada la implementación de la documentación histórica.

---

## 8. Notas finales

Los prompts utilizados durante la Entrega 2 presentan una evolución respecto a los empleados durante la Entrega 1.

Mientras que en la primera fase el asistente se utilizó principalmente para **explorar alternativas, estructurar requisitos y generar documentación**, durante la segunda fase se utilizó como herramienta de apoyo al **desarrollo, validación y aseguramiento de calidad**.

El proceso seguido puede resumirse en:

`Auditoría → Especificación → Implementación → Validación → Corrección → Revalidación`

Los prompts se diseñaron manteniendo varias restricciones deliberadas:

- El código generado debía contrastarse con la documentación y los requisitos del proyecto.
- La implementación debía limitarse al alcance del MVP.
- Las funcionalidades futuras debían permanecer explícitamente fuera de la Entrega 2.
- La generación mediante IA debía estar desacoplada del dominio y ser trazable.
- `BusinessProfile` debía actuar como fuente canónica para la generación.
- La persistencia real debía utilizarse en las pruebas E2E.
- Las comprobaciones de autorización y ownership debían realizarse en servidor.
- Las decisiones del asistente debían someterse a revisión humana antes de considerarse definitivas.

### Principales contribuciones del uso de IA en la Entrega 2

| Área | Uso del asistente |
|---|---|
| Análisis | Auditoría del repositorio y detección de gaps |
| Arquitectura | Resolución de inconsistencias y definición del contrato |
| Backend | Generación de estructura y lógica de aplicación |
| Persistencia | Diseño e implementación de Prisma/PostgreSQL |
| IA | Diseño del pipeline y gateway desacoplado |
| Frontend | Implementación del flujo funcional E2E |
| Testing | Diseño de pruebas unitarias, integración y E2E |
| Seguridad | Auditoría de autenticación, autorización y ownership |
| QA | Validación sistemática contra requisitos |
| Hardening | Corrección de defectos y validaciones |
| Entrega | Auditoría de packaging y preparación de la PR |

El valor del uso de IA durante esta fase no se limitó a la generación de código. El asistente se utilizó también como mecanismo de **análisis, contraste, detección de inconsistencias, generación de pruebas y revisión técnica**, manteniendo la decisión final y la validación del resultado bajo control humano.