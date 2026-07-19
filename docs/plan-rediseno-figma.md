# Plan de Rediseño — Figma "Premium Tattoo Marketplace"

> Rama: `feature/rediseno-figma`
> Referencia de diseño: `fixs/figma-design/` (código exportado desde Figma Make)
> Objetivo: aplicar el diseño visual del prototipo Figma al frontend Angular **sin alterar ninguna funcionalidad existente** (rutas, servicios, guards, flujos de reserva/pago/reseñas).

---

## 1. Análisis del diseño de referencia

El export de Figma Make es una app React + Tailwind con 3 vistas (Home, Artistas, Perfil de artista) y un chatbot modal. Lo que se porta **no es el código React**, sino sus **tokens de diseño y patrones visuales**, adaptados a los componentes Angular ya existentes.

### 1.1 Tokens de diseño (fuente: `fixs/figma-design/src/styles/theme.css` y `App.tsx`)

| Token | Valor Figma | Valor actual (styles.scss) |
|---|---|---|
| Fondo principal | `#0D0D0D` | `#0c0c0c` |
| Fondo secundario | `#161616` | `#141414` |
| Tarjetas | `#1E1E1E` | `#1c1c1c` |
| Acento (dorado) | `#D4AF37` | `#c9a446` |
| Texto principal | `#FFFFFF` | `#f0ede8` |
| Texto secundario | `#A3A3A3` | `#888888` |
| Borde | `rgba(255,255,255,0.07)` | igual |
| Radio base | `1rem` (16px) | `12px` |
| Ring/focus | `rgba(212,175,55,0.4)` | — |
| Tipografía | Inter / Geist | Inter |

### 1.2 Patrones visuales clave del prototipo

- **Nav global fija** transparente que al hacer scroll gana fondo `rgba(13,13,13,0.92)` + `backdrop-filter: blur(20px)` + borde inferior sutil.
- **Botones CTA** dorados (`#D4AF37`, texto `#0D0D0D`) con `border-radius: full` y hover `brightness(1.10)`.
- **Nav móvil inferior** fija (Inicio / Buscar / Mapa / Mi cuenta) con blur y safe-area.
- **Botón flotante "Cotizar"** (móvil) dorado con sombra `0 8px 32px rgba(212,175,55,0.30)`.
- **Tarjetas de artista** con imagen, badges (verificado, certificado, premiado, auspiciado), rating con estrellas, etiqueta dorada de estilo.
- **Chatbot modal** de cotización por pasos.
- **Barras de dimensión** en reseñas (4 dimensiones).
- Branding: el prototipo usa "INKSPIRE"; **se mantiene la marca actual INK·LINK** (solo cambia el estilo visual del logo).

---

## 2. Restricciones

1. **Cero cambios funcionales**: no se tocan servicios, guards, interceptores, modelos ni rutas. Solo templates (`.html`) y estilos (`.scss`), y TS únicamente cuando sea presentacional (ej. estado `scrolled` del nav).
2. **No se introduce Tailwind ni React**: los estilos se portan a SCSS con las variables CSS ya existentes (`--ink-*`).
3. **Angular Material se conserva** donde da funcionalidad (formularios, datepicker, dialogs); se re-tematiza a oscuro/dorado. Se reemplaza solo donde es puramente visual (toolbar del nav).
4. **Mobile-first responsive** como el prototipo.
5. Commits en español, incrementales por fase (estándar del repo).

---

## 3. Fases de implementación

### Fase 0 — Base de diseño (tokens + tipografía + tema Material)
- Actualizar variables en `frontend/src/styles.scss` a los valores Figma (tabla 1.1), agregando las que faltan (`--ink-ring`, radios derivados).
- Cargar fuentes Inter + Geist (Google Fonts en `index.html`).
- Reemplazar el tema Material `azure-blue` por un tema oscuro personalizado (paleta dorada) para que inputs, botones y dialogs de Material no rompan la estética.
- Estilos base globales: headings, botones, scrollbar, focus ring.
- **Verificación**: `ng build` + revisión visual de todas las rutas (nada roto, solo colores/tipografía).

### Fase 1 — Shell de navegación (`app.html` / `app.scss` / `app.ts`)
- Nav superior fija con transición al scroll (transparente → blur), logo INK·LINK con marca dorada, links Vitrina/Artistas/Mapa, CTA "Registrarse"/"Ingresar" o menú de usuario autenticado.
- Nav móvil inferior fija (Inicio, Buscar, Mapa, Mi cuenta) — enlaza a rutas existentes.
- Menú hamburguesa móvil para el nav superior.
- **Verificación**: navegación completa funciona, login/logout visibles según estado de sesión.

### Fase 2 — Home / Vitrina (`features/showcase`)
- Hero con imagen de fondo, titular grande, CTA dorado y buscador.
- Secciones de vitrina restyled: carruseles/grillas de destacados, estilos con imágenes, artistas mejor calificados.
- Restyle de `shared/components/artist-card`, `star-rating`, `certification-badge`, `sponsor-badges`, `showcase-section` según las tarjetas del prototipo.
- **Verificación**: datos reales del backend se siguen mostrando; navegación a perfiles funciona.

### Fase 3 — Listado de artistas (`features/artists`)
- Barra de búsqueda + panel de filtros restyled (chips de estilo, comuna, precio, rating).
- Grilla de tarjetas de artista con el nuevo diseño (badges, favoritos, etiqueta dorada).
- **Verificación**: filtros y búsqueda siguen funcionando contra el API.

### Fase 4 — Perfil de artista (`features/artist-profile`)
- Header de perfil: avatar, badges, rating, comuna, tarifas, CTA "Cotizar" que abre el chatbot existente.
- Galería/portafolio, sección de reseñas con barras de 4 dimensiones, sección de auspiciadores.
- **Verificación**: cotización por chatbot y flujo de reserva intactos.

### Fase 5 — Chatbot cotizador (`features/quote-chatbot`)
- Restyle del modal/panel al estilo del prototipo (pasos, burbujas, CTA dorado) sin cambiar la lógica de pasos ni el servicio.
- Botón flotante "Cotizar" en móvil.

### Fase 6 — Auth, cuenta y reservas (`auth/login`, `account`, `booking/*`)
- Login, mi cuenta, mis reservas, resumen de reserva, checkout simulado, retorno de pago y formulario de reseña: aplicar tokens (fondos, tarjetas, botones dorados, inputs oscuros). Sin rediseño estructural profundo, solo coherencia visual.
- **Verificación**: flujo e2e completo — login → cotizar → reservar → pagar (sandbox) → calificar.

### Fase 7 — Mapa (`features/map`)
- Tematizar contenedor, popups de Leaflet y controles al tema oscuro/dorado.

### Fase 8 — Cierre
- Revisión responsive completa (móvil/desktop) de todas las rutas.
- `ng build` producción sin errores, tests existentes en verde.
- Actualizar `PROJECT_STATUS.md` y `HANDOFF.md` (protocolo de traspaso) + `PROMPT_REGISTRY.md`.
- PR hacia `main`.

---

## 4. Criterios de aceptación globales

- Ninguna ruta, guard, servicio ni contrato de API modificado.
- Todas las funcionalidades del MVP operativas (verificadas manualmente por flujo).
- `ng build --configuration production` sin errores; tests unitarios existentes en verde.
- Estética consistente con el prototipo Figma en las 3 vistas principales y coherente en el resto.
