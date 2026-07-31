# ADR-0001 — Librería de componentes UI para los frontends Angular 22

- **Estado:** Aceptada
- **Fecha:** 2026-07-17
- **Decisores:** Arquitectura de Software CCB
- **Ámbito:** `frontend/portal-certificados`, `frontend/portal-verificacion`
- **Relacionado con:** PRD §15.2 (Stack Frontend), AGENTS.md (2 apps Angular 22)

---

## Contexto

El proyecto es la **migración** del canal digital de certificados electrónicos existente
(`CERTIFICADOS_ELECTRONICOS_NET`) hacia dos SPAs en **Angular 22**. El sitio actual está
construido con **AngularJS 1.x + jQuery + Bootstrap 3 + angular-ui-bootstrap**.

Restricción dura del negocio: **el estilo corporativo de la CCB no puede modificarse**. La
identidad visual del sitio actual es **CSS corporativo propio construido sobre Bootstrap**, no
un tema de ninguna librería de componentes. Sus elementos clave, extraídos del código actual
(`CCB.Certificados.Presentacion/Content/style.css`), son:

| Elemento | Valor en el sitio actual |
| --- | --- |
| Tipografía corporativa | `TradeGothicLTPro` (Linotype, licencia comercial MyFonts) + variantes `-Light` y `-Bd2`; fallback HelveticaNeue/Helvetica/Arial |
| Archivos de fuente | `Content/fonts/302991_0_0.{eot,woff2,woff,ttf,svg}` (y `_1_0`, `_2_0`) |
| Azul institucional (primario) | `#033864` |
| Azul secundario / enlaces | `#1864a1` |
| Acento magenta CCB | `#d11848` |
| Color de texto | `#1d1d26`; grises `#808080` / `#a9aaaa` |
| Logo | `images/logo-ccb.svg` + rótulo "Servicio Virtual" |
| Estructura | Header off-canvas, `.rotulo-servicio` con `<h1>`, menú principal + submenú, grid Bootstrap |

El lenguaje visual es **plano, cuadrado, sobrio e institucional**, deliberadamente alejado de
Material Design.

La decisión a tomar: qué librería de componentes usar en Angular 22 —**PrimeNG** o **Angular
Material**— dado que el diseño ya está definido y es inmutable.

## Compatibilidad con Angular 22 (verificada 2026-07-17)

| Librería | Versión estable | Angular 22 |
| --- | --- | --- |
| Angular Material | 22.0.5 | Compatibilidad nativa (mismo día que Angular) |
| PrimeNG | 22.0.0 (15-jul-2026) | Compatibilidad oficial, soporte Signal Forms |

Ninguna opción queda descartada por compatibilidad.

## Decisión

Se adopta **PrimeNG 22 en modo *unstyled* (headless)**, combinado con **Tailwind CSS 4** y un
**tema corporativo CCB propio** que reproduce fielmente la identidad del sitio actual.

Cuando el requisito es reproducir un diseño corporativo fijo hecho a medida, el criterio de
selección no es "qué librería trae más componentes", sino **cuál impone menos su propio lenguaje
visual**:

- **Angular Material** es fuertemente opinado: sus componentes traen la anatomía de Material
  Design incrustada (ripple, elevación, form-fields con label flotante, shape tokens). Aunque se
  cambien los colores mediante design tokens, los componentes seguirían "sabiendo" a Google.
  Imitar un diseño Bootstrap/CCB plano implicaría **pelear contra el framework**, con fidelidad
  imperfecta y CSS de override frágil.
- **PrimeNG (v18+/v22)** ofrece **modo unstyled + pass-through + design tokens**. En modo
  unstyled aporta **solo comportamiento y accesibilidad** (ARIA, foco, teclado) y el equipo pone
  el **100 % del CSS**, lo que permite **reproducir el diseño pixel a pixel** y reutilizar el CSS
  y la fuente corporativa actuales. Además conserva la riqueza de componentes transaccionales
  (tabla server-side para el historial de 365 días, stepper de pago, carrito) que necesita
  `portal-certificados`.

Complementariamente, el sitio actual ya es Bootstrap; portar esa capa a PrimeNG (neutro) es
natural, mientras que a Material sería una reescritura visual completa.

## Consecuencias

**Positivas**
- Fidelidad total al estilo corporativo CCB inmutable.
- Reutilización directa de la fuente `TradeGothicLTPro` y de la paleta corporativa.
- Cobertura de componentes complejos out-of-the-box para el portal transaccional.
- Una sola librería para ambos portales (menor costo de mantenimiento).

**Negativas / riesgos a gestionar**
- **Accesibilidad:** PrimeNG es más débil en a11y que Angular Material/CDK. Mitigación:
  `axe-core` en CI y pruebas de teclado/lector de pantalla obligatorias (RNF-33 exige WCAG 2.1 AA;
  portal público estatal).
- **Licencia de fuente:** `TradeGothicLTPro` es de Linotype/MyFonts con licencia de pageviews
  limitada (el CSS menciona 250.000 vistas). **Debe confirmarse con la CCB que la licencia web
  cubre el nuevo despliegue** antes de producción; si no, se resuelve con el fallback
  Helvetica/Arial ya definido.
- **Madurez:** PrimeNG 22 estable es muy reciente (15-jul-2026); vigilar los primeros patches.
- El modo unstyled traslada al equipo el mantenimiento del CSS corporativo (no hay tema listo).

## Alternativas consideradas

1. **Angular Material** — Descartada para este caso: su fortaleza (Material Design coherente) es
   justo lo que aquí sobra, porque el diseño ya está definido y no es Material. Reproducir un look
   no-Material exige luchar contra el framework.
2. **PrimeNG en modo styled (preset Aura)** — Descartada como opción principal: más rápida de
   arrancar, pero introduce decisiones visuales propias que habría que sobrescribir para lograr la
   fidelidad exigida.
3. **Enfoque mixto (PrimeNG en certificados, Material en verificación)** — Descartada: duplica el
   costo de mantenimiento y dificulta la consistencia visual entre portales que comparten identidad.

## Notas de implementación (para fases posteriores)

- Portar los `@font-face` de `TradeGothicLTPro` y sus archivos de fuente.
- Trasladar la paleta (`#033864`, `#1864a1`, `#d11848`, `#1d1d26`) a design tokens / variables CSS
  compartidas entre ambos portales.
- Reconstruir el layout corporativo (header off-canvas, `rotulo-servicio`, logo SVG, menú/submenú,
  footer "Todos los derechos reservados") como componentes standalone compartidos.
- El esqueleto del tema corporativo se abordará en una tarea posterior (no incluido en este ADR).

### Actualización 2026-07-30 — Portal de verificación (TKT-067)

Se materializó el esqueleto de imagen corporativa en `frontend/portal-verificacion`:

| Elemento | Ubicación |
| --- | --- |
| Guía de uso | [`docs/IMAGEN_CORPORATIVA_PORTAL_VERIFICACION.md`](../IMAGEN_CORPORATIVA_PORTAL_VERIFICACION.md) |
| Tokens + SCSS activo | `frontend/portal-verificacion/src/styles/ccb/` |
| Fuentes / logo / sprite | `frontend/portal-verificacion/public/assets/brand/` |
| Extracto CSS legacy (referencia) | `frontend/portal-verificacion/src/assets/brand/legacy/` |
| Shell HTML (logo, menú, rótulo) | `frontend/portal-verificacion/src/app/app.html` |

**Nota sobre fuentes:** el CSS legacy apunta a `302991_*`, archivos ausentes en el repo .NET.
Se versionaron los `2C577A_*` disponibles (misma familia TradeGothicLTPro). Ver la guía
de imagen corporativa §1 y §8 (licencia).

`portal-certificados` deberá reutilizar el mismo set de tokens/activos cuando inicie su
tema (idealmente extrayendo un paquete/shared brand común).
