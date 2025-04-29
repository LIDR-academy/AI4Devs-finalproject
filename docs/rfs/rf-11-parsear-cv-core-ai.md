# Requisito Funcional: RF-11

## 1. Título Descriptivo
* **Propósito:** Parsear CV (Core AI)

## 2. Descripción Funcional (QUÉ debe hacer el sistema)
* **Propósito:** TalentIA Core AI (Servicio de Evaluación), al recibir una solicitud de evaluación (RF-10), debe ser capaz de procesar el archivo de CV adjunto (en formatos PDF, DOCX) para extraer información estructurada clave, como mínimo: experiencia laboral (empresas, cargos, fechas), formación académica (instituciones, títulos, fechas) y habilidades técnicas o skills mencionadas.

## 3. Justificación de Valor / Objetivo de Negocio (POR QUÉ es necesario)
* **Propósito:** Convierte la información no estructurada (o semi) del CV en datos que la IA puede entender y utilizar para realizar comparaciones objetivas (matching) con los requisitos de la vacante y calcular un score relevante.

## 4. User Persona(s) / Rol(es) Afectado(s) (PARA QUIÉN)
* **Propósito:** N/A (Servicio interno).

## 5. Criterios de Aceptación Principales (Condiciones Clave de Éxito)
* **Propósito:**
    1.  El servicio puede leer y extraer texto de archivos PDF y DOCX.
    2.  Identifica y extrae secciones de Experiencia Laboral, incluyendo nombre de empresa, puesto y fechas (aproximadas si es necesario).
    3.  Identifica y extrae secciones de Educación, incluyendo institución, título y fechas.
    4.  Identifica y extrae una lista de Habilidades (skills) mencionadas en el CV (ej. lenguajes de programación, herramientas, certificaciones).
    5.  Los datos extraídos se almacenan de forma estructurada (ej. JSON) asociados a la evaluación (en `EvaluacionCandidatoIA.datos_extraidos_cv`).

## 6. Origen / Fuente del Requisito
* **Propósito:** PRD TalentIA FInal.md - Sección 8 (RF-11), Sección 4.B (Módulo Cribado), Sección 7 (UC3), Sección 11 (Modelo Datos - EvaluacionCandidatoIA).

## 7. Prioridad Inicial (Sugerida por PO)
* **Propósito:** `Crítica` (Basado en Must Have del PRD).

## 8. Dependencias Funcionales (Opcional pero Recomendado)
* **Propósito:** RF-10 (Recepción de solicitud con CV), RF-12 (Uso de datos para Score). Puede requerir librerías de parsing (Tika, etc.) o llamadas a LLM para extracción más avanzada.

## 9. Notas y Suposiciones del PO
* **Propósito:** La precisión del parsing es un desafío conocido y depende de la calidad/formato del CV. El MVP se centrará en la extracción básica. La mejora continua (feedback) puede afinar los modelos de extracción.