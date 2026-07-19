# Issue-014: Nombre y correo no visibles en Mi Cuenta

**Fecha:** 2026-07-18  
**Contexto:** Como cliente logueado, el nombre y correo no se ven en la página Mi Cuenta. Probablemente el color de la fuente es igual o similar al fondo.  
**Estado:** 🔧 En progreso

---

## Problema

- En la página "Mi Cuenta", los campos de nombre y correo del usuario logueado no son visibles
- Los valores probablemente están presentes en el DOM pero no son legibles por un conflicto de color entre fuente y fondo
- Puede ocurrir en modo oscuro, en un contenedor con fondo blanco, o por una clase CSS incorrecta

## Comportamiento esperado

- El nombre completo y el correo electrónico del usuario deben ser claramente visibles en la página "Mi Cuenta"
- El contraste entre el texto y el fondo debe cumplir con WCAG AA (ratio mínimo 4.5:1 para texto normal)

## Posibles causas

- Clase Tailwind como `text-white` aplicada sobre un fondo blanco (`bg-white`)
- Clase `text-gray-100` o similar en un contenedor claro
- Variable CSS de color heredada incorrectamente
- Componente reutilizado de un contexto oscuro aplicado en uno claro

## Solución

1. Inspeccionar el componente de "Mi Cuenta" y localizar los elementos de nombre y correo
2. Verificar las clases de color de texto aplicadas (`text-*`) y el color de fondo del contenedor padre
3. Corregir el color de texto a uno con suficiente contraste (ej. `text-gray-900` o `text-ink-dark`)
4. Validar en modo claro y oscuro si la aplicación soporta ambos

## Archivos a modificar

- `frontend/src/pages/MyAccount.tsx` (o `Profile.tsx` / `AccountPage.tsx`)
- Posible: componentes de campo de texto o tarjeta de perfil reutilizados

## Relacionado

- Revisión general de accesibilidad y contraste de color en páginas autenticadas
