# Wireframes — Clickoteca

Tercer entregable de UX, después de [`ux-flows.md`](ux-flows.md) (qué recorre cada rol)
y [`design-system.md`](design-system.md) (con qué se pinta). Aquí se decide **dónde va
cada cosa** en las cinco pantallas que `ux-flows.md` §9.2 dejó pendientes.

Son wireframes de **disposición y contenido**, no de estilo: no hay color ni tipografía
porque eso ya está resuelto y medido en el sistema de diseño. Lo que se decide aquí es
la jerarquía, qué datos aparecen, qué acción es la principal y qué pasa cuando no hay
nada, falla algo o hay que esperar.

**Método, el mismo que dio resultado en `ux-flows.md`:** cada pantalla se dibuja contra
el **código que ya existe** —la forma real de los datos, los veredictos reales del
dominio, los errores reales de la API—, no contra una idea de lo que debería haber. Ese
cruce vuelve a ser lo que aporta información nueva: §8 recoge **siete huecos de
implementación** que solo aparecen al intentar dibujar la pantalla.

---

## 1. Cómo se lee esto

### 1.1 Notación

**Por qué no son Mermaid.** La convención del proyecto es que **los diagramas** van en
Mermaid, y se mantiene: los flujos de `ux-flows.md` y los C4 lo son. Un wireframe no es
un diagrama de relaciones sino una **maqueta espacial**, y Mermaid no tiene forma de
expresar "esto está a la derecha de aquello y ocupa un tercio del ancho". Bloques de
texto dentro de vallas de código: se ven igual en GitHub y en cualquier editor, y se
revisan en un diff línea a línea.

```
┌───────────────────────────┐   Marco de la pantalla o de un bloque.
│ ▓▓▓▓▓                     │   Imagen o media.
│ [ Botón principal ]       │   Botón `default` (--primary).
│ [ Botón secundario ]      │   Botón `outline`.
│ ( Píldora )               │   StatusBadge — el tono sale de lib/status.ts.
│ ‹campo›                   │   Campo de formulario.
│ · texto secundario        │   --muted-foreground.
│ ⚠ aviso                   │   Bloque de tono; el tono se anota al lado.
└───────────────────────────┘
```

Cada wireframe lleva debajo cuatro apartados fijos, que son justo los que se suelen
dejar para el final:

- **De dónde salen los datos** — repositorio o endpoint concreto, con fichero.
- **Acciones** — qué llama a qué, y qué contesta la API cuando dice que no.
- **Vacío / error / espera** — aplicando `design-system.md` §7 a esta pantalla.
- **Accesibilidad** — lo que axe no puede comprobar solo: orden de foco, nombres de
  región, qué se anuncia.

### 1.2 Reglas que estos wireframes heredan y no discuten

Vienen de decisiones ya tomadas; se listan para no reabrirlas al dibujar.

| Regla | De dónde viene |
|---|---|
| Rol equivocado → **redirección** a su superficie, nunca un 403 sin salida. | `ux-flows.md` §7 |
| Una acción sin permiso **se muestra** y explica el 403; no se esconde. | `design-system.md` §7.2 |
| El `detail` de la API (RFC 9457) se enseña **tal cual**; la pantalla no lo reescribe. | `ADR-0002`, `design-system.md` §7.2 |
| Los errores de formulario salen **todos a la vez**, no de uno en uno. | `design-system.md` §7.2 |
| Ninguna pantalla escribe a mano la etiqueta de un estado: sale de `lib/status.ts`. | `design-system.md` §5 |
| El tono mide **la urgencia de quien lee**, no el estado: `EN_INSPECCION` es `warning` para el operador e `info` para el suscriptor. | `design-system.md` §5.1 |
| Móvil primero; las tablas anchas van en `overflow-x-auto` con `min-w-*`. | `design-system.md` §4.2 |
| Ancho por superficie: `max-w-5xl` pública · `max-w-6xl` portal · `max-w-7xl` back-office. | `design-system.md` §4.2 |

---

## 2. Las tres decisiones que este documento cierra

`ux-flows.md` §8.2 dejó abiertos siete puntos; dos se resolvieron con el sistema de
diseño y uno (la ficha de set) es la pantalla W1. Quedaban tres, y sin ellos no se
puede dibujar. Se cierran aquí, **con el motivo**, y son reversibles: si el propietario
prefiere otra cosa, lo que cambia es este documento y no el código.

### 2.1 · Alcance del back-office de catálogo (§8.2.3)

**Decisión: pantalla completa de lista + ficha de set con su inventario. No hace falta
ningún endpoint nuevo.**

La pregunta era "¿gestión completa de sets y copias, o basta con dar de alta una copia
sobre un set ya sembrado?". La respuesta la da el código: **la API completa ya existe**
—`POST /api/sets`, `PATCH /api/sets/:id`, `PUT /api/sets/:id/publication`,
`GET`/`POST /api/sets/:id/copies`, `POST /api/copies/:id/transitions`,
`POST /api/copies/:id/retire`—, así que la versión recortada no ahorraría backend, solo
dejaría capacidades pagadas y escondidas. Y sin lista de sets **no hay forma de llegar a
un set no publicado**: el catálogo público lo devuelve como 404 a propósito
([`browse-public-catalog.ts`](../src/use-cases/catalog/browse-public-catalog.ts)), que es
justo el estado en el que está un set recién creado.

Lo único que falta es un `GET /api/sets` que liste incluyendo los no publicados — y **no
hay que escribirlo**: la pantalla es un Server Component y lee el repositorio directamente,
igual que ya hace [`backoffice/page.tsx`](<../app/(backoffice)/backoffice/page.tsx>). La API
pública se amplía cuando alguien de fuera la necesite, no para alimentar nuestra propia
pantalla.

### 2.2 · Dónde vive "mi suscripción" (§8.2.4)

**Decisión: pantalla propia `/portal/suscripcion`, y el bloque de resumen se queda en
`/portal`.**

Hoy el plan es un bloque del portal con un `PlanSwitcher` dentro. Funciona porque solo
hay una acción. Pero ahí tienen que caber además **pausar, cancelar y reactivar** —que
existen en `PUT /api/subscriptions/me` y no tienen interfaz—, y **cancelar una
suscripción no puede ser un botón más en una lista de cuatro bloques**: es la acción más
destructiva que un cliente puede ejecutar, necesita confirmación explícita y necesita
explicar por qué a veces está bloqueada (`canEndSubscription` cuenta los sets sin
devolver).

El resumen se queda en `/portal` porque responde a "¿puedo pedir un set?", que es la
pregunta con la que se entra. Enlaza a la pantalla; no la duplica.

### 2.3 · Navegación del portal (§8.2.7)

**Decisión: la navegación entra en el layout que ya existe**, con cinco destinos:
`Resumen · Mis sets · Historial · Suscripción · Avisos`.

`app/(portal)/portal/layout.tsx` ya está, y trae el guarda de superficie, el ancho, el
nombre de quien ha entrado y el botón de salir. **Lo que no trae es navegación**, porque
hoy el portal es una sola ruta y no la necesitaba. Con historial y suscripción entrando,
sí.

**Cabecera, no `tabs`.** Son cinco rutas de verdad, con su propia URL, enlazables y
recargables; `tabs` es para alternar vistas dentro de una misma página. Se marca la
activa con `aria-current="page"` y, en móvil, la barra se convierte en una fila
desplazable — no en un menú hamburguesa, que esconde cinco destinos detrás de un toque
sin ganar nada.

**Y el mismo problema, la misma solución para el back-office:** su `<nav>` vive **dentro
de `backoffice/page.tsx`**, así que en `/backoffice/clientes` no está y cada subpágina se
apaña con un enlace «‹ Cola de trabajo» de vuelta. Funciona —no hay callejón sin salida—
pero obliga a pasar por el centro para ir de una sección a otra. Subirlo al layout, con
`Cola de trabajo · Catálogo · Clientes · Configuración · Personal` filtrado por permiso
como ya hace la página, sale gratis; y con W4 añadiendo una sección más, el rodeo deja de
ser gratis.

---

## 3. W1 · Ficha de set — `/catalogo/:id`

> **Construida el 2026-08-20.** `app/(public)/catalogo/[setId]/page.tsx` +
> `set-actions.tsx`, con `Card` traído de shadcn. HU-00, HU-03 y HU-04 pasan a verde.
> Verificada con cuatro pruebas nuevas (`e2e/ficha-set.spec.ts`), dos auditorías de axe
> —una por proyección— y los pasos 1 y 2 del circuito completo, que ahora se hacen **por
> la interfaz** en vez de por la API. Lo que salió de construirla está en §3.10.

La pantalla con más peso de diseño del proyecto, y la que desbloquea HU-03 y HU-04. Hasta
hoy el catálogo era **una rejilla sin destino**: `POST /api/sets/:id/rentals` y
`POST /api/sets/:id/queue` existen y no hay ningún sitio desde donde ejecutarlos. Es
también donde **D13 se hace visible por primera vez**: el mismo recurso, dos
proyecciones según quién mira.

### 3.1 La idea: una sola caja de decisión

Todo lo que cambia entre visitante y suscriptor, y entre suscriptor elegible y no
elegible, ocurre **en un único bloque** a la derecha de la imagen. El resto de la
pantalla —foto, nombre, tema, piezas, edad, dificultad— es idéntico para todos, porque
es la proyección pública y no depende de quién pregunta.

Eso mantiene una sola pregunta viva en la página: **¿puedo llevármelo, y si no, por
qué?**

### 3.2 Estado A — visitante (sin sesión)

```
┌──────────────────────────────────────────────────────────────┐
│ Clickoteca            Catálogo   Planes   Acceder            │
├──────────────────────────────────────────────────────────────┤
│ ‹ Catálogo                                                   │
│                                                              │
│ ┌────────────────────┐   Hogwarts Express                    │
│ │                    │   · Harry Potter · 2018 · ref. 75955  │
│ │      ▓▓▓▓▓▓        │                                       │
│ │      ▓▓▓▓▓▓        │   1.245 piezas · 8+ · Intermedio      │
│ │                    │                                       │
│ └────────────────────┘   ┌─────────────────────────────────┐ │
│                          │ Entra para ver si está libre    │ │
│                          │ · La disponibilidad y la cola   │ │
│                          │   solo se ven con cuenta.       │ │
│                          │ [ Crear cuenta ] [ Entrar ]     │ │
│                          └─────────────────────────────────┘ │
│                                                              │
│ Qué incluye el alquiler                                      │
│ · Envío y recogida a domicilio, limpieza e inventario de     │
│   piezas antes de cada entrega.                              │
│ · Con cualquiera de los planes → [ Ver planes ]              │
└──────────────────────────────────────────────────────────────┘
```

**Lo que no aparece, y es deliberado:** disponibilidad, número de copias, longitud de
cola y valor de referencia. No es que se oculten en la vista — **no llegan al servidor
de la página**: `viewPublicSet` devuelve `PublicSet`, que no tiene esos campos
([`public-projection.ts`](../src/domain/catalog/public-projection.ts)). La frontera está
en la forma de los datos, no en un `if` de la plantilla, y así no se puede filtrar por
descuido.

El bloque de decisión **no miente por omisión**: no dice "disponible", dice que la
disponibilidad se ve con cuenta. Un visitante que ve un botón "Alquilar" y descubre
después que necesita plan ha perdido el tiempo dos veces.

### 3.3 Estado B — suscriptor elegible, con copias libres

```
│ ┌────────────────────┐   Hogwarts Express                    │
│ │      ▓▓▓▓▓▓        │   · Harry Potter · 2018 · ref. 75955  │
│ │      ▓▓▓▓▓▓        │   1.245 piezas · 8+ · Intermedio      │
│ └────────────────────┘                                       │
│                          ┌─────────────────────────────────┐ │
│                          │ ( Disponible )                  │ │
│                          │ 2 de 5 copias libres            │ │
│                          │                                 │ │
│                          │ [ Pedir este set ]              │ │
│                          │ · Te llega en 2-4 días. Ocupa   │ │
│                          │   1 de tus 2 plazas.            │ │
│                          └─────────────────────────────────┘ │
```

`( Disponible )` es la píldora `success` de `copyStatus`, y **"2 de 5 copias libres" es
todo el inventario que se enseña**: `availableCopies` y `totalCopies`, nunca el estado de
cada copia una a una. Al suscriptor le sirve saber cuántas hay, no cuál está en
higienización.

"Ocupa 1 de tus 2 plazas" sale de `simultaneousSets()`, la misma frase que usan los
planes y el alta.

### 3.4 Estado C — sin copias libres: la cola

```
│                          ┌─────────────────────────────────┐ │
│                          │ ( En espera )                   │ │
│                          │ Ahora mismo no queda ninguna    │ │
│                          │ libre. Hay 3 personas esperando.│ │
│                          │                                 │ │
│                          │ [ Apuntarme a la cola ]         │ │
│                          │ · Te avisamos cuando te toque y │ │
│                          │   tendrás 48 h para confirmar.  │ │
│                          └─────────────────────────────────┘ │
```

Y si **ya está en la cola de este set**:

```
│                          ┌─────────────────────────────────┐ │
│                          │ ( En espera )   Eres el nº 2    │ │
│                          │ de 3 en la cola.                │ │
│                          │                                 │ │
│                          │ [ Salir de la cola ]  ← outline │ │
│                          │ · Si sales pierdes el turno; al │ │
│                          │   volver entrarías por el final.│ │
│                          └─────────────────────────────────┘ │
```

`queuePosition` viene ya calculada en la proyección autenticada y **nunca revela quién
ocupa las demás posiciones**. La advertencia de "entrarías por el final" no es un adorno:
el orden es por `effectiveEntryAt` **inmutable** (D11), así que salir y volver es
irreversible dentro de esa cola, y el suscriptor tiene que saberlo antes de pulsar.

**Un detalle que sale del código, no del diseño:** "Pedir este set" con cero copias
libres **no falla** — `requestSet` devuelve `200 {outcome:"no_copy_available",
canQueue:true}`. Así que el botón podría ser siempre "Pedir este set" y resolver la cola
después. **No se hace**: enseñar un botón que promete un set y contesta con una cola es
peor que enseñar la cola de entrada. La API es tolerante porque tiene que serlo (entre
que se pinta la página y se pulsa, la última copia puede irse); la pantalla es honesta
con lo que sabe. Si la carrera ocurre, el resultado se explica en el sitio (§3.7).

### 3.5 Estado D — no elegible: cuatro motivos, cuatro salidas

Esta es la parte que justifica que `checkSetEligibility` devuelva **200 con el
veredicto** en vez de un 403: la pantalla necesita el motivo concreto para saber qué
ofrecer. Un "no puedes" genérico dejaría al suscriptor sin acción.

```
│                          ┌─────────────────────────────────┐ │
│                          │ ⚠ warning                       │ │
│                          │ ‹detail exacto de la API›       │ │
│                          │ [ acción que lo resuelve ]      │ │
│                          └─────────────────────────────────┘ │
```

| `reason` | Texto (el `detail` real de [`eligibility.ts`](../src/domain/subscriptions/eligibility.ts)) | Acción que se ofrece |
|---|---|---|
| `NO_ACTIVE_SUBSCRIPTION` | "Necesitas una suscripción activa para llevarte un set." | `[ Ver mi suscripción ]` → `/portal/suscripcion` |
| `PLAN_LIMIT_REACHED` | "Tu plan permite N set(s) a la vez. Devuelve uno para pedir otro." | `[ Mis sets ]` → `/portal/sets` · y `[ Apuntarme a la cola ]`, que **sí se puede** |
| `RETURN_IN_PROGRESS` | "Tu devolución anterior aún no está completada. La plaza se libera cuando la copia vuelve a estar disponible." | Ninguna: solo cabe esperar. Se dice así, sin botón. |
| `SUBSCRIPTION_TOO_RECENT` | "Este set requiere N meses de antigüedad de suscripción; llevas M." | Ninguna. Es un set restringido (D7) y el tiempo es la única salida. |

**Tono `warning`, no `danger`.** Ninguno de los cuatro es un fallo: son la situación del
suscriptor. Pintarlos de rojo gastaría el rojo que hace falta cuando algo se rompe de
verdad (`design-system.md` §3.4).

**Y el matiz que importa: no elegible no es lo mismo que no encolable.** `joinQueue` no
comprueba el límite de plazas —solo suscripción activa y antigüedad—, así que un
suscriptor con el plan lleno **puede apuntarse a la cola** y encontrarse el set libre
cuando devuelva. Con `PLAN_LIMIT_REACHED` la pantalla ofrece las dos cosas: el aviso y el
botón de cola. Con `NO_ACTIVE_SUBSCRIPTION` no, porque ahí `joinQueue` también rechaza.

### 3.6 De dónde salen los datos

| Dato | Origen |
|---|---|
| Todo lo de catálogo | `viewPublicSet` / `viewSetAsSubscriber` — [`browse-public-catalog.ts`](../src/use-cases/catalog/browse-public-catalog.ts) |
| `availableCopies`, `totalCopies`, `queueLength`, `queuePosition`, `restricted` | Solo en la proyección autenticada |
| Veredicto y motivo | `checkSetEligibility` — [`check-eligibility.ts`](../src/use-cases/subscriptions/check-eligibility.ts) |
| Ventana de confirmación ("48 h") | `settings.load().offerConfirmationWindowHours` — **no se escribe a mano** |

Se resuelve en el **Server Component**, no con `fetch` desde el navegador: la página es
pública y tiene que servirse renderizada para que sea indexable, que es la razón de ser
de la proyección pública (D13).

### 3.7 Acciones

| Acción | Llamada | Respuesta buena | Respuesta mala |
|---|---|---|---|
| Pedir este set | `POST /api/sets/:id/rentals` | `201 {rental}` → a `/portal` con el set ya en "Mis sets" | `200 {no_copy_available}` → el bloque se transforma en el estado C, en el sitio, sin recargar · `409 NO_ACTIVE_SUBSCRIPTION` / `NOT_ELIGIBLE` → `detail` bajo el botón |
| Apuntarme a la cola | `POST /api/sets/:id/queue` | `201 {entry}` → el bloque pasa a "Eres el nº N" | `detail` bajo el botón |
| Salir de la cola | `DELETE /api/queue/:entryId` | `204` → vuelve al estado C | ídem |

Las tres son `POST`/`DELETE` desde un componente de cliente con el botón deshabilitado y
texto de progreso mientras dura (`design-system.md` §7.3), como ya hacen las acciones del
portal.

### 3.8 Vacío · error · espera

- **Vacío**: no lo hay. Un set sin foto ya tiene su marcador gris en el catálogo; se
  reutiliza.
- **404**: un set inexistente y uno sin publicar responden **igual** a propósito
  —distinguirlos permitiría sondear qué hay en el catálogo antes de publicarlo—. La
  pantalla dice "Este set no está en el catálogo" y ofrece volver. No dice "no existe":
  sería mentira la mitad de las veces.
- **Error de acción**: bajo el botón, `role="alert"`, `--destructive`, y **no se va
  solo**.
- **Espera**: la página es SSR, no hay carga intermedia. Los botones sí tienen su estado
  de progreso.

### 3.9 Accesibilidad

- La caja de decisión es `<section aria-labelledby>` — "Disponibilidad" —, así el lector
  de pantalla puede saltar a ella directamente y el E2E puede anclarse por rol en vez de
  por texto, que fue la lección de la regresión de copia del portal.
- El resultado de una acción se anuncia: el bloque que cambia lleva `aria-live="polite"`.
  Pulsar "Pedir este set" y que la caja se convierta en una cola **sin decir nada** deja
  fuera a quien no lo ve.
- `( Disponible )` no es solo color: la píldora lleva texto (`design-system.md` §3.4).
- La foto del set lleva `alt` descriptivo — "Caja del set {nombre}", como ya hace el
  catálogo. El marcador gris de "sin foto" es `aria-hidden`, porque no aporta nada.
- Orden de foco: migas → título → caja de decisión → resto. La acción principal se
  alcanza con dos tabulaciones.

### 3.10 Lo que salió de construirla

El wireframe aguantó: no hubo que mover nada de la disposición. Lo que apareció fue de
alrededor.

**Un fallo real, que solo se ve cuando existe esta pantalla.** La cabecera pública
ofrecía **"Acceder" a quien ya tenía sesión**. Daba igual mientras las páginas públicas
fueran landing, planes y una rejilla: nadie las visitaba estando dentro. Con la ficha, un
suscriptor navega el catálogo **desde dentro**, y se le mandaba a un formulario de login
que no necesita. Ahora el enlace apunta a su superficie —"Mi portal" o "Back-office",
según el rol—. Es un caso de manual: una pantalla nueva no solo añade, también cambia
quién pisa las viejas.

**Un ajuste de redacción que el wireframe no podía prever:** "1 de 1 copias libres" está
mal escrito. El texto pluraliza según el total.

**Dos trampas de Playwright**, anotadas porque volverán:

1. `getByRole("button", { name: "Salir" })` casa **por subcadena**, así que en la ficha
   encontraba **"Salir de la cola"**. En el circuito, el paso que creía cerrar la sesión
   sacaba a Bruno de la cola y deshacía el paso anterior. Con `exact: true` o, mejor,
   yendo al portal —donde vive el botón de salir— antes de cerrar sesión.
2. Esperar la navegación con un `expect(...).toBeVisible()` sobre la página destino la
   somete al reloj de la aserción (5 s), no al de la prueba (60 s). Con tres workers, la
   primera petición de una ruta recién estrenada los agota y el fallo miente: dice "no
   existe la región" cuando lo cierto es "aún no ha llegado". `waitForURL` primero.

**Y un no-fallo que parecía uno:** "6785 piezas" sin separador de millares es
**correcto** en español —CLDR usa `minimumGroupingDigits: 2`, así que los números de
cuatro cifras no se agrupan—. `toLocaleString("es-ES")` ya hace lo que toca.

---

## 4. W2 · Registro de condición — back-office

HU-11, el flujo O2. Es la base documental de cualquier reclamación posterior: sin un
registro "antes", una pieza que falta al volver no se puede atribuir a nadie
([`delivery.ts`](../src/domain/rentals/delivery.ts)). Por eso se dibuja junto a W3 — el
par condición/discrepancia solo tiene sentido completo.

### 4.1 El problema previo: no hay puerta

Antes de dibujar nada hay que arreglar una cosa. `POST /api/rentals/:id/delivery` exige
que la copia esté en `ALQUILADA`, y **`ALQUILADA` no está en la cola de trabajo**:

```
ACTIONABLE_STATES = [INTAKE, EN_DEVOLUCION, EN_INSPECCION, EN_HIGIENIZACION, INCOMPLETA]
                     ← backoffice.repository.prisma.ts:17
```

El operador no tiene forma de enterarse de que hay un set asignado esperando a
prepararse. Es el hallazgo nº 4 de `ux-flows.md`, y aquí se convierte en un bloqueo
concreto: **la pantalla sería inalcanzable**. La cola de trabajo necesita un grupo más,
el primero de todos:

```
┌────────────────────────────────────────────────────────────────────┐
│ Cola de trabajo                          6 copias esperan acción   │
├────────────────────────────────────────────────────────────────────┤
│ ( Por preparar ) 2 copias        ← NUEVO · ALQUILADA · warning     │
│  Set                 Suscriptor      Desde          Acciones       │
│  Hogwarts Express    Ana Pérez       12/08 09:14   [ Registrar y   │
│                                                       enviar ]     │
│  Millennium Falcon   Bruno Gil       12/08 11:02   [ Registrar y   │
│                                                       enviar ]     │
│                                                                    │
│ ( Por inspeccionar ) 1 copia                                       │
│ ( En higienización ) 1 copia                                       │
│ ( Incompleta )       1 copia                                       │
│ ( En devolución )    1 copia                                       │
│ ( Sin catalogar )    1 copia                                       │
└────────────────────────────────────────────────────────────────────┘
```

Va **el primero** por el criterio que ya ordena la cola —primero lo que bloquea a un
cliente—: aquí hay alguien que ya tiene el set adjudicado y todavía no lo ha recibido.
Y el tono es `warning`, porque espera una acción de quien lee, que es la regla del
sistema de diseño.

Que la copia salga de la cola en cuanto se registra la condición es automático: el envío
pasa a `PREPARADO` pero la copia **sigue en `ALQUILADA`**, así que hace falta excluir las
que ya tengan un `Shipment` `OUTBOUND`. Es una condición más en la consulta, no un estado
nuevo — ver §8.1.

### 4.2 La pantalla — `/backoffice/copias/:copyId/entrega`

Pantalla propia, no un diálogo: hay una lista de comprobación que se rellena con el set
delante, y un diálogo obliga a mantener el contexto de la página de detrás para nada.

```
┌────────────────────────────────────────────────────────────────────┐
│ ‹ Cola de trabajo                                                  │
│ Registro de entrega                                                │
│ Hogwarts Express · copia #A3F2 · para Ana Pérez                    │
├────────────────────────────────────────────────────────────────────┤
│ Estado de la copia                                                 │
│  ( ) Correcta — completa y en buen estado                          │
│  ( ) Incompleta — faltan piezas                                    │
│  ( ) Dañada — hay piezas rotas o deterioradas                      │
│                                                                    │
│ Comprobaciones                                                     │
│  [x] Recuento de piezas conforme al inventario                     │
│  [x] Manual de instrucciones incluido                              │
│  [ ] Caja o embalaje en buen estado                                │
│  [x] Sin piezas sueltas fuera de bolsa                             │
│  ‹Observaciones (opcional)                                       ›  │
│                                                                    │
│ ⚠ warning                                                          │
│  Al guardar, el envío queda PREPARADO y Ana tendrá 48 h para       │
│  revisar la entrega y reportar cualquier diferencia.               │
│                                                                    │
│ [ Guardar y preparar envío ]   [ Cancelar ]                        │
└────────────────────────────────────────────────────────────────────┘
```

**Por qué el resultado va arriba y la lista debajo.** El campo obligatorio es `result`;
el `checklist` es opcional en el esquema. Poner primero lo que la API exige evita el
formulario que se rellena entero y falla por lo primero.

**El aviso de la ventana no es decorativo.** Guardar dispara el reloj de la discrepancia
(W3) y el operador tiene que saber que a partir de ahí la copia queda documentada. Las
"48 h" salen de `offerConfirmationWindowHours`, nunca escritas a mano.

### 4.3 El hueco que hay que decidir: qué lleva la lista de comprobación

`checklist` es `z.record(z.string(), z.unknown()).nullish()` en los **dos** endpoints
—entrega e inspección—. Es decir: **no existe ningún catálogo de comprobaciones en
ninguna capa**. La forma libre está bien para el almacenamiento, pero una pantalla no se
puede dibujar contra un `Record<string, unknown>`.

Las cuatro de arriba son una **propuesta**, no una decisión tomada: son las que se
deducen de lo que ya distingue el dominio (`INCOMPLETE` mira piezas, `DAMAGED` mira
estado) más el manual y el embalaje, que es lo que se toca al preparar un envío. **Hay
que ratificarlas** — es una decisión de operación, no de diseño — y una vez fijadas deben
vivir en un solo sitio, con la misma lista para entrega e inspección, para que los dos
informes de un mismo alquiler sean comparables campo a campo. Un informe de entrada y
otro de salida con casillas distintas no sirven para lo único que justifica registrarlos.

### 4.4 De dónde salen los datos · acciones

| | |
|---|---|
| Alquiler, copia, set, suscriptor | `rentals.findById` — la cola de trabajo ya trae `setName` y `subscriberName` |
| Ventana | `settings.load().offerConfirmationWindowHours` |
| Guardar | `POST /api/rentals/:id/delivery` → `201 {report, confirmationWindowHours}` → vuelve a la cola de trabajo |

**Errores reales que puede devolver:**

- `403` — "Solo el back-office registra el estado de una copia." Le llega a un
  suscriptor que llegue por URL, no al operador.
- `409 COPY_STATE_CONFLICT` — "El registro de entrega se hace sobre una copia ya
  asignada." Pasa si otro operador ya la preparó, o si el alquiler avanzó entre que se
  abrió la pantalla y se guardó. Se enseña el `detail` **y** se ofrece volver a la cola,
  porque recargar el formulario no arregla nada.

### 4.5 Vacío · error · espera · accesibilidad

- **Vacío**: no aplica; sin alquiler la pantalla es un 404.
- **Error**: sobre el botón, `role="alert"`, `--destructive`, persistente.
- **Espera**: botón deshabilitado con "Guardando…".
- **Accesibilidad**: el grupo de resultado es un `<fieldset>` con `<legend>` —tres
  radios sueltos sin agrupar no se anuncian como una elección—; cada casilla, su
  `<label>` asociada; el orden de foco recorre resultado → comprobaciones →
  observaciones → guardar, que es el orden en el que se rellena con el set en la mano.

---

## 5. W3 · Revisar la entrega y reportar discrepancia — portal

HU-07, el flujo S4. La otra mitad de W2: el suscriptor recibe el set y puede decir que
no coincide con lo registrado. **No se le imputa nada** — el registro previo existe
justamente para poder distinguir un daño anterior de uno causado durante el alquiler, y
ante la duda la carga de la prueba es nuestra.

### 5.1 La decisión importante: no hay botón de "Todo correcto"

La primera versión de esta pantalla tenía dos botones, "Todo correcto" y "Algo no
coincide". El código dice que el primero **no puede existir**:

> La conformidad tácita **no necesita guardarse**: es la ausencia de discrepancia una vez
> pasada la ventana, y se deduce de lo que ya hay registrado. Persistir un "confirmado
> tácitamente" obligaría a un proceso que lo escribiera y a mantenerlo en sincronía, para
> no añadir ninguna información nueva.
> — [`delivery.ts`](../src/domain/rentals/delivery.ts)

No hay endpoint de confirmación, y no lo hay a propósito. Un botón "Todo correcto" sería
un botón que no hace nada: la peor clase de interfaz, porque el usuario se queda creyendo
que ha dejado constancia. **Así que solo hay una acción, y el silencio se explica en vez
de disfrazarse.**

### 5.2 En "Mis sets", mientras la ventana está abierta

```
┌────────────────────────────────────────────────────────────────────┐
│ Mis sets                                                           │
│ ┌────────────────────────────────────────────────────────────────┐ │
│ │ Hogwarts Express            ( En tu poder )                    │ │
│ │ · Desde el 12 de agosto                        [ Devolver ]    │ │
│ │ ┌────────────────────────────────────────────────────────────┐ │ │
│ │ │ ⚠ warning                                                  │ │ │
│ │ │ Revisa la entrega antes del 14 ago, 09:14                  │ │ │
│ │ │ Lo enviamos como **completo y en buen estado**.            │ │ │
│ │ │ Si no coincide, dínoslo → [ Algo no coincide ]  ‹outline›  │ │ │
│ │ │ · Si no nos dices nada, damos la entrega por conforme.     │ │ │
│ │ └────────────────────────────────────────────────────────────┘ │ │
│ └────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘
```

La franja vive **dentro de la tarjeta del set**, no en un bloque aparte: es información
sobre ese set concreto y en cuanto la ventana se cierra desaparece sola. `warning` porque
espera algo de quien lee y caduca — la misma regla que hace que "Te toca" sea el otro
único `warning` del portal.

"Lo enviamos como **completo y en buen estado**" es el `result` del informe de entrega
traducido por `lib/status.ts` (`ConditionResult`). Sin decir contra qué se compara, "algo
no coincide" no significa nada.

### 5.3 El diálogo

```
┌──────────────────────────────────────────────────────┐
│ ¿Qué no coincide?                              [×]   │
├──────────────────────────────────────────────────────┤
│ Registramos la entrega como: ( Correcta )            │
│ Comprobado el 12 ago, 09:14                          │
│  · Recuento de piezas conforme                       │
│  · Manual incluido                                   │
│  · Caja en buen estado                               │
│                                                      │
│ Cuéntanos qué has encontrado                         │
│ ‹                                                  › │
│ ‹                                                  › │
│ · Mínimo 5 caracteres. No se te imputa nada: abrimos │
│   una incidencia y la revisamos nosotros.            │
│                                                      │
│              [ Cancelar ]  [ Enviar el aviso ]       │
└──────────────────────────────────────────────────────┘
```

Diálogo y no pantalla: la acción es corta, tiene un solo campo y el contexto que necesita
—qué registramos— cabe dentro. Es exactamente el caso para el que sirve `dialog`.

El "no se te imputa nada" está en el diálogo y no en la letra pequeña porque es lo que
decide si alguien lo reporta o se calla. Es la política real del dominio, no un consuelo.

### 5.4 De dónde salen los datos · acciones

| | |
|---|---|
| Informe y estado de la confirmación | `getDeliveryStatus` → `{deliveryReport, confirmation}` con `confirmation.status` ∈ `pending{expiresAt}` / `disputed` / `tacit` |
| Reportar | `POST /api/rentals/:id/discrepancy` `{notes}` → `201 {incidentId}` |

Los tres estados de `confirmation` mandan sobre lo que se ve:

| `confirmation` | Qué muestra la tarjeta |
|---|---|
| `null` (aún no hay registro de entrega) | Nada. El set está asignado pero no preparado. |
| `pending` | La franja de §5.2, con `expiresAt` en texto. |
| `disputed` | `( Incidencia abierta )` en `danger` y "Lo estamos revisando." Sin botón: `hasOpenIncidentOfType` ya rechazaría un segundo aviso. |
| `tacit` | Nada. La ventana pasó; la tarjeta vuelve a su forma normal. |

**Errores reales:**

- `409 COPY_STATE_CONFLICT` — "Ya has reportado una discrepancia para esta entrega."
  Solo alcanzable en una carrera; la interfaz ya no enseña el botón.
- `409 OFFER_EXPIRED` — "La ventana para reportar discrepancias en la entrega ya ha
  pasado." Es el caso real: la página se cargó con la ventana abierta y se envió después.
  El `detail` es claro y se muestra tal cual.
- `422` — menos de 5 caracteres. Junto al campo, no en un toast.

### 5.5 Accesibilidad

- El diálogo es `dialog` de shadcn (Radix): foco atrapado, `Esc` cierra, y al cerrarse el
  foco vuelve al botón que lo abrió. Es la razón de traerlo en vez de montar un modal a
  mano.
- La fecha límite se escribe completa —"14 ago, 09:14"— y no "quedan 36 horas": una
  cuenta atrás obliga a un `aria-live` que interrumpe cada minuto y envejece mal en una
  página que no se recarga.
- La franja de aviso no depende del color: lleva el texto "Revisa la entrega antes
  del…".

---

## 6. W4 · Catálogo e inventario — back-office

HU-10 y la parte de HU-16 que toca al catálogo. Dos pantallas, decisión §2.1: una lista
y una ficha.

### 6.1 `/backoffice/catalogo` — la lista

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Cola de trabajo · Catálogo · Clientes · Configuración · Personal          │
├──────────────────────────────────────────────────────────────────────────┤
│ Catálogo                    35 sets · 59 copias      [ + Nuevo set ]     │
│ ‹Buscar por nombre o referencia                    ›  ( Todos ▾ )        │
│                                                                          │
│  Set                    Ref.     Tema           Copias      Publicado    │
│  ──────────────────────────────────────────────────────────────────────  │
│  Hogwarts Express       75955    Harry Potter   2/5 libres  ( Sí )       │
│  Millennium Falcon      75192    Star Wars      0/1 libres  ( Sí )       │
│  Titanic                10294    Icons          0/0         ( No )  ⚠    │
│  ──────────────────────────────────────────────────────────────────────  │
│                                          « Anterior  1 de 2  Siguiente » │
└──────────────────────────────────────────────────────────────────────────┘
```

**El filtro por defecto es "Todos", incluidos los no publicados.** Es la razón de que
esta pantalla exista: un set recién creado nace sin publicar y el catálogo público lo
devuelve como 404, así que sin esta lista **no hay forma de volver a él**.

**"0/0" con el aviso** marca el caso que de verdad se cuela: un set publicado sin ninguna
copia sale en el catálogo público y no se puede alquilar nunca. La columna lo enseña sin
que haya que abrir nada.

La tabla va en `overflow-x-auto` con `min-w-[48rem]`; en móvil se desplaza ella, no la
página.

### 6.2 `/backoffice/catalogo/:setId` — la ficha

```
┌──────────────────────────────────────────────────────────────────────────┐
│ ‹ Catálogo                                                               │
│ Hogwarts Express                              ( Publicado )              │
│ 75955 · Harry Potter · 2018 · 1.245 pzs · 8+ · Intermedio                │
│ Valor de referencia 149,99 € · Restringido: no                           │
│                             [ Editar ]  [ Retirar del catálogo ] ‹admin› │
├──────────────────────────────────────────────────────────────────────────┤
│ Copias (5)                                        [ + Añadir copia ]     │
│  #      Estado             Alta         Acciones                         │
│  ────────────────────────────────────────────────────────────────────    │
│  A3F2   ( Disponible )     02/07/26     —                                │
│  B7C1   ( En tu poder→ )   12/08/26     · Ana Pérez                      │
│  C9D4   ( Sin catalogar )  19/08/26     [ Catalogar ]                    │
│  D2E8   ( Incompleta )     04/08/26     [ Higienizar ] [ Dar de baja ]   │
│  E5F0   ( De baja )        11/05/26     —                                │
└──────────────────────────────────────────────────────────────────────────┘
```

**Un solo sitio para el inventario.** Las acciones de copia son las mismas que ya existen
en la cola de trabajo (`POST /api/copies/:id/transitions`), reutilizando el componente:
la cola de trabajo responde a "¿qué hago ahora?" y esta ficha a "¿qué pasa con este
set?". Duplicar el componente duplicaría el sitio donde olvidar una transición.

**"Dar de baja" se le muestra al operador aunque reciba un 403** al pulsarlo. No es un
descuido: es la decisión ya tomada en el código (`copy.retire` es solo de admin) y
recogida en `ux-flows.md` — mejor explicar por qué no se puede que hacer desaparecer una
acción sin decir nada. Igual con "Retirar del catálogo", que necesita `set.publish`.

### 6.3 Alta de set y alta de copia

**El alta de copia no es un formulario.** `addCopy` no recibe ningún campo: crea la copia
en `INTAKE` y ya. Así que `[ + Añadir copia ]` es un botón que llama y añade una fila,
con `[ Catalogar ]` al lado — que es la transición `INTAKE → DISPONIBLE`. Pedir datos que
la API no acepta sería inventarse un formulario.

**El alta de set sí lo es**, y sus campos son literalmente los del esquema Zod de
`POST /api/sets`:

```
┌──────────────────────────────────────────────────────┐
│ Nuevo set                                            │
│  Tema *          ( Harry Potter ▾ )                  │
│  Nombre *        ‹                                 › │
│  Nº de piezas *  ‹      ›   Referencia  ‹        ›   │
│  Año  ‹    ›  Edad ‹     ›  Dificultad ‹          ›  │
│  Valor de referencia ‹        ›  €                   │
│  Foto de la caja (URL) ‹                           › │
│  [ ] Set restringido — exige N meses de antigüedad   │
│                                                      │
│  · Se crea sin publicar. Lo verá el público cuando   │
│    un administrador lo publique.                     │
│                    [ Cancelar ]  [ Crear set ]       │
└──────────────────────────────────────────────────────┘
```

Tres cosas que salen del esquema y no de la imaginación: el **tema es un `uuid`**, así
que es un desplegable poblado desde `themes` y nunca texto libre; el **valor de
referencia viaja como cadena** con dos decimales (`/^\d+(\.\d{1,2})?$/`) porque el
decimal exacto no cabe en un `number`, así que el campo valida contra eso; y **solo el
tema, el nombre y las piezas son obligatorios**. Los errores se acumulan y se pintan
todos a la vez, con el mensaje que ya trae cada regla ("Indica el tema del set.", "Usa un
importe como 149.99.").

La nota de "se crea sin publicar" evita el desconcierto de crear un set y no encontrarlo
en la web.

### 6.4 De dónde salen los datos

Server Components leyendo repositorios, **sin `GET /api/sets`**: `prisma.set.findMany`
para la lista con el recuento de copias por estado, `listCopiesOfSet` para la ficha. La
API pública se amplía cuando la pida un consumidor externo, no para alimentar una
pantalla nuestra (§2.1).

### 6.5 Vacío · error · espera · accesibilidad

- **Vacío de la lista**: solo posible con la base recién creada. "Todavía no hay ningún
  set" + `[ + Nuevo set ]` — vacío de tipo "todavía no", que invita a la acción.
- **Vacío de la búsqueda**: "Ningún set coincide con «xyz»" + `[ Quitar el filtro ]` —
  vacío de tipo "ya no queda", que ofrece deshacer. Son dos casos distintos y se
  redactan distinto (`design-system.md` §7.1).
- **Sin copias**: "Este set no tiene ninguna copia todavía. Publicado sin copias, nadie
  podrá alquilarlo."
- **Error**: junto a la acción, persistente. Un `409` de transición ("El estado de la
  copia ha cambiado") pide recargar, y se dice.
- **Accesibilidad**: las tablas llevan `<caption>` (`sr-only`) y `<th scope="col">`; las
  acciones de fila nombran su objeto — `aria-label="Catalogar la copia C9D4"` —, porque
  cuatro botones "Catalogar" seguidos son indistinguibles al tabular.

---

## 7. W5 · Portal ampliado

Hoy `/portal` es una página con cinco bloques y **ningún layout**: `app/(portal)` no
tiene `layout.tsx`, así que hereda el `<body>` pelado del layout raíz. Con historial y
suscripción entrando, se reparte en cinco rutas (§2.3).

### 7.1 La estructura

```
┌──────────────────────────────────────────────────────────────────┐
│ Clickoteca    Resumen  Mis sets  Historial  Suscripción  Avisos ③│
│                                            Ana Pérez ▾           │
└──────────────────────────────────────────────────────────────────┘
```

El ③ es el contador de avisos sin leer — `GET /api/notifications?unread=1` ya lo
devuelve. Es el único adorno numérico de la cabecera, y se lo gana: es lo único que
cambia sin que el suscriptor haga nada.

### 7.2 `/portal` — Resumen

Responde a "¿puedo pedir un set?", que es la pregunta con la que se entra, y no repite
lo que hay en las otras cuatro.

```
┌──────────────────────────────────────────────────────────────────┐
│ Hola, Ana                                                        │
│                                                                  │
│ ⚠ warning — Te toca                                              │
│  Millennium Falcon está disponible para ti. Tienes hasta el      │
│  14 ago, 09:14.            [ Confirmar ]  [ Rechazar ]           │
│                                                                  │
│ ┌──────────────────────────┐ ┌──────────────────────────────┐    │
│ │ Tu plan  ( Activa )      │ │ Ahora mismo                  │    │
│ │ Premium · 24,99 €/mes    │ │ 1 de 2 plazas ocupadas       │    │
│ │ 2 sets en casa a la vez  │ │ 2 colas activas              │    │
│ │ [ Gestionar ]            │ │ [ Explorar el catálogo ]     │    │
│ └──────────────────────────┘ └──────────────────────────────┘    │
│                                                                  │
│ Mis sets (1)                                     Ver todos ›     │
│  Hogwarts Express  ( En tu poder )  desde el 12 ago              │
│                                                                  │
│ Mis colas (2)                                    Ver todas ›     │
│  Millennium Falcon ( Te toca )  ·  Titanic ( En espera )         │
└──────────────────────────────────────────────────────────────────┘
```

"Te toca" se queda arriba del todo y sigue siendo **el único `warning` del portal**: es
literalmente lo único que le pedimos al suscriptor y caduca solo. Y sigue estando en el
resumen, no en su propia pestaña, porque esconder detrás de un clic lo único urgente
sería el peor sitio posible.

"1 de 2 plazas ocupadas" es el dato que **hoy no está en ninguna pantalla** y que explica
por adelantado el `PLAN_LIMIT_REACHED` que W1 puede devolver. Se cuenta con
`OCCUPYING_COPY_STATES`, el mismo conjunto que decide la elegibilidad, no con "los sets
que tengo en casa" — si no, una copia en inspección desaparecería de la cuenta y el
número contradiría al veredicto.

### 7.3 `/portal/sets` y `/portal/historial`

`Mis sets` es lo que ya existe: la lista de alquileres activos con su píldora, la fecha,
`[ Devolver ]` cuando la copia está `ALQUILADA`, y la franja de revisión de entrega de W3.

`Historial` es lo que falta, y **el dato ya está**: `listForUser(userId)` sin
`activeOnly` devuelve todos los alquileres ordenados por fecha. Es una tabla:

```
│  Set                 Desde       Hasta       Estado                │
│  Titanic             02/06/26    28/06/26    ( Cerrado )           │
│  Hogwarts Express    12/08/26    —           ( En tu poder )       │
```

Con la granularidad del suscriptor, claro: los cuatro estados del circuito de devolución
son un único "Devolución en curso".

### 7.4 `/portal/suscripcion`

La pantalla que da sitio a las tres acciones que hoy no tienen ninguno.

```
┌──────────────────────────────────────────────────────────────────┐
│ Tu suscripción                                                   │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ ( Activa )  Premium · 24,99 €/mes                            │ │
│ │ 2 sets en casa a la vez · desde el 4 de marzo de 2026        │ │
│ └──────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ Cambiar de plan                                                  │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ Basic · 14,99 €/mes · 1 set a la vez        [ Cambiar ]      │ │
│ │ ⚠ warning                                                    │ │
│ │  Ese plan permite menos sets de los que tienes ahora.        │ │
│ │  Devuelve 1 set para poder cambiarte.                        │ │
│ └──────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ Pausar o cancelar                                                │
│  Mientras esté en pausa no podrás llevarte sets nuevos.          │
│  [ Pausar ]   [ Cancelar la suscripción ]  ‹destructive›         │
└──────────────────────────────────────────────────────────────────┘
```

**El aviso del downgrade se enseña antes de pulsar, no después.** `canSwitchToPlan`
devuelve `mustReturn`, un número, y el mensaje ya dice **cuántos** hay que devolver: un
número es accionable, "tienes sets pendientes" no. Se puede calcular en el servidor al
pintar la página, así que el suscriptor lo sabe de antemano; el `409
PLAN_DOWNGRADE_BLOCKED` queda para la carrera.

**Cancelar abre un `alert-dialog`.** Es la única acción del portal que lo merece:
irreversible desde la interfaz —no hay "recontratar", solo `PUT status: ACTIVE`, que es
otra cosa— y con consecuencia inmediata sobre lo que puede hacer. El diálogo dice qué
pasa con los sets que tenga y pide confirmar.

**Pausar y cancelar comparten regla y no la comparten con el cambio de plan**, y eso se
nota en pantalla: `canEndSubscription` mide solo lo que el suscriptor tiene **en su
poder** (`HELD_COPY_STATES`), mientras que el cambio de plan mide lo que **ocupa plaza**
(`OCCUPYING_COPY_STATES`). Con una copia en inspección se puede pausar pero no bajar de
plan. Es deliberado —retener la suscripción por nuestro proceso interno sería injusto— y
el texto de cada bloque lo explica en sus términos, sin un mensaje común que sería falso
para uno de los dos.

### 7.5 `/portal/avisos`

La lista completa del buzón, con la fecha y el estado de leído, y el aviso sin leer
marcado. `POST /api/notifications/:id/read` ya existe. Los tipos se traducen: en la base
el aviso se llama `QUEUE_TURN`; en pantalla, "Te toca un set de tu cola".

### 7.6 Vacío · error · espera · accesibilidad

- **Vacíos**, los cuatro de tipo "todavía no", con salida: "No tienes ningún set ahora
  mismo" + enlace al catálogo; "No estás en ninguna cola" + enlace al catálogo; "Aún no
  has alquilado nada"; "Nada nuevo".
- **Sin plan activo** (suscripción `PAUSED` o `CANCELLED`): la píldora `neutral` —no es
  un error, es una decisión del cliente— y el texto explicando que impide alquilar, con
  `[ Reactivar ]`. El color no lo dice; el texto sí.
- **Espera**: botones con texto de progreso. Para el historial, `skeleton` con forma de
  tabla si llega a paginarse.
- **Accesibilidad**: la navegación es `<nav aria-label="Portal">` con `aria-current="page"`
  en el activo; cada bloque sigue siendo `<section aria-labelledby>` —lo que salvó al E2E
  de romperse con cada cambio de redacción—; el contador de avisos no es solo el número,
  lleva texto accesible ("3 avisos sin leer").

---

## 8. Lo que destapa dibujar estas pantallas

Igual que en `ux-flows.md`, cruzar el diseño con el código es lo que da información
nueva. Siete cosas, ordenadas de "bloquea una pantalla" a "conviene saberlo".

### 8.1 · Bloqueante — `ALQUILADA` no está en la cola de trabajo

`ACTIONABLE_STATES` no lo incluye
([`backoffice.repository.prisma.ts:17`](../src/repositories/backoffice.repository.prisma.ts)),
así que **W2 sería una pantalla sin puerta**: el operador no puede enterarse de que hay
un set asignado esperando a prepararse. Ya era el hallazgo nº 4 de `ux-flows.md`; ahora
es un requisito de implementación.

Y hay un matiz que no estaba visto: registrar la condición **no cambia el estado de la
copia** —crea el informe y el `Shipment` `OUTBOUND` `PREPARADO`, pero la copia sigue en
`ALQUILADA`—, así que el grupo nuevo tiene que excluir las copias que ya tengan envío de
salida. Si no, lo preparado se queda en la cola para siempre.

### 8.2 · Bloqueante — el `checklist` no existe en ninguna parte

`z.record(z.string(), z.unknown()).nullish()` en entrega e inspección. No hay catálogo de
comprobaciones, y una pantalla no se dibuja contra un diccionario libre. §4.3 propone
cuatro ítems; **hay que ratificarlos** y ponerlos en un sitio único compartido por los
dos informes, o los de entrada y salida de un mismo alquiler no serán comparables — que
es lo único que justifica registrarlos.

### 8.3 · Un ajuste con dos significados

La ventana para reportar una discrepancia es `offerConfirmationWindowHours`, el mismo
ajuste que da el plazo para confirmar una oferta de cola
([`delivery-and-return.ts`](../src/use-cases/rentals/delivery-and-return.ts)). Son dos
plazos distintos con razones distintas, y hoy un admin que acorte la ventana de ofertas
en `/backoffice/configuracion` **acortará sin saberlo el plazo para reclamar una
entrega**. No es un fallo de la pantalla, pero la pantalla lo hace visible: dos textos de
interfaz citando el mismo número por motivos que nadie relacionaría. Merece o un ajuste
propio o una nota explícita en la configuración.

### 8.4 · La posición en la cola no llega al portal

`QueueEntrySummary` trae `enqueuedAt`, `effectiveEntryAt`, `appliedBonusDays` y
`priorityPenaltyDays` — **pero no la posición**
([`queue.repository.ts:30`](../src/repositories/queue.repository.ts)). La posición sí
existe, pero en la proyección autenticada del set (`queuePosition`), o sea **por set**.
Así que "Mis colas" puede decir desde cuándo espera, no en qué puesto va, que es
justamente lo que pide HU-06.

Se arregla en el repositorio —contar entradas activas con `effectiveEntryAt` anterior, en
el mismo set—, no en la pantalla. Hasta entonces, la posición solo se ve entrando en la
ficha de cada set (W1 §3.4).

### 8.5 · La navegación de superficie no está en los layouts

Los layouts existen —`app/(portal)/portal/layout.tsx` y
`app/(backoffice)/backoffice/layout.tsx`— y traen el guarda de superficie, el ancho, el
nombre de quien ha entrado y el botón de salir. Lo que no traen es **navegación**: la del
back-office está dentro de `backoffice/page.tsx`, así que desde `/backoffice/clientes` hay
que volver al centro por el enlace de cada subpágina para ir a otra sección; y el portal
no tiene ninguna porque hoy es una sola ruta.

Hub y radios funciona con tres secciones. Con las cinco rutas de W5 y la sección nueva de
W4, no: el rodeo por el centro se paga en cada salto.

### 8.6 · No hace falta `GET /api/sets`

`app/api/sets/route.ts` solo tiene `POST`. La lista de W4 se resuelve leyendo el
repositorio desde un Server Component, como ya hace la cola de trabajo. Se anota para que
nadie escriba el endpoint pensando que la pantalla lo necesita (§2.1).

### 8.7 · La tabla de cobertura de `ux-flows.md` §7 está desfasada

Se escribió el 2026-08-16, un día antes de implementar `plan-obligatorio-en-alta`. Dice
que HU-02 (cambio de plan) está "sin API ni UI" cuando `PUT /api/subscriptions/me` y el
`PlanSwitcher` del portal existen desde el 17. HU-09 (pausar/cancelar) sí sigue siendo
correcta: la API está, la interfaz no.

Y queda fuera de esta tanda, sin cambiar de estado: **HU-16**, cuyos endpoints
`PATCH /api/plans/:code` y `PUT /api/sets/:id/retention-reminder` existen y no tienen
ninguna pantalla en `/backoffice/configuracion`.

---

## 9. Qué hace falta para construirlo

### 9.1 Componentes de shadcn, por pantalla

Amplía `design-system.md` §6.2 con lo que estos wireframes confirman. Se traen **cuando
se implementa la pantalla que los pide**, no antes: shadcn copia el código al repo y un
componente sin uso es código muerto.

| Componente | Lo pide |
|---|---|
| `card` | W1 (caja de decisión), W5 (plan y "ahora mismo") |
| `input`, `label`, `form`, `textarea` | W2 (observaciones), W3 (notas), W4 (alta de set) |
| `checkbox`, `radio-group` | W2 — la lista de comprobación y el resultado |
| `select` | W4 — el tema, que es un `uuid` y nunca texto libre |
| `dialog` | W3 (reportar), W4 (alta de set) |
| `alert-dialog` | W5 — cancelar la suscripción. Y `[ Dar de baja ]` de W4 |
| `alert` | Los avisos de no elegibilidad (W1 §3.5) y de downgrade (W5 §7.4) |
| `table` | W4 y el historial de W5 |
| `skeleton` | Solo si el historial llega a paginarse |
| `tabs` | **No** — la navegación del portal son rutas, no pestañas (§2.3) |

### 9.2 Orden de implementación

El mismo de `ux-flows.md` §9.2, con lo que cada paso obliga a arreglar antes:

1. ~~**W1 · Ficha de set.**~~ **Hecha el 2026-08-20** (§3). Desbloqueaba HU-03 y HU-04,
   el flujo central del producto, y el catálogo deja de ser una rejilla sin destino.
2. **La navegación en los dos layouts** (§8.5). Barato, y todo lo que viene después la
   da por supuesta. ← **siguiente**
3. **W5 · Portal ampliado.** Después de W1, porque W1 manda a `/portal/suscripcion` y a
   `/portal/sets` desde sus avisos de no elegibilidad.
4. **W2 + W3.** Juntos, y **después de arreglar §8.1 y ratificar §8.2**: sin la puerta en
   la cola de trabajo y sin la lista de comprobaciones, no se pueden construir.
5. **W4 · Catálogo e inventario.** El último de los cinco: es el que menos bloquea a un
   cliente y el que más superficie tiene.

### 9.3 Cómo se verifica cada pantalla

No hace falta inventar nada; el andamiaje ya está montado y tiene sus reglas:

- **`e2e/accesibilidad.spec.ts`** crece con cada pantalla. Con W1 ya son **doce**
  —las cinco públicas, la ficha de set **en sus dos proyecciones**, el portal y las
  cuatro del back-office—, y con las cuatro restantes rondará las veinte. Solo las
  etiquetas de conformidad (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`): las
  *best-practice* de axe quedan fuera a propósito.
- **Recorridos nuevos en el E2E:** pedir un set y encolarse desde W1 (HU-03/HU-04) y el
  par registro→discrepancia (HU-11/HU-07). El circuito tiene que **cerrarse** —dejar la
  copia `DISPONIBLE`— o la segunda ejecución falla por estado residual, que ya pasó una
  vez.
- **Anclar los tests por rol**, `getByRole("region", { name: … })`, no por texto: cambiar
  una frase no puede poner la suite roja. Es la lección de la regresión de copia del
  portal.
- **`workers: 3`.** Si aparecen timeouts sin sentido en `page.goto`, es hambre de CPU, no
  la aplicación.
- Lo que **ninguna de esas pruebas cubre** y hay que mirar a mano en cada pantalla: el
  recorrido completo por teclado y si los textos alternativos describen algo. Verde en
  axe no es "es accesible".

### 9.4 Cobertura si se construyen las cinco

Recontando la tabla de `ux-flows.md` §7 con la corrección de §8.7 (HU-01 y HU-02 ya
están hechas desde el 17 de agosto):

| | Hoy | Con W1–W5 |
|---|---|---|
| Historias con recorrido completo por interfaz | 9 de 18 | **16 de 18** |
| De las seis ⭐ distintivas del producto | 3 de 6 (HU-05, HU-08, HU-13) | **6 de 6** |
| ¿Se puede ser cliente de Clickoteca solo con el navegador? | **No** | **Sí** |

Las siete que cambian: HU-00 y HU-03/HU-04 con W1, HU-07 con W3, HU-09 con W5, HU-10 con
W4 y HU-11 con W2.

Las dos que seguirían sin cerrar, y por qué:

- **HU-06** (mis sets, historial y **posición** en cola) se queda a medias: el historial
  llega con W5, pero la posición está bloqueada por §8.4 y no se arregla en la pantalla.
- **HU-16** (planes y recordatorios de retención) queda fuera de esta tanda: tiene API y
  no tiene pantalla, §8.7.
