# 📸 Instrucciones para Exportar los Diagramas como Imagen

## ✅ Archivo HTML Creado

He creado el archivo **`canvas-diagrama.html`** que contiene todos los diagramas principales renderizados visualmente.

## 🚀 Método 1: Abrir en Navegador (Recomendado)

1. **Abre el archivo HTML:**
   - Navega a la carpeta del proyecto
   - Haz doble clic en `canvas-diagrama.html`
   - O arrastra el archivo a tu navegador (Chrome, Firefox, Safari, Edge)

2. **Exportar como imagen:**
   - **Opción A - Captura de pantalla:**
     - macOS: `Cmd + Shift + 4` (selecciona el área del diagrama)
     - Windows: `Win + Shift + S` (herramienta de recorte)
     - Linux: `Print Screen` o herramientas de captura
   
   - **Opción B - Guardar desde navegador:**
     - Haz clic derecho sobre el diagrama
     - Selecciona "Guardar imagen como..." o "Copiar imagen"
     - Guarda en formato PNG o JPG

3. **Para mejor calidad:**
   - Haz zoom en el navegador antes de capturar (Cmd/Ctrl +)
   - Usa modo de pantalla completa (F11)

## 🛠️ Método 2: Usando Herramientas de Línea de Comandos

### Opción A: Usando Puppeteer (Node.js)

Si tienes Node.js instalado, puedes usar este script:

```bash
npm install puppeteer
node export-diagram.js
```

### Opción B: Usando Python con Selenium

```bash
pip install selenium
python export-diagram.py
```

## 📋 Método 3: Usando Mermaid CLI (Requerido: Node.js)

Si puedes instalar `@mermaid-js/mermaid-cli`:

```bash
# Instalar globalmente (requiere permisos)
npm install -g @mermaid-js/mermaid-cli

# O localmente
npm install --save-dev @mermaid-js/mermaid-cli

# Generar imagen desde archivo .mmd
mmdc -i diagrama.mmd -o diagrama.png -w 2000 -H 1500
```

## 🎨 Método 4: Usando Herramientas Online

1. Ve a [Mermaid Live Editor](https://mermaid.live/)
2. Copia el código del diagrama desde `canvas-proceso-quirurgico.md`
3. Pega en el editor
4. Haz clic en "Actions" → "Download PNG" o "Download SVG"

## 📁 Archivos Disponibles

- **`canvas-diagrama.html`** - Archivo HTML con todos los diagramas renderizados
- **`canvas-proceso-quirurgico.md`** - Documentación completa con código Mermaid
- **`canvas-resumen-ejecutivo.md`** - Resumen ejecutivo con diagramas

## 💡 Consejos Adicionales

- **Para presentaciones:** Usa formato PNG con alta resolución
- **Para documentos:** SVG es mejor para escalabilidad
- **Para web:** Puedes usar el HTML directamente o exportar como imagen
- **Colores:** Los diagramas usan colores específicos por área (ver leyenda en el HTML)

## 🎯 Diagramas Incluidos

1. **Diagrama Principal del Proceso Completo** - Flujo completo de inicio a fin
2. **Canvas Visual - Vista de Matriz** - Matriz por fases del proceso
3. **Diagrama de Interacción entre Áreas** - Cómo se conectan las 3 áreas principales

## ⚡ Solución Rápida

La forma más rápida es:
1. Abrir `canvas-diagrama.html` en tu navegador
2. Hacer zoom (Cmd/Ctrl +)
3. Capturar pantalla del diagrama deseado
4. Guardar como PNG

¡Listo! 🎉
