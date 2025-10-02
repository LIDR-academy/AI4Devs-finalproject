# 📄 Documento de Especificaciones Técnicas (CTO) – MailTuner

## 🔧 Resumen Técnico – MVP MailTuner

### 🔐 Acceso y Control sin Login
- ✅ Sin login en el MVP
- ✅ Control de uso por:
  - IP (desde backend con Redis)
  - `localStorage` o cookie en frontend (aunque la IP es la que predomina)
- ✅ Almacenamiento de control:
  - **Upstash Redis** (sin base de datos relacional en esta fase)
  - Configuración en `.env.local` copiando del env.example
- ⚠️ Limitaciones del frontend (cambiar IP)

---

### 🧱 Stack Tecnológico

| Componente       | Elección                  | Justificación                                       |
|------------------|---------------------------|----------------------------------------------------|
| **Frontend**     | Next.js                   | SSR opcional, integrable en Vercel, moderno        |
| **Estilos**      | TailwindCSS               | Rápido, sin escribir CSS manual                    |
| **Backend**      | API Routes en Next.js     | Ideal para MVP en Vercel, sin necesidad de NestJS |
| **Hosting**      | Vercel                    | Deploy directo y escalable                         |

---

### 🗃️ Base de Datos / Almacenamiento

- No se usará DB relacional
- ✅ Elección: **Upstash Redis**
  - Uso: conteo por IP para limitador de uso
  - Gratuito y sin mantenimiento
  - Escalable en siguientes fases

---

### 📈 Logs y Métricas

| Tipo              | Herramienta       | Propósito                                      |
|-------------------|-------------------|------------------------------------------------|
| Logs de errores   | Sentry            | Captura errores frontend/backend              |
| Métricas de uso   | PostHog           | Contador de visitas, eventos, correos enviados |
| Dashboard interno | PostHog Dashboard | Visualizar actividad básica inicial            |

---

## 🛠️ Backend – Next.js API Routes

### Endpoint `/api/rewrite`
- Recibe `texto` (string) y `tono` (string)
- Procesa con OpenAI (GPT-4o)
- Devuelve JSON con texto reescrito

### Protección antispam
- Rate limit por IP (1–10 usos diarios)
- Tecnología: **Upstash Redis REST API**
- Middleware: `lib/rateLimit.ts`
- Variables en `.env.local`:
  - `UPSTASH_REDIS_REST_URL`
  - `UPSTASH_REDIS_REST_TOKEN`

### Observabilidad
- **Sentry**
  - Configurar `SENTRY_DSN` en `.env.local`
  - `npx @sentry/wizard -i nextjs` para setup
  - Archivos generados en `lib/`
- **PostHog**
  - Eventos tipo `rewrite_submitted`, `rewrite_success`, `rewrite_error`
  - Variables:
    - `NEXT_PUBLIC_POSTHOG_KEY`
    - `NEXT_PUBLIC_POSTHOG_HOST`

---

## 💻 Frontend – Next.js + TailwindCSS

### Componentes clave
- Campo `textarea` para input del usuario
- Selector de tono visual (botones o dropdown)
- Botón “Mejorar” → POST a `/api/rewrite`
- Resultado mostrado editable + botón “Copiar”
- Mensajes contextuales:
  - ✅ “Correo mejorado con éxito”
  - ❌ “Error al procesar tu correo”
  - ⚠️ “Has alcanzado el límite de uso diario”

---

## 📁 Estructura de Proyecto
mailtuner/
├── .env.local ← Variables: OPENAI, REDIS, SENTRY, POSTHOG
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── package.json
├── public/ ← Favicon, logos
│
├── pages/
│ ├── index.tsx ← UI principal
│ └── api/
│ └── rewrite.ts ← Endpoint backend
│
├── styles/
│ └── globals.css ← Tailwind global
│
├── lib/
│ ├── rateLimit.ts ← Middleware Redis IP
│ ├── posthog.ts ← PostHog (condicional)
│ ├── sentry.server.config.ts
│ └── sentry.client.config.ts
│
├── utils/
│ └── rewritePrompt.ts ← Prompt para OpenAI
│
└── docs/ ← Documentación
└── README.md


---

## 🧠 Prompt para GPT (archivo: `utils/rewritePrompt.ts`)

```ts
{
  model: "gpt-4o",
  messages: [
    {
      role: "system",
      content: "Actúa como un asistente experto en redacción de correos profesionales."
    },
    {
      role: "user",
      content: "Toma el siguiente mensaje y reescríbelo con el tono indicado. Mantén el contenido original, pero mejora la claridad, estructura y estilo para que sea más efectivo en un contexto profesional.\n\n- Tono deseado: {tono}\n- Texto original: \"{texto}\"\n\nReescribe únicamente el texto, sin añadir explicaciones, encabezados ni notas."
    }
  ]
}
