## ADDED Requirements

### Requirement: Ordenación de columnas en la tabla de pedidos
La tabla de pedidos en `/orders` SHALL permitir al administrador ordenar las filas haciendo clic en los encabezados de las columnas ordenables: Referencia, Tienda, Usuario, Importe y Fecha. Las columnas Estado, Modo y la columna de acción de chat NO son ordenables.

#### Scenario: Acceso a la página sin parámetros de ordenación
- **WHEN** el administrador navega a `/orders` sin query params `sort` ni `dir`
- **THEN** los pedidos se muestran ordenados por fecha de recepción del webhook (`webhookReceivedAt`) en orden descendente (más recientes primero)

#### Scenario: Ordenar por una columna inactiva
- **WHEN** el administrador hace clic en el encabezado de una columna que no está activa como columna de ordenación
- **THEN** la URL se actualiza a `?sort=<columna>&dir=asc`
- **THEN** la página recarga con los datos ordenados por esa columna en orden ascendente

#### Scenario: Invertir el orden de la columna activa
- **WHEN** el administrador hace clic en el encabezado de la columna que ya está activa
- **THEN** la URL alterna `dir` entre `asc` y `desc`
- **THEN** los datos se recargan en el nuevo orden

#### Scenario: Persistencia del orden en la URL al recargar
- **WHEN** el administrador recarga la página con `?sort=store&dir=asc` en la URL
- **THEN** la tabla muestra los pedidos ordenados por Tienda ascendente, sin perder el estado

#### Scenario: Parámetros de ordenación completamente inválidos
- **WHEN** la URL contiene `?sort=invalido&dir=invalido`
- **THEN** la página renderiza con el orden por defecto (Fecha DESC) sin mostrar error

#### Scenario: sortBy inválido con sortDir válido — reset completo al defecto
- **WHEN** la URL contiene `?sort=invalido&dir=asc`
- **THEN** la página renderiza con el orden por defecto (Fecha DESC) sin mostrar error
- **THEN** el sortDir válido recibido (`asc`) es descartado porque el sortBy es inválido

---

### Requirement: Subsort por Referencia al ordenar por Tienda
Cuando la columna activa de ordenación sea **Tienda**, el sistema SHALL aplicar un criterio de ordenación secundario por **Referencia** (`externalOrderNumber`) en la misma dirección, de forma que los pedidos de una misma tienda aparezcan ordenados por referencia.

#### Scenario: Ordenar por Tienda ascendente con subsort
- **WHEN** la URL contiene `?sort=store&dir=asc`
- **THEN** los pedidos se ordenan primero por nombre de tienda A→Z
- **THEN** los pedidos con la misma tienda se subordenan por `externalOrderNumber` A→Z (nulls al final)

#### Scenario: Ordenar por Tienda descendente con subsort
- **WHEN** la URL contiene `?sort=store&dir=desc`
- **THEN** los pedidos se ordenan primero por nombre de tienda Z→A
- **THEN** los pedidos con la misma tienda se subordenan por `externalOrderNumber` Z→A (nulls al final)

---

### Requirement: Indicadores visuales de ordenación en los encabezados
Los encabezados de las columnas ordenables SHALL mostrar iconos que indiquen el estado de ordenación de cada columna.

#### Scenario: Columna inactiva muestra icono neutro
- **WHEN** una columna ordenable no es la columna activa de ordenación
- **THEN** muestra el icono `ChevronsUpDown` (↕) en color atenuado (`muted-foreground/50`)

#### Scenario: Columna activa en orden ascendente
- **WHEN** la columna es la columna activa y `dir=asc`
- **THEN** muestra el icono `ChevronUp` (▲) en color resaltado (`foreground`)

#### Scenario: Columna activa en orden descendente
- **WHEN** la columna es la columna activa y `dir=desc`
- **THEN** muestra el icono `ChevronDown` (▽) en color resaltado (`foreground`)

#### Scenario: Columnas no ordenables sin icono
- **WHEN** la columna es Estado, Modo o la columna de acción de chat
- **THEN** no muestra ningún icono de ordenación ni área clicable

---

### Requirement: Accesibilidad de los controles de ordenación
Los controles de ordenación SHALL cumplir con WCAG 2.1 AA.

#### Scenario: Atributo aria-sort en columna activa
- **WHEN** la columna es la columna activa con `dir=asc`
- **THEN** el elemento `<th>` incluye `aria-sort="ascending"`
- **WHEN** la columna es la columna activa con `dir=desc`
- **THEN** el elemento `<th>` incluye `aria-sort="descending"`

#### Scenario: Atributo aria-sort en columnas inactivas ordenables
- **WHEN** la columna es ordenable pero no es la columna activa
- **THEN** el elemento `<th>` incluye `aria-sort="none"`

#### Scenario: Botón de ordenación con aria-label descriptivo
- **WHEN** se inspecciona el botón de ordenación de "Tienda" con dirección próxima `asc`
- **THEN** el botón tiene `aria-label="Ordenar por Tienda ascendente"`
- **WHEN** se inspecciona el botón de ordenación de "Tienda" con dirección próxima `desc`
- **THEN** el botón tiene `aria-label="Ordenar por Tienda descendente"`

---

### Requirement: Renombrado de la columna N.º pedido a Referencia
La columna actualmente llamada "N.º pedido" en la tabla de pedidos SHALL renombrarse a **"Referencia"** en todos los textos visibles e identificadores de accesibilidad.

#### Scenario: Cabecera de columna actualizada
- **WHEN** el administrador visualiza la tabla de pedidos
- **THEN** el encabezado de la primera columna muestra el texto "Referencia"
- **THEN** el texto "N.º pedido" no aparece en ningún lugar de la tabla
