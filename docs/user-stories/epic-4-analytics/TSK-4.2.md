# TSK-4.2: Exportador de Histórico Mensual a Hoja de Cálculo Excel (.xlsx)

- **Historia de Usuario Relacionada:** [US-13: Exportaciones Financieras Avanzadas (Excel/PDF)](US-13.md)
- **Épica:** Epic 4: Analytics and Paid Features
- **Capa:** Frontend (Export Utility)
- **Complejidad:** 2 SP
- **Dependencias:** TSK-1.2, TSK-3.4

## 1. Descripción de la Tarea
Implementar la utilidad de exportación mensual de gastos a una hoja de cálculo en formato Excel o archivo CSV compatible para usuarios Premium. Agrupará la información cronológicamente con fórmulas automáticas para subtotales.

## 2. Detalles de Implementación
1. **Generación del Archivo:**
   * Crear `src/utils/excelExporter.ts`.
   * Utilizar una librería compacta de manipulación de hojas de cálculo (ej. `xlsx` en npm).
   * Implementar `exportHistoryToExcel(tickets: Ticket[]): void`.
2. **Estructura de Columnas:**
   * Definir hojas ordenadas: columna A para Fecha, B para Nombre del Restaurante, C para Subtotal, D para Impuestos, E para Propina y F para Total.
   * Añadir una fila final de sumatorio automático (`=SUM(C2:C100)`).

## 3. Criterios de Aceptación y Pruebas (DoD)
* Fichero de test `src/utils/excelExporter.test.ts` que valide la conversión correcta del array de tickets en una estructura tabular coherente de filas y columnas.
* Confirmar compatibilidad al abrir el archivo exportado en herramientas de hojas de cálculo comunes (Microsoft Excel, Google Sheets y Numbers de Apple).
