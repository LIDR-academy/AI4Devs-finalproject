A continuación te dejo el documento en formato **Product / Project Manager Decision Record**, integrando tus respuestas y completando las partes donde pediste apoyo.

---

# EventFlow — Product Owner Open Questions & Decisions

## 1. Propósito del documento

Este documento consolida las respuestas del Product Owner a las preguntas abiertas identificadas durante la fase de **Domain Discovery** de **EventFlow**.

El objetivo es dejar documentadas las decisiones iniciales de producto para orientar las siguientes fases del proyecto:

* Definición del MVP.
* Priorización de funcionalidades.
* Diseño de arquitectura.
* Definición de user stories.
* Planeación técnica.
* Preparación de datos seed.
* Diseño de experiencia de usuario.
* Alcance de IA para el MVP.

---

# 2. Contexto general del producto

**EventFlow** será una plataforma web responsive para planificación de eventos asistida por IA, enfocada inicialmente en organizadores de eventos y proveedores de servicios.

La visión a largo plazo es evolucionar hacia una plataforma que combine:

* Workspace de planificación de eventos.
* Marketplace de proveedores.
* Gestión de cotizaciones.
* Herramientas de productividad para organizadores y proveedores.
* Capacidades de IA para estructurar eventos, tareas, presupuestos y solicitudes.

Para el MVP, el producto debe mantenerse enfocado y evitar convertirse desde el inicio en un marketplace complejo.

---

# 3. Respuestas del Product Owner

|  # | Pregunta                                                   | Decisión / Respuesta                                                                                                                                                                                                                                                                                                                                                          |
| -: | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|  1 | ¿Cuál es el mercado piloto prioritario?                    | El mercado prioritario será **Guatemala**, con visión futura hacia **España** y **LATAM en general**.                                                                                                                                                                                                                                                                         |
|  2 | ¿Cuáles son los tipos de evento prioritarios para el MVP?  | Los eventos priorizados son: **bodas, XV años, bautizos, baby showers, cumpleaños y eventos corporativos**.                                                                                                                                                                                                                                                                   |
|  3 | ¿Habrá proveedores reales desde el día uno?                | Por el momento se trabajará principalmente con **datos seed**. Existe la posibilidad de incluir algún proveedor real, pero no es una dependencia del MVP.                                                                                                                                                                                                                     |
|  4 | ¿Cuál será el modelo de negocio futuro?                    | Para organizadores: modelo **freemium**. El uso básico será gratuito, pero se cobrará si se desea agregar más personas colaborando en la organización. Para proveedores: **suscripción mensual** en el MVP/fase inicial. A futuro se contempla suscripción + comisión por contrato cerrado sobre el monto total. También se contempla un plan premium con galería/portafolio. |
|  5 | ¿Qué proveedor LLM se usará por defecto?                   | Se evaluará entre **OpenAI** y **Anthropic**. Para el MVP se recomienda iniciar con **OpenAI como proveedor principal** y diseñar una capa de abstracción para permitir cambiar o comparar contra Anthropic posteriormente.                                                                                                                                                   |
|  6 | ¿Habrá app móvil nativa?                                   | No. Para el MVP solo se construirá una **web responsive**.                                                                                                                                                                                                                                                                                                                    |
|  7 | ¿Qué nivel de personalización por país requiere el MVP?    | Se desea incluir soporte de **moneda e idioma** desde el MVP.                                                                                                                                                                                                                                                                                                                 |
|  8 | ¿Habrá integración con WhatsApp?                           | No en el MVP. La integración con WhatsApp queda como funcionalidad futura.                                                                                                                                                                                                                                                                                                    |
|  9 | ¿Qué branding se desea?                                    | Se prefiere un branding **premium / aspiracional**.                                                                                                                                                                                                                                                                                                                           |
| 10 | ¿Quién será el admin en la demo?                           | El administrador principal será el Product Owner. Para la demo se crearán entre **5 y 10 usuarios organizadores** con eventos creados, avanzados o finalizados para demostrar el flujo completo.                                                                                                                                                                              |
| 11 | ¿Habrá reseñas reales o simuladas?                         | El sistema debe permitir crear reseñas. Además, se incluirán reseñas simuladas mediante datos seed.                                                                                                                                                                                                                                                                           |
| 12 | ¿Qué métricas son críticas para la evaluación académica?   | Se definirán métricas enfocadas en evidencia de proceso E2E, calidad técnica, uso responsable de IA, completitud funcional y demostrabilidad del MVP.                                                                                                                                                                                                                         |
| 13 | ¿Se contempla análisis de sentimiento o moderación con IA? | No para el MVP. Se difiere. El administrador/moderador sí podrá eliminar comentarios ofensivos manualmente.                                                                                                                                                                                                                                                                   |
| 14 | ¿Debe cumplir alguna normativa específica?                 | Para el MVP se aplicarán **buenas prácticas de privacidad, seguridad y manejo de datos**, sin enfocarse todavía en cumplimiento formal de normativas específicas por país.                                                                                                                                                                                                    |
| 15 | ¿Qué idiomas soportará el MVP?                             | El MVP debe soportar: **español LATAM neutral**, **español de España**, **portugués** e **inglés**. El inglés es no negociable.                                                                                                                                                                                                                                               |

---

# 4. Decisiones complementarias recomendadas

## 4.1 Recomendación sobre proveedor LLM

Para el MVP, recomiendo usar:

> **OpenAI como proveedor principal del MVP**, con una arquitectura preparada para soportar Anthropic posteriormente.

## Justificación

OpenAI es una buena opción inicial para el MVP porque ofrece un ecosistema amplio, modelos con diferentes niveles de costo/capacidad y documentación orientada a integración de producto. La página oficial de modelos de OpenAI recomienda usar modelos flagship para razonamiento complejo y modelos mini/nano para cargas de menor costo y latencia. ([OpenAI Developers][1])

Anthropic también es una opción fuerte, especialmente para análisis largo, redacción estructurada y razonamiento cuidadoso. Su documentación oficial muestra modelos Claude Opus con precios por millón de tokens y soporte de caching, lo cual puede ser útil si el producto empieza a reutilizar prompts extensos o plantillas de planificación. ([Claude Platform][2])

## Decisión recomendada

| Criterio                | Recomendación                                               |
| ----------------------- | ----------------------------------------------------------- |
| Proveedor principal MVP | **OpenAI**                                                  |
| Proveedor alternativo   | **Anthropic**                                               |
| Estrategia técnica      | Crear una interfaz `AIProvider` o `LLMProvider`             |
| Evitar                  | Acoplar el backend directamente a un solo SDK               |
| Objetivo                | Poder cambiar proveedor sin reescribir la lógica de negocio |

## Ejemplo de decisión técnica

```ts
interface LLMProvider {
  generateEventPlan(input: EventPlanningInput): Promise<EventPlanResult>;
  generateChecklist(input: ChecklistInput): Promise<ChecklistResult>;
  suggestBudget(input: BudgetInput): Promise<BudgetSuggestionResult>;
  compareQuotes(input: QuoteComparisonInput): Promise<QuoteComparisonResult>;
}
```

Esto permitiría tener implementaciones como:

```text
OpenAIProvider
AnthropicProvider
MockAIProvider
```

Para el MVP académico, también conviene tener un `MockAIProvider` para demos controladas, pruebas automatizadas y escenarios donde no se quiera consumir tokens.

---

# 5. Recomendación sobre branding

## Decisión recomendada

El branding debería ser:

> **Premium / aspiracional, pero accesible y humano.**

No lo haría demasiado corporativo ni demasiado juvenil. EventFlow debe transmitir:

* Organización.
* Confianza.
* Elegancia.
* Claridad.
* Inspiración.
* Control.
* Tranquilidad.

## Posicionamiento visual sugerido

```text
EventFlow es una plataforma inteligente que convierte la incertidumbre de organizar un evento en un plan claro, elegante y accionable.
```

## Personalidad de marca

| Atributo           | Recomendación                                                  |
| ------------------ | -------------------------------------------------------------- |
| Tono               | Profesional, cálido y claro                                    |
| Estilo visual      | Elegante, moderno, limpio                                      |
| Percepción deseada | Premium accesible                                              |
| Evitar             | Verse como app genérica de tareas                              |
| Evitar             | Verse como marketplace barato                                  |
| Inspiración        | Wedding planner premium + SaaS moderno + asistente inteligente |

## Por qué premium / aspiracional sí tiene sentido

Eventos como bodas, XV años, baby showers y eventos corporativos tienen una carga emocional y económica importante. El usuario no solo quiere “hacer una lista de tareas”; quiere sentir que su evento está bajo control y que puede lograr algo memorable.

Por eso, un branding premium ayuda a reforzar:

* Confianza.
* Deseo.
* Valor percibido.
* Calidad de proveedores.
* Disposición a pagar en el futuro.

---

# 6. Métricas críticas para la evaluación académica

Para la evaluación académica, recomiendo no enfocarse en métricas comerciales reales como ingresos, CAC, LTV o conversión pagada, porque el MVP no tendrá operación comercial activa.

En su lugar, las métricas deben demostrar que el proyecto cumple el propósito del master:

> Construir un producto E2E apoyado por IA en todo el ciclo de vida, con criterio humano para revisar, corregir y elevar la calidad.

## 6.1 Métricas de completitud funcional

| Métrica                           | Objetivo                                    |
| --------------------------------- | ------------------------------------------- |
| Eventos creados exitosamente      | Demostrar flujo principal del organizador   |
| Planes de evento generados con IA | Demostrar integración real de IA            |
| Checklists generados con IA       | Validar utilidad del asistente              |
| Presupuestos estructurados        | Demostrar lógica de planificación           |
| Proveedores seed disponibles      | Demostrar flujo de discovery                |
| Solicitudes de cotización creadas | Demostrar interacción organizador-proveedor |
| Cotizaciones respondidas          | Demostrar panel proveedor                   |
| Comparación de cotizaciones       | Demostrar valor de decisión                 |
| Reseñas creadas                   | Demostrar feedback básico                   |
| Acciones admin ejecutadas         | Demostrar control operativo                 |

## 6.2 Métricas de calidad técnica

| Métrica                 | Objetivo recomendado                            |
| ----------------------- | ----------------------------------------------- |
| Cobertura de pruebas    | Mínimo razonable: 50% en lógica crítica         |
| Endpoints documentados  | 100% de endpoints principales                   |
| User stories trazables  | Cada feature clave debe mapearse a una historia |
| Flujos E2E demostrables | Al menos 3 flujos principales                   |
| Errores controlados     | Manejo claro de errores en API y UI             |
| Seed reproducible       | Setup de demo consistente                       |
| Deploy funcional        | Aplicación accesible en ambiente público o demo |
| Separación por capas    | Frontend, backend, DB e IA claramente separados |

## 6.3 Métricas de uso de IA

| Métrica                                         | Qué demuestra             |
| ----------------------------------------------- | ------------------------- |
| Número de features asistidas por IA             | Alcance de IA en producto |
| AI outputs editables por usuario                | Human-in-the-loop         |
| Validación humana antes de guardar sugerencias  | Uso responsable de IA     |
| Uso de prompts documentados                     | Trazabilidad del proceso  |
| Fallback mock para IA                           | Robustez técnica          |
| Comparación de resultados IA vs reglas manuales | Criterio humano aplicado  |

## 6.4 Métricas de UX / demostrabilidad

| Métrica                              | Objetivo                                        |
| ------------------------------------ | ----------------------------------------------- |
| Tiempo para crear un evento demo     | Demostrar fluidez                               |
| Tiempo para generar plan + checklist | Demostrar valor inmediato                       |
| Número de pasos del flujo principal  | Mantener simple el MVP                          |
| Estados visuales claros              | Pendiente, en progreso, completado              |
| Dashboard del evento visible         | Mostrar progreso del evento                     |
| Demo con datos precargados           | Evitar depender de carga manual en presentación |

## 6.5 Métricas de documentación

| Métrica                       | Objetivo                         |
| ----------------------------- | -------------------------------- |
| Discovery document completo   | Evidencia de análisis de dominio |
| MVP scope documentado         | Evidencia de priorización        |
| User stories documentadas     | Evidencia de planificación ágil  |
| Data model documentado        | Evidencia técnica                |
| API contract documentado      | Evidencia backend                |
| Architecture decision records | Evidencia de criterio humano     |
| Testing evidence              | Evidencia de calidad             |
| Deployment guide              | Evidencia E2E                    |

---

# 7. Métricas académicas prioritarias recomendadas

Para la entrega, yo priorizaría estas 10:

| Prioridad | Métrica                                             | Motivo                              |
| --------: | --------------------------------------------------- | ----------------------------------- |
|         1 | Flujo E2E del organizador completado                | Es el corazón del producto          |
|         2 | Generación de plan de evento con IA                 | Demuestra diferenciador principal   |
|         3 | Generación de checklist con IA                      | Demuestra utilidad práctica         |
|         4 | Flujo de cotización organizador-proveedor           | Demuestra interacción multi-rol     |
|         5 | Panel proveedor funcional                           | Demuestra segundo lado del producto |
|         6 | Admin funcional para categorías/proveedores/reseñas | Demuestra gobernanza                |
|         7 | Seed data reproducible                              | Facilita demo y evaluación          |
|         8 | Tests en lógica crítica                             | Demuestra calidad técnica           |
|         9 | Deploy funcional                                    | Demuestra ciclo E2E completo        |
|        10 | Documentación trazable de IA + decisiones humanas   | Demuestra alineación con el master  |

---

# 8. Alcance actualizado del MVP según respuestas

## 8.1 Incluido en MVP

| Área                  | Incluido                                                                        |
| --------------------- | ------------------------------------------------------------------------------- |
| Plataforma            | Web responsive                                                                  |
| Mercado inicial       | Guatemala                                                                       |
| Expansión conceptual  | España y LATAM                                                                  |
| Idiomas               | Español LATAM neutral, español España, portugués, inglés                        |
| Moneda                | Soporte inicial de moneda                                                       |
| Eventos               | Bodas, XV años, bautizos, baby showers, cumpleaños, corporativos                |
| Usuarios              | Organizador, proveedor, admin                                                   |
| Datos                 | Seed data como base principal                                                   |
| Proveedores reales    | Opcional, no bloqueante                                                         |
| IA                    | Plan, checklist, presupuesto, categorías, mensajes, comparación de cotizaciones |
| Cotizaciones          | Solicitud y respuesta básica                                                    |
| Reseñas               | CRUD básico + seed                                                              |
| Moderación            | Admin puede eliminar reseñas/comentarios ofensivos                              |
| Admin                 | Gestión de categorías, proveedores, reseñas y datos demo                        |
| Modelo negocio MVP    | Proveedor con suscripción mensual simulada/conceptual                           |
| Modelo negocio futuro | Freemium organizador + proveedor mensual + comisión futura                      |

## 8.2 Excluido del MVP

| Área                                   | Razón                         |
| -------------------------------------- | ----------------------------- |
| App móvil nativa                       | Tiempo y alcance              |
| WhatsApp                               | Futuro                        |
| Pagos reales                           | Complejidad y riesgo          |
| Comisión real por contrato cerrado     | Futuro                        |
| Análisis de sentimiento                | Futuro                        |
| Moderación automática con IA           | Futuro                        |
| Cumplimiento legal específico por país | Se aplicarán buenas prácticas |
| Marketplace completo                   | Riesgo de sobrealcance        |
| Contratos legales                      | Complejidad alta              |
| Chat en tiempo real                    | No necesario para demo        |

---

# 9. Decisión sobre idiomas y localización

## Decisión

El MVP debe soportar:

1. **Español LATAM neutral**
2. **Español de España**
3. **Portugués**
4. **Inglés**

El inglés es obligatorio.

## Recomendación técnica

Implementar internacionalización desde el inicio usando archivos de traducción.

Ejemplo:

```text
/locales
  /es-LATAM
  /es-ES
  /pt
  /en
```

## Recomendación de producto

Para evitar sobrecargar el MVP, sugiero:

* Usar **español LATAM neutral** como idioma base.
* Tener traducciones completas para navegación, labels, botones y mensajes principales.
* Permitir que los prompts de IA reciban el idioma deseado.
* No intentar adaptar modismos locales en v1.
* No crear lógica compleja por país todavía.

---

# 10. Decisión sobre moneda

## Decisión

El MVP debe contemplar moneda.

## Recomendación

Para la demo, manejar moneda como configuración simple del evento o del país.

Ejemplo:

| Mercado              | Moneda |
| -------------------- | ------ |
| Guatemala            | GTQ    |
| España               | EUR    |
| México               | MXN    |
| Colombia             | COP    |
| Internacional / demo | USD    |

## Alcance recomendado

En el MVP:

* Mostrar moneda en presupuestos.
* Mostrar moneda en cotizaciones.
* Permitir configurar moneda del evento.
* No hacer conversión automática entre monedas.
* No integrar tipo de cambio real.

---

# 11. Decisión sobre datos seed

## Recomendación

La demo debería tener datos seed robustos.

## Seed sugerido

| Tipo de dato              | Cantidad recomendada |
| ------------------------- | -------------------: |
| Usuarios organizadores    |               5 a 10 |
| Usuarios proveedores      |              10 a 20 |
| Eventos creados           |              10 a 15 |
| Eventos en progreso       |                    5 |
| Eventos finalizados       |                    3 |
| Eventos recién creados    |                    3 |
| Categorías de servicio    |              10 a 15 |
| Solicitudes de cotización |              15 a 25 |
| Cotizaciones respondidas  |              10 a 20 |
| Reseñas                   |              20 a 40 |

Esto hará que la demo se vea viva y no como una app vacía.

---

# 12. Decisión sobre moderación

## Decisión

No habrá análisis de sentimiento ni moderación automática con IA en el MVP.

## Alcance MVP

El admin podrá:

* Ver reseñas.
* Eliminar reseñas ofensivas.
* Ocultar comentarios.
* Revisar proveedores.
* Gestionar categorías.

## Futuro

Para versiones posteriores se podría incluir:

* Detección automática de lenguaje ofensivo.
* Análisis de sentimiento.
* Alertas de reputación.
* Score de confianza del proveedor.

---

# 13. Posicionamiento recomendado del MVP

```text
EventFlow debe iniciar como un workspace inteligente de planificación de eventos para organizadores que necesitan convertir una idea inicial en un plan estructurado, usando IA para generar checklist, presupuesto y necesidades de proveedores, mientras mantiene bajo control humano las decisiones finales, cotizaciones y selección de proveedores.
```

---

# 14. Recomendación estratégica final

```text
Recommendation: Build with constraints
```

## Justificación

EventFlow es viable como proyecto académico y como portafolio si se mantiene enfocado en la planificación asistida por IA y no intenta convertirse desde el inicio en un marketplace completo.

El mayor valor diferencial está en permitir que un usuario pase rápidamente de una idea desordenada a un plan accionable con tareas, presupuesto y proveedores necesarios.

El marketplace debe existir en el MVP solo como flujo demostrable:

```text
Organizador → Solicita cotización → Proveedor responde → Organizador compara
```

No debe construirse todavía como un sistema comercial completo con pagos, comisiones, contratos, chat, WhatsApp o verificación avanzada.

---

# 15. Próximo paso recomendado

El siguiente paso debería ser convertir estas decisiones en un documento de:

# **MVP Scope Definition**

Ese documento debería definir:

* Objetivo del MVP.
* Roles del sistema.
* Features incluidas.
* Features excluidas.
* Flujos principales.
* Reglas de negocio iniciales.
* Datos seed necesarios.
* Criterios de aceptación.
* Métricas académicas de éxito.
* Riesgos de alcance.
* Roadmap post-MVP.

[1]: https://developers.openai.com/api/docs/models?utm_source=chatgpt.com "Models | OpenAI API"
[2]: https://platform.claude.com/docs/en/about-claude/pricing?utm_source=chatgpt.com "Pricing - Claude API Docs"
