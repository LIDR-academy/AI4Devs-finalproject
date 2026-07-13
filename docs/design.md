# Sistema de diseño — La Pocha

> Documento de referencia visual extraído por inspección de los wireframes
> generados en Figma (Home, Crear partida, Añadir jugadores, Orden de mesa,
> Apuestas). Es orientativo, no pixel-perfect: sirve para guiar a Cursor al
> traducir los wireframes a widgets Flutter con un lenguaje visual coherente,
> no como especificación exacta de medidas.

## Paleta de color

| Token semántico | Uso observado | Aproximación |
|---|---|---|
| `primary` | Cabeceras, botones de acción principal, círculos de posición activos | Verde tapete oscuro (`#2E7D5B` aprox.) |
| `primaryContainer` / `primary` (tono claro) | Avatares de jugador (fondo verde claro), fondo de tarjetas resaltadas (apuesta seleccionada) | Verde claro (`#D7ECE0` aprox.) |
| `surface` | Fondo general de pantalla | Beige/gris muy claro, cálido (`#F2EFE9` aprox.) |
| `surfaceContainer` / tarjetas | Tarjetas blancas (resumen, jugadores, listas) | Blanco roto (`#FFFFFF` / `#FCFBF9`) |
| `secondary` / acento cálido | Botón "Repartidor aleatorio", aviso de "¿Cómo empezar?", chip de "número prohibido" | Ámbar/terracota suave (`#F4A259` aprox., con fondo `#FCEFE0` aprox.) |
| `error` / advertencia | Aviso de número prohibido, futuro botón "Cancelar partida" | Naranja/rojo de advertencia (`#D9772E` para texto, fondo ámbar pálido) |
| `onPrimary` | Texto sobre fondo verde (cabeceras) | Blanco |
| `onSurface` | Texto principal sobre fondo claro | Gris oscuro casi negro (`#2B2B28` aprox.) |
| `onSurfaceVariant` | Texto secundario, etiquetas, subtítulos | Gris medio (`#6B6B66` aprox.) |

**Nota de theming futuro:** estos tokens están nombrados siguiendo la
convención de `ColorScheme` de Material 3 en Flutter (`primary`,
`onPrimary`, `surface`, `error`, etc.) de forma intencional, para que migrar
a un theme configurable por el usuario (backlog post-MVP) sea una extensión
de `ColorScheme.fromSeed()` en vez de un refactor de valores hardcodeados
dispersos por los widgets.

## Tipografía

- Familia sans-serif geométrica/humanista de alto contraste (tipo Inter o
  Roboto). En Flutter: `Theme.of(context).textTheme`, sin tipografía
  decorativa.
- Jerarquía observada:
  - **Título de cabecera** (ej. "La Pocha", "Nueva partida"): grande, bold,
    blanco sobre verde.
  - **Subtítulo de cabecera** (ej. "2 de 4 añadidos", "Arrastra para
    reordenar"): tamaño medio, peso regular, blanco con opacidad reducida.
  - **Números destacados** (ej. "4" jugadores, "40" cartas, "19/22" rondas,
    "Bazas restantes: 4"): muy grandes, bold, color `primary` — son el
    elemento de mayor peso visual de cada pantalla, coherente con la
    necesidad de legibilidad a distancia (persona Carlos, PRD).
  - **Etiquetas de campo** (ej. "NÚMERO DE JUGADORES", "PARTICIPANTES",
    "TURNO DE APUESTAS"): mayúsculas, tamaño pequeño, letterspacing amplio,
    color `onSurfaceVariant` — actúan como section headers discretos.
  - **Texto de cuerpo / nombres**: tamaño medio, peso semi-bold para nombres
    de jugador, regular para texto descriptivo.

## Espaciado y forma

- Esquinas redondeadas generosas y consistentes en todos los contenedores:
  tarjetas, botones, chips, avatares — aprox. 12–20px (`BorderRadius` entre
  `12` y `20` en Flutter).
- Cabecera de cada pantalla: bloque verde de altura fija con esquinas
  inferiores redondeadas, ocupando el ancho completo, ligeramente menor que
  el ancho total de pantalla (efecto de "tarjeta flotante" en la parte
  superior, no banda edge-to-edge).
- Las tarjetas de contenido (blancas) usan elevación sutil (sombra ligera,
  no borde duro) sobre el fondo `surface`.
- Padding interno generoso en tarjetas y filas de lista (aprox. 16–20px),
  con separación vertical clara entre tarjetas (aprox. 12–16px) — prioriza
  "tocabilidad" y lectura rápida sobre densidad de información.

## Componentes recurrentes identificados

- **Avatar circular con inicial**: color de fondo variable por jugador
  (verde, ámbar, azul, lila — paleta categórica para diferenciar jugadores
  a simple vista), inicial en mayúscula centrada.
- **Botón primario de ancho completo**: fondo `primary`, texto blanco bold,
  esquinas redondeadas, icono opcional a la izquierda del texto (ej. "+
  Nueva partida", "▶ Empezar partida").
- **Botón secundario / acción de bajo énfasis**: fondo `secondary` claro
  (ámbar pálido), texto en tono `secondary` oscuro, mismo radio de esquina
  que el primario pero sin la prominencia visual (ej. "Repartidor
  aleatorio").
- **Chip selector**: fila de opciones discretas (ej. selector de número de
  jugadores 3–8), opción activa con fondo `primary` y texto blanco, resto
  con fondo `surface`/transparente y texto `onSurfaceVariant`.
- **Tarjeta de dato numérico destacado**: par etiqueta+valor con el valor
  en tipografía grande alineado a la derecha (ej. "Cartas totales — 40
  cartas"), usado en pantallas de resumen y de ronda.
- **Indicador de progreso/conteo**: segmentos tipo "barra de puntos" (ej.
  "2 de 4 añadidos" en Jugadores) — representa unidades completadas de un
  total, no pasos de navegación (aclarado tras revisión conjunta).
- **Aviso contextual (banner)**: fondo de color suave (ámbar para
  advertencia, verde pálido para tips informativos), icono a la izquierda,
  texto explicativo corto — usado tanto para "número prohibido" (alerta)
  como para "¿Cómo empezar?" (ayuda).
- **Fila reordenable (drag handle)**: icono de tres líneas horizontales a
  la izquierda, número de posición en círculo, contenido central, acción o
  indicador a la derecha.
- **Cabecera de pantalla de ciclo de ronda**: patrón recurrente confirmado
  en Apuestas y Pantalla de juego — icono de "más opciones" (tres puntos)
  en círculo translúcido sobre el verde, esquina superior derecha, que
  despliega "Cancelar partida"; y un enlace discreto "‹ Ver ronda anterior"
  justo debajo de la cabecera (solo visible a partir de la ronda 2). Debe
  replicarse igual en Bazas reales y Resultado de ronda cuando se generen.

## Pantallas pendientes de wireframe (bloqueado por créditos Figma hasta 01/07)

- **Bazas reales (LPT-11)**: implementar por ahora solo con la descripción
  textual del ticket + estos tokens; revisar visualmente en cuanto se
  genere el wireframe.
- **Resultado de ronda (LPT-14)**: idem.

## Principios de diseño a mantener en pantallas nuevas

1. **Un solo color primario dominante** (verde tapete) + un acento cálido
   secundario (ámbar) para todo lo que requiere atención sin ser la acción
   principal (advertencias, acciones secundarias).
2. **Jerarquía por tamaño, no por saturación**: los datos más importantes
   (números de ronda, bazas restantes, puntuación) son grandes y bold, no
   necesariamente de color distinto.
3. **Tarjetas blancas sobre fondo cálido neutro**, nunca texto directamente
   sobre el fondo `surface` para contenido interactivo — todo lo tocable
   vive dentro de una tarjeta o botón con forma propia.
4. **Mobile-first, una sola columna**: ninguna pantalla del MVP usa layouts
   multi-columna; todo se apila verticalmente, coherente con el uso en mano
   durante una partida.
