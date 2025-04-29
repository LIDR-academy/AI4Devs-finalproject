# Requisito Funcional: RF-12

## 1. Título Descriptivo
* **Propósito:** Calcular Score Idoneidad (Core AI)

## 2. Descripción Funcional (QUÉ debe hacer el sistema)
* **Propósito:** TalentIA Core AI (Servicio de Evaluación), utilizando los datos estructurados extraídos del CV (RF-11) y los requisitos implícitos o explícitos de la vacante (obtenidos de la `DescripcionPuestoGenerada` asociada), debe calcular un score numérico (ej. en una escala de 0 a 100) que represente la idoneidad o el grado de ajuste del candidato para esa vacante específica.

## 3. Justificación de Valor / Objetivo de Negocio (POR QUÉ es necesario)
* **Propósito:** Proporciona una medida cuantitativa y objetiva inicial de la adecuación del candidato, permitiendo a los reclutadores priorizar rápidamente los perfiles más prometedores y reduciendo la subjetividad en la primera criba. Es central para el objetivo de eficiencia y objetividad.

## 4. User Persona(s) / Rol(es) Afectado(s) (PARA QUIÉN)
* **Propósito:** N/A (Servicio interno).

## 5. Criterios de Aceptación Principales (Condiciones Clave de Éxito)
* **Propósito:**
    1.  El servicio recupera los datos parseados del CV (RF-11).
    2.  Recupera los requisitos de la vacante (puede ser de la JD o parámetros específicos).
    3.  Aplica una lógica de matching/puntuación (puede ser basada en reglas, ML, o combinación) para comparar candidato vs vacante.
    4.  Calcula un score numérico final (`score.valor_general`).
    5.  (Opcional Should Have) Puede calcular scores parciales por categorías (skills, experiencia).
    6.  Almacena el score(s) calculado(s) en la entidad `EvaluacionCandidatoIA`.

## 6. Origen / Fuente del Requisito
* **Propósito:** PRD TalentIA FInal.md - Sección 8 (RF-12), Sección 4.B (Módulo Cribado), Sección 7 (UC3), Sección 11 (Modelo Datos - EvaluacionCandidatoIA).

## 7. Prioridad Inicial (Sugerida por PO)
* **Propósito:** `Crítica` (Basado en Must Have del PRD).

## 8. Dependencias Funcionales (Opcional pero Recomendado)
* **Propósito:** RF-11 (Datos parseados), RF-06B (Acceso a parámetros/JD de la vacante).

## 9. Notas y Suposiciones del PO
* **Propósito:** La lógica exacta del scoring es un elemento clave a definir y refinar. Puede empezar simple (coincidencia de keywords/skills) y evolucionar. La transparencia sobre cómo se calcula (RNF-17) es importante.