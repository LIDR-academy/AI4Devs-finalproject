# Historias de Usuario — Gamy (MVP)

## US-001 — Explorar catálogo como visitante

**Título de la Historia de Usuario:**
Como **visitante**,
quiero **buscar, filtrar y ver la ficha básica de un juego**,
para que **pueda descubrir juegos adecuados sin necesidad de registrarme**.

**Criterios de Aceptación:**

* Puedo **buscar por nombre** y **filtrar** por **número de jugadores**, **tiempo de juego** y **edad mínima**.
* Al abrir un juego, veo **descripción básica**, **categoría**, **rango de jugadores**, **tiempo estimado**, **edad mínima** e **imagen**.
* Se muestran **reglas básicas** y hasta **3 videos intro** (si existen) sin requerir login.
* La interfaz es **responsive** y se carga en **< 3 s** para la ficha y el listado principal.
* Si no hay resultados, el sistema muestra un **mensaje claro** y sugiere **limpiar filtros**.

**Notas Adicionales:**

* Preparar SEO básico (título/meta) para las páginas de detalle.
* Los videos deben **abrirse en una nueva pestaña** (enlace externo).

**Historias de Usuario Relacionadas:**

* **US-002** (Biblioteca/Wishlist — requiere registro).
* **US-003** (Curación de catálogo y reglas por el administrador).

---

## US-002 — Gestionar mi biblioteca y wishlist

**Título de la Historia de Usuario:**
Como **usuario registrado**,
quiero **agregar/quitar juegos a mi biblioteca y wishlist**,
para que **pueda organizar mi colección y planear futuras compras**.

**Criterios de Aceptación:**

* Desde la ficha de un juego puedo **Agregar a Biblioteca** (estado: *owned*) o **Agregar a Wishlist** (*wishlist*), y **quitar** con un clic.
* El sistema **evita duplicados**: un juego no puede estar dos veces en el mismo estado; mover entre *owned* ↔ *wishlist* es posible con confirmación.
* Puedo **ver mi lista** paginada con **contador** total y **filtros** (owned/wishlist).
* La acción muestra **feedback inmediato** (toast/alerta) y se **persiste** en la base de datos.
* Cumple con **seguridad CSRF** y **requiere sesión**; si no estoy logueado, se me redirige a **login** y luego a la página previa.

**Notas Adicionales:**

* Registrar en la BD **fecha de agregado** para ordenar por **recientes**.
* Preparar endpoint para **recomendaciones futuras** (no obligatorio en MVP).

**Historias de Usuario Relacionadas:**

* **US-001** (Explorar catálogo para descubrir juegos).
* **US-003** (Administrador mantiene el catálogo actualizado).

---

## US-003 — Curar catálogo, reglas y solicitudes

**Título de la Historia de Usuario:**
Como **administrador/curador**,
quiero **crear/editar juegos, gestionar versiones de reglas y variantes, y aprobar solicitudes de nuevos juegos**,
para que **el catálogo se mantenga actualizado y de alta calidad**.

**Criterios de Aceptación:**

* Puedo **crear/editar** juegos (nombre, descripciones, atributos clave, imagen, categoría) desde **Django Admin**.
* Puedo crear **RuleSets** por **idioma** y **versión** (p. ej. *es/en/fr*, *v2.0*), y asociar **reglas en markdown**.
* Puedo crear **RuleVariants** (oficial o comunidad) con **tags** y **ajustes** (p. ej. deltas de jugadores/tiempo).
* Puedo **asociar videos** de entrenamiento (YouTube/Vimeo/otro) a un **juego** y opcionalmente a un **RuleSet**.
* Puedo **aprobar/rechazar** **solicitudes de nuevos juegos** con **historial** (quién y cuándo lo cambió).
* Las operaciones de admin requieren **permisos**; usuarios sin rol admin reciben **403**.

**Notas Adicionales:**

* Mantener **auditoría básica** (created\_at/updated\_at y usuario que modifica).
* Validar **enlaces de video** y **idiomas** contra lista permitida (ISO-639-1).

**Historias de Usuario Relacionadas:**

* **US-001** (Contenido visible para visitantes: reglas básicas/videos).
* **US-002** (Usuarios registrados gestionan su biblioteca y wishlist).
