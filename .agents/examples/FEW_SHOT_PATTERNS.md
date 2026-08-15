# 🌟 Ejemplos de Patrones Agnósticos (Few-Shot Exemplars)

Este directorio contiene plantillas y patrones de diseño en **pseudocódigo 100% agnóstico**, organizados modularmente por dominio. El agente de IA debe consultar estas plantillas estructurales para extrapolar los patrones de arquitectura limpia a cualquier lenguaje de programación (TypeScript, Python, Java, Go, C#, Rust, etc.).

---

## 📂 Catálogo Modular de Patrones Agnósticos:

### ⚙️ Backend & Infraestructura (`examples/backend/`)
1. **[Caso de Uso Puro (SOLID + DIP)](backend/01_use_case_pattern.example.md):** Estructura abstracta de un caso de uso con inyección de dependencias por puerto e invariantes de negocio.
2. **[Controlador HTTP REST](backend/02_controller_pattern.example.md):** Estructura abstracta de sanitización de entradas HTTP, invocación del caso de uso y manejo centralizado de excepciones.

### 🎨 Frontend & UI/UX (`examples/frontend/`)
3. **[Componente UI y Estados Defensivos](frontend/03_ui_component_pattern.example.md):** Estructura abstracta de desacoplamiento por repositorio, separación de hooks/estado y renderizado de los 4 estados defensivos con ergonomía táctil.
