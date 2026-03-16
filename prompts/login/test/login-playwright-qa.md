# 🧪 QA Automatización Playwright para Módulo Login Genesis

Este documento describe el enfoque y checklist para la automatización de pruebas end-to-end del módulo de login de la aplicación "Genesis" usando Playwright, alineado con el stack React + Vite + TailwindCSS.

---

## Roles QA involucrados
- Arquitecto QA
- Especialista en Accesibilidad
- Ingeniero de Integración API
- Analista de Validaciones
- Experto en Reportes

---

## Objetivos de las pruebas
- Validar UI, lógica de autenticación, validaciones, accesibilidad y manejo de tokens.
- Simular llamadas a la API de seguridad usando mocks/interceptación.
- Probar diseño responsivo y accesible.
- Verificar mensajes de error y estados de los botones.
- Validar almacenamiento seguro de token en cookies y localStorage.
- Probar redirección a `/home` si existe token.
- Generar reportes automáticos y capturas de pantalla en caso de fallo.

---

## Estructura recomendada
- Ubicar el test en `frontend/tests/login.desktop.spec.ts`.
- Separar los tests por escenarios: éxito, error, validaciones, accesibilidad, almacenamiento y redirección.

---

## Checklist de Pruebas
- [ ] Renderizado correcto de fondo, logo y tarjeta central.
- [ ] Inputs e iconos visibles y accesibles.
- [ ] Validaciones de usuario y contraseña.
- [ ] Mensajes de error claros y accesibles.
- [ ] Estado loading y deshabilitado de botón.
- [ ] Interceptación y mock de API login.
- [ ] Almacenamiento seguro de token en cookies/localStorage.
- [ ] Redirección automática a `/home` si hay token.
- [ ] Pruebas de diseño responsivo (desktop/mobile).
- [ ] Accesibilidad: navegación por teclado, foco, contraste.
- [ ] Reporte automático y capturas en fallos.

---

## Instalación y ejecución de Playwright

1. Instala Playwright y dependencias:
   ```powershell
   cd ./frontend
   npm install --save-dev playwright @playwright/test
   npx playwright install
   ```

2. Crea la carpeta de tests:
   ```powershell
   mkdir tests
   ```

3. Ejecuta los tests:
   ```powershell
   npx playwright test
   ```

4. Visualiza el reporte:
   ```powershell
   npx playwright show-report
   ```

---

## Referencias
- [Playwright Docs](https://playwright.dev/)
- [React Testing with Playwright](https://playwright.dev/docs/test-react)
- [Accesibilidad en Playwright](https://playwright.dev/docs/accessibility)

---

> Este documento sirve como guía inicial para el equipo QA. El siguiente paso es crear el archivo `login.desktop.spec.ts` con el escenario completo.
