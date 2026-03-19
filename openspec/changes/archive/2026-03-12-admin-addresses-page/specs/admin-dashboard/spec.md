## MODIFIED Requirements

### Requirement: Layout con sidebar de navegación
La app SHALL renderizar un layout de dos columnas: sidebar fijo de 264px (`bg-brand-black`) con navegación principal y área de contenido flexible con scroll.

El sidebar SHALL mostrar el wordmark "adresles" en `text-brand-lime` con el tag "admin" en `text-white/30`, **cuatro** ítems de navegación con iconos lucide-react (`ShoppingCart` para Pedidos, `Users` para Usuarios, `MapPin` para Direcciones, `MessageSquare` para Simulación) y la versión `v0.1.0` en el footer (`text-white/30 text-xs`).

El orden de los ítems de navegación SHALL ser: Pedidos → Usuarios → **Direcciones** → Simulación.

El ítem activo SHALL marcarse con `border-l-2 border-brand-lime bg-white/5 text-brand-lime`. Los ítems inactivos SHALL tener `text-white/70 hover:bg-white/10 hover:text-white`.

La raíz `/` SHALL redirigir automáticamente a `/orders`.

El layout SHALL incluir un skip link `<a href="#main-content">Saltar al contenido</a>` visible al recibir foco (`sr-only focus:not-sr-only`).

#### Scenario: Navegación a /orders muestra ítem activo
- **WHEN** el usuario navega a `/orders`
- **THEN** el ítem "Pedidos" en el sidebar muestra estado activo: `border-l-2 border-brand-lime bg-white/5 text-brand-lime`

#### Scenario: Navegación a /addresses muestra ítem activo
- **WHEN** el usuario navega a `/addresses`
- **THEN** el ítem "Direcciones" en el sidebar muestra estado activo: `border-l-2 border-brand-lime bg-white/5 text-brand-lime`

#### Scenario: Direcciones aparece entre Usuarios y Simulación
- **WHEN** el usuario ve el sidebar
- **THEN** el ítem "Direcciones" (icono `MapPin`) aparece en la posición 3, entre "Usuarios" y "Simulación"

#### Scenario: Redirección desde raíz
- **WHEN** el usuario accede a `/`
- **THEN** es redirigido automáticamente a `/orders`

#### Scenario: Skip link accesible al recibir foco
- **WHEN** el usuario presiona Tab en la primera interacción con la página
- **THEN** el skip link `"Saltar al contenido"` se hace visible y permite saltar al `#main-content`
