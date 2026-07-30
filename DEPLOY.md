# Despliegue de AEnEA

Toda la configuración está lista (`render.yaml`, `backend/Dockerfile`, `frontend/eas.json`). Estos son
los pasos que tienes que ejecutar tú mismo, con tus propias cuentas — nunca compartas tu
`OPENAI_API_KEY` ni tokens de sesión con nadie, ni los pegues en el chat de un asistente.

## 1. Backend + Base de datos en Render

1. Crea una cuenta en [render.com](https://render.com) si no tienes una.
2. Instala la CLI (opcional — la creación del Blueprint se hace desde el dashboard web, pero la
   CLI es útil después para validar el YAML, ver logs, deploys, etc.):
   ```bash
   brew install render
   render login
   render workspace set   # selector interactivo: elige tu workspace
   ```
   Puedes validar la sintaxis de `render.yaml` con:
   ```bash
   render blueprints validate ./render.yaml
   ```
3. La **creación** de los recursos a partir del Blueprint se hace desde el dashboard web de Render
   (la CLI v2.x no tiene un comando para esto): entra en [dashboard.render.com](https://dashboard.render.com),
   pulsa **"New +"** → **"Blueprint"** → conecta tu repositorio de GitHub → Render detecta
   `render.yaml` automáticamente y te muestra un preview de los recursos (`aenea-backend` +
   `aenea-db`) antes de crearlos.
4. En el dashboard, entra en el servicio `aenea-backend` → pestaña **Environment** → añade la
   variable `OPENAI_API_KEY` con tu clave real de OpenAI (marcada como `sync: false` en
   `render.yaml`, así que Render te la pedirá explícitamente y no queda versionada en el repo).
5. Verifica el despliegue visitando `https://<tu-servicio>.onrender.com/docs` (Swagger UI) y
   `https://<tu-servicio>.onrender.com/health`.

## 2. Frontend con Expo EAS

1. Crea una cuenta en [expo.dev](https://expo.dev) si no tienes una.
2. Instala la CLI y haz login:
   ```bash
   npm install -g eas-cli
   cd frontend
   eas login
   ```
3. Vincula el proyecto a tu cuenta de Expo (genera un `projectId` en `app.json`):
   ```bash
   eas init
   ```
4. Edita `frontend/eas.json` y sustituye `REPLACE_WITH_YOUR_RENDER_URL` por la URL real de tu
   backend en Render (paso 1).
5. Genera un build instalable de prueba (perfil `preview`, distribución interna vía QR):
   ```bash
   eas build --profile preview --platform android
   # o --platform ios (requiere cuenta de Apple Developer para dispositivo físico)
   ```
6. Para desarrollo local rápido sin build nativo, basta con:
   ```bash
   cp .env.example .env   # ajusta EXPO_PUBLIC_API_BASE_URL si no usas localhost
   npx expo start
   ```
   y escanear el QR con la app Expo Go en tu móvil.

## Notas de seguridad

- `OPENAI_API_KEY` nunca debe commitearse ni pegarse en ningún chat — solo vive en
  `backend/.env` (local) o en las variables de entorno del dashboard de Render (producción).
- Los tokens de sesión de `render login` / `eas login` quedan en tu máquina local; no los
  compartas.
