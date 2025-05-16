
# 📄 PRD - Sistema de Cotización de Desarrollo de Software

## 1. Resumen del producto
Este sistema permite generar cotizaciones personalizadas para proyectos de desarrollo de software (web, móvil, escritorio), con base en selección de stack, tipo de aplicación, base de datos, tareas específicas y costos por hora/categoría.

## 2. Objetivo
Optimizar el proceso de generación de cotizaciones para agentes de desarrollo interno, con una herramienta intuitiva que permita sugerir configuraciones óptimas según el presupuesto, alcance y requerimientos técnicos.

## 3. Stakeholders
- **Product Owner:** Responsable del alcance y prioridades del producto.
- **Desarrolladores de software:** Usuarios del sistema para cotizar proyectos.
- **Equipo comercial (opcional):** Pueden revisar cotizaciones o utilizar documentos generados.

## 4. Usuarios finales
- **Agentes internos del equipo de desarrollo**
- **Clientes potenciales (en vista pública y limitada)**

## 5. Características principales
- Selección de tipo de aplicación (Web, Móvil, Escritorio)
- Selección de stack predefinido o configuración manual
- Tareas agrupadas por categorías con precios por hora
- Generación de cotización ordenada por costo creciente (económica a avanzada)
- Recomendaciones inteligentes con justificación técnica
- Exportación en PDF de la cotización
- Guardado de borradores
- Estimación de duración del proyecto por rol

## 6. Requerimientos funcionales
- RF01: Crear proyecto de cotización con tipo de aplicación
- RF02: Seleccionar stack (predeterminado o personalizado)
- RF03: Agregar tareas con tiempos estimados
- RF04: Calcular costo según categoría y rol
- RF05: Generar resumen técnico y económico
- RF06: Exportar cotización a PDF
- RF07: Guardar borradores y cargar después
- RF08: Mostrar recomendaciones por configuración

## 7. Requerimientos no funcionales
- RNF01: Tiempo de respuesta < 1s por operación de selección
- RNF02: Seguridad en el acceso interno (login por token JWT)
- RNF03: Compatibilidad móvil
- RNF04: Soporte para múltiples idiomas (futuro)

## 8. Modelo de datos inicial (borrador)
- **ProjectQuote**
  - id, nombre, tipoAplicacion, fechaCreacion, estado, total
- **Stack**
  - id, nombre, frontend, backend, database, recomendacion, costoEstimado
- **TaskCategory**
  - id, nombre, precioHora
- **Task**
  - id, nombre, descripcion, categoriaId, horasEstimadas
- **User**
  - id, nombre, rol, email

## 9. Flujos de usuario (User Flows)
### a) Crear cotización
1. Seleccionar tipo de aplicación
2. Elegir stack (predefinido o personalizado)
3. Agregar tareas o módulos
4. Visualizar costo mínimo → máximo
5. Recibir recomendaciones
6. Exportar PDF o guardar como borrador

### b) Ver historial de cotizaciones
1. Iniciar sesión
2. Ver listado
3. Cargar o duplicar cotización anterior

## 10. Roadmap por etapas

### Fase 1 - MVP
- Login básico interno
- Crear cotización simple
- Selección de stack
- Agregado de tareas
- Cálculo básico de costos
- Exportación PDF

### Fase 2 - Avanzado
- Configuración completa de stack
- Guardado de cotizaciones
- Recomendaciones automatizadas
- Historial de cotizaciones

### Fase 3 - Expansión
- Autenticación cliente
- Portal público limitado
- Soporte multi-idioma
- Estimaciones cronológicas de ejecución

---

## ✅ Notas finales
- El enfoque será minimalista, ágil y funcional.
- El stack sugerido es VueJS + .NET 9 + PostgreSQL.
- PDF puede generarse con Wkhtmltopdf o DinkToPdf desde backend.
- Posible integración futura con CRM o ERP.

