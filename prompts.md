# Prompts destacados utilizados en el proyecto

Los cambios en este proyecto se realizan **mediante pull requests**. Este archivo se rellena con los **prompts destacados** (máximo 3 por sección): aquellos que mejor justifican el uso de asistentes de código en cada fase del ciclo de vida. La entrega actual corresponde a **Pull Request 2 (segunda entrega)**.

## Categorías temáticas

### 🏷️ **Nombre**: Inicio/cierre de tickets (trabajemos en X, confirmar, cerremos)

- 📋 **Prompts incluidos**:
  - Trabajemos en T6-086; ok.
  - Trabajemos en T6-087; si.
  - Trabajemos en T6-001; no está la BD creada; eso no se puede crear con migración?; ok sigamos; si; cerremos este issue.
  - Trabajemos en T6-002; cedula en vez de NIT; si; qué revisar; está ok.
  - T6-003 ok continuemos / quedó ok; T6-004 ok / implementa; si hace 1 y luego cerramos; T6-005 si; está ok; T6-006 ok; me gusta opción A y ruta /crear-caso; ok; T6-007 si; cerremos; T6-008 si cerremos; T6-009 si cerremos; T6-010 ok cerremos; T6-011 no veo referencias a mockup; por qué te saltaste el mockup?; si aplicalo; cerremos; T6-012 ok; cerremos; no dale con el push no más.
- 🔢 **Total**: 28+ prompts

---

### 🏷️ **Nombre**: UI / Login y marca (nombre sistema, favicon, logo, footer)

- 📋 **Prompts incluidos**:
  - Faltan nombre del sistema, favicon y logo Kibernum.
  - Footer: Kibernum - DII 2026 - AÑO_ACTUAL.
  - Objetos corporativos en brand-assets; no estás leyendo DESIGN_SYSTEM.
  - No se cargan las imágenes; sigo sin verlas; ok ahora sí pero no veo favicon y pusiste logo DII en vez de Kibernum.
  - Logo en login debe ser logo_kib.png; favicon desde brand-assets/favicon.png.
  - Agranda más el logo; Takumi más grande que "Acceso al sistema"; "Service Desk Corporate" abajo más pequeño.
  - Agranda más el logo de Kibernum; quita "Acceso al sistema".
  - Login: logo como imagen (no escudo), tamaño grande; recuperar contraseña abajo del botón (tabulación); quita ese mensaje.
  - Recordar sesión (antes "recordar usuario"); quita mensaje de ayuda.
- 🔢 **Total**: 18 prompts

---

### 🏷️ **Nombre**: Flujo, reglas y artefactos (log, pruebas, MR, documentación)

- 📋 **Prompts incluidos**:
  - Fecha y hora inicio al principio del desarrollo (log).
  - Commit, push y MR automático al decir "todo ok"; añadir a flujo.
  - Ejecución de pruebas (Angular, Laravel, E2E), log_pruebas, carpeta resultados; añadir al flujo.
  - Nombre desde GitLab se extrae mal; cobertura de pruebas no se calcula.
  - Resultado de pruebas siempre lo mismo; Playwright report mismas pruebas.
  - Carpeta "pruebas" en docs/artifacts; ¿duplicamos info?
  - Al cerrar: commit, push y MR; añadir a reglas.
  - README no actualizado bien; verificar completitud con prompt_documentacion; actualizar en el flujo al añadir pantallas/tickets.
  - Todo lo genérico a reglas y flujos; design system obligatorio; mockups obligatorios al redactar requisito (sección "Mockup de referencia").
- 🔢 **Total**: 14 prompts

---

### 🏷️ **Nombre**: Design system y componentes (ng-select, autocomplete, estilos globales)

- 📋 **Prompts incluidos**:
  - Incluir librerías de autocomplete en listas desplegables; no seguiste design system?
  - Por qué implementaste componente propio? Design system dice instalar plugin/librería; usemos ng-select.
  - Falta estilo para que se note que son desplegables (flecha, borde).
  - No se ven bien en listado (sin flecha, sin borde, placeholder superpuesto); estilos globales para que no difieran entre pantallas; añadir a reglas.
  - Doble flecha en desplegables; ocultar una.
  - Validación visible por campo (correo, etc.); layout escritorio en todas las pantallas.
  - Iconografía consistente; añadir al design system y flujo.
  - Estilos globales para componentes compartidos; no divergir por pantalla salvo que el usuario lo pida.
- 🔢 **Total**: 12 prompts

---

### 🏷️ **Nombre**: Crear caso y formularios (mockup, validación, layout, BD)

- 📋 **Prompts incluidos**:
  - ¿Estás mirando mockups HTML e imágenes al diseñar? Añadir al flujo.
  - Crear caso: parecerse más al mockup; bordes muy pegado a márgenes; logo login y recuperar contraseña abajo.
  - Algo pasó y se ve horrible (grid/alineación).
  - Cómo probar que guarda desde el form a la BD.
  - Ng-select: no parece implementado; listas no parecen listas; TS2307 módulo no encontrado; bajar y subir front; doble flecha; validación correo y layout escritorio.
  - Algo genérico a reglas; Docker prune en README; commit y pull desde main antes de push.
- 🔢 **Total**: 11 prompts

---

### 🏷️ **Nombre**: Listado de casos y detalle (tabla, filtros, topbar, banderas)

- 📋 **Prompts incluidos**:
  - Listado: solo se ve bien 1 caso (layout tabla); truncar casos para empezar de 0.
  - Desplegables en listado sin borde; unificar estilos globales.
  - Validar vs prototipo; faltan cosas; login, layout, crear caso (orden); topbar Help, Settings, avatar; checkbox "Incluir casos cerrados".
  - Locale es-CL (DatePipe); formato fecha 06-03-2026 19:54; no mostrar RUT, columna Correo aparte.
  - Detalle: más estilo (colores, pills, cards); banderita en país; más colores en home/crear/listado.
  - Listado: banderita donde se imprime país; no se ve emoji; sistema muy gris; colores más vivos.
  - Banderitas siguen sin verse (flag-icons CDN).
- 🔢 **Total**: 13 prompts

---

### 🏷️ **Nombre**: Backend y BD (migraciones, seed, truncate)

- 📋 **Prompts incluidos**:
  - T6-001: BD no creada; crear con datos .env; ¿se puede con migración?
  - Playwright: video/screenshots obligatorios en resultados.
  - Qué revisar T6-001; servidor BD abajo correr migraciones; BD creada correctamente.
  - T6-002: cédula de ciudadanía en vez de NIT (Colombia).
  - Evidencia unit-front, unit-back, e2e en subcarpetas; .gitignore y versionar resultados.
  - Subir archivos que no pertenecían al issue; hacer MR.
- 🔢 **Total**: 8 prompts

---

### 🏷️ **Nombre**: Revisión y qué probar

- 📋 **Prompts incluidos**:
  - Qué tengo que revisar (T6-087, T6-001, T6-002, T6-005, T6-006, T6-011).
  - Cómo pruebo T6-011; qué probar; bajar y subir front.
  - Puerto del front; npm install; lo que estaba viendo está bien?
- 🔢 **Total**: 6 prompts

---

## Conclusiones

- 🥇 **Categoría dominante**: **Inicio/cierre de tickets** (28+ prompts).
- ⚖️ **Áreas a balancear**: **Revisión y qué probar** (6); **Backend y BD** (8). Las categorías **UI Login y marca**, **Flujo y artefactos**, **Design system**, **Crear caso/formularios** y **Listado y detalle** tienen entre 11 y 18 prompts cada una.
