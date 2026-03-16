# 🎫 WORK TICKETS (JIRA) - BLOQUE 4 (Tickets 151-200)

**Proyecto:** RRFinances - Sistema Web Financiero Core  
**Fecha:** 17 de Diciembre de 2025  
**Bloque:** 4 de 9  
**Tickets:** 151 - 200

---

## 📋 Continuación US-003: Registro y Gestión Completa de Clientes con Apoderados y Poderes

### 🖥️ Módulo: Frontend - Clientes

---

#### **TICKET-151: Crear módulo de clientes en Angular**

**Título:** Crear módulo de clientes en Angular

**Descripción:**
Crear módulo lazy-loaded para gestión completa de clientes con estructura de componentes.

**Criterios de Aceptación:**
- ✅ Módulo ClientesModule con lazy loading
- ✅ Routing configurado (/clientes)
- ✅ Estructura de componentes (list, form, view, mensajes, apoderados, poderes)
- ✅ Servicio ClientesService
- ✅ Modelos TypeScript completos

**Prioridad:** Crítica  
**Esfuerzo:** 2 horas  
**Etiquetas:** frontend, angular, module, clientes

---

#### **TICKET-152: Crear servicio ClientesService en Angular**

**Título:** Crear servicio ClientesService en Angular

**Descripción:**
Implementar servicio para consumir API de clientes con gestión de estado.

**Criterios de Aceptación:**
- ✅ Métodos CRUD completos
- ✅ Método search(filters) para búsqueda avanzada
- ✅ Método activate/deactivate/suspend
- ✅ Método exportToExcel(filters)
- ✅ Gestión de estado con BehaviorSubject
- ✅ Caché de clientes frecuentes
- ✅ Manejo de errores centralizado

**Prioridad:** Crítica  
**Esfuerzo:** 2.5 horas  
**Etiquetas:** frontend, service, clientes

---

#### **TICKET-153: Crear componente ClientesListComponent**

**Título:** Crear componente ClientesListComponent

**Descripción:**
Crear componente para listar clientes con tabla avanzada y filtros.

**Criterios de Aceptación:**
- ✅ Tabla con Material Table o AG Grid
- ✅ Columnas: código, identificación, nombres, tipo, oficina, oficial, estado
- ✅ Filtros: búsqueda, tipo, estado, oficina, oficial, segmento
- ✅ Búsqueda por código dactilar
- ✅ Paginación del lado del servidor
- ✅ Ordenamiento por columnas
- ✅ Acciones: ver, editar, mensajes, suspender
- ✅ Botón crear nuevo cliente
- ✅ Botón exportar a Excel
- ✅ Visualización rápida de alertas

**Prioridad:** Crítica  
**Esfuerzo:** 3 horas  
**Etiquetas:** frontend, component, table, clientes

---

#### **TICKET-154: Crear componente ClienteFormComponent (wizard multi-paso)**

**Título:** Crear componente ClienteFormComponent (wizard multi-paso)

**Descripción:**
Crear componente con formulario wizard de múltiples pasos para crear/editar clientes.

**Criterios de Aceptación:**
- ✅ Wizard con 3 pasos: Datos Personales, Datos Cliente, Confirmación
- ✅ Paso 1: Formulario de persona (nombres, identificación, dirección, contacto)
- ✅ Paso 2: Formulario de cliente (tipo, oficina, oficial, segmento)
- ✅ Paso 3: Resumen y confirmación
- ✅ Validación por paso
- ✅ Navegación entre pasos
- ✅ Validación de cédula en tiempo real
- ✅ Autocompletado de persona existente
- ✅ Carga de fotografía
- ✅ Modo crear y modo editar

**Prioridad:** Crítica  
**Esfuerzo:** 3 horas  
**Etiquetas:** frontend, component, form, wizard, clientes

---

#### **TICKET-155: Crear componente de búsqueda de persona existente**

**Título:** Crear componente de búsqueda de persona existente

**Descripción:**
Crear diálogo de búsqueda para verificar si persona ya existe antes de crear cliente.

**Criterios de Aceptación:**
- ✅ Búsqueda por número de identificación
- ✅ Búsqueda por nombres y apellidos
- ✅ Resultados en tabla con datos relevantes
- ✅ Selección de persona encontrada
- ✅ Autocompletado de formulario con datos de persona
- ✅ Opción de crear nueva si no existe
- ✅ Validación de no duplicados

**Prioridad:** Alta  
**Esfuerzo:** 2.5 horas  
**Etiquetas:** frontend, component, dialog, search

---

#### **TICKET-156: Crear componente ClienteViewComponent**

**Título:** Crear componente ClienteViewComponent

**Descripción:**
Crear componente para visualizar información completa de un cliente.

**Criterios de Aceptación:**
- ✅ Vista de datos personales completos
- ✅ Vista de datos de cliente
- ✅ Fotografía del cliente
- ✅ Sección de apoderados y poderes vigentes
- ✅ Sección de mensajes activos
- ✅ Timeline de histórico de cambios
- ✅ Placeholder de estado económico (US-004)
- ✅ Botones de acciones: editar, suspender, mensajes
- ✅ Diseño tipo perfil con tabs

**Prioridad:** Alta  
**Esfuerzo:** 3 horas  
**Etiquetas:** frontend, component, clientes

---

#### **TICKET-157: Crear componente de gestión de mensajes (ClienteMensajesComponent)**

**Título:** Crear componente de gestión de mensajes (ClienteMensajesComponent)

**Descripción:**
Crear componente para gestionar mensajes/alertas de un cliente.

**Criterios de Aceptación:**
- ✅ Lista de mensajes del cliente (activos e históricos)
- ✅ Filtros por tipo y vigencia
- ✅ Formulario para crear mensaje nuevo
- ✅ Campos: tipo, título, descripción, fechas vigencia
- ✅ Indicador visual por tipo (info, warning, critical)
- ✅ Edición y eliminación de mensajes
- ✅ Visualización de quién y cuándo vio el mensaje

**Prioridad:** Alta  
**Esfuerzo:** 2.5 horas  
**Etiquetas:** frontend, component, mensajes

---

#### **TICKET-158: Crear modal de visualización de mensajes críticos**

**Título:** Crear modal de visualización de mensajes críticos

**Descripción:**
Crear modal que se muestre automáticamente al consultar cliente con mensajes críticos pendientes.

**Criterios de Aceptación:**
- ✅ Modal automático al abrir vista de cliente
- ✅ Lista de mensajes pendientes con prioridad
- ✅ Mensajes críticos resaltados
- ✅ Checkbox de confirmación para críticos
- ✅ Botón "Confirmar lectura"
- ✅ Registro de visualización al backend
- ✅ Bloqueo de operaciones hasta confirmar (opcional)

**Prioridad:** Alta  
**Esfuerzo:** 2 horas  
**Etiquetas:** frontend, component, dialog, mensajes

---

#### **TICKET-159: Crear servicio ApoderadosService en Angular**

**Título:** Crear servicio ApoderadosService en Angular

**Descripción:**
Implementar servicio para gestión de apoderados.

**Criterios de Aceptación:**
- ✅ Métodos CRUD para apoderados
- ✅ Método search(query) para búsqueda
- ✅ Método getPoderes(apoderadoId)
- ✅ Caché de apoderados frecuentes
- ✅ Observables para reactividad

**Prioridad:** Alta  
**Esfuerzo:** 2 horas  
**Etiquetas:** frontend, service, apoderados

---

#### **TICKET-160: Crear componente ApoderadosListComponent (embebido)**

**Título:** Crear componente ApoderadosListComponent (embebido)

**Descripción:**
Crear componente embebible para mostrar/gestionar apoderados de un cliente.

**Criterios de Aceptación:**
- ✅ Lista de apoderados del cliente
- ✅ Datos: nombres, identificación, tipo, estado
- ✅ Acciones: ver detalles, agregar nuevo
- ✅ Componente reutilizable (puede usarse en vista o tab)
- ✅ Búsqueda rápida de apoderados

**Prioridad:** Alta  
**Esfuerzo:** 2 horas  
**Etiquetas:** frontend, component, apoderados

---

#### **TICKET-161: Crear componente ApoderadoFormComponent**

**Título:** Crear componente ApoderadoFormComponent

**Descripción:**
Crear componente con formulario para crear/editar apoderados.

**Criterios de Aceptación:**
- ✅ Formulario de persona completo
- ✅ Campo tipo de apoderado
- ✅ Búsqueda de persona existente
- ✅ Validación de mayoría de edad
- ✅ Validación de no ser el mismo cliente
- ✅ Modo crear y modo editar
- ✅ Carga de documentos de respaldo

**Prioridad:** Alta  
**Esfuerzo:** 2.5 horas  
**Etiquetas:** frontend, component, form, apoderados

---

#### **TICKET-162: Crear servicio PoderesService en Angular**

**Título:** Crear servicio PoderesService en Angular

**Descripción:**
Implementar servicio para gestión de poderes legales.

**Criterios de Aceptación:**
- ✅ Métodos CRUD para poderes
- ✅ Método uploadDocument(file) para subir PDF
- ✅ Método downloadDocument(poderId)
- ✅ Método revocar(poderId, motivo)
- ✅ Método getExpiringSoon(days)
- ✅ Validaciones de fechas

**Prioridad:** Alta  
**Esfuerzo:** 2.5 horas  
**Etiquetas:** frontend, service, poderes

---

#### **TICKET-163: Crear componente PoderesListComponent (embebido)**

**Título:** Crear componente PoderesListComponent (embebido)

**Descripción:**
Crear componente embebible para mostrar/gestionar poderes de un cliente.

**Criterios de Aceptación:**
- ✅ Lista de poderes del cliente
- ✅ Datos: apoderado, tipo, fechas, estado
- ✅ Indicador visual de vigencia
- ✅ Alerta de próximos a vencer
- ✅ Acciones: ver, editar, descargar PDF, revocar
- ✅ Botón agregar nuevo poder
- ✅ Filtros por estado y apoderado

**Prioridad:** Alta  
**Esfuerzo:** 2.5 horas  
**Etiquetas:** frontend, component, poderes

---

#### **TICKET-164: Crear componente PoderFormComponent**

**Título:** Crear componente PoderFormComponent

**Descripción:**
Crear componente con formulario para registrar/editar poderes.

**Criterios de Aceptación:**
- ✅ Selector de apoderado (existente o nuevo)
- ✅ Selector de tipo de poder
- ✅ Campos: escritura, fechas, notaría, alcance
- ✅ Upload de documento PDF (drag & drop)
- ✅ Vista previa de PDF
- ✅ Validación de tamaño (máx. 2MB)
- ✅ Validación de fechas (inicio <= fin)
- ✅ Validación de no duplicados vigentes
- ✅ Modo crear y modo editar

**Prioridad:** Alta  
**Esfuerzo:** 3 horas  
**Etiquetas:** frontend, component, form, poderes

---

#### **TICKET-165: Crear componente de upload de archivos (FileUploadComponent)**

**Título:** Crear componente de upload de archivos (FileUploadComponent)

**Descripción:**
Crear componente reutilizable para carga de archivos con drag & drop y validaciones.

**Criterios de Aceptación:**
- ✅ Área de drag & drop visual
- ✅ Botón de selección de archivo
- ✅ Validación de tipo de archivo (configurable)
- ✅ Validación de tamaño máximo (configurable)
- ✅ Vista previa de archivo (imagen o PDF)
- ✅ Progress bar de carga
- ✅ Botón de cancelar carga
- ✅ Reutilizable para fotos y PDFs
- ✅ Integración con Reactive Forms

**Prioridad:** Media  
**Esfuerzo:** 3 horas  
**Etiquetas:** frontend, component, upload, reusable

---

#### **TICKET-166: Crear visor de PDF (PDFViewerComponent)**

**Título:** Crear visor de PDF (PDFViewerComponent)

**Descripción:**
Crear componente para visualizar documentos PDF en línea.

**Criterios de Aceptación:**
- ✅ Integración con librería PDF.js o similar
- ✅ Navegación entre páginas
- ✅ Zoom in/out
- ✅ Botón de descarga
- ✅ Botón de impresión
- ✅ Loading indicator mientras carga
- ✅ Manejo de errores si PDF no carga
- ✅ Reutilizable en modales o páginas

**Prioridad:** Media  
**Esfuerzo:** 2.5 horas  
**Etiquetas:** frontend, component, pdf, reusable

---

#### **TICKET-167: Implementar diálogo de revocación de poder**

**Título:** Implementar diálogo de revocación de poder

**Descripción:**
Crear diálogo para revocar poder con captura de motivo.

**Criterios de Aceptación:**
- ✅ Diálogo con información del poder
- ✅ Campo de texto para motivo (obligatorio)
- ✅ Validación de motivo (mínimo caracteres)
- ✅ Confirmación de revocación
- ✅ Llamada a endpoint de revocación
- ✅ Actualización de lista tras revocación
- ✅ Registro en auditoría

**Prioridad:** Media  
**Esfuerzo:** 1.5 horas  
**Etiquetas:** frontend, component, dialog, poderes

---

#### **TICKET-168: Crear componente de cambio de estado de cliente**

**Título:** Crear componente de cambio de estado de cliente

**Descripción:**
Crear diálogo para cambiar estado de cliente (activar, inactivar, suspender).

**Criterios de Aceptación:**
- ✅ Selector de nuevo estado
- ✅ Campo de motivo (obligatorio para inactivar)
- ✅ Validaciones según estado
- ✅ Confirmación de cambio
- ✅ Llamada a endpoint correspondiente
- ✅ Actualización de vista tras cambio
- ✅ Mensajes de validación si tiene operaciones activas

**Prioridad:** Media  
**Esfuerzo:** 2 horas  
**Etiquetas:** frontend, component, dialog, clientes

---

#### **TICKET-169: Implementar exportación de clientes a Excel desde UI**

**Título:** Implementar exportación de clientes a Excel desde UI

**Descripción:**
Implementar funcionalidad de exportación con selección de campos y filtros.

**Criterios de Aceptación:**
- ✅ Botón "Exportar" en lista de clientes
- ✅ Diálogo de configuración de exportación
- ✅ Checkboxes para seleccionar campos a exportar
- ✅ Aplicación de filtros activos
- ✅ Preview de cantidad de registros
- ✅ Llamada a endpoint de exportación
- ✅ Descarga automática del archivo
- ✅ Loading indicator durante proceso

**Prioridad:** Baja  
**Esfuerzo:** 2.5 horas  
**Etiquetas:** frontend, export, clientes

---

#### **TICKET-170: Crear componente de línea de tiempo (TimelineComponent)**

**Título:** Crear componente de línea de tiempo (TimelineComponent)

**Descripción:**
Crear componente reutilizable para mostrar histórico de eventos en formato timeline.

**Criterios de Aceptación:**
- ✅ Visualización vertical de eventos
- ✅ Iconos por tipo de evento
- ✅ Fecha y hora de cada evento
- ✅ Usuario que realizó la acción
- ✅ Descripción del evento
- ✅ Datos antes/después (expandible)
- ✅ Paginación para muchos eventos
- ✅ Reutilizable para cualquier entidad

**Prioridad:** Baja  
**Esfuerzo:** 2.5 horas  
**Etiquetas:** frontend, component, timeline, reusable

---

---

## 📋 US-004: Consulta Rápida de Clientes y Visualización de Alertas

### 🔍 Módulo: Búsqueda y Consulta de Clientes (Backend)

---

#### **TICKET-171: Optimizar queries de búsqueda de clientes**

**Título:** Optimizar queries de búsqueda de clientes

**Descripción:**
Optimizar queries de búsqueda para garantizar respuestas en menos de 1 segundo.

**Criterios de Aceptación:**
- ✅ Índices full-text en campos de búsqueda
- ✅ Índices compuestos optimizados
- ✅ Query con EXPLAIN ANALYZE para verificar performance
- ✅ Paginación eficiente con cursor
- ✅ Caché de búsquedas frecuentes
- ✅ Tiempo de respuesta < 1 segundo para 100,000 registros

**Prioridad:** Alta  
**Esfuerzo:** 2.5 horas  
**Etiquetas:** backend, optimization, performance, search

---

#### **TICKET-172: Crear endpoint de búsqueda rápida (quick search)**

**Título:** Crear endpoint de búsqueda rápida (quick search)

**Descripción:**
Crear endpoint optimizado para búsqueda rápida desde barra de búsqueda global.

**Criterios de Aceptación:**
- ✅ GET /clientes/quick-search?q=...
- ✅ Búsqueda en: código, identificación, nombres, email, teléfono
- ✅ Resultados limitados a 10 registros
- ✅ Ordenados por relevancia
- ✅ Incluye foto thumbnail
- ✅ Response time < 500ms
- ✅ Highlighting de términos coincidentes

**Prioridad:** Alta  
**Esfuerzo:** 2.5 horas  
**Etiquetas:** backend, endpoint, search, quick-search

---

#### **TICKET-173: Implementar búsqueda por código dactilar**

**Título:** Implementar búsqueda por código dactilar

**Descripción:**
Implementar endpoint especializado para búsqueda biométrica por código dactilar.

**Criterios de Aceptación:**
- ✅ GET /clientes/buscar-por-dactilar?codigo=...
- ✅ Búsqueda exacta por código dactilar
- ✅ Índice único en campo codigo_dactilar
- ✅ Retorna cliente completo si existe
- ✅ Error 404 si no encuentra
- ✅ Registro en auditoría de búsqueda biométrica

**Prioridad:** Media  
**Esfuerzo:** 1.5 horas  
**Etiquetas:** backend, endpoint, search, biometrics

---

#### **TICKET-174: Crear endpoint para obtener resumen de cliente**

**Título:** Crear endpoint para obtener resumen de cliente

**Descripción:**
Crear endpoint que retorne resumen rápido de cliente para vista de consulta.

**Criterios de Aceptación:**
- ✅ GET /clientes/:id/resumen
- ✅ Incluye: datos básicos, foto, mensajes activos, apoderados vigentes
- ✅ No incluye históricos (optimizado)
- ✅ Caché de 5 minutos
- ✅ Response time < 500ms
- ✅ Preparado para indicadores financieros (placeholder)

**Prioridad:** Alta  
**Esfuerzo:** 2 horas  
**Etiquetas:** backend, endpoint, clientes, summary

---

#### **TICKET-175: Implementar endpoint de estado económico (estructura placeholder)**

**Título:** Implementar endpoint de estado económico (estructura placeholder)

**Descripción:**
Crear endpoint con estructura placeholder para estado económico, a completar en fases futuras.

**Criterios de Aceptación:**
- ✅ GET /clientes/:id/estado-economico
- ✅ Estructura JSON con secciones vacías:
  - cuentas_ahorro: []
  - inversiones: []
  - creditos: []
  - garantias: []
  - resumen: {}
- ✅ Mensaje indicando disponibilidad futura
- ✅ Preparado para integración con módulos financieros

**Prioridad:** Baja  
**Esfuerzo:** 1 hora  
**Etiquetas:** backend, endpoint, placeholder, estado-economico

---

#### **TICKET-176: Crear endpoint de reporte "Clientes por Fechas"**

**Título:** Crear endpoint de reporte "Clientes por Fechas"

**Descripción:**
Implementar endpoint para generar reporte configurable de clientes por rango de fechas.

**Criterios de Aceptación:**
- ✅ POST /clientes/reporte/por-fechas
- ✅ Filtros obligatorios: oficina, tipo_cliente, fecha_desde, fecha_hasta
- ✅ Filtros opcionales: estado, oficial, segmento, provincia
- ✅ Selección de campos adicionales (array)
- ✅ Ordenamiento configurable
- ✅ Paginación del lado del servidor
- ✅ Totalizadores (cantidad clientes)
- ✅ Formato JSON para tabla

**Prioridad:** Alta  
**Esfuerzo:** 3 horas  
**Etiquetas:** backend, endpoint, reports, clientes

---

#### **TICKET-177: Implementar exportación de reporte a Excel**

**Título:** Implementar exportación de reporte a Excel

**Descripción:**
Crear endpoint para exportar reporte de clientes por fechas a formato Excel.

**Criterios de Aceptación:**
- ✅ POST /clientes/reporte/por-fechas/export
- ✅ Respeta mismos filtros que reporte
- ✅ Formato Excel con estilos
- ✅ Headers descriptivos y formateados
- ✅ Fecha en formato legible
- ✅ Fila de totales al final
- ✅ Nombre de archivo con fecha y filtros
- ✅ Límite de 10,000 registros
- ✅ Generación asíncrona para grandes volúmenes

**Prioridad:** Media  
**Esfuerzo:** 2.5 horas  
**Etiquetas:** backend, export, reports

---

#### **TICKET-178: Implementar exportación de reporte a PDF**

**Título:** Implementar exportación de reporte a PDF

**Descripción:**
Crear endpoint para exportar reporte de clientes a formato PDF.

**Criterios de Aceptación:**
- ✅ POST /clientes/reporte/por-fechas/export-pdf
- ✅ Formato PDF profesional con logo
- ✅ Tabla con datos del reporte
- ✅ Encabezado con filtros aplicados
- ✅ Pie de página con totales
- ✅ Números de página
- ✅ Orientación landscape para muchas columnas
- ✅ Límite de 1,000 registros (recomendación)

**Prioridad:** Baja  
**Esfuerzo:** 3 horas  
**Etiquetas:** backend, export, reports, pdf

---

#### **TICKET-179: Crear endpoint para guardar configuración de reportes**

**Título:** Crear endpoint para guardar configuración de reportes

**Descripción:**
Permitir guardar configuraciones frecuentes de reportes para reutilización.

**Criterios de Aceptación:**
- ✅ POST /clientes/reporte/configuraciones - Guardar configuración
- ✅ GET /clientes/reporte/configuraciones - Listar configuraciones guardadas
- ✅ GET /clientes/reporte/configuraciones/:id - Obtener una configuración
- ✅ DELETE /clientes/reporte/configuraciones/:id - Eliminar
- ✅ Campos: nombre, descripción, filtros (JSON), campos_seleccionados (JSON)
- ✅ Asociado a usuario o compartido por cooperativa

**Prioridad:** Baja  
**Esfuerzo:** 2 horas  
**Etiquetas:** backend, reports, configuration

---

### 🖥️ Módulo: Frontend - Búsqueda y Consulta

---

#### **TICKET-180: Crear componente de búsqueda global (GlobalSearchComponent)**

**Título:** Crear componente de búsqueda global (GlobalSearchComponent)

**Descripción:**
Crear barra de búsqueda global en navbar con autocompletado.

**Criterios de Aceptación:**
- ✅ Input de búsqueda en navbar
- ✅ Autocompletado con resultados mientras escribe
- ✅ Llamada a /quick-search endpoint
- ✅ Debounce de 300ms
- ✅ Resultados con foto, nombre, identificación
- ✅ Click en resultado navega a vista de cliente
- ✅ Keyboard navigation (flechas, enter)
- ✅ Loading indicator
- ✅ Mensaje si no hay resultados

**Prioridad:** Alta  
**Esfuerzo:** 2.5 horas  
**Etiquetas:** frontend, component, search, global

---

#### **TICKET-181: Crear componente ClienteResumenComponent**

**Título:** Crear componente ClienteResumenComponent

**Descripción:**
Crear componente para vista rápida/resumen de cliente.

**Criterios de Aceptación:**
- ✅ Vista compacta con datos esenciales
- ✅ Foto del cliente grande
- ✅ Datos básicos en cards
- ✅ Mensajes activos visibles prominentemente
- ✅ Lista de apoderados vigentes
- ✅ Accesos rápidos a operaciones frecuentes
- ✅ Botón "Ver detalles completos"
- ✅ Diseño optimizado para consulta rápida

**Prioridad:** Alta  
**Esfuerzo:** 2.5 horas  
**Etiquetas:** frontend, component, clientes, summary

---

#### **TICKET-182: Crear componente EstadoEconomicoComponent (placeholder)**

**Título:** Crear componente EstadoEconomicoComponent (placeholder)

**Descripción:**
Crear componente con estructura placeholder para estado económico del cliente.

**Criterios de Aceptación:**
- ✅ Secciones con placeholders:
  - Cuentas de Ahorro
  - Inversiones
  - Créditos
  - Garantías
  - Resumen Financiero
- ✅ Mensaje "Disponible en próximas versiones"
- ✅ Diseño visual de cómo se verá
- ✅ Skeleton loaders para simular datos
- ✅ Preparado para integración futura

**Prioridad:** Baja  
**Esfuerzo:** 2 horas  
**Etiquetas:** frontend, component, placeholder, estado-economico

---

#### **TICKET-183: Crear componente de reporte "Clientes por Fechas"**

**Título:** Crear componente de reporte "Clientes por Fechas"

**Descripción:**
Crear componente completo para generación de reporte configurable.

**Criterios de Aceptación:**
- ✅ Panel de filtros obligatorios y opcionales
- ✅ Selectores múltiples de campos adicionales (checkboxes)
- ✅ Vista previa de cantidad de registros
- ✅ Tabla de resultados con paginación
- ✅ Botones de exportación (Excel, PDF)
- ✅ Guardado de configuración de reporte
- ✅ Carga de configuración guardada
- ✅ Totalizadores visibles

**Prioridad:** Media  
**Esfuerzo:** 3 horas  
**Etiquetas:** frontend, component, reports

---

#### **TICKET-184: Implementar selector de campos múltiples**

**Título:** Implementar selector de campos múltiples

**Descripción:**
Crear componente para selección múltiple de campos del reporte.

**Criterios de Aceptación:**
- ✅ Lista de campos disponibles agrupados
- ✅ Checkboxes para seleccionar/deseleccionar
- ✅ "Seleccionar todos" por grupo
- ✅ Contador de campos seleccionados
- ✅ Orden de campos personalizable (drag & drop)
- ✅ Campos obligatorios siempre seleccionados
- ✅ Vista previa de columnas

**Prioridad:** Baja  
**Esfuerzo:** 2.5 horas  
**Etiquetas:** frontend, component, reports

---

#### **TICKET-185: Crear componente de gestión de configuraciones de reportes**

**Título:** Crear componente de gestión de configuraciones de reportes

**Descripción:**
Crear UI para guardar, cargar y gestionar configuraciones de reportes.

**Criterios de Aceptación:**
- ✅ Botón "Guardar configuración"
- ✅ Diálogo para nombre y descripción
- ✅ Lista de configuraciones guardadas
- ✅ Carga rápida de configuración
- ✅ Edición de configuraciones
- ✅ Eliminación de configuraciones
- ✅ Indicador de configuración activa

**Prioridad:** Baja  
**Esfuerzo:** 2 horas  
**Etiquetas:** frontend, component, reports, configuration

---

---

## 📋 US-005: Auditoría y Supervisión de Operaciones del Sistema

### 📊 Módulo: Auditoría y Reportes (Backend)

---

#### **TICKET-186: Crear endpoint para consulta de logs de auditoría**

**Título:** Crear endpoint para consulta de logs de auditoría

**Descripción:**
Implementar endpoint con filtros avanzados para consultar logs de auditoría.

**Criterios de Aceptación:**
- ✅ GET /audit/logs - Listar logs (paginado)
- ✅ Filtros: módulo, acción, usuario, fecha_desde, fecha_hasta, entidad, entidad_id, ip
- ✅ Búsqueda full-text en metadatos
- ✅ Ordenamiento por fecha descendente
- ✅ Paginación eficiente (cursor-based)
- ✅ Índices optimizados
- ✅ Response time < 2 segundos
- ✅ Solo usuarios con permisos de auditoría

**Prioridad:** Alta  
**Esfuerzo:** 3 horas  
**Etiquetas:** backend, endpoint, audit

---

#### **TICKET-187: Crear endpoint para obtener log específico**

**Título:** Crear endpoint para obtener log específico

**Descripción:**
Endpoint para ver detalles completos de un log de auditoría.

**Criterios de Aceptación:**
- ✅ GET /audit/logs/:id
- ✅ Retorna log completo con todos los metadatos
- ✅ Incluye datos_anteriores y datos_nuevos formateados
- ✅ Incluye información del usuario que realizó la acción
- ✅ Diff visual entre datos anteriores y nuevos
- ✅ Solo usuarios con permisos de auditoría

**Prioridad:** Media  
**Esfuerzo:** 1.5 horas  
**Etiquetas:** backend, endpoint, audit

---

#### **TICKET-188: Crear endpoint de estadísticas de auditoría**

**Título:** Crear endpoint de estadísticas de auditoría

**Descripción:**
Crear endpoint que retorne estadísticas y métricas de auditoría.

**Criterios de Aceptación:**
- ✅ GET /audit/stats
- ✅ Filtros de rango de fechas
- ✅ Estadísticas:
  - Total de eventos por módulo
  - Total de eventos por acción
  - Total de eventos por usuario
  - Eventos críticos
  - Intentos de acceso fallidos
- ✅ Gráficas de actividad por hora/día
- ✅ Top usuarios más activos
- ✅ Caché de 5 minutos

**Prioridad:** Media  
**Esfuerzo:** 2.5 horas  
**Etiquetas:** backend, endpoint, audit, stats

---

#### **TICKET-189: Crear endpoint para exportar logs de auditoría**

**Título:** Crear endpoint para exportar logs de auditoría

**Descripción:**
Endpoint para exportar logs de auditoría a Excel con filtros aplicados.

**Criterios de Aceptación:**
- ✅ POST /audit/logs/export
- ✅ Respeta filtros aplicados
- ✅ Formato Excel con múltiples hojas si necesario
- ✅ Incluye resumen de filtros aplicados
- ✅ Límite de 50,000 registros
- ✅ Generación asíncrona
- ✅ Notificación cuando está listo (opcional)

**Prioridad:** Baja  
**Esfuerzo:** 2.5 horas  
**Etiquetas:** backend, export, audit

---

#### **TICKET-190: Implementar proceso de limpieza de logs antiguos**

**Título:** Implementar proceso de limpieza de logs antiguos

**Descripción:**
Crear job programado para archivar o eliminar logs de auditoría muy antiguos.

**Criterios de Aceptación:**
- ✅ Job ejecutado mensualmente
- ✅ Archiva logs mayores a N meses (configurable, default: 24)
- ✅ Opción de eliminar vs archivar
- ✅ Logs críticos nunca se eliminan (solo archivan)
- ✅ Backup antes de eliminar
- ✅ Logging de proceso de limpieza
- ✅ Configuración de retención por tipo de evento

**Prioridad:** Baja  
**Esfuerzo:** 2.5 horas  
**Etiquetas:** backend, batch, maintenance, audit

---

### 🖥️ Módulo: Frontend - Auditoría

---

#### **TICKET-191: Crear módulo de auditoría en Angular**

**Título:** Crear módulo de auditoría en Angular

**Descripción:**
Crear módulo para visualización y consulta de logs de auditoría.

**Criterios de Aceptación:**
- ✅ Módulo AuditModule con lazy loading
- ✅ Routing configurado (/audit)
- ✅ Estructura de componentes (logs-list, log-detail, stats)
- ✅ Servicio AuditService
- ✅ Modelos TypeScript

**Prioridad:** Media  
**Esfuerzo:** 2 horas  
**Etiquetas:** frontend, angular, module, audit

---

#### **TICKET-192: Crear servicio AuditService en Angular**

**Título:** Crear servicio AuditService en Angular

**Descripción:**
Implementar servicio para consumir API de auditoría.

**Criterios de Aceptación:**
- ✅ Método getLogs(filters) con paginación
- ✅ Método getLogDetail(id)
- ✅ Método getStats(dateRange)
- ✅ Método exportLogs(filters)
- ✅ Observables para reactividad
- ✅ Manejo de errores

**Prioridad:** Media  
**Esfuerzo:** 2 horas  
**Etiquetas:** frontend, service, audit

---

#### **TICKET-193: Crear componente AuditLogsListComponent**

**Título:** Crear componente AuditLogsListComponent

**Descripción:**
Crear componente para listar logs de auditoría con filtros avanzados.

**Criterios de Aceptación:**
- ✅ Tabla de logs con columnas esenciales
- ✅ Filtros avanzados (módulo, acción, usuario, fechas, entidad)
- ✅ Búsqueda full-text
- ✅ Paginación del lado del servidor
- ✅ Ordenamiento por columnas
- ✅ Click en fila muestra detalles
- ✅ Botón exportar
- ✅ Indicadores visuales por tipo de acción
- ✅ Filtros colapsables

**Prioridad:** Alta  
**Esfuerzo:** 3 horas  
**Etiquetas:** frontend, component, table, audit

---

#### **TICKET-194: Crear componente AuditLogDetailComponent**

**Título:** Crear componente AuditLogDetailComponent

**Descripción:**
Crear componente para visualizar detalles completos de un log.

**Criterios de Aceptación:**
- ✅ Vista detallada de log de auditoría
- ✅ Información del usuario y timestamp
- ✅ IP de origen
- ✅ Módulo, acción y entidad afectada
- ✅ Visualización de datos anteriores y nuevos
- ✅ Diff visual entre cambios (si aplica)
- ✅ Metadatos adicionales en formato legible
- ✅ Puede ser modal o página

**Prioridad:** Media  
**Esfuerzo:** 2.5 horas  
**Etiquetas:** frontend, component, audit

---

#### **TICKET-195: Crear componente DiffViewerComponent**

**Título:** Crear componente DiffViewerComponent

**Descripción:**
Crear componente para visualizar diferencias entre estados anterior y nuevo.

**Criterios de Aceptación:**
- ✅ Visualización lado a lado o unificada
- ✅ Highlighting de cambios (agregado, eliminado, modificado)
- ✅ Formato JSON con pretty print
- ✅ Expand/collapse de objetos anidados
- ✅ Colores diferenciados (verde=agregado, rojo=eliminado, amarillo=modificado)
- ✅ Reutilizable para cualquier objeto

**Prioridad:** Baja  
**Esfuerzo:** 2.5 horas  
**Etiquetas:** frontend, component, diff, reusable

---

#### **TICKET-196: Crear componente AuditStatsComponent**

**Título:** Crear componente AuditStatsComponent

**Descripción:**
Crear dashboard con estadísticas de auditoría.

**Criterios de Aceptación:**
- ✅ Cards con métricas principales
- ✅ Gráfica de actividad por tiempo (línea)
- ✅ Gráfica de eventos por módulo (barras)
- ✅ Gráfica de eventos por acción (pie)
- ✅ Lista de top usuarios más activos
- ✅ Filtro de rango de fechas
- ✅ Actualización automática (opcional)
- ✅ Integración con librería de charts (Chart.js, Highcharts)

**Prioridad:** Baja  
**Esfuerzo:** 3 horas  
**Etiquetas:** frontend, component, stats, charts

---

#### **TICKET-197: Implementar visualización de intentos fallidos de acceso**

**Título:** Implementar visualización de intentos fallidos de acceso

**Descripción:**
Crear vista especializada para monitoreo de seguridad con intentos fallidos.

**Criterios de Aceptación:**
- ✅ Filtro automático a eventos de login fallido
- ✅ Tabla con: usuario, IP, fecha/hora, motivo
- ✅ Agrupación por usuario o IP
- ✅ Alerta visual si hay muchos intentos de misma IP
- ✅ Acciones: bloquear IP, bloquear usuario
- ✅ Exportación de reporte de seguridad

**Prioridad:** Media  
**Esfuerzo:** 2.5 horas  
**Etiquetas:** frontend, component, security, audit

---

#### **TICKET-198: Crear componente de filtros de auditoría avanzados**

**Título:** Crear componente de filtros de auditoría avanzados

**Descripción:**
Crear panel de filtros avanzados para logs de auditoría.

**Criterios de Aceptación:**
- ✅ Filtros: módulo, acción, usuario, rango de fechas, entidad, IP
- ✅ Autocompletado en selectores
- ✅ Date range picker
- ✅ Búsqueda full-text
- ✅ Guardado de filtros favoritos
- ✅ Limpieza rápida de filtros
- ✅ Contador de resultados

**Prioridad:** Media  
**Esfuerzo:** 2 horas  
**Etiquetas:** frontend, component, filters, audit

---

---

## 🧪 Módulo: Testing y Calidad

---

#### **TICKET-199: Crear suite de tests E2E para flujo completo de cliente**

**Título:** Crear suite de tests E2E para flujo completo de cliente

**Descripción:**
Crear tests end-to-end que validen el flujo completo de creación y gestión de cliente.

**Criterios de Aceptación:**
- ✅ Test: Login como oficial de crédito
- ✅ Test: Búsqueda de cliente existente
- ✅ Test: Creación de cliente nuevo con persona nueva
- ✅ Test: Creación de cliente con persona existente
- ✅ Test: Agregar mensaje a cliente
- ✅ Test: Agregar apoderado
- ✅ Test: Registrar poder con documento PDF
- ✅ Test: Cambio de estado de cliente
- ✅ Test: Generación de reporte
- ✅ Uso de Cypress o Playwright

**Prioridad:** Media  
**Esfuerzo:** 3 horas  
**Etiquetas:** testing, e2e, clientes

---

#### **TICKET-200: Documentar APIs con Swagger/OpenAPI**

**Título:** Documentar APIs con Swagger/OpenAPI

**Descripción:**
Completar documentación de todos los endpoints con Swagger/OpenAPI.

**Criterios de Aceptación:**
- ✅ Decoradores de NestJS Swagger en todos los controladores
- ✅ DTOs documentados con ApiProperty
- ✅ Ejemplos de requests y responses
- ✅ Códigos de error documentados
- ✅ Documentación de autenticación (JWT)
- ✅ Agrupación por módulos
- ✅ UI de Swagger accesible en /api/docs
- ✅ Exportación a archivo OpenAPI 3.0

**Prioridad:** Media  
**Esfuerzo:** 3 horas  
**Etiquetas:** documentation, swagger, api

---

## 📊 RESUMEN DEL BLOQUE 4

**Tickets Generados:** 151 - 200 (50 tickets)  
**Esfuerzo Total:** ~120 horas (~3 semanas)

### Distribución por Categoría:
- 🖥️ Frontend - Clientes: 20 tickets (50 horas)
- 🔍 Backend - Búsqueda y Consulta: 9 tickets (21.5 horas)
- 🖥️ Frontend - Búsqueda y Consulta: 6 tickets (14.5 horas)
- 📊 Backend - Auditoría: 5 tickets (11 horas)
- 🖥️ Frontend - Auditoría: 8 tickets (19 horas)
- 🧪 Testing y Documentación: 2 tickets (6 horas)

### Estado:
✅ **Bloque 4 completado** - Completa US-003 (Frontend), avanza US-004 y US-005

---

## 🎯 Resumen de Progreso Total

**Tickets Completados:** 200 de ~427  
**Esfuerzo Acumulado:** ~480 horas (~12 semanas / 3 meses)

### User Stories Completadas:
- ✅ **US-001:** 100% - Configuración y Administración Global
- ✅ **US-002:** 100% - Gestión de Usuarios y Roles
- ✅ **US-003:** 100% - Gestión de Clientes, Apoderados y Poderes
- 🔄 **US-004:** 70% - Consulta de Clientes
- 🔄 **US-005:** 60% - Auditoría y Supervisión

### Bloques Restantes:
**Faltan aproximadamente 227 tickets** distribuidos en:
- Bloque 5: Tickets 201-250 (Finalización US-004 y US-005)
- Bloque 6-9: Tests, documentación, optimizaciones, bugs y ajustes finales

---

## 🎉 Hito Importante Alcanzado

✨ **¡Se han completado las 3 User Stories principales!** ✨

El sistema ya tiene la funcionalidad core operativa:
- 🔐 Autenticación y seguridad
- 👥 Gestión completa de usuarios
- 🧑‍💼 Gestión completa de clientes con apoderados y poderes
- 📊 Búsqueda y consulta de clientes
- 📋 Auditoría completa del sistema

---

## 🔄 ¿Continuar con el Bloque 5?

El **Bloque 5 (Tickets 201-250)** incluirá:
- Finalización de funcionalidades secundarias
- Optimizaciones de performance
- Tests adicionales
- Documentación de usuario
- Bugs y ajustes finales

**¿Deseas que continúe generando el Bloque 5?**

---

**Fecha de Generación:** 17 de Diciembre de 2025  
**Bloque:** 4 de 9
