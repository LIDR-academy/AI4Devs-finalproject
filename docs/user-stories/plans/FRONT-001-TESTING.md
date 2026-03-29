# Plan de Estrategia de Testing Frontend (Unit)

Este documento detalla el plan para asegurar la calidad del código frontend mediante pruebas unitarias (Vitest), cubriendo los componentes y flujos críticos implementados en FRONT-001.

## 1. Configuración de Entorno

- [ ] **Validar Configuración Vitest**: Asegurar que `vitest.config.ts` incluye alias de Nuxt y entorno `happy-dom`.

## 2. Pruebas Unitarias (Vitest)

El objetivo es probar componentes aislados y lógica de negocio pura.

### 2.1. Componentes Base (UI Kit)
- **`components/common/UiInput.spec.ts`**
    - [ ] Renderiza correctamente con props (`label`, `placeholder`).
    - [ ] Emite eventos `update:modelValue`.
    - [ ] Muestra mensajes de error cuando la prop `errorMessage` está presente.
    - [ ] Aplica clases de error visualmente.

- **`components/common/UiButton.spec.ts`**
    - [ ] Renderiza el slot por defecto.
    - [ ] Muestra el spinner cuando `loading` es true y deshabilita el botón.
    - [ ] Aplica las clases correctas según la variante (`primary`, `secondary`, etc.).
    - [ ] Emite evento `click` cuando no está deshabilitado.

### 2.2. Stores (Pinia)
- **`stores/auth.spec.ts`**
    - [ ] `setUser` actualiza el estado del usuario.
    - [ ] `setToken` actualiza el token y la cookie.
    - [ ] `isAuthenticated` devuelve `true` solo si hay token.
    - [ ] `clearAuth` resetea usuario y token a null.

### 2.3. Composables (Lógica de Negocio)
- **`tests/unit/composables/useAuth.spec.ts`**
    - [ ] **Mocking**: Se debe mockear `$fetch` y `navigateTo`.
    - [ ] `login`: Llama al endpoint correcto y actualiza el store.
    - [ ] `register`: Llama al endpoint de registro y luego realiza auto-login.
    - [ ] `logout`: Limpia el store y redirige a login.
    - [ ] Manejo de errores: Verifica que las variables reactivas `error` y `loading` cambien correctamente.

## 3. Ejecución

```bash
# Ejecutar Unit Tests
npm run test:unit
```
