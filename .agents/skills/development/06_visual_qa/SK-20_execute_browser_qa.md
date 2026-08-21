---
name: SK-20_execute_browser_qa
description: "Guía al subagente de navegación de la IA para ejecutar pruebas visuales, de accesibilidad táctil y funcionales sobre la interfaz de usuario local."
version: "1.1.0"
category: "development/06_visual_qa"
inputs:
  - target_url: "URL opcional del servidor de desarrollo local — si no se pasa, se infiere de docs/00_stack_manifest.md §7 (Frontend Dev Server); solo si el manifiesto no la declara, se descubre leyendo la config real del proyecto (Guard 24)"
  - user_flow: "Descripción del flujo de usuario a probar visualmente"
outputs:
  - "Reporte de verificación visual de la interfaz"
  - "Grabaciones de video/capturas de pantalla de los estados verificados"
  - "Verificación del cumplimiento de accesibilidad y ergonomía táctil"
---

Actúa como un Quality Assurance (QA) Analyst y Visual Verifier. Tu objetivo es utilizar el subagente del navegador (`browser_subagent`) para renderizar e interactuar con la interfaz del proyecto local, asegurando la consistencia del diseño y la ergonomía física descritas en las especificaciones.

Sigue estrictamente este flujo de trabajo secuencial:

---

## 🔍 FASE 1: Descubrimiento de Configuración Local y UX
1. **Identificar la URL de Desarrollo (Guard 24):** Si no se provee `target_url`, lee primero `docs/00_stack_manifest.md` §7 ("URLs de Desarrollo Local") — es la fuente única de verdad. Solo si el manifiesto no la declara todavía, descubre el puerto leyendo los archivos de configuración reales del frontend (ej. `package.json`, `vite.config.ts`, `next.config.js`) y considera añadir la fila correspondiente al manifiesto para que la próxima invocación no tenga que redescubrirla.
2. **Descubrir Reglas Visuales del Proyecto:** Busca y lee las directivas de frontend y accesibilidad táctil en `docs/04_governance_and_quality/rules/` o en `docs/`. Identifica:
   - El tamaño mínimo de elementos interactivos (táctil).
   - La paleta de colores y variables CSS oficiales (Design Tokens).
   - Los estados defensivos requeridos (Carga, Vacío, Error, Desconexión).
   - La resolución de pantalla objetivo (ej. tablet horizontal, móvil, desktop).

---

## 🚀 FASE 2: Preparación del Entorno Local
1. **Levantar Servidores:** Si no están encendidos, ejecuta los comandos del proyecto en segundo plano para levantar el backend (API) y el frontend (servidor de desarrollo de UI).
2. **Arrancar el Navegador:** Inicia el subagente de navegación indicándole la URL del servidor local. Configura la resolución de pantalla a las dimensiones objetivo descubiertas en la Fase 1.

---

## 🕹️ FASE 3: Ejecución de Pruebas de Interacción y Visuales
Utiliza el subagente de navegación para ejecutar el `{user_flow}` paso a paso y auditar visualmente los siguientes aspectos:
1. **Audit de Ergonomía Táctil:**
   - Asegúrate de que los botones, inputs y selectores interactivos cumplan con el área mínima física de pulsación descubierta en las reglas.
   - Verifica que el espaciado (margin/padding) impida pulsaciones accidentales de elementos adyacentes.
2. **Verificación de Estados Defensivos:**
   - **Loading State:** Observa la carga de la página. ¿Tiene skeletons animados o indicadores visuales limpios?
   - **Error / Empty States:** Si simulas una búsqueda vacía o un fallo de conexión, verifica que aparezcan interfaces explicativas claras con botones de reintento.
3. **Contraste y Legibilidad:**
   - Valida que el contraste del texto sobre los colores de fondo cumpla con los estándares de lectura a distancia (adecuado para entornos de fatiga u operarios en cocina).
   - Verifica que las fuentes y estilos aplicados coincidan con el sistema de tokens del proyecto.

---

## 📹 FASE 4: Documentación y Cierre de Procesos
1. **Registrar Evidencia:** Genera capturas de pantalla (screenshots) o grabaciones de video de los puntos clave del flujo interactivo y del Visual QA.
2. **Cierre:** Detiene de forma segura los servidores y procesos que abriste localmente.
3. **Reporte al Humano:** Detallar los hallazgos visuales y las rutas de las capturas guardadas estructurados estrictamente según la plantilla universal en `.agents/rules/00_output_reporting_standard.md`.
