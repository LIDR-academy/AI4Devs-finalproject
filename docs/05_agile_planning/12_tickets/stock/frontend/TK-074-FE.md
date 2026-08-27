---
ticket: TK-074-FE
title: Frontend — Dynamic Storage Locations Selector & Management UI
epic: Inventario y Bodega
user_story: US-016
status: BACKLOG
---

# 🎟️ Ticket Técnico: TK-074-FE — Frontend Storage Locations UI

## 🎯 Objetivo
Desarrollar el servicio `LocationsService`, la pantalla/modal de gestión de sectores físicos de almacenamiento y conectar los desplegables del modal de extracción y restock para consumir ubicaciones dinámicas desde el backend.

---

## 🛠️ Tareas Técnicas
1. Crear `LocationsService` en `src/features/stock/services/locations.service.ts`.
2. Crear `LocationsManagementModal.tsx` para alta y edición de sectores físicos.
3. Actualizar `WarehouseExtractionModal.tsx` para cargar dinámicamente los sectores de bodega y cocina en los elementos `<select>`.

---

## 🧪 Plan de Pruebas
- Pruebas unitarias de renderizado para `LocationsManagementModal.test.tsx`.
- Verificación de carga dinámica de sectores en modales.
