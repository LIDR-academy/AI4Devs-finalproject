# HU-003 — Localización en mapa dentro del detalle de árbol

## 1. Validación de la información existente


| Aspecto                           | Estado                                                                                                                                                                                                         |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Título**                        | Correcto y alineado con backlog: *Localización en mapa dentro del detalle de árbol*.                                                                                                                           |
| **Formato “Como… quiero… para…”** | Correcto; define claramente actor público, acción de visualizar mapa en detalle y beneficio de contexto geográfico sin salir del flujo de consulta.                                                            |
| **Estimación (S/M/L)**            | **M** coherente para alcance MVP (detalle público + representación en mapa).                                                                                                                                   |
| **Prioridad**                     | **Alta** coherente con valor de la consulta pública en el producto.                                                                                                                                            |
| **Inconsistencias detectadas**    | No hay contradicción de fondo con `readme.md` ni backlog; sí existe dependencia funcional estrecha con **HU-002** que requiere coordinación para evitar duplicidades de implementación en la vista de detalle. |
| **Tamaño / división**             | Tamaño adecuado para **M** si se mantiene foco en visualización de localización dentro del detalle (sin introducir geobúsqueda, clustering o filtros avanzados).                                               |


---

## 2. Historia refinada


| Campo                         | Valor                                            |
| ----------------------------- | ------------------------------------------------ |
| **ID**                        | HU-003                                           |
| **Épica**                     | Consulta pública                                 |
| **Título**                    | Localización en mapa dentro del detalle de árbol |
| **Estimación de complejidad** | M                                                |
| **Prioridad**                 | Alta                                             |


**Historia de usuario**

Como usuario de la aplicación, quiero ver en el detalle de cada árbol publicado su localización en mapa, para comprender su contexto geográfico sin salir del flujo de consulta de listado y detalle.

- **Entregable de la historia:** Vista de detalle público de árbol enriquecida con mapa integrado que muestre la localización del ejemplar publicado, reutilizando el flujo de navegación de **HU-002** y permitiendo implementación conjunta sin duplicar responsabilidades de listado/detalle frente a mapa.

### Alcance

#### Incluye

- Integración del mapa en la vista de detalle de árbol publicada.
- Visualización de marcador/posición geográfica del ejemplar a partir de coordenadas del árbol publicado.
- Comportamiento de fallback en detalle cuando no existan coordenadas válidas (mensaje o bloque informativo controlado).
- Coordinación explícita con **HU-002** para implementación conjunta de la página de detalle (estructura + mapa) en el mismo ciclo.
- Consumo de datos de localización dentro del contrato público del detalle sin requerir autenticación.

#### Queda fuera de esta historia

- Implementación del listado público y navegación base de consulta (núcleo de HU-002).
- Alta/edición de árboles y captura de coordenadas en formularios colaborador (HU-005/HU-008).
- Funcionalidades geoespaciales avanzadas (búsqueda por radio, clustering, capas temáticas, rutas).
- Gestión de fotografías, notificaciones o capacidades IA (HU-006, HU-007, HU-009, HU-010).
- Creación de una página de mapa independiente fuera de la ficha de detalle.

### Dependencias

- **HU-002**: disponibilidad de flujo de consulta pública (listado y acceso a detalle) y estructura de detalle reutilizable.
- Existencia de árboles publicados con coordenadas válidas en catálogo (dependencia de datos procedentes de HU-005).
- Contrato de lectura pública en gateway/backend que exponga coordenadas necesarias en el detalle.
- Definición de rutas y navegación MVP ya establecida (HU-013).

### Riesgos

- Solape de alcance entre HU-002 y HU-003 si no se coordina una única implementación de la vista de detalle.
- Inconsistencias de formato/rango de coordenadas que provoquen errores de render en el mapa.
- Dependencia de librería/proveedor de mapas y su disponibilidad en entornos de desarrollo o demo.
- Falta de datos publicados georreferenciados para validación funcional en pruebas.

### Aclaraciones pendientes (refinamiento)

- Definir con precisión los campos de coordenadas esperados en la respuesta de detalle público (nombre y formato).
- Determinar comportamiento UX definitivo cuando no haya coordenadas (ocultar mapa o mostrar estado vacío estándar).
- Acordar nivel de interacción del mapa en MVP (solo visualización, zoom/pan básico, sin herramientas adicionales).
- Concretar estrategia de implementación paralela HU-002/HU-003 en un único componente de detalle para evitar retrabajo.

## 3. Criterios de aceptación (BDD)

### Referencias

Backlog `HU-003` (tabla §3), `readme.md` §1.2 (consulta pública y visualización geográfica), `readme.md` §1.3 (detalle público con mapa integrado), `docs/use-cases/use-case-summary.md` (UC-01), relación funcional con [HU-002-fichas-publicadas-lista-y-detalle.md](HU-002-fichas-publicadas-lista-y-detalle.md).

### Escenario 1 — Mapa visible en detalle público con coordenadas válidas

- **Dado que** existe una ficha de árbol publicada con coordenadas válidas  
- **Cuando** un visitante abre su vista de detalle público  
- **Entonces** se muestra un mapa integrado en el detalle con la localización del ejemplar marcada correctamente.

### Escenario 2 — Continuidad del flujo listado -> detalle con mapa

- **Dado que** el visitante navega desde el listado público al detalle del árbol  
- **Cuando** accede a la ficha concreta  
- **Entonces** mantiene el flujo de consulta sin salir del detalle y visualiza la localización en mapa dentro de la misma página.

### Escenario 3 — Manejo de detalle sin localización disponible

- **Dado que** una ficha publicada no dispone de coordenadas válidas  
- **Cuando** un visitante abre su detalle público  
- **Entonces** la página no falla y muestra un estado controlado indicando que la localización no está disponible.

## 4. Evaluación INVEST (resumen)


| Criterio          | Comentario                                                                                                          |
| ----------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Independiente** | Parcialmente: depende del detalle público de HU-002, pero aporta valor específico de contexto geográfico.           |
| **Negociable**    | Sí: nivel de interacción del mapa y comportamiento de fallback pueden ajustarse sin alterar el objetivo principal.  |
| **Valiosa**       | Sí: mejora comprensión del árbol publicado y la utilidad de la consulta pública.                                    |
| **Estimable**     | Sí: alcance acotado a mapa integrado en detalle, sin geoespacial avanzado.                                          |
| **Small**         | Sí para **M** si se mantiene la implementación dentro de detalle y sin ampliar a funcionalidades de mapa avanzadas. |
| **Testable**      | Sí: verificable con escenarios de detalle con/sin coordenadas y navegación pública integrada con HU-002.            |


## 5. Esfuerzo estimado de implementación

Orden de magnitud **medio (M)** para MVP: integración de mapa en detalle público, ajuste del contrato de datos de localización en backend/gateway si procede y validación de estados de interfaz con coordenadas válidas y no disponibles. Al implementarse en paralelo con **HU-002**, parte del esfuerzo se optimiza al compartir la misma pantalla de detalle.