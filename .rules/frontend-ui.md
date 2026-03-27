# Frontend & UX Rules for latearte

Este documento define las reglas de diseño, estándares visuales y lógica de interacción para el frontend de **latearte**.

## 1. Estilado y Diseño (Framework)
- **Framework**: Se debe utilizar exclusivamente **Tailwind CSS** para todo el estilado de componentes.
- **Micro-interacciones**: El diseño debe sentirse " premium" y fluido, utilizando transiciones suaves y estados de hover consistentes.
- **Tipografía y Color**: Seguir la paleta de colores definida por la marca, asegurando una estética de "Hub Cultural" de alta especialidad.

## 2. Sistema Visual de Acceso (Iconografía)
Es mandatorio utilizar la siguiente codificación visual para indicar el tipo de acceso al contenido en todas las vistas (Cards, Detalles, Listas):
- 🟢 **Libre**: Contenido gratuito o de dominio público (Abierto).
- 🟡 **Suscripción**: Requiere una cuenta activa en una plataforma externa.
- 🔵 **VOD / Alquiler**: Contenido de pago por evento o premium.

**Regla**: Los iconos deben ser claros y estar acompañados de un *tooltip* informativo si el usuario interactúa con ellos.

## 3. Lógica del "Dial de Tiempo"
El componente de filtrado por duración (Dial de Tiempo) es una pieza crítica de la UX y debe seguir estas reglas:
- **Optimización**: Las peticiones de filtrado deben estar debunced (esperar a que el usuario termine el ajuste) para no saturar al microservicio de curaduría.
- **Parámetros**: Debe enviar cambios en tiempo real que afecten a la query `duracion_max` y combinarse con el selector de `vibe_mood`.
- **Coherencia**: El Dial debe reflejar siempre la duración máxima del catálogo disponible en el eje vertical seleccionado.

## 4. Estándares de Componentes
- **Smart Embedding**: El componente de reproducción debe decidir dinámicamente si renderiza un `iframe` (Smart Embedding) o un botón de redirección (Deep Linking) basado en el campo `permite_iframe` del modelo de datos.
- **Modo Contexto**: Se debe implementar un sistema de pop-ups informativos que se sincronicen con la `marca_tiempo` del video en reproducción, basándose en la entidad `DATO_CONTEXTO`.
- **Accesibilidad (A11y)**: Asegurar que todos los elementos interactivos tengan etiquetas ARIA descriptivas y sean navegables mediante teclado.

---
**Fuente**: [Diseño de arquitectura Arteflujo_ Hub Cultural.md](file:///c:/Documentos/Cursos/Lidr/IA4Devs/AI4Devs-finalproject/documentacion/Dise%C3%B1o%20de%20arquitectura%20Arteflujo_%20Hub%20Cultural.md)
