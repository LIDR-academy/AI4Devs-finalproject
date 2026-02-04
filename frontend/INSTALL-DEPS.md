# Instalación de Dependencias

## ⚠️ Error Común: Dependencias Faltantes

Si ves el error:
```
Failed to run dependency scan. Skipping dependency pre-bundling. Error: The following dependencies are imported but could not be resolved:
  @heroicons/react/24/outline
```

## ✅ Solución

Ejecuta el siguiente comando para instalar todas las dependencias:

```bash
cd frontend
npm install
```

Esto instalará todas las dependencias listadas en `package.json`, incluyendo:
- `@heroicons/react` - Iconos para el sidebar
- Todas las demás dependencias del proyecto

## 📦 Dependencias Principales que se Instalarán

- React y React DOM
- React Router
- TanStack Query
- Zustand
- React Hook Form + Zod
- Axios
- Tailwind CSS
- @heroicons/react
- Y muchas más...

## 🚀 Después de Instalar

Una vez instaladas las dependencias, puedes iniciar el servidor de desarrollo:

```bash
npm run dev
```

El frontend estará disponible en `http://localhost:5173`
