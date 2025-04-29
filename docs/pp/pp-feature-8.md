# Plan de Pruebas Detallado por Feature - TalentIA Fase 1

## (Continúa...)

---

## 8. Feature 8: Mejoras Adicionales de Usabilidad y Funcionalidad (Prioridad: Baja)

### 8.1. Objetivos de Prueba

* Verificar la funcionalidad del sistema de notificaciones internas (generación, visualización, marcar como leídas).
* Validar la funcionalidad de búsqueda básica de candidatos por nombre/email.
* Asegurar que el dashboard básico muestra correctamente las métricas agregadas definidas.
* Confirmar que la funcionalidad de exportar datos básicos y CV del candidato funciona correctamente.
* Evaluar la usabilidad de estas funcionalidades adicionales.

### 8.2. User Stories Cubiertas

* [US-41: Recibir Notificaciones Internas sobre Eventos Clave](./us/us-41-recibir-notificaciones-internas-eventos-clave.md)
* [US-42: Buscar Candidatos por Nombre o Palabra Clave](./us/us-42-buscar-candidatos-nombre-palabra-clave.md)
* [US-43: Visualizar Dashboard con Métricas Básicas](./us/us-43-visualizar-dashboard-metricas-basicas.md)
* [US-44: Exportar Información Básica de un Candidato](./us/us-44-exportar-informacion-basica-candidato.md)

*(Todas estas US son clasificadas como "Could Have")*

### 8.3. Enfoque de Pruebas Específico (por sub-funcionalidad)

* **Notificaciones (US-41):**
    * **Funcional:**
        * UI (TK-145, TK-146, TK-147): Probar indicador (campana+badge), apertura/cierre del panel, listado de notificaciones (mensaje, fecha, link), marcado como leída (individual/todas).
        * API (TK-143): Probar endpoints de contar no leídas, listar, marcar como leída (single/all).
        * Backend Logic (TK-142, TK-144): Verificar que los eventos clave (ej. nueva candidatura, cambio de etapa relevante) generan la notificación correcta para el usuario(s) correcto(s) y se almacena en `Notificacion` (TK-141).
    * **Integración:** Probar E2E: Realizar acción notificable -> Verificar aparición de notificación en UI -> Marcar como leída.
    * **Usabilidad:** ¿Es claro el indicador? ¿Es fácil leer y gestionar las notificaciones?

* **Búsqueda Básica (US-42):**
    * **Funcional:**
        * UI (TK-150, TK-151, TK-152): Probar input de búsqueda, ejecución, navegación a resultados, visualización de resultados (nombre, vacante, etapa), paginación de resultados, manejo de "no resultados".
        * API (TK-148): Probar endpoint de búsqueda con diferentes queries (`q`), incluyendo búsquedas parciales, case-insensitive, por nombre y por email. Verificar paginación y estructura de respuesta.
        * Backend Logic (TK-149): Verificar que la consulta BBDD busca correctamente en `Candidato.nombre_completo` y `Candidato.email`.
    * **Integración:** Probar E2E: Introducir término en UI -> Ver página de resultados correcta.
    * **Rendimiento:** Medir tiempo de respuesta de la búsqueda con un volumen moderado de candidatos.
    * **Usabilidad:** ¿Es fácil encontrar y usar la búsqueda? ¿Son útiles los resultados?

* **Dashboard Básico (US-43):**
    * **Funcional:**
        * UI (TK-155, TK-156, TK-157): Probar carga de página del dashboard, visualización de widgets numéricos (vacantes activas, apps recientes), visualización del gráfico de barras de distribución por etapa. Verificar estado de carga.
        * API (TK-153): Probar endpoint de resumen del dashboard. Verificar estructura y tipos de datos.
        * Backend Logic (TK-154): Verificar la corrección de las consultas de agregación (COUNT vacantes publicadas, COUNT candidaturas recientes, GROUP BY etapa).
    * **Integración:** Probar E2E: Crear/modificar vacantes/candidaturas -> Verificar que los datos del dashboard se actualizan (puede requerir refresco manual o tener una latencia aceptable).
    * **Rendimiento:** Medir tiempo de carga del dashboard.
    * **Usabilidad:** ¿Es clara la información presentada? ¿Es útil el gráfico?

* **Exportar Datos Candidato (US-44):**
    * **Funcional:**
        * UI (TK-160, TK-161): Probar visibilidad del botón "Exportar Datos". Probar la acción de clic y verificar que inicia la descarga del navegador.
        * API (TK-158): Probar endpoint de exportación directamente. Verificar cabeceras `Content-Type: application/zip` y `Content-Disposition: attachment; filename=...`. Verificar que se descarga un archivo.
        * Backend Logic (TK-159): Verificar la lógica de creación del ZIP: inclusión de archivo de texto con datos de contacto correctos y archivo CV correcto. Probar con candidato sin CV (esperar error o ZIP sin CV).
    * **Integración:** Probar E2E: Hacer clic en exportar en UI -> Verificar descarga -> Abrir ZIP descargado y validar contenido (archivo de texto y CV).
    * **Seguridad:** Asegurar que solo usuarios autorizados puedan exportar.
    * **Usabilidad:** ¿Es clara la acción de exportar? ¿Es útil el formato del archivo exportado?

### 8.4. Datos de Prueba Necesarios

* Datos suficientes para generar notificaciones (usuarios asignados a vacantes, candidaturas).
* Candidatos con nombres/emails variados para probar búsqueda.
* Volumen de datos suficiente para que el dashboard muestre métricas (>0).
* Candidatos con y sin CV asociado para probar exportación.

### 8.5. Priorización Interna

* Todas las funcionalidades de esta feature son "Could Have", por lo que se probarán una vez implementadas, después de las features de mayor prioridad. No hay una dependencia fuerte entre ellas.

---
