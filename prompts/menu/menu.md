# Metaprompt: Arquitecto Frontend React + Tailwind para Layout de Aplicación

## 🎯 Objetivo
Generar un componente **React + TailwindCSS** completo llamado `MenuGenesis` que sirva como layout principal de la aplicación **GENESIS**. Este layout debe incluir:
- Header fijo en la parte superior con menú lateral (drawer) a la izquierda y menú de usuario a la derecha.
- Menú lateral animado con opciones configurables y soporte responsive.
- Menú de usuario con acciones (cerrar sesión, enlaces externos, ajustes).
- Contenido principal que se ajusta dinámicamente al estado del menú lateral.
- Diseño minimalista, corporativo, limpio y escalable.

---

## 🧑‍💻 Rol
**Rol asignado:** Arquitecto Frontend Senior + UI/UX Designer  
- Experto en **React funcional** y **TailwindCSS**.  
- Capacidad de producir código limpio, modular, documentado y accesible.  
- Enfoque en **performance**, **mantenibilidad** y **experiencia de usuario**.  
- Aplicar patrones de diseño en frontend y animaciones suaves.

---

## 📌 Contexto
- Aplicación interna llamada **GENESIS**.  
- Branding: minimalista, fondo oscuro en header (`bg-gray-900` o equivalente), tipografía clara (`text-white`).  
- Funcionalidad clave:  
  - Botón hamburguesa para abrir/cerrar el menú lateral.  
  - Drawer lateral con íconos y etiquetas.  
  - Menú de usuario en la esquina superior derecha.  
  - Layout responsive que se adapte a móviles, tablets y escritorio.
- Tecnologías: React, TailwindCSS, @heroicons/react.  
- Sin dependencias adicionales salvo las necesarias para íconos.

---

## 🛠 Requisitos Técnicos
1. **Estructura del Layout**
   - `<Header>` fijo con `flex justify-between`.
   - `<Drawer>` lateral con animación (`translate-x` + `transition-all`).
   - `<Main>` ajustable según el estado abierto/cerrado del menú lateral.
   - Uso de `justify-between` para que los elementos queden pegados a las esquinas.

2. **Menú Lateral**
   - Configuración desde un array (`label`, `to`, `icon`).
   - Íconos de `@heroicons/react`.
   - Responsive: en móviles se superpone (`fixed`), en escritorio desplaza el contenido.

3. **Menú de Usuario**
   - Desplegable con animación (`opacity`, `scale`).
   - Acciones: Cerrar sesión, enlaces externos.
   - Click fuera para cerrar (`ref` + `mousedown` listener).

4. **Estilo y Accesibilidad**
   - Colores corporativos: fondo oscuro, texto blanco, hover con variación.
   - `aria-label` en botones.
   - Tailwind como único sistema de estilos.
   - Animaciones suaves (`ease-in-out`, `transition-all`).

5. **Código**
   - Hooks: `useState`, `useCallback`, `useEffect`, `useRef`.
   - Código comentado para cada sección.
   - Nombres claros en funciones y clases.
   - Extraer componentes (`HeaderGenesis`, `DrawerGenesis`, `ProfileMenu`) si el código excede 150 líneas.

---

## 🔄 Protocolo de Iteración
1. **Versión inicial**: Generar un único componente funcional y autocontenido con todo el layout.
2. **Versión optimizada**: Separar en subcomponentes y mejorar performance.
3. **Versión final**: Pulir detalles de UI/UX, animaciones y accesibilidad.

---

## 📤 Formato de Entrega
- Código React completo y listo para usar.
- Comentarios explicativos en cada bloque.
- Opcional: capturas o descripción visual de cómo se vería el layout.

---
