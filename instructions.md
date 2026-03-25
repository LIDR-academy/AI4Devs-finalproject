# 🧑🏻‍💻 Instrucciones Proyecto Final

## Explicación del Proyecto Final

### Descripción

#### Propósito

Desarrollar un producto de software end-to-end (E2E) que cubra todo el ciclo de vida —de la idea al despliegue— apoyándose en IA en todas las fases y con criterio humano para revisar, corregir y elevar la calidad.

#### Alcance del MVP

* **Dominio libre:** (ideal: cercano a tu trabajo o uno nuevo para aprender). Ejemplos: e-commerce tipo Zalando, neobanco tipo Revolut, transporte tipo Uber, marketplace tipo Amazon o alojamientos tipo Airbnb.
* Define un flujo E2E prioritario que cree valor completo.
* Planifica 3–5 historias Must-Have y 1–2 Should-Have opcionales para ese flujo.

### Artefactos a producir

* Documentación de producto: objetivo, características y funcionalidades.
* Historias de usuario y tickets de trabajo con criterios de aceptación y trazabilidad.
* Arquitectura y modelo de datos.
* Backend con acceso a base de datos.
* Frontend que implemente el flujo E2E usable.
* Suite de tests: unitarios, integración y al menos un test E2E del flujo principal.
* Infra y despliegue: pipeline básico CI/CD, gestión de secretos, URL pública accesible.
* Registro del uso de IA: prompts clave, herramientas usadas, comparativas antes/después y qué ajustes humanos hiciste.

> Los artefactos se desarrollarán y completarán progresivamente a lo largo de las tres entregas del proyecto.

### Libertad tecnológica

Puedes usar el lenguaje y stack que domines mejor:

* **Ejemplos:** JavaScript/TypeScript, Java, PHP, Python, Ruby, etc.
* **Frameworks y librerías:** quedan a tu elección, siempre que el resultado sea:
  * Ejecutable.
  * Comprensible.
  * Razonablemente documentado.

---

## Formato de trabajo y entrega

### Completar la plantilla de trabajo (repo AI4Devs-finalproject)

En el repositorio AI4Devs-finalproject deberás rellenar:

#### El archivo readme.md

Con la ficha del proyecto, descripción general del producto, arquitectura, modelo de datos, API, historias de usuario, tickets de trabajo y pull requests, siguiendo la estructura que ya viene en la plantilla.

#### El archivo prompts.md

Aquí debes documentar los prompts más relevantes que utilizaste durante la creación del proyecto. Para cada sección (producto, arquitectura, modelo de datos, API, etc.), incluye:

* Hasta 3 prompts clave.
* Una breve nota de cómo guiaste al asistente de código o LLM.
* Opcional: enlace o referencia a la conversación completa si lo consideras útil.

### Repositorio de código

El código debe estar alojado en un repositorio accesible:

* Puede ser público o privado.
* Si es privado, debes dar acceso a tu TA (por GitHub handle o correo).
* El proyecto debe estar desplegado en un entorno ejecutable, de forma que se pueda:
  * Probar el flujo principal.
  * Ver el sistema “en vivo” (aunque sea un entorno de pruebas).

### Trabajo mediante Pull Requests

Durante el desarrollo:

* Realiza los cambios mediante pull requests.
* Asegúrate de que cada PR:
  * Tiene un título claro.
  * Incluye una descripción detallada (qué cambia, por qué, impacto).
  * Hace referencia a la historia de usuario o ticket correspondiente cuando aplique.

---

## Ramas, pull requests y formulario de entrega

### Entrega 1 – Documentación técnica

Trabaja en una rama de feature, por ejemplo: `feature-entrega1-[iniciales]` (Ej.: `feature-entrega1-JLPT`).

**Entrega oficial:**
Rellena el formulario [https://lidr.typeform.com/proyectoai4devs](https://lidr.typeform.com/proyectoai4devs) e incluye la URL del pull request de la Entrega 1.

### Entrega 2 – Código funcional (primer MVP ejecutable)

Continúa sobre la base de tu repo y crea otra rama de feature, por ejemplo: `feature-entrega2-[iniciales]` (Ej.: `feature-entrega2-JLPT`).

**Entrega oficial:**
Vuelve a rellenar el formulario [https://lidr.typeform.com/proyectoai4devs](https://lidr.typeform.com/proyectoai4devs) e incluye la URL del pull request de la Entrega 2.

### Para la entrega definitiva

Crea una rama final con el siguiente formato: `finalproject-[iniciales]` (Ej.: `finalproject-JLPT`).

En esa rama deben estar:

* **Plantilla completa:** `readme.md` y `prompts.md`.
* **Código funcional.**
* **Evidencia de despliegue:** Link al entorno público, y/o instrucciones claras o capturas del sistema funcionando.
* **(Opcional, pero recomendado) Etiqueta de release:** `v1.0-final-[iniciales]`.

**Envío del proyecto:**
Sube la URL de la rama final en el formulario: [https://lidr.typeform.com/proyectoai4devs](https://lidr.typeform.com/proyectoai4devs)

---

## Fechas de las entregas parciales

* **Documentación técnica:** Entrega de la idea, estructura y diseño del proyecto, con la mayor parte de la plantilla avanzada (producto, arquitectura, modelo de datos, historias).
  * **Viernes 6 de febrero**
* **Código funcional:** Backend, frontend y base de datos ya conectados, con el flujo principal “casi” completo.
  * **Viernes 6 de marzo**
* **Entrega final:** Versión completa y desplegada del proyecto, con el flujo principal funcionando de principio a fin, tests y documentación cerrada.
  * **Jueves 26 de marzo**

---

## Recordatorios importantes

* Si tu repositorio es privado, da acceso a tu TA.
* El nombre de la rama debe contener tus iniciales. De lo contrario, tu entrega no podrá ser identificada correctamente.
* En caso de que el proyecto sea privado, puedes incluir en la plantilla capturas del funcionamiento. Sin embargo, se recomienda anexar un video breve (2–3 minutos) explicando y mostrando el flujo principal del sistema.

### Dedicación estimada

Se espera una dedicación aproximada de 30 horas en total. Puedes organizar tu tiempo como prefieras, pero las tres entregas están pensadas para repartir el esfuerzo y evitar dejar todo para el final.

---

## Tutoría y soporte

* Por email con cualquier duda a `jorge@lidr.co` o tu TA.
* Habrá 3 sesiones de tutoría en vivo centradas en el Proyecto Final:
  * Una al inicio (para elegir bien la idea y planificar).
  * Una a mitad (para desbloquear problemas de diseño/implementación).
  * Una cerca del cierre (para pulir detalles antes de la entrega final).
* 3 sesiones de 1,5h en distintos horarios y días para garantizar la asistencia mínima:
  * Miércoles 3 de diciembre | 13:30 - 15:00 CET
  * Martes 20 de enero | 14:30 - 16:00 CET
  * Miércoles 18 de marzo | 15:30 - 17:00 CET

---

## Fecha de entrega final

**Jueves 26 de marzo, al final del día (hora del programa).**

Toda la información debe estar:

1. En la rama `finalproject-[iniciales]`.
2. Con el formulario de Typeform enviado.

### Extensión y retroalimentación

* Si no llegas a la fecha de entrega final, puedes solicitar una prórroga de hasta dos semanas a partir de esa fecha. La prórroga debe tramitarse directamente con el TA, quien evaluará cada caso y confirmará su aprobación.
* No se entregará feedback individual de las dos primeras entregas (documentación técnica y código funcional), ya que su propósito es guiar la construcción progresiva del proyecto.
* La retroalimentación completa y formal se realizará únicamente sobre la entrega final, una vez evaluado el proyecto en su conjunto.

# 🎯 Objetivo del Proyecto Final

El objetivo de este proyecto final no es solo entregar código funcional, sino simular una **entrega profesional completa de ingeniería de software** potenciada por Inteligencia Artificial.

Para ello, nos basamos en una **plantilla estructural estandarizada** que cubre todo el ciclo de vida del desarrollo (SDLC), desde la concepción del producto hasta el despliegue y testing.

## 📚 Referencias del Proyecto

Les presentamos dos referencias que comparten la misma estructura, con la cual podréis usar para guiaros y mejorar vuestros proyectos:

* [Ver Repositorio Example 1](https://github.com/christianbusup/AI4Devs-finalproject-Example1.git)
* [Ver Repositorio Example 2](https://github.com/lidr-training/AI4Devs-finalproject-Example2)
