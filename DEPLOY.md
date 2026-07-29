# Despliegue de AEnEA

Toda la configuración está lista (`render.yaml`, `backend/Dockerfile`, `frontend/eas.json`). Estos son
los pasos que tienes que ejecutar tú mismo, con tus propias cuentas — nunca compartas tu
`OPENAI_API_KEY` ni tokens de sesión con nadie, ni los pegues en el chat de un asistente.

## 1. Backend + Base de datos en Render

1. Crea una cuenta en [render.com](https://render.com) si no tienes una.
2. Instala la CLI (opcional, también puedes hacerlo desde el dashboard web):
   ```bash
   brew install render
   render login
   ```
3. Desde la raíz del repo (donde está `render.yaml`), crea el Blueprint:
   ```bash
   render blueprint launch
   ```
   Esto crea el servicio web `aenea-backend` y la base de datos gestionada `aenea-db` a partir de
   `render.yaml`. Si prefieres el dashboard web: "New +" → "Blueprint" → conecta tu repo de GitHub.
4. En el dashboard de Render, entra en el servicio `aenea-backend` → pestaña **Environment** →
   añade la variable `OPENAI_API_KEY` con tu clave real de OpenAI (marcada como `sync: false` en
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
