## ADDED Requirements

### Requirement: Componente MarkdownMessage para burbujas de chat
El sistema SHALL incluir un componente `MarkdownMessage` en `apps/web-admin/src/components/chat/markdown-message.tsx` que renderice una cadena de texto con sintaxis Markdown estándar usando `react-markdown` con los plugins `remark-gfm` y `remark-breaks`.

El componente SHALL:
- Aceptar una prop `content: string` con el texto a renderizar
- Aceptar una prop `colorScheme: 'light' | 'dark'` para adaptar estilos al fondo del bubble
- Estar envuelto en `React.memo` para evitar re-renders innecesarios
- Usar `remark-breaks` para convertir saltos de línea simples (`\n`) en `<br>` — esencial para la sintaxis del Worker
- Usar `remark-gfm` para soporte de tablas, tachado (`~~`), y listas de tarea

Los `components` personalizados SHALL aplicar los siguientes estilos Tailwind:
- `p` → `<span className="block mb-2 last:mb-0">`
- `strong` → `<strong className="font-semibold">`
- `em` → `<em className="italic">`
- `del` → `<del className="line-through opacity-70">`
- `code` (inline) → `<code className="font-mono text-xs bg-black/10 rounded px-1 py-0.5">`
- `ul` → `<ul className="list-disc pl-4 space-y-0.5 mb-2">`
- `ol` → `<ol className="list-decimal pl-4 space-y-0.5 mb-2">`
- `blockquote` → `<blockquote className="border-l-2 border-current pl-2 opacity-60 italic mb-2">`
- `h1`, `h2`, `h3` → `<p className="font-semibold mb-1">` (sin tamaños de heading en contexto conversacional)
- `a` → `<a className="underline" target="_blank" rel="noopener noreferrer">`

#### Scenario: Texto con negrita
- **WHEN** `content` contiene `**texto**`
- **THEN** el componente renderiza un elemento `<strong>` con el texto sin asteriscos

#### Scenario: Texto con cursiva
- **WHEN** `content` contiene `_texto_`
- **THEN** el componente renderiza un elemento `<em>` con el texto sin guiones bajos

#### Scenario: Salto de línea simple
- **WHEN** `content` contiene un salto de línea simple (`\n`) entre dos frases
- **THEN** el componente renderiza un `<br>` entre ambas frases (gracias a `remark-breaks`)

#### Scenario: Texto plano sin Markdown
- **WHEN** `content` no contiene ninguna sintaxis Markdown
- **THEN** el componente renderiza el texto tal cual, sin diferencia visual respecto al comportamiento anterior

#### Scenario: Heading en contenido del LLM
- **WHEN** `content` contiene una línea que empieza por `# Título`
- **THEN** el heading se renderiza como `<p className="font-semibold mb-1">`, no como un `<h1>` de tamaño grande

#### Scenario: Emoji preservado
- **WHEN** `content` contiene emojis como 📍 o ✅
- **THEN** los emojis se renderizan sin alteración en el texto

---

### Requirement: Integración de MarkdownMessage en ChatBubble
El componente `ChatBubble` SHALL sustituir la expresión `{message.content}` por `<MarkdownMessage content={message.content} colorScheme="..." />` en las ramas `assistant` y `user`.

- La rama `assistant` SHALL usar `colorScheme="light"`
- La rama `user` SHALL usar `colorScheme="dark"`
- La rama `system` SHALL mantener su implementación actual (`{message.content}` como texto plano centrado en cursiva) sin modificación

#### Scenario: Burbuja de asistente con Markdown
- **WHEN** se recibe un mensaje con `role: 'assistant'` y `content` con sintaxis `**negrita**`
- **THEN** la burbuja izquierda (gris) muestra el texto en negrita renderizado, no los asteriscos literales

#### Scenario: Burbuja de usuario con Markdown
- **WHEN** se recibe un mensaje con `role: 'user'` y `content` con sintaxis `_cursiva_`
- **THEN** la burbuja derecha (teal) muestra el texto en cursiva renderizado

#### Scenario: Burbuja de sistema sin cambios
- **WHEN** se recibe un mensaje con `role: 'system'`
- **THEN** se mantiene el renderizado actual: texto centrado, cursiva, gris, con separadores horizontales

---

### Requirement: Dependencias npm para Markdown
El archivo `apps/web-admin/package.json` SHALL incluir las dependencias `react-markdown`, `remark-gfm` y `remark-breaks` como dependencias de producción (`dependencies`).

#### Scenario: Build de producción con dependencias Markdown
- **WHEN** se ejecuta `pnpm build` en `apps/web-admin/`
- **THEN** el build completa sin errores de módulo no encontrado relacionados con `react-markdown`, `remark-gfm` o `remark-breaks`

#### Scenario: Sin dependencias de estilos adicionales
- **WHEN** se revisa `package.json` tras la instalación
- **THEN** no se han añadido dependencias de hojas de estilo externas (`@tailwindcss/*` existentes se mantienen); los estilos usan Tailwind v4 CSS-first ya configurado
