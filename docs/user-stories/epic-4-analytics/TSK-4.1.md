# TSK-4.1: Exportación de Reportes de Ticket a PDF Corporativo

- **Historia de Usuario Relacionada:** [US-13: Exportaciones Financieras Avanzadas (Excel/PDF)](US-13.md)
- **Épica:** Epic 4: Analytics and Paid Features
- **Capa:** Frontend (Export Utility)
- **Complejidad:** 3 SP
- **Dependencias:** TSK-1.6

## 1. Descripción de la Tarea
Crear el servicio cliente de generación y descarga de informes detallados en formato PDF. El informe debe incluir el nombre del restaurante, desglose de IVA, lista de platos divididos por participante, el total de redondeo y propina aplicada.

## 2. Detalles de Implementación
1. **Lógica de Generación de PDF:**
   * Utilizar una librería ligera cliente (como `jsPDF` y `jspdf-autotable`).
   * Crear `src/utils/pdfGenerator.ts`.
   * Implementar `downloadTicketPDF(ticket: Ticket, items: TicketItem[], participants: Participant[]): void`.
2. **Diseño Visual:**
   * Aplicar la paleta de colores y branding de SplitEat al PDF.
   * Maquetar una tabla limpia donde se listen las personas en las columnas o filas y los platos que han consumido, con los precios desglosados y sumas parciales.

## 3. Criterios de Aceptación y Pruebas (DoD)
* Fichero de test en `pdfGenerator.test.ts` (con mocks del canvas/document si es necesario) que verifique la llamada de construcción de tablas y el método `.save()`.
* Probar que el archivo PDF resultante se descarga correctamente en dispositivos móviles (Safari en iOS y Chrome en Android) abriéndose en sus respectivos visores nativos.
