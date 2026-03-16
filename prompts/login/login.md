Quiero que actúes como un equipo de desarrollo especializado con los siguientes roles: Arquitecto Frontend React, Diseñador UI/UX, Ingeniero de Autenticación, Especialista en Validaciones e Integrador de Librerías.

Debes crear un componente de inicio de sesión para la aplicación "Genesis" con las siguientes características:

- Stack: React + Vite + TailwindCSS + react-hook-form + axios + validator + js-cookie + react-hot-toast + heroicons.
- Fondo con imagen y overlay.
- Logo centrado.
- Validación de usuario y contraseña, con mensajes claros de error.
- Checkbox para recordar usuario.
- Botón con estado loading.
- Conexión a API usando variables de entorno.
- Guardado seguro de token en cookies y localStorage.
- Redirección a `/home` si hay token.
- Diseño responsivo y accesible.
- Código modular, limpio y optimizado con memo y hooks.

Genera el código completo en un solo archivo index.jsx y especifica también las instrucciones de instalación, dependencias y estructura de carpetas necesarias para integrarlo.


---

### 🎨 Rol 2: Diseñador UI/UX
**Objetivo:** Crear una interfaz visual moderna, limpia y accesible.
- Fondo con imagen (`fondoLogin`) y overlay oscuro con opacidad `60%`.
- Tarjeta central con `backdrop-blur-sm` y `hover:scale-105`.
- Tipografía clara y jerarquías visuales correctas.
- Botones con estados (`hover`, `disabled`, `focus`).
- Iconografía de `@heroicons/react` (`UserIcon`, `LockClosedIcon`, `EyeIcon`, `EyeSlashIcon`).

---

### 🔐 Rol 3: Ingeniero de Autenticación
**Objetivo:** Conectar el login con la API de seguridad centralizada.
- Usar `axios` con `CancelToken` para abortar peticiones.
- Configurar `Cookies` y `localStorage` según `bitRecordar`.
- Variables de entorno para API:
- `PROT_DATALAKE`
- `HOST_DATALAKE`
- `PORT_DATALAKE`
- `LOGIN_DATALAKE`
- Manejar respuestas de error con `react-hot-toast`.

---

### 🧪 Rol 4: Especialista en Validaciones
**Objetivo:** Garantizar entrada de datos correcta y segura.
- `strUser` obligatorio, sin dominio de correo corporativo.
- `strPass` obligatorio.
- Checkbox para recordar usuario.
- Mensajes de error accesibles y visibles bajo cada input.

---

### 📦 Rol 5: Integrador de Librerías
**Objetivo:** Configurar todas las dependencias necesarias.
- **Frontend:**
- `react`, `react-dom`, `react-router-dom`
- `react-hook-form`
- `axios`
- `validator`
- `js-cookie`
- `react-hot-toast`
- `@heroicons/react`
- `tailwindcss`, `postcss`, `autoprefixer`
- **Backend/API:** (solo referencia en este prompt)
- Debe existir un endpoint válido para autenticación.

---

## 📌 Checklist de Implementación

- [ ] UI con TailwindCSS y diseño responsive.
- [ ] Integración de imágenes (`logo.png`, `fondo.png`).
- [ ] Validaciones con `react-hook-form` y `validator`.
- [ ] Manejo de `loading` y deshabilitado de botones.
- [ ] Almacenamiento seguro de tokens (`Cookies`, `localStorage`).
- [ ] Manejo de errores con `react-hot-toast`.
- [ ] Redirección a `/home` si ya hay `token`.
- [ ] Optimización de render con `memo`.

---

## 📚 Resultado Esperado

- Componente funcional Login listo para producción.

- UI responsiva y moderna.

- Validaciones robustas y manejo seguro de credenciales.

- Documentación clara para instalación y despliegue.