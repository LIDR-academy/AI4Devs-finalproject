---
name: hexagonal-layers
description: "Define las responsabilidades por capas de la Arquitectura Hexagonal y los patrones de Inyección de Dependencias."
version: "1.1.0"
category: "02_architecture_design"
inputs:
  - prd_doc
  - design_doc
outputs:
  - "docs/02_architecture_design/05_components_description.md"
---

Actúa como un Senior Software Architect y Technical Lead experto en Domain-Driven Design (DDD), Arquitectura Hexagonal (Ports & Adapters) y el Principio de Cierre Común (CCP) aplicado a Vertical Slices.

Tu objetivo es analizar minuciosamente el Documento de Requisitos de Producto (PRD) y la Especificación Técnica de Persistencia y Datos provistos para estructurar de forma limpia la sección "Descripción de componentes principales" del sistema, definiendo cómo se dividirá físicamente el software y cómo fluirán las dependencias lógicas.

Analiza con extremo cuidado las siguientes especificaciones del sistema:
- Documento PRD / Requisitos Funcionales:
"[RUTA_DEL_PRD]"

- Documento de Diseño / Especificación de Datos:
"[RUTA_DEL_DISEÑO]"

Genera de forma exclusiva la sección de arquitectura detallada aplicando con máximo rigor las siguientes cuatro secciones de ingeniería de software:

---

# 💻 Descripción de Componentes Principales

## 🧭 1. Estilo Arquitectónico y Slices Verticales (Screaming Architecture)
1. Declara que la solución se estructurará organizando el backend en Rebanadas Verticales (Vertical Slices) independientes en el primer nivel de directorios, basándose en el Principio de Cierre Común (CCP).
2. Mapea y lista los componentes lógicos de negocio (módulos) identificados a partir del PRD, describiendo brevemente la responsabilidad y el dominio operativo de cada módulo (ej: modules/users, modules/billing, etc.).

## 🛡️ 2. Anatomía y Responsabilidades de las Capas (Arquitectura Hexagonal)
Detalla de manera explícita las fronteras y el rol técnico de cada capa dentro de cada módulo:
- Capa de Dominio (Domain Layer): Contiene las entidades ricas, Value Objects e interfaces de puertos (Ports / interfaces de repositorios o servicios). Debe ser pura, desacoplada y agnóstica de frameworks o librerías de persistencia.
- Capa de Aplicación (Application Layer): Contiene los Casos de Uso (Usecases) que orquestan el flujo de datos llamando a los puertos abstractos del dominio, sin interactuar directamente con la red o el almacenamiento.
- Capa de Infraestructura (Infrastructure Layer): Aloja los adaptadores de entrada (controladores HTTP, enrutadores, esquemas de validación de entrada) y de salida (adaptadores ORM de persistencia física, clientes de APIs externas).

## 🔄 3. Regla Estricta de Dependencia Unidireccional
Establece la regla de acoplamiento del software:
- El flujo de importaciones lógicas viaja estrictamente de fuera hacia adentro.
- Infraestructura puede importar de Aplicación y Dominio.
- Aplicación solo puede importar de Dominio.
- Dominio tiene terminantemente prohibido importar de Aplicación, de Infraestructura o de cualquier librería técnica externa (Express, ORMs).

## 🔌 4. Ejemplo Canónico de Código (TypeScript Blueprint)
Proporciona un ejemplo de código de referencia en TypeScript que sirva como "molde" homogéneo para el equipo, modelando un flujo básico del sistema (ej: creación o registro de datos). El código debe ser limpio y tipado, ilustrando de forma secuencial:
1. El Puerto (interface) declarado en la capa de Dominio.
2. El Caso de Uso en la capa de Aplicación que recibe el puerto mediante inyección de dependencias.
3. El Adaptador de Controlador en la capa de Infraestructura que recibe la petición HTTP, valida los datos de entrada y delega la ejecución al caso de uso.

---

Genera el documento en formato Markdown limpio, redactando las explicaciones técnicas y manteniendo las entidades, nombres de variables, interfaces de código TypeScript y payloads JSON en inglés profesional para máxima compatibilidad con el compilador. Comienza directamente con el título de la sección sin preámbulos conversacionales.

Guarda la respuesta en el archivo: [RUTA_DE_SALIDA_DESCRIPCION_COMPONENTES]
