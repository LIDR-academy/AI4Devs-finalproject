# Sistema de diseño — Clickoteca

> **Qué es esto.** El segundo entregable de diseño/UX, después de
> [`ux-flows.md`](ux-flows.md) y siguiendo el orden que aquel propuso en su §9:
> primero el sistema, después los wireframes. Fija el **material** con el que se
> construyen las pantallas —color, tipografía, ritmo, vocabulario de estados y
> componentes— para que las que faltan no se inventen cada una su forma de decir lo
> mismo.
>
> **Qué no es.** No es un catálogo de pantallas ni una guía de marca. No decide qué
> vistas existen (eso es `ux-flows.md` §8.2, todavía abierto) ni cómo se maquetan
> (eso vendrán a ser los wireframes).
>
> **Está implementado, no solo escrito.** Los tokens viven en
> [`app/globals.css`](../app/globals.css), el vocabulario de estados en
> [`lib/status.ts`](../lib/status.ts) y la píldora en
> [`components/ui/badge.tsx`](../components/ui/badge.tsx). Dos pruebas lo sostienen:
> [`tests/design-tokens.test.ts`](../tests/design-tokens.test.ts) mide los contrastes
> contra el CSS real y [`tests/status.test.tsx`](../tests/status.test.tsx) comprueba
> contra `schema.prisma` que ningún estado se queda sin etiqueta.
>
> **Estado:** 2026-08-19. Aplicado ya al portal y al back-office; las pantallas
> públicas usan los tokens por herencia.

---

## 1. Cinco principios, y de dónde salen

No son aspiraciones: cuatro de los cinco ya estaban **decididos en el código** del
MVP (`ux-flows.md` §7 los recogió). Escribirlos aquí es lo que impide que la próxima
pantalla los contradiga sin darse cuenta.

1. **A cada rol se le cuenta lo que necesita, no lo que hay.** El operador ve el
   estado exacto de una copia; el suscriptor, en qué punto está lo suyo. Es la misma
   frontera que ya separa la proyección pública de la autenticada (`design.md` D13),
   aplicada al vocabulario. → §5.
2. **Nada de callejones sin salida.** Rol equivocado → redirección a su superficie,
   nunca un 403 pelado. Acción que no te corresponde → se **muestra** y se explica al
   pulsarla, en vez de esconderse sin motivo aparente.
3. **Los errores se acumulan, no se sirven de uno en uno.** El alta devuelve
   `errors[]` con todo lo que está mal; la pantalla los pinta juntos. Rellenar un
   formulario cinco veces para descubrir cinco fallos es un maltrato evitable.
4. **El color acompaña; el texto informa.** Ninguna píldora, fila ni gráfico depende
   del color para entenderse (WCAG 1.4.1). Si quitas el color, la pantalla sigue
   siendo legible. → §3.4.
5. **Se destaca lo que reclama algo.** Como mucho un bloque con tono de aviso por
   pantalla. Si todo grita, no grita nada: en el portal solo lo hace "Te toca",
   porque es lo único con un reloj corriendo.

---

## 2. La forma de los tokens

Todo el color se declara como **variable CSS en `:root`** y se sobrescribe en
`.dark`. Ninguna pantalla escribe un color literal.

Hay **dos familias** y la separación importa:

| Familia | Ejemplos | Para qué |
|---|---|---|
| **Superficie** (shadcn/ui) | `--background`, `--primary`, `--muted`, `--border` | El chasis: fondos, textos, bordes, botones. |
| **Tono de estado** | `--tone-info`, `--tone-warning-foreground`… | El vocabulario con el que se pinta un estado del dominio. |

Mezclarlas es el error clásico: pintar de `--destructive` una fila que solo está
"pendiente" convierte el rojo de "esto ha fallado" en ruido de fondo. `--destructive`
es para **acciones destructivas y fallos**; los estados usan `--tone-*`.

El tema por variables no es un capricho de shadcn: el modelo de datos ya tiene una
entidad `Theme`, así que un tema por marca blanca es cambiar un bloque de variables,
no recompilar clases.

---

## 3. Color

### 3.1 Por qué había que tocarlo

La base era el tema neutro de fábrica de shadcn: **grises puros**, croma cero
(`oklch(0.97 0 0)`). Funcionan, pero no son de nadie — y dos problemas concretos:
el token `--input` no llegaba al 3:1 que exige WCAG 1.4.11 para el borde de un
control, y no existía ningún color para decir "esto está bien" o "esto reclama algo".

Todo se expresa en **OKLCH** porque su `L` es luminosidad percibida: subir `L` sube
el contraste de verdad, cosa que en HSL no ocurre (un amarillo y un azul con la misma
`L` de HSL se leen a distancias abismales).

### 3.2 La familia neutra tiene croma

Los grises llevan ahora `h≈258` (azul) con croma bajísimo (0.004–0.03). No se
perciben como azules; se perciben como grises **que van juntos**. El fondo es
`#fafcfe` y no `#ffffff`: un blanco absoluto contra una tarjeta blanca no deja
levantar la tarjeta sin recurrir a una sombra.

### 3.3 Marca: un azul de acción y un amarillo que no actúa

- **`--primary` (`#2466c3`)** es el azul de acción: botones primarios, enlaces,
  anillo de foco. Uno solo, para que "lo azul se pulsa" sea cierto siempre.
- **`--highlight` (`#f6b933`)** es el amarillo de la marca —el guiño de plástico
  amarillo del producto— y **no es un color de acción**: no lleva texto de botón
  encima ni compite con `primary`. Marca cosas (un destacado, el acento de la
  cabecera). Es la regla que impide acabar con dos colores primarios peleándose.

Rojo se reserva a `--destructive` y al tono `danger`, que es la razón de que el
primario no pueda ser rojo por mucho que el producto sea de ladrillos de colores.

### 3.4 Cinco tonos, y por qué exactamente cinco

Cada tono es una **lectura distinta para quien mira**, no un sentimiento del dato:

| Tono | Significa, para quien lo lee | Ejemplos |
|---|---|---|
| `neutral` | No pasa nada, o ya está archivado. | `WAITING`, `BAJA`, `COMPLETED` |
| `info` | En marcha, y no depende de ti. | `ALQUILADA`, devolución en curso |
| `success` | Terminado bien, o disponible. | `DISPONIBLE`, `CONFIRMED`, suscripción activa |
| `warning` | **Te espera a ti.** | `OFFERED` (suscriptor), `EN_INSPECCION` (operador) |
| `danger` | Algo va mal. | `INCOMPLETA`, incidencia abierta, usuario suspendido |

Un sexto tono obligaría a distinguir dos urgencias donde solo hay una decisión
posible: o actúas, o no. Y cada tono trae **tres** tokens —fondo, texto y borde— para
que la píldora se sostenga también en modo oscuro, donde un fondo tintado sin borde
desaparece.

### 3.5 Los valores

<!-- Generado desde app/globals.css; si tocas un token, vuelve a medir (§9). -->

| Token | Claro | | Oscuro | |
|---|---|---|---|---|
| `--background` | `0.99 0.004 258` | `#fafcfe` | `0.19 0.02 264` | `#0f141d` |
| `--foreground` | `0.24 0.03 264` | `#181f2e` | `0.95 0.008 258` | `#ebeff4` |
| `--card` | `1 0 0` | `#ffffff` | `0.235 0.022 264` | `#191e29` |
| `--popover` | `1 0 0` | `#ffffff` | `0.235 0.022 264` | `#191e29` |
| `--primary` | `0.52 0.16 258` | `#2466c3` | `0.72 0.14 256` | `#67a6fb` |
| `--primary-foreground` | `0.985 0.006 258` | `#f8fafe` | `0.2 0.05 258` | `#07162c` |
| `--secondary` | `0.955 0.012 258` | `#ebf1f8` | `0.3 0.02 264` | `#292e38` |
| `--secondary-foreground` | `0.32 0.05 258` | `#22334c` | `0.93 0.01 258` | `#e4e8ef` |
| `--muted` | `0.965 0.008 258` | `#f0f4f9` | `0.28 0.02 264` | `#242933` |
| `--muted-foreground` | `0.52 0.028 258` | `#5f6a79` | `0.72 0.025 258` | `#9ba5b5` |
| `--accent` | `0.945 0.025 250` | `#e1effd` | `0.32 0.04 258` | `#263347` |
| `--accent-foreground` | `0.32 0.06 255` | `#1d3451` | `0.95 0.01 258` | `#eaeff5` |
| `--highlight` | `0.82 0.155 82` | `#f6b933` | `0.84 0.16 84` | `#fbc031` |
| `--highlight-foreground` | `0.28 0.06 70` | `#3b2301` | `0.25 0.045 70` | `#2f1d06` |
| `--destructive` | `0.55 0.2 27` | `#cc2827` | `0.68 0.18 25` | `#f3625d` |
| `--destructive-foreground` | `0.985 0.006 27` | `#fef9f8` | `0.2 0.05 25` | `#290b0a` |
| `--border` | `0.895 0.014 258` | `#d7dde6` | `0.35 0.02 264` | `#353b45` |
| `--input` | `0.63 0.03 258` | `#7e8a9c` | `0.54 0.025 264` | `#676f7e` |
| `--ring` | `0.62 0.14 258` | `#4d86d9` | `0.6 0.12 258` | `#5181c7` |
| `--tone-neutral` | `0.945 0.008 258` | `#e9edf2` | `0.3 0.015 258` | `#292e35` |
| `--tone-neutral-foreground` | `0.4 0.025 258` | `#3f4855` | `0.85 0.02 258` | `#c6cedb` |
| `--tone-neutral-border` | `0.875 0.012 258` | `#d1d6de` | `0.4 0.02 258` | `#414853` |
| `--tone-info` | `0.935 0.027 250` | `#dcebfb` | `0.3 0.06 252` | `#152f4b` |
| `--tone-info-foreground` | `0.44 0.13 252` | `#035397` | `0.85 0.07 250` | `#acd2fb` |
| `--tone-info-border` | `0.86 0.05 250` | `#b9d4f1` | `0.42 0.08 252` | `#2a4f77` |
| `--tone-success` | `0.935 0.055 155` | `#cef5da` | `0.3 0.06 155` | `#0f3620` |
| `--tone-success-foreground` | `0.42 0.098 155` | `#0d5c34` | `0.85 0.1 155` | `#98e2b1` |
| `--tone-success-border` | `0.86 0.07 155` | `#addfbd` | `0.42 0.08 155` | `#225a39` |
| `--tone-warning` | `0.935 0.05 80` | `#fbe7c5` | `0.31 0.06 75` | `#422b06` |
| `--tone-warning-foreground` | `0.45 0.1 65` | `#7a4702` | `0.88 0.11 85` | `#f9d280` |
| `--tone-warning-border` | `0.86 0.09 80` | `#f0cb8d` | `0.43 0.08 75` | `#694914` |
| `--tone-danger` | `0.935 0.027 25` | `#fbe3e0` | `0.31 0.07 25` | `#4e201e` |
| `--tone-danger-foreground` | `0.46 0.16 27` | `#9e2320` | `0.86 0.07 25` | `#fcc0ba` |
| `--tone-danger-border` | `0.86 0.06 25` | `#f6c2bd` | `0.44 0.1 25` | `#813935` |

### 3.6 Contrastes medidos

Todos por encima del mínimo AA, en los dos temas. Los mide
`tests/design-tokens.test.ts` leyendo el CSS, así que la tabla no puede quedarse
obsoleta sin que la suite se ponga roja.

| Texto sobre fondo | Claro | Oscuro | Mínimo |
|---|---|---|---|
| `foreground` / `background` | 16.01:1 | 15.97:1 | 4.5:1 |
| `foreground` / `card` | 16.47:1 | 14.42:1 | 4.5:1 |
| `muted-foreground` / `background` | 5.35:1 | 7.45:1 | 4.5:1 |
| `muted-foreground` / `muted` | 4.97:1 | 5.89:1 | 4.5:1 |
| `primary-foreground` / `primary` | 5.37:1 | 7.29:1 | 4.5:1 |
| `primary` / `background` | 5.45:1 | 7.43:1 | 4.5:1 |
| `secondary-foreground` / `secondary` | 11.14:1 | 11.11:1 | 4.5:1 |
| `accent-foreground` / `accent` | 10.83:1 | 10.97:1 | 4.5:1 |
| `highlight-foreground` / `highlight` | 8.33:1 | 9.75:1 | 4.5:1 |
| `destructive` / `background` | 5.22:1 | 5.91:1 | 4.5:1 |
| `destructive-foreground` / `destructive` | 5.14:1 | 5.86:1 | 4.5:1 |
| `input` / `background` | 3.40:1 | 3.65:1 | 3:1 |
| `ring` / `background` | 3.57:1 | 4.66:1 | 3:1 |
| `tone-neutral-foreground` / `tone-neutral` | 7.84:1 | 8.63:1 | 4.5:1 |
| `tone-neutral-foreground` / `background` | 8.95:1 | 11.69:1 | 4.5:1 |
| `tone-info-foreground` / `tone-info` | 6.46:1 | 8.66:1 | 4.5:1 |
| `tone-info-foreground` / `background` | 7.59:1 | 11.75:1 | 4.5:1 |
| `tone-success-foreground` / `tone-success` | 6.80:1 | 8.74:1 | 4.5:1 |
| `tone-success-foreground` / `background` | 7.84:1 | 12.14:1 | 4.5:1 |
| `tone-warning-foreground` / `tone-warning` | 6.30:1 | 9.21:1 | 4.5:1 |
| `tone-warning-foreground` / `background` | 7.43:1 | 12.82:1 | 4.5:1 |
| `tone-danger-foreground` / `tone-danger` | 6.34:1 | 8.63:1 | 4.5:1 |
| `tone-danger-foreground` / `background` | 7.52:1 | 11.77:1 | 4.5:1 |

Los `--tone-*-border` no aparecen: son decorativos —la píldora se entiende sin
ellos—, así que no tienen mínimo. `--input` sí, porque es el **límite de un control**
y sin él no se sabe dónde se escribe.

### 3.7 El modo oscuro no es el claro invertido

Dos ajustes que no salen de invertir la `L`:

- Los fondos de tono suben de `0.935` a `≈0.30`, pero **el texto baja de croma**
  (`tone-info-foreground` pasa de `C 0.13` a `C 0.07`). Un color saturado sobre negro
  vibra y cansa; el mismo color sobre blanco no.
- Las tarjetas son **más claras** que el fondo (`0.235` sobre `0.19`), al revés que
  en claro, donde son más blancas que un fondo ya casi blanco. La jerarquía se
  mantiene aunque la dirección se invierta.

Nota: el tema oscuro está **definido y medido, pero no conmutable**: no hay todavía
interruptor ni lectura de `prefers-color-scheme`, porque la clase `.dark` no la pone
nadie. Es deuda conocida, no un olvido.

---

## 4. Tipografía, ritmo y superficie

### 4.1 Tipografía

Pila del sistema (`--font-sans`), sin webfont. Es una decisión, no una carencia: un
`next/font` descarga en tiempo de build y ata el despliegue a tener red — y el
destino es una VM libre de Oracle, no un CDN. Cambiarlo es una línea en
[`app/layout.tsx`](../app/layout.tsx) el día que compense.

La escala **ratifica la que ya usaban las pantallas** en vez de inventar otra:

| Uso | Clase | Notas |
|---|---|---|
| Título de página pública | `text-3xl font-bold` | Solo landing, catálogo y planes. |
| Título de página en app | `text-2xl font-bold` | Portal y back-office: entras a trabajar, no a que te reciban. |
| Título de sección | `text-lg font-semibold` | |
| Cuerpo | `text-sm` | Denso a propósito: casi todo son listas y tablas. |
| Cuerpo destacado | `text-base` | Párrafos de las páginas públicas. |
| Secundario | `text-sm text-[var(--muted-foreground)]` | Fechas, contadores, ayudas. |
| Píldora / etiqueta | `text-xs font-medium` | |

`h1`–`h3` llevan `letter-spacing: -0.015em` en la capa base: a tamaño grande el
interletraje por defecto se abre demasiado.

### 4.2 Ritmo y forma

- **Espaciado**: la escala de Tailwind, restringida en la práctica a `2 / 3 / 4 / 6 / 8`.
  Entre secciones de una página, `gap-8`; dentro de una sección, `space-y-3`; dentro
  de una tarjeta, `p-4`.
- **Radio**: `--radius: 0.625rem`. Tarjetas y botones `rounded-md`; las píldoras,
  `rounded-full`, que es lo que las hace inconfundibles con un botón.
- **Elevación**: casi ninguna. Un borde de 1px separa igual de bien y no se rompe en
  oscuro. Sombra solo donde algo **flota de verdad** (popovers, diálogos).
- **Ancho**: crece con la densidad de la superficie — `max-w-5xl` en la pública
  (columna de lectura), `max-w-6xl` en el portal, `max-w-7xl` en el back-office,
  donde las tablas piden sitio. Siempre con `px-4` para que en móvil no se pegue al
  borde.
- **Tablas anchas**: siempre dentro de `overflow-x-auto` con un `min-w-*`. La página
  no hace scroll horizontal; la tabla sí.

---

## 5. Vocabulario de estados

Este es el apartado que `ux-flows.md` §8.5 dejó pedido, y el de más recorrido: hoy
hay **nueve estados de copia, cinco de cola, cuatro de oferta y cuatro de alquiler**,
y hasta ahora se pintaban tal cual salían de la base (`EN_HIGIENIZACION`).

Vive en [`lib/status.ts`](../lib/status.ts) y se pinta con
[`<StatusBadge>`](../components/status-badge.tsx). **Ninguna pantalla debe escribir
la etiqueta de un estado a mano**: si lo hace, el día que cambie el texto habrá dos
verdades.

### 5.1 Las dos reglas

1. **La granularidad depende de quién mira.** Al operador, el estado exacto: es su
   cola de trabajo y la diferencia entre `EN_INSPECCION` y `EN_HIGIENIZACION` es qué
   le toca hacer. Al suscriptor, dónde está lo suyo: los cuatro estados que hay entre
   "la devolví" y "está cerrada" son **un solo hecho**, y detallárselos sería
   contarle nuestra logística.
2. **El tono mide la urgencia de quien lee, no el estado en sí.** `EN_INSPECCION` es
   `warning` para el operador —hay trabajo esperando— e `info` para el suscriptor
   —no tiene nada que hacer—. Es lo que evita pintar de rojo cosas que van bien.

### 5.2 Copia (`CopyState`)

| Estado | Operador | Tono | Suscriptor | Tono |
|---|---|---|---|---|
| `INTAKE` | Sin catalogar | `warning` | Todavía no disponible | `neutral` |
| `DISPONIBLE` | Disponible | `success` | Disponible | `success` |
| `OFRECIDA` | Reservada | `info` | Reservada | `info` |
| `ALQUILADA` | Con el cliente | `info` | **En tu poder** | `info` |
| `EN_DEVOLUCION` | En camino de vuelta | `info` | Devolución en curso | `info` |
| `EN_INSPECCION` | Por inspeccionar | `warning` | Devolución en curso | `info` |
| `EN_HIGIENIZACION` | Por higienizar | `warning` | Devolución en curso | `info` |
| `INCOMPLETA` | Incompleta | `danger` | Devolución en curso | `info` |
| `BAJA` | De baja | `neutral` | No disponible | `neutral` |

Cuatro filas colapsan en una para el suscriptor. Eso **ya estaba decidido en el
dominio** —`OCCUPYING_COPY_STATES` frente a `HELD_COPY_STATES`, con el aviso de que
"solo `ALQUILADA` significa que lo tienes en casa"—; aquí solo se hace visible.

### 5.3 Cola, oferta, alquiler y suscripción

| Enum | Valor | Suscriptor | Operador |
|---|---|---|---|
| `QueueEntryStatus` | `WAITING` | En espera · `neutral` | En espera · `neutral` |
| | `OFFERED` | **Te toca** · `warning` | Ofrecida · `info` |
| | `CONFIRMED` | Confirmada · `success` | Confirmada · `success` |
| | `EXPIRED` | Caducada · `neutral` | Caducada · `neutral` |
| | `LEFT` | Abandonada · `neutral` | Abandonada · `neutral` |
| `OfferStatus` | `PENDING` | Pendiente de respuesta · `warning` | — igual — |
| | `ACCEPTED` / `REJECTED` / `EXPIRED` | Aceptada `success` / Rechazada `neutral` / Caducada `neutral` | — igual — |
| `RentalStatus` | `ACTIVE` | En tu poder · `info` | En curso · `info` |
| | `RETURN_INITIATED` | Devolución en curso · `info` | Devolución iniciada · `info` |
| | `IN_INSPECTION` | Devolución en curso · `info` | En inspección · `warning` |
| | `COMPLETED` | Cerrado · `neutral` | Cerrado · `neutral` |
| `SubscriptionStatus` | `ACTIVE` / `PAUSED` / `CANCELLED` | Activa `success` / En pausa `neutral` / Cancelada `neutral` | — igual — |

**`OFFERED` es el único `warning` de todo el portal.** Es literalmente lo único que
le pedimos al suscriptor, y tiene una ventana que caduca sola.

Pausada y cancelada **no son un error** —son decisiones del cliente—, así que van en
`neutral`. Lo que sí hacen es impedir alquilar, y de eso avisa el texto que las
acompaña, no el color.

### 5.4 Y lo demás

`UserStatus` (activo `success` / suspendido `danger`), `IncidentStatus` (abierta
`danger` / en curso `warning` / resuelta `success`), `ConditionResult` (correcta,
incompleta, dañada) y `Role` (suscriptor, operador, administrador — sin tono: un rol
no es un estado, es quién eres).

También son vocabulario las frases que describen una **regla**, no solo los estados:
"N sets en casa a la vez" estaba escrita tres veces —planes, alta y portal— con dos
redacciones distintas. Ahora sale de `simultaneousSets()`.

Los **avisos** también se traducen: en la base se llaman como el evento de dominio
(`QUEUE_TURN`) y en pantalla como lo que le pasa a quien lo lee ("Te toca un set de
tu cola"). Un tipo desconocido se muestra tal cual en vez de romper la lista: peor
sería una fila en blanco.

### 5.5 La red de seguridad

`tests/status.test.tsx` lee **`prisma/schema.prisma`** y comprueba que cada valor de
cada enum tiene etiqueta en cada superficie. Añadir un estado nuevo y olvidar su
texto pone la suite roja en vez de sacar `EN_CUARENTENA` a producción. La prueba
además rechaza cualquier etiqueta que siga siendo `MAYÚSCULAS_CON_GUIONES`.

---

## 6. Componentes

### 6.1 Lo que hay

| Componente | Dónde | Notas |
|---|---|---|
| `Button` | `components/ui/button.tsx` | shadcn, 6 variantes × 4 tamaños. `asChild` para enlaces. |
| `Badge` | `components/ui/badge.tsx` | **Un solo eje: el tono.** Ni tamaños ni formas: lo que distingue un estado es el color y, sobre todo, el texto. |
| `Card` | `components/ui/card.tsx` | Traído con la ficha de set (2026-08-20). **Sin sombra**: la elevación es para lo que flota de verdad, y en oscuro no separa. `Card` y `CardTitle` aceptan `asChild` — el título no fija nivel de encabezado, lo pone quien la usa. |
| `StatusBadge` | `components/status-badge.tsx` | Recibe el `StatusLabel` ya resuelto, no el estado crudo, para que la decisión de qué ve cada rol viva entera en `lib/status.ts`. |
| `AlertDialog` | `components/ui/alert-dialog.tsx` | Traído con W5 (2026-08-20) para cancelar la suscripción. **No es un `Dialog`**: interrumpe pidiendo una decisión, no se cierra pinchando fuera y no lleva más campos que sus dos botones. Cuando hay que recoger un dato —el motivo de una baja—, el correcto es `Dialog`. Escrito a mano sobre Radix: el generador de shadcn insistía en sobrescribir `button.tsx`. |
| `Dialog` | `components/ui/dialog.tsx` | Traído con W4 (2026-08-20). Radix pone lo que no se debe reimplementar: trampa de foco, cierre con `Esc`, `aria-modal` y el foco de vuelta al disparador. **Sí lleva sombra**, al contrario que `Card`: esto flota de verdad. `DialogTitle` es obligatorio o el diálogo no tiene nombre accesible. |
| `Input`, `Label` | `components/ui/` | Traídos con W4. El borde del campo usa `--input` y no `--border`: es un control y su contorno necesita 3:1 (WCAG 1.4.11). El error se pinta desde `aria-invalid`, no desde una prop, para que el color y lo que anuncia el lector no puedan ir por caminos distintos. |
| `CopyActions` | `components/backoffice/` | Acciones de ciclo de vida de una copia, compartidas por la cola de trabajo y la ficha de catálogo. Cada botón nombra su copia: cuatro «Catalogar» seguidos son indistinguibles al tabular. |
| `SurfaceNav` | `components/surface-nav.tsx` | Barra de secciones de una superficie, en el layout (2026-08-20). Recibe los destinos **ya filtrados por permiso** desde el servidor; lo único que hace en cliente es marcar el activo con `aria-current`. En móvil, fila desplazable. |
| `LogoutButton`, `Terms` | `components/` | De producto, no de sistema. |

### 6.2 Lo que hará falta traer de shadcn

Por orden de la primera pantalla que lo necesita (`ux-flows.md` §8.2):

| Componente | Primera pantalla que lo pide |
|---|---|
| ~~`card`~~ | ~~Ficha de set~~ — **traído el 2026-08-20**, ver §6.1. |
| `form`, `textarea` | Registro de condición (W2) y notas de discrepancia (W3). Son lo único que queda por traer. |
| `alert` | Vacíos y errores con formato, en vez de un párrafo rojo suelto. |
| `table` | Back-office: hoy son `<table>` con clases copiadas en cuatro sitios. |
| `skeleton` | Esperas (§7.3). |

No se traen por adelantado: shadcn copia el código al repo, y componentes sin uso son
código muerto que hay que mantener.

**Traídos el 2026-08-20 con W4:** `dialog`, `input` y `label` (§6.1). El **tema** del
alta de set se resolvió con un `<select>` **nativo** y no con el de Radix —veinte
opciones planas, mejor en móvil y sin JavaScript—, y `table` sigue fuera: traerlo solo
para las dos tablas de W4 habría dejado el back-office con dos estilos de tabla.

**Ampliado el 2026-08-20** con lo que confirman los wireframes:
[`wireframes.md`](wireframes.md) §9.1 añade `textarea`, `checkbox`, `radio-group` y
`select` —los pide el registro de condición y el alta de set— y descarta `tabs`: la
navegación del portal son cinco **rutas**, no pestañas.

Por eso la fila de `tabs` / `navigation-menu` ha salido de la tabla: la barra de secciones
se resolvió el mismo día con `SurfaceNav` (§6.1), que son enlaces dentro de un `<nav>` —30
líneas— y no hizo falta traer nada de shadcn. `navigation-menu` es para menús con
submenús; aquí hay cinco destinos planos.

---

## 7. Vacíos, errores y esperas

Los tres estados que siempre se dejan para el final y son la mitad de la experiencia
real. `ux-flows.md` §8.6 los dejó apuntados; esto es la pauta.

### 7.1 Vacío

Un vacío nunca es solo "no hay nada": dice **por qué** y **qué hacer**. Y distingue
dos casos que no se parecen:

- **Todavía no** ("No tienes ningún set ahora mismo") → invita a la acción que lo
  resuelve, con enlace al catálogo.
- **Ya no queda** (una búsqueda sin resultados) → ofrece deshacer el filtro.

Tono `muted-foreground`, sin ilustración, sin borde. Un vacío no es un error y no
debe pesar como uno.

### 7.2 Error

El contrato de la API es **RFC 9457** (`ADR-0002`) y su campo `detail` **ya viene
redactado para leerse**. La pantalla lo muestra tal cual: no reescribe el mensaje del
servidor ni lo sustituye por un genérico, porque el servidor es el único que sabe qué
ha pasado.

- **De formulario**: junto al campo, y **todos a la vez** (principio 3).
- **De acción**: junto al botón que la disparó, con `role="alert"`, en
  `--destructive`. Nunca un toast que se va solo: si algo ha fallado, tiene que poder
  releerse.

> Los nueve mensajes de error de la aplicación usaban `text-red-600`, un color del
> catálogo de Tailwind ajeno al tema: no cambiaba en oscuro y allí se quedaba en
> **3.82:1**, por debajo de AA. Ahora todos son `--destructive` (5.22:1 / 5.91:1).
- **De permiso** (403): se explica, no se esconde el botón (principio 2).

### 7.3 Espera

Toda acción que llama a la API deja su botón deshabilitado y con texto de progreso
mientras dura — ya se hace, y ahora es norma. Para cargas de página, `skeleton` con
la forma del contenido que viene; nunca un spinner centrado que no dice nada.

---

## 8. Accesibilidad

Objetivo declarado: **WCAG 2.1 AA**.

**Cubierto y comprobado:**

- Contraste de texto (1.4.3) y de bordes de control y foco (1.4.11) → §3.6, medido en
  la suite.
- El color nunca es el único portador de información (1.4.1) → §3.4.
- Foco visible siempre (2.4.7): `:focus-visible` con anillo de 2px y `outline-offset`
  en la capa base, **fuera** del elemento para que no lo tape un fondo de color.
- Movimiento reducido: `prefers-reduced-motion` neutraliza animaciones y transiciones.
- Idioma de la página (`lang="es"`) y títulos por pantalla.

**Comprobado solo (2026-08-19):** `e2e/accesibilidad.spec.ts` pasa **axe-core** por las
nueve pantallas —las cinco públicas, el portal y las cuatro del back-office— pidiendo
exactamente las etiquetas `wcag2a`, `wcag2aa`, `wcag21a` y `wcag21aa`. Las
*best-practice* de axe se dejan fuera a propósito: mezclar consejos con criterios de
conformidad convierte el rojo en una opinión y nadie lo arregla. Sale en verde sin
incidencias. **Lo que eso significa y lo que no:** axe cubre los fallos mecánicos
(contraste, nombres accesibles, roles, etiquetas de formulario, orden de encabezados),
que son del orden de un tercio de los reales; no dice si el recorrido funciona con
teclado ni si un texto alternativo describe algo.

**Pendiente:**
- Recorrido completo por teclado del back-office (las tablas con acciones son lo más
  expuesto).
- Modo oscuro sin interruptor (§3.7): quien lo necesite hoy no puede activarlo.
- `aria-live` en las listas que cambian tras una acción del cliente.

---

## 9. Cómo se cambia esto

1. **Un color**: edita el token en `app/globals.css` y ejecuta `npm test`. Si el
   nuevo valor baja de AA o se sale del gamut sRGB, `tests/design-tokens.test.ts` lo
   dice y nombra el par. Actualiza después las tablas de §3.5 y §3.6.
2. **Una etiqueta de estado**: solo en `lib/status.ts`. Nunca en la pantalla.
3. **Un estado nuevo en el dominio**: la prueba de `status.test.tsx` fallará hasta
   que tenga etiqueta en **las dos** superficies. Es a propósito: obliga a decidir qué
   se le cuenta al cliente antes de que el estado llegue a producción.
4. **Un componente de shadcn**: `npx shadcn@latest add <nombre>` y después
   **repasarlo** — llega con los tokens de fábrica y hay que dejarlo hablando el
   vocabulario de aquí.

---

## 10. Qué desbloquea esto, y qué falta

Con el sistema en pie, lo siguiente del plan de `ux-flows.md` §9 son los
**wireframes**, por este orden: ficha de set `/catalogo/:id` → registro de condición
+ discrepancia → gestión de catálogo → portal ampliado.

Sigue **abierto y es decisión de producto** —no de diseño— cuáles de esos recorridos
reciben pantalla (`ux-flows.md` §8.2). El sistema no lo decide; solo garantiza que,
cuando se decida, la pantalla ya sepa de qué color es cada cosa y cómo se llama.
