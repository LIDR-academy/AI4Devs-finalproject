## **Propósito**

router-service es la **fuente de la verdad geográfica** de la plataforma. Su objetivo es:

* Gestionar **Stops** (paradas) y **Routes** (rutas) con sus **geometrías** y **metadatos operativos**.

* Mantener **versionado** y **snapshots inmutables** de rutas para uso operativo (p. ej. planifications-service).

* Proveer capacidades espaciales: búsquedas por **bbox**, búsquedas **nearest**, export/import (GeoJSON / polyline / CSV).

* Ejecutar y validar reglas topológicas (no self-intersect, conectividad, longitud mínima), detectar duplicados de paradas (flagging) y soportar merge manual.

* Calcular (vía adaptadores a proveedores de mapas) y **cachear** estimaciones de distancia/tiempo por versión de ruta.

* Publicar eventos (RoutePublished, StopCreated, RouteEstimateUpdated) mediante Outbox con payloads mínimos (sin PII ni geometría completa en topics públicos).

**Alcance**

**Incluye:**

* CRUD y flujo editorial de **Stops** y **Routes** (draft → publish → version).

* Snapshots inmutables (route\_version) para consumo por planificación y ops.

* Búsquedas espaciales (bbox, nearest), detección de duplicados, import/export.

* Integración con proveedores de mapas (adapter con fallback y cache).

* Publicación de eventos confiables y tabla outbox.

* Soporte para **multi-tenant** y **multi-operator** (una ruta puede asociarse a uno o varios operadores).

**No incluye:**

* Planificación / asignación de servicios (eso lo hace planifications-service).

* Map-matching en tiempo real de telemetría (eso lo hace traffic-control-service), aunque router-service expone la geometría para ayudar al matching.

* Almacenamiento de PII o datos sensibles.

## **Entidades**

**Stop**

Una Stop es la entidad que representa una parada física única en el mundo (un punto geográfico) que puede reutilizarse en múltiples rutas; encapsula la posición (lat/lon), datos operativos básicos (dirección, zona horaria, atributos de accesibilidad), estado de aprobación y metadatos, y sirve como la referencia canonical que usan las rutas para localizar dónde debe efectuarse una recogida o bajada.

**Route**

Una Route es el objeto lógico y persistente que agrupa la historia y la propiedad de una ruta; define el concepto comercial de la ruta (nombre, propietario/tenant u operadores asociados y estado de vida como draft/approved) y actúa como contenedor que apunta a la versión vigente (current\_version\_id) para separar la identidad lógica de sus representaciones operativas.

**RouteSnapshot**

 Un RouteSnapshot (o versión) es la representación operativa e inmutable de una Route en un momento concreto: contiene la secuencia ordenada de paradas tal como se ejecuta, la geometría del trazado asociada a esa versión, las métricas operativas cacheadas (distancia, duración estimada), las ventanas de validez y la marca temporal de publicación; su inmutabilidad garantiza que la planificación y la ejecución puedan reproducir exactamente la ruta que existía en el momento de su creación.

**RouteStop**

Un RouteStop describe la presencia y el papel de una Stop dentro de una RouteSnapshot: expresa la posición secuencial (orden) en la ruta, parámetros específicos para esa parada en esa versión (dwell time, alias o nombre local, reglas de pickup/dropoff, si está activa), y permite que la misma parada física aparezca múltiples veces en una ruta con comportamientos distintos en cada aparición.

**Route Geometries:** 

RouteGeometries agrupa una o varias representaciones geométricas asociadas a una RouteSnapshot — por ejemplo la geometría primaria (LINESTRING), una versión simplificada para UIs, las geometrías por tramo (segments) o la geometría tal cual la devuelve un proveedor de mapas — y facilita tanto la visualización como el cálculo de estimaciones y el map-matching manteniendo metadatos sobre el tipo, el proveedor y la precisión de cada geometría.

