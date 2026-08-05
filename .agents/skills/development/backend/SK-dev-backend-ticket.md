---
name: dev-backend-ticket
description: "Lee un ticket técnico de Backend y genera el código correspondiente respetando el diseño de arquitectura y las reglas de gobernanza técnica del proyecto."
version: "2.0.0"
category: "development/backend"
inputs:
  - ticket_path: "Ruta del ticket técnico de backend"
outputs:
  - "Código generado e implementado conforme a la especificación del ticket"
  - "Pruebas unitarias/integración verdes assertando los requerimientos"
---

Actúa como un Senior Backend Developer. Tu objetivo es implementar la funcionalidad requerida en el ticket técnico especificado en `ticket_path`.

Sigue estrictamente este flujo de trabajo secuencial para garantizar el cumplimiento de los estándares del repositorio:

---

## 🔍 FASE 1: Descubrimiento de Reglas y Arquitectura
Antes de generar código, debes mapear el entorno dinámicamente:
1. **Analizar el Ticket:** Lee detalladamente el archivo en `{ticket_path}` y comprende sus criterios de aceptación y Definition of Done (DoD).
2. **Descubrir Reglas del Workspace:** Busca y lee las directivas de desarrollo del repositorio (ubicadas en directorios como `.agents/rules/` o similares). Identifica los límites de dependencias de capas, reglas de bases de datos y estrategias de testing.
3. **Mapear el Stack y Estructura:** Consulta la documentación de arquitectura del proyecto (PRD, diseño de sistemas o `README.md`) y examina el código existente para deducir:
   - El lenguaje de programación y la arquitectura aplicada (ej. Hexagonal, Clean, MVC).
   - El framework de base de datos/ORM y las librerías de validación de datos activas.
   - La estructura de directorios y convenciones de nombres del proyecto.

---

## 🧪 FASE 2: Diseño de Pruebas (Test-Driven Development)
1. **Identificar la Estrategia de Mocks/Fakes:** De acuerdo con las reglas de testing del repositorio, determina si debes utilizar simuladores en memoria (Fakes), mocks de librerías o bases de datos de prueba.
2. **Escribir el Test (Fase RED):** Diseña y escribe la prueba unitaria o de integración correspondiente a la lógica descrita en el ticket antes de escribir la implementación. Asegúrate de que el test falle por los motivos correctos.

---

## 💻 FASE 3: Implementación de Código
Implementa la lógica de negocio y los adaptadores de infraestructura siguiendo el flujo de dependencias de la arquitectura descubierta en la Fase 1:
1. **Lógica de Negocio/Núcleo:** Escribe las entidades, reglas de negocio e interfaces/puertos asegurando cero acoplamiento con frameworks externos.
2. **Lógica de Aplicación/Casos de Uso:** Implementa los flujos de control y orquestación. Pon las pruebas unitarias en **VERDE (GREEN)**.
3. **Adaptadores de Infraestructura:** Implementa los controladores de API, serializadores, validadores de entrada y adaptadores de persistencia requeridos en el ticket utilizando el stack del proyecto.

---

## 🚨 FASE 4: Verificación y Calidad
1. **Compilación:** Ejecuta el comando de compilación/verificación del proyecto (ej. los scripts definidos en `package.json`) para asegurar que no se introducen errores de tipado.
2. **Análisis Estático:** Ejecuta el linter o formateador del proyecto para cumplir con los estándares de estilo del equipo.
3. **Resultados:** Presenta los archivos creados o modificados y confirma el estado exitoso de la suite de pruebas.
