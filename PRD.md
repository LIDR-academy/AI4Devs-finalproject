# PRD

# Reading Analytics Platform

**Versión:** 1.0

**Owner:** Celia (Founder / Product Owner)

**Fecha:** abril 2026

**Estado:** Ready for UX & Technical Design

---

# 1. Introducción y Objetivos

## Resumen del producto

Reading Analytics Platform es una aplicación web desktop orientada a lectoras intensivas que desean registrar sus lecturas y obtener estadísticas avanzadas de forma visual, sencilla y automatizada.

El producto nace para sustituir el uso de Excel como herramienta de tracking lector, eliminando la necesidad de fórmulas manuales y entrada repetitiva de datos.

El foco principal del producto es la **analítica de los libros leídos**.

No se trata de una red social de libros, sino de un espacio personal donde la usuaria puede entender sus hábitos lectores a través de dashboards, comparativas y objetivos.

---

## Propósito

Permitir que lectoras orientadas a datos puedan:

- registrar lecturas fácilmente
- gestionar TBR mensuales
- analizar métricas mensuales y anuales
- seguir objetivos anuales
- exportar visuales atractivos
- descubrir patrones en sus hábitos de lectura

---

## Objetivos del producto

### Objetivos funcionales

- sustituir completamente Excel
- automatizar captura de metadatos
- ofrecer estadísticas avanzadas
- simplificar gestión de listas y TBR

---

## Objetivos de experiencia

- interfaz visual, suave y femenina
- experiencia clara y no técnica
- baja fricción en flujos clave
- alta sensación de control

---

## Objetivos de negocio (sin monetización)

En esta fase, el objetivo no es monetización sino **product excellence**.

Se prioriza:

- calidad funcional
- precisión de métricas
- usabilidad
- delight visual

---

# 2. Stakeholders

## Stakeholder principal

### Founder / Product Owner

Celia

Responsable de:

- visión
- priorización
- validación funcional
- diseño de producto

---

## Usuario principal

### Lectoras que adoran los datos

Perfil principal:

- leen varios libros al mes
- actualmente usan Excel / Notion
- disfrutan analizando patrones
- valoran dashboards y wrap-ups

---

## Stakeholder secundario

### Influencers literarias

Usuarios que pueden utilizar el producto para:

- wrap-ups mensuales
- estadísticas visuales
- stories
- contenido para Instagram / TikTok

---

## Stakeholders futuros

- diseñadora UX/UI
- frontend developer
- backend developer
- QA / accessibility

---

# 3. Historias de Usuario

---

## Tracking

- Como lectora, quiero añadir un libro mediante búsqueda automática para no introducir datos manualmente.
- Como lectora, quiero registrar múltiples libros a la vez para reflejar mis lecturas simultáneas.

---

## Progreso

- Como lectora, quiero actualizar la página actual para saber cuánto me queda por leer.
- Como lectora, quiero ver una barra de progreso para visualizar mi avance rápidamente.

---

## Estadísticas

- Como lectora, quiero ver gráficos por género, formato y rating para entender mis hábitos.
- Como lectora, quiero comparar este mes con otro periodo para analizar mi evolución.

---

## Objetivos

- Como lectora, quiero definir una meta anual para seguir mi progreso.
- Como lectora, quiero recibir insights automáticos sobre mi ritmo lector.

---

## TBR

- Como lectora, quiero gestionar listas mensuales para organizar mis lecturas.
- Como lectora, quiero que se marquen automáticamente cuando termino un libro.

---

## Export

- Como influencer, quiero exportar mis estadísticas en formato story para compartirlas.

---

# 4. Componentes Principales y Sitemap

## Navegación

**sidebar fija izquierda**

---

## Sitemap

### Home

- libros actuales
- progreso
- meta anual
- KPIs del mes
- TBR actual

---

### Book Tracker

- tabla visual
- filtros
- búsqueda interna
- edición
- añadir libro

---

### Reading Stats

- dashboards
- gráficos
- comparativas
- insights

---

### Lists

- TBR mensual
- listas personalizadas
- favoritos
- retos

---

### Goals

- meta anual
- forecast
- evolución

---

### Library

- histórico completo
- búsqueda avanzada
- filtros

---

### Recap / Insights

- resumen mensual
- resumen anual
- export

---

### Import / Export

- Excel
- CSV
- Goodreads
- story export

---

### Perfil / Ajustes

- preferencias
- temas visuales
- fuentes de datos
- objetivos

---

# 5. Características y Funcionalidades

---

## MVP Priority

Funcionalidades prioritarias:

- añadir libro importando todos sus datos de forma automática
- TBR listas
- meta anual
- insights automáticos

---

## Alta prioridad V1

- progreso página / %
- export story
- comparativas
- búsqueda avanzada
- tags personalizadas

---

## Funcionalidades clave

### Importación

- Excel
- CSV
- Goodreads export

---

### Exportación

- PNG
- PDF
- Story 9:16

---

### Tags

La usuaria puede crear tags propias.

Ejemplos:

- cozy fantasy
- spicy romance
- book club

---

### Search

Búsqueda interna por cualquier filtro:

- autora
- género
- trope
- saga
- año
- formato
- rating

---

# 6. Diseño y Experiencia de Usuario

## Estilo visual

**soft feminine / coquette** 🎀📚

Debe sentirse:

- elegante
- suave
- cálido
- limpio

---

## Paleta

- Veranda blue #6BB1AD → acciones primarias, navegación lateral y header
- Sky cloud #A7BCBD → secundarios
- Blanco #FFFFFF → fondo principal
- Lychee #ECECDB → superficies de card / modal
- Melon #E5A9A9 → highlights suaves
- Cupid pink #E6748E → KPIs y acentos

---

## UX Principles

- cards suaves
- bordes redondeados
- tipografía editorial
- dashboards visuales
- gráficos claros
- microinteracciones

---

## Experiencia

El producto debe sentirse más cercano a:

- journaling app
- reading planner
- aesthetic dashboard

que a un SaaS corporativo clásico.

---

# 7. Requisitos Técnicos

## Frontend

- React
- TypeScript
- responsive desktop-first

---

## Backend

- Node / NestJS
- PostgreSQL

---

## Data sources

lookup secuencial con fallback:

1. fuente principal: Open Library API 
2. secundaria: Google Books API
3. Goodreads
4. entrada manual

---

## Interactividad

- edición inline
- modales
- drag & drop listas
- filtros persistentes

---

## Personalización

- tags custom
- listas custom
- objetivo anual editable

---

## Normativa

Cumplimiento obligatorio de la normativa de accesibilidad web en España, impulsada por la **Ley 11/2023** y el **Real Decreto 193/2023**: estándar **UNE-EN 301 549** (WCAG 2.1/2.2 nivel AA) 

---

# 8. Planificación del Proyecto

## Fase 1 · Core MVP

Duración estimada: **4-6 semanas**

- arquitectura base
- diseño sistema
- add book flow
- TBR lists
- meta anual
- insights básicos

---

## Fase 2 · Analytics Expansion

Duración estimada: **3-4 semanas**

- comparativas
- dashboards avanzados
- export story
- progreso %

---

## Fase 3 · Delight & Polish

Duración estimada: **2-3 semanas**

- animaciones
- recap mensual
- mejoras visuales
- optimización

---

## Dependencias

- diseño UX
- modelo de datos
- APIs de libros
- motor de insights

---

# 9. Criterios de Aceptación

## Añadir libro

- búsqueda devuelve resultados relevantes
- selección de edición
- guardado correcto
- visible en tracker

---

## TBR

- listas automáticas creadas
- checklist funcional
- auto-complete al finalizar lectura

---

## Meta anual

- progreso visible
- % correcto
- forecast funcional

---

## Insights

- al menos 3 insights generados por periodo
- datos coherentes con lecturas reales

---

## Export story

- formato vertical 9:16
- visual atractivo
- legible en móvil

---

# 10. Non-goals / Fuera de alcance

Explícitamente fuera de esta iteración:

- red social
- reseñas públicas
- comentarios
- feed actividad
- recomendaciones IA de libros
- compra de libros
- app móvil nativa
- integración Kindle / Kobo

Esto es muy importante para evitar scope creep.

---

# 11. Métricas de Éxito (KPIs)

## Activación

- % usuarios que añaden libro en primera sesión
- tiempo medio hasta primer libro

---

## Engagement

- visitas semanales a stats
- nº listas activas
- nº actualizaciones de progreso

---

## Sustitución de Excel

KPI principal:

**% de usuarios que importan datos históricos y continúan usando el producto semanalmente**

---

## Retención funcional

- uso recurrente de TBR mensual
- revisión de meta anual
- export wrap-up mensual

---

# 12. Apéndices y Recursos

## Glosario

**TBR** → To Be Read

**DNF** → Did Not Finish

**Reading Session** → lectura individual del mismo libro

**Re-read** → relectura

---

## Referencias

Benchmark funcional:

- Goodreads
- The StoryGraph