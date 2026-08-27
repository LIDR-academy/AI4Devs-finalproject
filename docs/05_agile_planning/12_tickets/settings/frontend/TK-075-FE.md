---
ticket: TK-075-FE
title: Frontend — System Settings & Restaurant Identity UI
epic: Configuración de Sistema
user_story: US-017
status: BACKLOG
---

# 🎟️ Ticket Técnico: TK-075-FE — Frontend System Settings UI

## 🎯 Objetivo
Desarrollar el servicio `SettingsService`, la vista/modal de **Configuración General del Restaurante** (`RestaurantSettingsModal.tsx`) y actualizar dinámicamente el header principal de la aplicación con el nombre y la moneda del restaurante.

---

## 🛠️ Tareas Técnicas
1. Crear `SettingsService` en `src/features/settings/services/settings.service.ts`.
2. Crear `RestaurantSettingsModal.tsx` con formulario táctil para editar el nombre del restaurante, moneda, umbral de horas de alerta crítica y vida útil estándar.
3. Actualizar la cabecera principal en `App.tsx` para reflejar dinámicamente el nombre guardado.

---

## 🧪 Plan de Pruebas
- Pruebas unitarias de renderizado para `RestaurantSettingsModal.test.tsx`.
- Verificación de reflejo dinámico en el header.
