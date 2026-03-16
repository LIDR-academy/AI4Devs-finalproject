# 🎯 Metaprompt para IA – Componente `HomeAdministrator` (React + TailwindCSS)

## 🎭 Roles del sistema

1. **Arquitecto Frontend Senior**
   - Diseña el componente siguiendo arquitectura limpia y desacoplada.
   - Mantiene responsabilidades separadas (presentación, lógica y datos).
   - Prepara el código para ser fácilmente escalable.

2. **Experto en UX/UI con TailwindCSS**
   - Garantiza diseño responsivo, moderno y accesible.
   - Aplica colores, espaciados y jerarquía visual clara.
   - Usa patrones de interfaz consistentes con el resto del sistema.

3. **Ingeniero de Rendimiento**
   - Optimiza renderizados y minimiza re-render innecesarios.
   - Usa `React.memo` y hooks bien configurados.
   - Aplica lazy loading y suspense si es necesario.

4. **Especialista en Seguridad y Roles**
   - Valida acceso según roles desde el contexto.
   - Maneja mensajes y alertas de forma segura y no intrusiva.
   - Evita fugas de información en UI.

---

## 📋 Requerimientos funcionales

- Mostrar un **menú lateral** (`Menu`) en la izquierda y contenido dinámico a la derecha.
- Incluir **WelcomeHome** como pantalla de bienvenida con:
  - Mensaje de saludo con nombre del usuario (`strNombre` del contexto).
  - Descripción de la plataforma Genesis Stack.
  - Lista de funcionalidades clave con íconos o emojis.
- Gestionar rutas internas con `react-router-dom`:
  - `/` → Bienvenida
  - `/genesis` → Componente `ListGenesis`
- Mostrar **alerta** si el usuario no tiene roles (`strRolApp` vacío o no definido).
- Integrar **Loader** cuando la variable `loading` sea `true`.
- Incluir **botón de ayuda** (`HelpButton`) flotante.

---

## 🎨 Requerimientos de diseño (TailwindCSS)

- Menú lateral fijo en la izquierda en desktop, ocultable en mobile.
- Contenedor principal con `flex` para layout horizontal.
- Encabezados con jerarquía visual clara (`text-3xl font-bold` para títulos).
- Bloques de información con `bg-blue-50 border border-blue-200 rounded p-4`.
- Lista de funcionalidades con `list-disc list-inside text-sm`.
- Alerta de roles centrada (`fixed inset-0 flex items-center justify-center`).
- Totalmente **responsive**.

---

## ⚙️ Requerimientos técnicos

- Usar `useContext` para obtener `strInfoUser` desde `AuthContext`.
- Manejar `openAlert` con `useState` y cerrarlo con `handleCloseAlert`.
- Aplicar `useEffect` para verificar roles al cargar.
- Exportar componente con `export default`.
- Usar `Fragment` para evitar nodos extra en el DOM.

---

## 🛡️ Validaciones y seguridad

- Evitar acceso a rutas sin roles válidos.
- Manejar `target="_blank"` con `rel="noopener noreferrer"` para enlaces externos.
- Sanitizar texto mostrado desde el contexto (no renderizar HTML dinámico no seguro).

---

## 🧩 Entregable esperado

- **Archivo:** `HomeAdministrator.jsx`
- **Framework:** React 18+
- **Estilos:** TailwindCSS 3+
- **Routing:** `react-router-dom` v6+
- **Estructura:**
