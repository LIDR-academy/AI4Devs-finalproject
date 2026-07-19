# Issue-008: Portfolio images are incorrect (animals, cars, random photos)

**Fecha:** 2026-07-18  
**Contexto:** Las imágenes del catálogo de tatuajes (`TattooImageCatalog.cs`) incluyen fotos de animales, autos y contenido no relacionado con tatuajes. El fallback a `picsum.photos` genera imágenes aleatorias. Las imágenes deben coincidir con las del prototipo Figma.  
**Estado:** 🔧 En progreso

---

## Problema

- `TattooImageCatalog.cs` usa URLs de Wikimedia/Flickr poco confiables (algunas muestran contenido incorrecto)
- El fallback `picsum.photos/seed/{style}-{index}/800/1000` genera fotos aleatorias (paisajes, comida, etc.)
- No hay alineación entre las imágenes del seed y el diseño Figma

## Comportamiento esperado

- Todas las imágenes de portfolio deben mostrar tatuajes reales
- Las imágenes deben coincidir con el estilo del artista
- No deben repetirse entre artistas diferentes
- Deben coincidir con la calidad visual del prototipo Figma (Unsplash)

## Solución

1. Extraer todos los IDs de imágenes Unsplash usados por Figma (`App.tsx`)
2. Crear `fixs/figma-images.yml` como fuente única de verdad para imágenes del diseño
3. Reemplazar URLs en `TattooImageCatalog.cs` con imágenes Unsplash de Figma
4. Actualizar `DatabaseSeeder.cs` para usar el nuevo catálogo
5. Re-seedear la base de datos

## Archivos a modificar

- `fixs/figma-images.yml` — nuevo, referencia de imágenes del diseño
- `backend/Seed/TattooImageCatalog.cs` — reemplazar todas las URLs
- `backend/Seed/DatabaseSeeder.cs` — verificar lógica de offset
- Posible: mocks del frontend si usan URLs hardcodeadas

## Relacionado

- fix-001 (fix previo parcial para overlap de imágenes)
