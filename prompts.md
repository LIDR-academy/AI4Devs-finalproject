> Detalla en esta sección los prompts principales utilizados durante la creación del proyecto, que justifiquen el uso de asistentes de código en todas las fases del ciclo de vida del desarrollo. Esperamos un máximo de 3 por sección, principalmente los de creación inicial o  los de corrección o adición de funcionalidades que consideres más relevantes.
Puedes añadir adicionalmente la conversación completa como link o archivo adjunto si así lo consideras


## Índice

1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)
8. [Hosting y Despliegue en Railway](#8-hosting-y-despliegue-en-railway)

---
# Prompts Detallados para README del Proyecto de Gestión de Citas para Barbería

## Sección 0: Ficha del Proyecto

**Prompt 0.1-0.5: Información básica del proyecto**
```
Como experto en desarrollo de aplicaciones móviles y gestión de proyectos, proporciona la siguiente información para la ficha de mi proyecto:

1. Define un nombre profesional y descriptivo para un sistema de gestión de citas para barberías que utilice IA.
2. Escribe una descripción concisa pero completa (2-3 párrafos) del proyecto que incluya:
   - El problema que resuelve
   - La solución tecnológica propuesta (React Native, PostgreSQL, IA)
   - El valor diferencial que aporta al mercado
3. Sugiere un formato adecuado para la URL del proyecto (no necesito una URL real, solo el formato y estructura que debería seguir).
4. Explica brevemente cómo debería estructurarse el repositorio para este tipo de proyecto (sin necesidad de una URL real).

El objetivo es completar la ficha del proyecto con información profesional que refleje adecuadamente el alcance y propósito del sistema.
```

## Sección 1: Descripción General del Producto

**Prompt 1.1: Objetivo del producto**
```
Como consultor de productos tecnológicos especializado en aplicaciones de servicios, desarrolla un objetivo detallado para mi sistema de gestión de citas para barberías con IA. Incluye:

1. La propuesta de valor principal del producto
2. Los problemas específicos que resuelve tanto para los clientes de la barbería como para los barberos/administradores
3. Una explicación de cómo la integración de IA mejora significativamente la experiencia respecto a soluciones convencionales
4. El impacto económico y operativo que tendría en el negocio de barbería
5. Los segmentos de usuarios principales (clientes, barberos, administradores) y el valor específico que obtiene cada uno

El objetivo debe ser convincente y mostrar claramente por qué este sistema es necesario en el mercado actual.
```

**Prompt 1.2: Características y funcionalidades principales**
```
Como arquitecto de software especializado en sistemas de reservas y gestión de recursos, detalla las características y funcionalidades principales del sistema de gestión de citas para barberías con IA. Para cada característica, proporciona:

1. Nombre de la funcionalidad
2. Descripción detallada de su propósito y funcionamiento
3. Componentes de IA implementados en la funcionalidad (si aplica)
4. Valor específico que aporta al usuario
5. Cómo se integra con otras funcionalidades del sistema

Organiza las funcionalidades en categorías lógicas (por ejemplo: gestión de usuarios, sistema de reservas, IA y personalización, administración, etc.) y asegúrate de cubrir tanto la perspectiva del cliente como la del negocio.

Incluye al menos 8-10 funcionalidades principales, con énfasis especial en aquellas que utilizan componentes de IA para mejorar la experiencia.
```

**Prompt 1.3: Diseño y experiencia de usuario**
```
Como experto en UX/UI para aplicaciones móviles, describe detalladamente la experiencia de usuario ideal para el sistema de gestión de citas para barberías. Incluye:

1. Una descripción del flujo completo para:
   - Registro y onboarding del usuario
   - Proceso de reserva de cita
   - Gestión (modificación/cancelación) de citas existentes
   - Experiencia post-servicio (valoraciones, recomendaciones, etc.)
   - Panel del barbero/administrador

2. Para cada pantalla principal, detalla:
   - Elementos visuales clave y su disposición
   - Interacciones principales
   - Información mostrada al usuario
   - Puntos donde la IA interactúa con el usuario

3. Describe cómo se implementaría la personalización basada en IA en la interfaz

4. Explica cómo se visualizarían las recomendaciones inteligentes y los elementos predictivos

No es necesario proporcionar imágenes reales, pero sí descripciones detalladas que permitan entender cómo sería la experiencia completa del usuario en la aplicación.
```

**Prompt 1.4: Instrucciones de instalación**
```
Como DevOps especializado en aplicaciones móviles con backend en Node.js y bases de datos PostgreSQL, proporciona instrucciones detalladas para la instalación y configuración completa del sistema de gestión de citas para barberías. Incluye:

1. Requisitos previos del sistema (software, dependencias, configuraciones, etc.)
2. Pasos detallados para configurar:
   - El entorno de desarrollo
   - La base de datos PostgreSQL
   - El backend en Node.js
   - El frontend en React Native
   - Las integraciones con servicios de IA
   
3. Comandos específicos para:
   - Clonar el repositorio
   - Instalar dependencias
   - Configurar variables de entorno
   - Ejecutar migraciones
   - Cargar datos de prueba (seeds)
   - Iniciar el proyecto en modo desarrollo
   - Realizar pruebas

4. Soluciones a problemas comunes de instalación

Las instrucciones deben ser paso a paso, incluyendo los comandos exactos a ejecutar y los archivos a modificar cuando sea necesario, asumiendo que el usuario tiene conocimientos técnicos pero no necesariamente experiencia con todas las tecnologías específicas del proyecto.
```

## Sección 2: Arquitectura del Sistema

**Prompt 2.1: Diagrama de arquitectura**
```
Como arquitecto de sistemas cloud con experiencia en aplicaciones móviles y sistemas distribuidos, diseña la arquitectura completa para un sistema de gestión de citas para barberías con IA. Proporciona:

1. Una descripción detallada de la arquitectura propuesta que incluya:
   - El patrón arquitectónico seleccionado y su justificación
   - Cada componente principal del sistema y su responsabilidad
   - Cómo se comunican los diferentes componentes entre sí
   - Dónde y cómo se implementan los modelos de IA
   - Cómo se maneja la escalabilidad y la alta disponibilidad

2. Un análisis de los beneficios que aporta esta arquitectura:
   - Ventajas técnicas
   - Beneficios para el desarrollo y mantenimiento
   - Cómo mejora la experiencia del usuario final
   - Cómo facilita la implementación de componentes de IA

3. Limitaciones o inconvenientes de la arquitectura elegida:
   - Posibles cuellos de botella
   - Aspectos que podrían mejorar en futuras iteraciones
   - Consideraciones para la implementación

Utiliza el formato de un diagrama textual detallado y explicativo que pueda servir como base para generar posteriormente un diagrama visual.
```

**Prompt 2.2: Descripción de componentes principales**
```
Como ingeniero de sistemas especializado en arquitecturas para aplicaciones móviles, describe detalladamente cada componente principal del sistema de gestión de citas para barberías con IA. Para cada componente, incluye:

1. Nombre y propósito general
2. Tecnología específica utilizada y justificación de su elección
3. Responsabilidades principales y funcionalidades que implementa
4. Interacciones con otros componentes del sistema
5. Aspectos técnicos relevantes (patrones de diseño, librerías clave, etc.)
6. Consideraciones de rendimiento y escalabilidad
7. Implementación de características de IA (si aplica)

Asegúrate de cubrir al menos:
- Frontend móvil (React Native)
- Backend API (Node.js/NestJS)
- Base de datos (PostgreSQL)
- Servicios de IA
- Sistema de notificaciones
- Servicios de autenticación y autorización
- Cualquier otro componente clave para el sistema

La descripción debe ser técnicamente precisa pero comprensible para desarrolladores que se incorporen al proyecto.
```

**Prompt 2.3: Estructura de ficheros**
```
Como arquitecto de software con experiencia en proyectos React Native y Node.js, diseña y explica la estructura de directorios y ficheros completa para el sistema de gestión de citas para barberías con IA. Incluye:

1. La estructura completa de carpetas para:
   - Frontend (React Native)
   - Backend (Node.js/NestJS)
   - Scripts de base de datos

2. Para cada directorio principal, explica:
   - Su propósito específico
   - Tipos de archivos que contiene
   - Convenciones de nomenclatura
   - Patrón arquitectónico que implementa (si aplica)

3. Detalla si la estructura sigue algún patrón específico (e.g., Clean Architecture, MVC, etc.) y cómo se refleja en la organización de los archivos

4. Explica cómo esta estructura facilita:
   - La separación de responsabilidades
   - La mantenibilidad del código
   - La escalabilidad del proyecto
   - La integración de componentes de IA

Proporciona un nivel de detalle suficiente para que un desarrollador pueda entender claramente dónde ubicar los diferentes tipos de archivos al contribuir al proyecto.
```

**Prompt 2.4: Infraestructura**
```
Como especialista DevOps con experiencia en despliegue de aplicaciones móviles y sistemas cloud, detalla la infraestructura completa y el proceso de despliegue para el sistema de gestión de citas para barberías. Incluye:

1. Descripción detallada de la infraestructura:
   - Servicios cloud utilizados (específica proveedores y tipos de servicios)
   - Entornos necesarios (desarrollo, staging, producción)
   - Recursos necesarios para cada componente
   - Configuración de redes y seguridad

2. Proceso completo de CI/CD:
   - Herramientas utilizadas
   - Pasos del pipeline
   - Estrategias de testing automatizado
   - Procesos de despliegue y rollback

3. Consideraciones específicas para:
   - Despliegue de la aplicación móvil en tiendas
   - Actualizaciones de la API backend
   - Gestión de migraciones de base de datos
   - Despliegue de modelos de IA

4. Monitorización y logging:
   - Herramientas propuestas
   - Métricas clave a monitorizar
   - Estrategias de alerta

5. Estrategias de escalabilidad y alta disponibilidad

La descripción debe ser técnicamente precisa y orientada a implementarse en entornos reales de producción.
```

**Prompt 2.4.1: Despliegues**

```
## Como DevOps especializado en plataformas cloud modernas, documenta y justifica la elección de Railway como plataforma de hosting para la primera versión del sistema de gestión de citas para barberías. Incluye:

1. Descripción de Railway y sus principales ventajas para proyectos Node.js y PostgreSQL.
2. Proceso paso a paso para desplegar el backend y la base de datos en Railway, incluyendo:
   - Creación de cuenta y proyecto
   - Conexión con GitHub para despliegue automático
   - Provisión de base de datos PostgreSQL
   - Configuración de variables de entorno y secretos
   - Comandos clave para migraciones y seeds
   - Generación de dominio público y pruebas de despliegue
3. Buenas prácticas de seguridad y gestión de credenciales en Railway.
4. Estrategias de escalabilidad y monitorización usando las herramientas integradas de Railway.
5. Consideraciones para migrar o escalar a otros entornos en el futuro.
6. Comparación breve con otras plataformas populares (Heroku, Render, Vercel) y justificación de la elección para este MVP.

El objetivo es que cualquier miembro del equipo pueda entender por qué se eligió Railway, cómo se realiza el despliegue y qué ventajas aporta en términos de velocidad, facilidad de uso, seguridad y escalabilidad para la primera versión del producto.
```

**Prompt 2.5: Seguridad**
```
Como consultor en ciberseguridad especializado en aplicaciones móviles y sistemas de gestión de datos personales, detalla las prácticas de seguridad implementadas en el sistema de gestión de citas para barberías. Incluye:

1. Protección de datos sensibles:
   - Estrategias de cifrado (en tránsito y en reposo)
   - Cumplimiento con regulaciones de protección de datos (GDPR, etc.)
   - Anonimización de datos para modelos de IA
   - Políticas de retención de datos

2. Seguridad en la API:
   - Protección contra ataques comunes (inyección, XSS, CSRF, etc.)
   - Rate limiting y protección contra DDoS
   - Validación y sanitización de inputs
   - Manejo seguro de errores

3. Seguridad en la infraestructura:
   - Aislamiento de componentes
   - Gestión de secretos
   - Actualizaciones y parches de seguridad

Para cada práctica de seguridad, incluye ejemplos concretos de implementación y explica cómo mitiga riesgos específicos relevantes para un sistema de gestión de citas con datos personales.
```

**Prompt 2.6: Tests**
```
Como ingeniero de QA especializado en pruebas para aplicaciones móviles y sistemas con IA, detalla la estrategia completa de testing para el sistema de gestión de citas para barberías. Describe:

1. Tipos de tests implementados:
   - Tests unitarios (con ejemplos específicos)
   - Tests de integración (con ejemplos específicos)
   - Tests end-to-end (con ejemplos específicos)
   - Tests de rendimiento y carga
   - Tests específicos para componentes de IA

2. Para cada tipo de test, proporciona:
   - Herramientas y frameworks utilizados
   - Enfoque y metodología
   - Áreas críticas cubiertas
   - Ejemplo detallado de un caso de test relevante

3. Estrategia de automatización:
   - Tests incluidos en el pipeline CI/CD
   - Frecuencia de ejecución
   - Manejo de fallos y reportes

4. Testing específico para características de IA:
   - Validación de modelos predictivos
   - Pruebas de precisión de recomendaciones
   - Evaluación de experiencia de usuario con componentes de IA

La descripción debe ser técnicamente detallada y demostrar un enfoque completo y profesional hacia la calidad del software.
```

## Sección 3: Modelo de Datos

**Prompt 3.1-3.2: Modelo de datos completo**
```
Como ingeniero de bases de datos especializado en PostgreSQL y modelado de datos para aplicaciones de gestión, diseña el modelo de datos completo para el sistema de gestión de citas para barberías con IA. Incluye:

1. Descripción detallada de todas las entidades principales:
   - Usuarios (clientes, barberos, administradores)
   - Servicios
   - Citas
   - Preferencias y perfiles
   - Valoraciones
   - Cualquier otra entidad necesaria

2. Para cada entidad, especifica:
   - Todos los atributos con nombres, tipos de datos y restricciones
   - Clave primaria y claves foráneas
   - Índices recomendados
   - Restricciones de integridad
   - Valores por defecto si aplica

3. Describe todas las relaciones entre entidades:
   - Tipo de relación (uno a uno, uno a muchos, muchos a muchos)
   - Cardinalidad
   - Restricciones de borrado/actualización en cascada

4. Explica cómo el modelo:
   - Soporta los requerimientos funcionales
   - Permite implementar las características de IA
   - Garantiza la integridad de los datos
   - Optimiza el rendimiento de consultas comunes

5. Incluye consideraciones para el almacenamiento de datos históricos, análisis y machine learning

El modelo debe ser completo, normalizado y optimizado para las operaciones típicas de un sistema de gestión de citas con componentes de IA.
```

## Sección 4: Especificación de la API

**Prompt 4: Especificación de la API**
```
Como arquitecto de APIs RESTful con experiencia en sistemas de reservas, diseña la especificación completa de la API para el sistema de gestión de citas para barberías con IA. En formato OpenAPI, detalla:

1. Los tres endpoints más críticos del sistema:
   - Gestión de citas (creación, modificación, cancelación)
   - Gestión de disponibilidad de barberos
   - Sistema de recomendaciones personalizadas basadas en IA

2. Para cada endpoint, especifica:
   - Método HTTP
   - Ruta completa
   - Parámetros de ruta, query y cuerpo (con tipos, restricciones y ejemplos)
   - Respuestas posibles (con códigos de estado, esquemas y ejemplos)
   - Headers requeridos
   - Mecanismos de autenticación y autorización

3. Para al menos un endpoint relacionado con IA, detalla:
   - Cómo se procesan los datos para generar recomendaciones
   - Qué parámetros afectan a los resultados
   - Formato de respuesta con explicación de cada campo

4. Incluye ejemplos completos de:
   - Request (con todos los parámetros necesarios)
   - Response (con datos realistas)
   - Manejo de errores

La especificación debe seguir las mejores prácticas de diseño RESTful y ser lo suficientemente detallada para que un equipo de desarrollo pueda implementarla sin ambigüedades.
```

## Sección 5: Historias de Usuario

**Prompt 5: Historias de usuario**
```
Como product owner con experiencia en desarrollo ágil y aplicaciones de servicios, redacta historias de usuario detalladas para el sistema de gestión de citas para barberías con IA. Selecciona historias que representen funcionalidades clave del sistema, incluyendo al menos una que involucre componentes de IA.

Para cada historia, proporciona:

1. Título claro y conciso
2. Usuario específico (rol)
3. Descripción en formato "Como [rol], quiero [acción] para [beneficio]"
4. Contexto detallado que explique la situación del usuario
5. Criterios de aceptación completos y verificables (al menos 4-5 por historia)
6. Información técnica relevante para el desarrollo
7. Consideraciones de UX/UI
8. Dependencias con otras historias o componentes
9. Estimación de esfuerzo (en story points o tiempo)
10. Prioridad y justificación de la misma

Las tres historias deben cubrir diferentes perspectivas del sistema:
- Una desde el punto de vista del cliente final
- Una desde el punto de vista del barbero
- Una desde el punto de vista del administrador del negocio

Cada historia debe ser completa, realista y seguir las mejores prácticas de historias de usuario en metodologías ágiles.
```
### Historia de Usuario 1: Gestión de Citas mediante Asistente Virtual
**Perspectiva:** Cliente de la barbería
**Características principales:**
- Asistente virtual conversacional con procesamiento de lenguaje natural
- Capacidad para programar, modificar y cancelar citas usando lenguaje cotidiano
- Personalización basada en el historial y preferencias del cliente
- Integración con canales externos como WhatsApp/Telegram

Esta historia implementa tecnología de IA para permitir a los clientes gestionar sus citas de manera conversacional, eliminando la necesidad de navegar por múltiples pantallas y haciendo el proceso más natural e intuitivo.

### Historia de Usuario 2: Gestión Visual de Estilos y Catálogo Interactivo
**Perspectiva:** Barbero
**Características principales:**
- Catálogo personalizado de trabajos realizados y estilos ofrecidos
- Sistema de etiquetado y categorización con reconocimiento visual automático
- Estadísticas sobre popularidad de estilos y conversión a reservas
- Vinculación directa entre estilos visuales y servicios ofrecidos

Esta historia incorpora elementos de IA para el reconocimiento visual y análisis de imágenes, mejorando la comunicación visual entre barberos y clientes y facilitando la selección precisa de estilos.

### Historia de Usuario 3: Dashboard Analítico de Rendimiento y Satisfacción
**Perspectiva:** Administrador/Dueño del negocio
**Características principales:**
- Dashboard interactivo con KPIs en tiempo real
- Análisis de tendencias y detección automática de anomalías
- Análisis de sentimientos en comentarios y correlación con factores operativos
- Recomendaciones basadas en datos para optimizar el negocio

## Sección 6: Tickets de Trabajo

**Prompt 6: Tickets de trabajo**
```
Como tech lead con experiencia en desarrollo full stack y gestión técnica de proyectos, crea tres tickets de trabajo detallados para el sistema de gestión de citas para barberías:

1. Un ticket de backend: Implementación del sistema de recomendación basado en IA
2. Un ticket de frontend: Desarrollo de la interfaz de reserva de citas con React Native
3. Un ticket de base de datos: Diseño e implementación del modelo de datos para preferencias de usuario y comportamiento histórico

Para cada ticket, proporciona:

1. Título técnico específico
2. Descripción detallada del problema o funcionalidad a implementar
3. Requerimientos técnicos completos
4. Tareas específicas a realizar (paso a paso)
5. Criterios de aceptación técnicos y funcionales
6. Dependencias con otros tickets o componentes
7. Consideraciones de rendimiento, seguridad y escalabilidad
8. Instrucciones para testing
9. Definición de hecho ("Definition of Done")
10. Estimación de tiempo/esfuerzo
11. Recursos o documentación de referencia
12. Detalles de implementación específicos para las tecnologías seleccionadas

Los tickets deben ser lo suficientemente detallados para que un desarrollador pueda tomarlos y trabajar sin necesidad de aclaraciones adicionales significativas.
```

## Sección 7: Pull Requests

**Prompt 7: Pull requests**
```
Como senior developer y revisor de código con experiencia en proyectos React Native y Node.js, crea tres pull requests detallados que podrían enviarse durante el desarrollo del sistema de gestión de citas para barberías con IA:

1. Un PR para la implementación del sistema de autenticación y perfiles de usuario
2. Un PR para el desarrollo del algoritmo de recomendación basado en IA
3. Un PR para la implementación del sistema de notificaciones inteligentes

Para cada pull request, incluye:

1. Título descriptivo que siga las convenciones de nomenclatura
2. Descripción detallada que incluya:
   - Resumen de los cambios implementados
   - Problema o historia de usuario que resuelve (con referencias)
   - Enfoque técnico utilizado
   - Decisiones de diseño importantes y su justificación
   - Cambios en la base de datos o APIs (si aplica)

3. Lista completa de cambios específicos realizados
4. Instrucciones detalladas para probar la funcionalidad
5. Capturas de pantalla o demos (descripción de lo que mostrarían)
6. Consideraciones sobre rendimiento, seguridad o UX
7. Dudas o solicitudes específicas para los revisores
8. Checklist de verificación pre-merge

Los pull requests deben seguir las mejores prácticas de la industria, ser informativos, facilitar la revisión de código y servir como documentación de los cambios importantes en el sistema.
```

Version 1.0