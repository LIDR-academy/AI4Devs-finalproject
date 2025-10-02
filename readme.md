# MailTuner

**MailTuner** is a web tool that automatically improves emails by adjusting them to a specific tone like *clear*, *formal*, *empathetic* or *persuasive*.

## 🧩 What does this project do?

The user pastes an email they have written, chooses a desired tone and MailTuner returns an improved version in that tone.

Example:  
> Original text: "I won't be able to attend the meeting."  
> Chosen tone: empathetic  
> Result: "I deeply regret not being able to be present at the meeting. I appreciate your understanding."

## 🚀 How it works

- The frontend sends the text and desired tone to an `/api/rewrite` endpoint.
- The backend uses an artificial intelligence API (OpenAI) to rewrite the content.
- The response is shown to the user, who can copy or edit it.
- The number of uses per IP is controlled via Redis.
- Relevant errors and events are logged for analysis.lTuner** es una herramienta web que permite mejorar correos electrónicos automáticamente, ajustándolos a un tono específico como *claro*, *formal*, *empático* o *persuasivo*.

## 🧩 ¿Qué hace este proyecto?

El usuario pega un correo que ha redactado, elige un tono deseado y MailTuner devuelve una versión mejorada en ese tono.

Ejemplo:  
> Texto original: “No podré asistir a la reunión.”  
> Tono elegido: empático  
> Resultado: “Lamento mucho no poder estar presente en la reunión. Agradezco su comprensión.”

## 🚀 ¿Cómo funciona?

- El frontend envía el texto y el tono deseado a un endpoint `/api/rewrite`.
- El backend usa una API de inteligencia artificial (como OpenAI) para reescribir el contenido.
- La respuesta se muestra al usuario, quien puede copiarla o editarla.
- Se controla el número de usos por IP mediante Redis.
- Se registran errores y eventos relevantes para análisis.

## 🛠️ Tecnologías utilizadas

- [Next.js](https://nextjs.org/) (frontend y backend con API Routes)
- [TailwindCSS](https://tailwindcss.com/) (estilado)
- [Upstash Redis](https://upstash.com/) (rate limiting por IP)
- [Sentry](https://sentry.io/) (registro de errores)
- [PostHog](https://posthog.com/) (analítica de eventos)
- [OpenAI API](https://openai.com/) (GPT-4) para reescritura de correos

## 🚀 Instalación y configuración

### Prerrequisitos
- Node.js 18+ instalado
- Una cuenta de OpenAI con acceso a la API
- (Opcional) Cuentas en Upstash Redis, Sentry y PostHog para funcionalidades completas

### Pasos para arrancar el proyecto

1. **Clona el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd mailtuner
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Configura las variables de entorno**
   ```bash
   # Copia el archivo de ejemplo
   cp env.example .env.local
   
   # Edita .env.local y añade tus claves API
   ```
   
   **Variables obligatorias:**
   - `OPENAI_API_KEY`: Tu clave API de OpenAI
   
   **Variables opcionales (para funcionalidades avanzadas):**
   - `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN`: Para rate limiting
   - `SENTRY_DSN`: Para captura de errores
   - `NEXT_PUBLIC_POSTHOG_KEY`: Para analítica

4. **Arranca el servidor de desarrollo**
   ```bash
   npm run dev
   ```

5. **Abre tu navegador**
   Ve a [http://localhost:3000](http://localhost:3000) para ver la aplicación.

### Comandos disponibles

- `npm run dev`: Arranca el servidor de desarrollo
- `npm run build`: Construye la aplicación para producción
- `npm run start`: Arranca la aplicación en modo producción
- `npm run lint`: Ejecuta el linter para revisar el código

## ⚙️ Configuración técnica

### Rate Limiting
- **Límite por IP**: 10 usos por día
- **Sistema**: Redis (Upstash) para control distribuido
- **Reseteo**: Automático cada 24 horas

### Despliegue
- **Plataforma**: Vercel (optimizado para Next.js)
- **Variables de entorno**: Configuradas para OpenAI, Redis, Sentry y PostHog

## 📁 Estructura del proyecto

```txt
/pages
  index.tsx              → Página principal
  /api/rewrite.ts        → Endpoint que procesa la reescritura

/lib
  rateLimit.ts           → Middleware para limitar por IP
  posthog.ts             → Cliente PostHog (frontend)
  sentry.client.config.ts / sentry.server.config.ts → Configuración Sentry

/utils
  rewritePrompt.ts       → Función para construir el prompt AI

/styles
  globals.css            → Estilos base con Tailwind

/docs
  *.md                   → Documentación técnica para desarrolladores
