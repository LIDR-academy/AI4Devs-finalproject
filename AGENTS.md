# AGENTS.md

## Proyecto
My Tree Library es una aplicación web colaborativa para registrar, localizar y compartir árboles de tu ciudad.

## Objetivo funcional
Permitir a colaboradores registrar árboles con:
- datos descriptivos
- fotografías
- ubicación geográfica
- publicación pública

También debe permitir:
- consulta pública sin login
- suscripción a notificaciones
- identificación orientativa mediante IA
- chat asistido por IA

## Stack principal
- Backend: Spring Boot 4
- Frontend: Vue 3
- Arquitectura: microservicios
- API: REST
- Persistencia: base de datos relacional y Mongo

## Prioridades del MVP
1. Registro y publicación de árboles
2. Consulta pública con mapa
3. Notificaciones a usuarios suscritos
4. IA para identificación orientativa

## Criterios generales
- No exponer entidades JPA directamente en la API.
- Priorizar claridad, mantenibilidad y separación de responsabilidades.
- Proponer código pequeño, modular y bien nombrado.
- Añadir validación, manejo de errores y pruebas básicas en código nuevo.
- Mantener el enfoque del producto: hobby, comunidad y memoria de árboles singulares.

## Reglas de generación
- Antes de crear código nuevo, revisar si ya existe una pieza reutilizable.
- Si una clase o componente crece demasiado, proponer división.
- Si hay una decisión de diseño ambigua, escoger la opción más simple compatible con el MVP.

## Reglas de nomenclatura e idioma del proyecto
- El idioma del proyecto es el español, la documentación se generará en este idioma
- El nombre de los archivos de documentación generados será en INGLÉS, por coherencia con nomenclatura heredada (readme)
- El nombre de las columnas en Base de datos será en español
