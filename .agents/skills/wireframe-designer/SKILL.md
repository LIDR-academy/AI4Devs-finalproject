---
name: wireframe-designer
description: "Trigger: wireframe, mockup, prototipo, UI prototype, navigable design, interactivo, autocontenido. Diseña y genera wireframes y prototipos interactivos autocontenidos (HTML/JS/Tailwind) para validar evolutivos de manera rápida."
license: Apache-2.0
metadata:
  author: bytelovers
  version: "1.0"
---

# wireframe-designer

```sudolang
/**
 * @agent wireframe-designer
 * @version 1.0
 * @description Diseña y genera wireframes y prototipos interactivos autocontenidos (HTML/JS/Tailwind) para validar evolutivos de manera rápida.
 */
WireframeDesigner {
  // Activation Contract
  onTrigger: ["wireframe", "mockup", "prototipo", "UI prototype", "navigable design", "interactivo", "autocontenido"]

  // Hard Rules / Constraints
  constraints: [
    "Generar un único archivo HTML autocontenido con CSS, JS y dependencias por CDN (como Tailwind y FontAwesome).",
    "Estilo consciente del contexto: leer directrices de la carpeta `.ai/` o contexto activo. Si no está definido, usar Tailwind por defecto.",
    "Interactividad completa: botones, menús, modales y navegación deben tener event handlers en Vanilla JS simulando estados de pantalla.",
    "Preparado para verificación: incluir selectores de ID únicos y claros en el DOM para pruebas automáticas con browser_subagent."
  ]

  // Decision Gates
  resolveStylingAndDestination(context) {
    if (context.hasWorkspaceGuidelines) {
      return { preset: context.workspacePreset, path: `.ai/wireframes/${context.name}.html` }
    } else if (context.hasAiDirSpecs) {
      return { preset: context.specsPreset, path: `.ai/wireframes/${context.name}.html` }
    } else {
      askUser("¿Qué stack y estilos prefieres para este wireframe?")
      return { preset: "tailwind_cdn", path: `artifacts/wireframes/${context.name}.html` }
    }
  }

  // Execution Steps
  execute(task) {
    // 1. Analizar el contexto y extraer los flujos, pantallas y componentes necesarios.
    analyzeContext(task)

    // 2. Resolver configuración de diseño y ruta de destino.
    config = resolveStylingAndDestination(task.context)

    // 3. Diseñar la estructura HTML semántica y responsive.
    htmlStructure = createSemanticHTML()

    // 4. Inyectar estilos modernos y componentes interactivos usando el preset.
    styledHtml = injectStyles(htmlStructure, config.preset)

    // 5. Escribir lógica de interacción JS (transiciones de pantalla, modales, menú mobile).
    finalMockup = injectInteractivity(styledHtml)

    // 6. Guardar archivo final en la ruta resuelta.
    saveFile(config.path, finalMockup)

    // 7. Si se requiere validación interactiva, ejecutar browser_subagent.
    if (task.verifyWithBrowser) {
      verifyWithBrowserSubagent(config.path)
    }

    return deliver(finalMockup, config.path)
  }

  // Output Contract
  deliver(mockup, path) {
    return {
      status: "success",
      filePath: path,
      summary: "Resumen visual del flujo diseñado, pantallas e interacciones simuladas.",
      verificationReport: "Resultado de las pruebas de navegación si fueron ejecutadas."
    }
  }

  // References
  references: [
    "Carpeta `.ai/`: Contiene especificaciones de flujos de usuario y diseño.",
    "AGENTS.md: Registro de skills del proyecto para la coordinación de dependencias."
  ]
}
```
