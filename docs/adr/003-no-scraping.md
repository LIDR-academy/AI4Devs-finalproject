# ADR-003: Scraping Educativo vs Comercial

**Fecha**: 2026-06-03

**Estado**: Aceptada

## Contexto

Listing Lens necesita obtener el contenido HTML de portales inmobiliarios (Idealista, Fotocasa, Habitaclia) para analizarlo. Técnicamente esto es scraping, lo que plantea cuestiones legales y éticas. Idealista ya ha emprendido acciones legales contra otros proyectos (Propertista) por violar sus TOS.

## Decisión

Scraping limitado con propósito educativo, implementado con salvaguardas legales y éticas:

1. **Cheerio** como parser HTML (sin headless browser, no evita detección)
2. **User-Agent honesto**: `Realista/1.0 (analizador educativo)`
3. **Rate limiting**: máximo 20 análisis/día por sesión
4. **No almacenar contenido de terceros**: el HTML se procesa y se descarta. Solo se persisten los resultados del análisis
5. **Subdominio móvil** (`.m.`) como fallback para páginas con JS pesado
6. **Posicionamiento educativo**: documentación, UI y comunicaciones claras sobre el propósito no comercial

## Alternativas consideradas

### Puppeteer / Playwright (headless browser)
- **Ventaja**: puede renderizar JS, más fiel al contenido real
- **Desventaja**: binario de Chromium (+300MB), lento, evade activamente las medidas anti-bot de los portales
- **Rechazada porque**: más agresivo, peor posicionamiento legal, overkill para páginas que sirven HTML server-side

### Usar APIs oficiales de los portales
- **Ventaja**: completamente legal
- **Desventaja**: Idealista no tiene API pública abierta. Las APIs de agregadores requieren ser partner comercial
- **Rechazada porque**: no existe una API pública viable para el caso de uso educativo

### Solo pegado manual de texto
- **Ventaja**: cero riesgo legal
- **Desventaja**: fricción enorme para el usuario, inviable como UX principal
- **Rechazada**: se mantiene como último fallback (paso 3 de la cadena), no como opción principal

## Posicionamiento legal

Realista es una **herramienta educativa sin ánimo de lucro**:
- No compite con los portales (no muestra anuncios, no redirige tráfico, no monetiza)
- No almacena ni redistribuye contenido de los portales
- Respeta robots.txt y rate limiting
- Se identifica con User-Agent honesto
- Licencia MIT (open source, sin modelo de negocio)

Este posicionamiento no garantiza inmunidad legal, pero establece un uso legítimo y transparente diferenciado del scraping comercial que los portales persiguen.

## Consecuencias

- **Positivas**: la funcionalidad principal (Listing Lens) es viable sin depender de APIs de pago o acuerdos comerciales. El usuario obtiene valor inmediato pegando una URL.
- **Negativas**: riesgo residual de bloqueo por parte de los portales. Si Idealista bloquea nuestro User-Agent, el fallback a texto manual es la única alternativa.
- **Mitigación**: monitorizar tasa de éxito del fetch. Si un portal bloquea sistemáticamente, deshabilitar el fetch automático para ese dominio y redirigir a texto manual.
