# Requisito Funcional: RF-23

## 1. Título Descriptivo
* **Propósito:** Usar Datos Internos para JD (Core AI)

## 2. Descripción Funcional (QUÉ debe hacer el sistema)
* **Propósito:** TalentIA Core AI (Servicio de Generación JD), al generar una descripción de puesto (RF-06), debería ser capaz de consultar y utilizar información interna estructurada de la organización, si está disponible (ej. matrices de competencias, descripciones de roles estándar, career paths), para enriquecer el prompt enviado al LLM o complementar/validar la salida generada, resultando en JDs más precisas y alineadas con la cultura y estructura interna.

## 3. Justificación de Valor / Objetivo de Negocio (POR QUÉ es necesario)
* **Propósito:** Mejora la calidad y relevancia de las JDs generadas por IA, yendo más allá de la información genérica que puede proporcionar un LLM externo y adaptándolas mejor al contexto específico de la empresa.

## 4. User Persona(s) / Rol(es) Afectado(s) (PARA QUIÉN)
* **Propósito:** N/A (Servicio interno). Indirectamente mejora la calidad para el Reclutador.

## 5. Criterios de Aceptación Principales (Condiciones Clave de Éxito)
* **Propósito:**
    1.  El servicio puede acceder a una fuente de datos interna definida (ej. otra BBDD, API interna, archivos).
    2.  Identifica qué datos internos son relevantes para la vacante que se está procesando.
    3.  Incorpora esta información en el prompt al LLM o la usa para post-procesar la respuesta del LLM.
    4.  La JD resultante refleja la información interna utilizada.

## 6. Origen / Fuente del Requisito
* **Propósito:** PRD TalentIA FInal.md - Sección 8 (RF-23), Sección 4.B.

## 7. Prioridad Inicial (Sugerida por PO)
* **Propósito:** `Alta` (Basado en Should Have del PRD).

## 8. Dependencias Funcionales (Opcional pero Recomendado)
* **Propósito:** RF-06 (Generación JD). Requiere la existencia y accesibilidad de dichos datos internos.

## 9. Notas y Suposiciones del PO
* **Propósito:** La viabilidad depende de la disponibilidad y formato de los datos internos. Puede requerir un esfuerzo significativo de integración o modelado de esos datos.