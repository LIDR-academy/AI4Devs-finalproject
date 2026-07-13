# ComercIA Frontend

Rama standalone para desplegar solo el frontend de ComercIA Marketplace Assistant.

## Railway

Build command:

```bash
npm install && npm run build
```

Start command:

```bash
npm start
```

## Variables

Usar `railway.env.example` como base.

Variable requerida:

- `VITE_API_URL=https://proyectofinal-production-6c08.up.railway.app`

En Vite esta variable se aplica durante el build. Si cambias `VITE_API_URL` en Railway, ejecuta un redeploy del frontend.

Si `VITE_API_URL` no existe en produccion, el frontend usa por defecto el backend publico actual:

```text
https://proyectofinal-production-6c08.up.railway.app
```
