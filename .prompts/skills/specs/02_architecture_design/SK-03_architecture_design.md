---
name: architecture-design
description: "Diseña la especificación técnica de Arquitectura Hexagonal y el modelo de persistencia relacional 3NF."
version: "1.1.0"
category: "02_architecture_design"
inputs:
  - prd_doc
outputs:
  - "docs/02_architecture_design/03_technical_design.md"
---

Actúa como un Senior Software Architect y Principal Database Administrator (DBA) experto en Spec-Driven Development (SDD), Domain-Driven Design (DDD) y arquitecturas limpias. 

Tu objetivo es analizar minuciosamente el Documento de Requisitos de Producto (PRD) provisto e implementar el plano técnico de construcción del sistema, el cual se documentará en el archivo de diseño técnico. Este documento debe actuar como una "especificación técnica ejecutable" inmutable para futuros agentes de programación.

Analiza con extremo cuidado el siguiente PRD de entrada:
[RUTA_DEL_PRD]

Estructura el archivo de salida aplicando con máximo rigor las siguientes cuatro secciones de ingeniería de software:

---

## 💻 1. Arquitectura de Referencia (Screaming Architecture & Slices)
Para mitigar la degradación de la ventana de contexto de los agentes de codificación, debes de estructurar el sistema dividiéndolo en Rebanadas Verticales (Vertical Slices) cohesivas y desacopladas en primer nivel de directorios, organizando internamente cada slice bajo los puertos y adaptadores de la Arquitectura Hexagonal.
1. Dibuja un mapa visual de directorios del proyecto que muestre la estructura de carpetas de la solución (Screaming Architecture).
2. Explica detalladamente las responsabilidades de cada capa técnica:
   - Capa de Dominio (Domain): Entidades puras, Value Objects e interfaces de puertos (Repositories/Services) 100% agnósticas de frameworks o bases de datos.
   - Capa de Aplicación (Application): Casos de uso específicos que orquestan el flujo de datos invocando puertos de dominio.
   - Capa de Infraestructura (Infrastructure): Adaptadores concretos (controladores HTTP como Express/Fastify/Next.js routes, persistencia como Prisma/Drizzle ORMs o drivers nativos, e integraciones externas).

## 🗄️ 2. Modelo de Datos Lógico/Físico Agnóstico (Database-Agnostic Blueprint)
Diseña un modelo de persistencia lógico y físico completamente independiente de la tecnología final (sin mencionar sintaxis de Prisma, SQL DDL, o colecciones de MongoDB). La estructura debe representarse en Markdown utilizando la Tercera Forma Normal (3NF) y modelarse bajo los siguientes estándares de alta fidelidad:

1. CATÁLOGO DE ENTIDADES Y CAMPOS: Para cada entidad de la base de datos, provee una tabla detallada con:
   - Nombre físico del campo (utiliza snake_case por convención de base de datos).
   - Tipo de dato lógico agnóstico (ej: Integer, Decimal(precisión, escala), String(longitud), DateTime, Boolean, Enum). REGLA INNEGOCIABLE: Prohíbe tipos 'Float' o 'Double' para valores monetarios, pesos o inventarios; usa Decimal para evitar errores de precisión acumulados.
   - Restricciones físicas (PK, FK, UNIQUE, NOT NULL, DEFAULT, CHECK).
   - Descripción clara del propósito del campo en el negocio.

2. DICCIONARIO DE ENUMS: Define los dominios cerrados que actúan como Enums nativos de base de datos (estados, motivos, roles) detallando sus valores permitidos para evitar la persistencia de texto basura.

3. MAPA DE RELACIONES Y CARDINALIDADES: Detalla de forma explícita las relaciones existentes utilizando notación estándar (ej: "EntidadA (1) ---- (N) EntidadB (N) ---- (1) EntidadC"). Especifica qué campos físicos actúan como llaves foráneas y cómo se comportarán las acciones referenciales (ON DELETE/ON UPDATE).

4. ESTRATEGIA DE INDEXACIÓN LOGICA: Recomienda qué columnas físicas deben contar con índices de rendimiento basados en la frecuencia esperada de búsquedas lógicas, joins y filtros cronológicos, justificando cada decisión técnica.

## 🔌 3. Contratos de la API REST (Especificación de Endpoints)
Define con absoluta precisión los contratos de comunicación de los endpoints necesarios para resolver el Happy Path del PRD:
1. Para cada endpoint crítico, detalla:
   - Método HTTP, URL exacta y middleware de seguridad aplicable.
   - Payload JSON de entrada esperado (request body) con tipos y reglas de validación necesarias.
   - Payload JSON de respuesta exitosa (HTTP 200/201) con formato de salida predecible.
   - Respuestas HTTP de error esperadas (ej. 401 Unauthorized para autenticaciones inválidas, 422 Unprocessable Entity para violaciones lógicas de negocio) y estructura JSON del mensaje de error.

## 🛡️ 4. Invariantes del Dominio y Reglas de Validación
Identifica las reglas lógicas críticas que el sistema debe validar en memoria antes de permitir cambios de estado en las entidades de la base de datos para mitigar la persistencia de datos corruptos:
1. Define las invariantes de negocio que deben proteger los agregados (ej: "el saldo de una cuenta no puede ser menor que cero" o "la fecha de inicio debe ser anterior a la de finalización").
2. Especifica el comportamiento dinámico esperado del ciclo de vida de los estados para evitar transacciones inconsistentes.

---

Genera el documento en formato Markdown limpio, redactando las explicaciones técnicas y manteniendo el código del ORM y payloads JSON en inglés para máxima compatibilidad con el compilador. Comienza directamente con el título del archivo sin preámbulos conversacionales.

Guarda el archivo en: [RUTA_DE_SALIDA_DISEÑO]
