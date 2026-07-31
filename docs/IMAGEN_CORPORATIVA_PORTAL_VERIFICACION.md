# Imagen corporativa — Portal de Verificación

Guía obligatoria para TKT-067 (`portal-verificacion`). La identidad visual del
**Servicio Virtual CCB** es inmutable: el nuevo SPA Angular 22 debe reproducir
el look & feel del sitio actual en `CERTIFICADOS_ELECTRONICOS_NET`.

Relacionado: [ADR-0001](./adr/ADR-0001-libreria-componentes-frontend.md), HU-14 / RF-28.

---

## 1. Fuente de verdad (legado)

| Artefacto | Ruta en el sitio actual |
| --- | --- |
| Shell HTML (logo, menú, rótulo) | `CCB.Certificados.Verificacion/Index.html` |
| Formulario de verificación | `App/Verificacion/VerificacionCertificados.html` |
| Visor PDF | `App/Verificacion/MuestraVerificacion.html` |
| CSS corporativo | `Content/style.css` (sección desde TradeGothic ~L8040) |
| Utilidades | `Content/sitio.css` |
| Logo | `Images/logo-ccb.svg` |
| Sprite de iconos | `App/Directivas/Iconos.html` |
| Fuentes | `fonts/2C577A_{0,1,2}_0.{woff2,woff,ttf}` |

> El CSS legacy referencia `fonts/302991_*`, pero esos archivos **no están** en el
> repositorio .NET. Los archivos versionados y reutilizados son `2C577A_*`
> (misma familia TradeGothicLTPro). Fallback: HelveticaNeue / Helvetica / Arial.

---

## 2. Activos portados a `portal-verificacion`

```
frontend/portal-verificacion/
├── public/assets/brand/
│   ├── fonts/          ← TradeGothicLTPro (woff2/woff/ttf)
│   ├── images/         ← logo-ccb.svg, favicons, success.svg
│   └── icons/          ← icons-sprite.svg (símbolos SVG)
├── src/styles/ccb/     ← tema SCSS activo (tokens + layout + componentes)
└── src/assets/brand/legacy/  ← extractos CSS de referencia (no se importan al build)
```

Servidos en runtime bajo `/assets/brand/...` (carpeta `public/` de Angular).

---

## 3. Tokens obligatorios

Usar siempre las variables CSS de `src/styles/ccb/_tokens.scss`:

| Token | Valor | Uso |
| --- | --- | --- |
| `--ccb-azul-institucional` | `#033864` | Rótulo servicio, bordes de botón, enlaces, acento `.rotulo` |
| `--ccb-azul-icono` | `#153960` | Fill de iconos informativos |
| `--ccb-azul-enlace-secundario` | `#1864a1` | Acentos secundarios (Presentacion) |
| `--ccb-magenta` | `#d11848` | Acento marca (logo / detalles Presentacion) |
| `--ccb-texto` | `#1d1d26` | Texto body |
| `--ccb-gris` / `--ccb-gris-claro` | `#808080` / `#a9aaaa` | Legal, rótulo "Servicio Virtual" |
| `--ccb-borde` | `#d5d4d4` | Bordes de títulos y controles |
| `--ccb-font-family` | `TradeGothicLTPro`, Helvetica… | Tipografía global |

**No** introducir Inter, Roboto, Material purple, pills redondeados ni sombras
multi-capa. El lenguaje es plano, cuadrado, sobrio e institucional.

---

## 4. Estructura de pantalla a conservar

### Shell global (todas las rutas)

1. **Header:** logo SVG + texto "Servicio Virtual" (oculto en &lt; md) + botón MENÚ
2. **Rótulo:** barra `#033864` con título blanco "Certificados Electrónicos"
3. **Contenido:** `router-outlet` dentro de `.container` / `.principal`
4. **Menú off-canvas:** fondo `#202221`, enlaces a canales CCB + T&C + legal

### Feature verificación (formulario)

Clases / patrones del HTML legacy a reutilizar:

| Elemento | Clase / patrón |
| --- | --- |
| Migas | `ul.breadcrumb` → Solicitudes › Verificación de Certificados |
| Atrás | `a.btn-icon-text` con icono `#arrow-left` del sprite |
| Título de página | `h3.rotulo` (borde izquierdo 5px `#033864`) |
| Info 60 días | `div.alert.alert-info.ccb-alert-top` + icono `#alert-info` |
| Instrucciones | `ul.lista` |
| Input código | `input.form-control` + ayuda `span.desc-input` |
| Términos | checkbox + enlace PDF T&C CCB |
| CTA | `a.btn` / `button.btn` (disabled hasta aceptar T&C) |

### Visor PDF

- Contenedor con borde punteado negro (`.pdf-viewer-frame`)
- Botón "Descargar" con clase `.btn`
- Navegación superior con `.btn-icon-text`

Uso del sprite:

```html
<svg class="icon" aria-hidden="true">
  <use href="/assets/brand/icons/icons-sprite.svg#alert-info"></use>
</svg>
```

---

## 5. Cómo aplicar el tema en el código

1. **Global:** `src/styles.scss` ya hace `@use 'styles/ccb';` — no desactivarlo.
2. **Componentes de feature:** preferir las clases CCB (`.rotulo`, `.btn`, `.alert-info`, …)
   antes de inventar estilos nuevos.
3. **Si hace falta un estilo nuevo:** extender `src/styles/ccb/_components.scss`
   con variables `--ccb-*`, nunca hardcodear hex sueltos en el componente.
4. **PrimeNG unstyled (ADR-0001):** pass-through / class bindings deben mapear a
   estas clases o a tokens `--ccb-*`.
5. **Tipografía:** no cargar Google Fonts ni sustituir TradeGothic sin autorización
   de licencia CCB.

---

## 6. Checklist de aceptación visual (TKT-067)

- [ ] Logo CCB + "Servicio Virtual" visibles en el primer viewport (desktop)
- [ ] Barra `#033864` con "Certificados Electrónicos"
- [ ] Tipografía TradeGothicLTPro (o fallback Helvetica/Arial) en body y títulos
- [ ] Formulario con `.rotulo`, alert info 60 días, lista de instrucciones y `.btn` corporativo
- [ ] Botón "Aceptar" en estado disabled con borde/texto `#d5d4d4` hasta aceptar T&C
- [ ] Sin look Material / Inter / degradados púrpura
- [ ] Contraste suficiente para WCAG 2.1 AA (RNF-33)

---

## 7. Textos y enlaces externos a preservar

| Concepto | Valor |
| --- | --- |
| Vigencia verificación | 60 días calendario (ilimitadas consultas) |
| Términos y condiciones | PDF en `recursos.ccb.org.co/.../Terminos_Y_condiciones_verificacion_Certificados_Electronicos.pdf` |
| Ayuda "¿Dónde lo encuentro?" | Imagen de ejemplo del código en el certificado (URL legacy o activo local cuando se porte) |
| Código | 14 caracteres alfanuméricos |

---

## 8. Licencia de fuente

`TradeGothicLTPro` es propiedad de Linotype/MyFonts (build ID 2905978 en el CSS
legacy; pageviews licenciados: 250.000). Confirmar con CCB que la licencia web
cubre el nuevo despliegue (`verificacion.ccb.org.co`) antes de producción.
Si no aplica, mantener el stack de fallback ya definido en los tokens.
