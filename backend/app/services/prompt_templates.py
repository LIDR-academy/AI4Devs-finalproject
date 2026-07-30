JSON_CONTRACT_INSTRUCTIONS = """
Debes responder EXCLUSIVAMENTE con un objeto JSON válido (sin texto adicional, sin markdown)
que cumpla exactamente este contrato:

{
  "routing": "BASELINE" | "TIMELINE" | "IRRELEVANT",
  "baseline": {
    "type": string,          // p.ej. "Condición Crónica", "Tratamiento Prolongado", "Alergia"
    "concept": string,       // nombre clínico formal (p.ej. "Talasemia Minor", "Lansoprazol 20mg")
    "start_date": string | null,
    "details": string | null
  } | null,
  "event": {
    "title": string,             // título corto y descriptivo del episodio
    "date": string,               // fecha o expresión temporal (p.ej. "2010", "2026-06-10")
    "type": string,               // "Cirugía" | "Urgencias" | "Consulta" | "Analítica" | "Síntoma"
    "clinical_summary": string,   // resumen clínico limpio, sin paja administrativa
    "severity": string,           // "Alta" | "Media" | "Baja"
    "doctor": string | null,
    "medical_center": string | null,
    "department": string | null
  } | null,
  "red_flag": {
    "active": boolean,
    "justification": string | null
  }
}

Reglas:
- Si "routing" es "BASELINE", el campo "baseline" es OBLIGATORIO y "event" debe ser null.
- Si "routing" es "TIMELINE", el campo "event" es OBLIGATORIO y "baseline" debe ser null.
- Si "routing" es "IRRELEVANT", tanto "baseline" como "event" deben ser null.
- Usa "BASELINE" para condiciones crónicas, rasgos genéticos o medicación de uso continuado.
- Usa "TIMELINE" para hechos puntuales fechados (cirugías, urgencias, consultas, analíticas, síntomas aislados).
- Usa "IRRELEVANT" si el contenido no aporta NINGUNA información clínica sobre el paciente
  (p.ej. una petición de comida, una conversación trivial, ruido o una transcripción vacía/sin
  sentido). Ante la duda, si hay aunque sea un dato clínico mínimamente aprovechable, NO uses
  "IRRELEVANT": prefiere clasificarlo como BASELINE o TIMELINE.
""".strip()

RED_FLAG_INSTRUCTIONS = """
Además, comprueba si el nuevo contenido, cruzado con el historial longitudinal del paciente
que se te proporciona a continuación, podría enmascarar una complicación crítica de un
antecedente pasado (sesgo de anclaje diagnóstico). Si detectas ese riesgo, activa
"red_flag.active": true y explica brevemente en "red_flag.justification" por qué. Si no hay
riesgo cruzado evidente, deja "red_flag.active": false y "red_flag.justification": null.
""".strip()


def build_text_classification_prompt(patient_context: str) -> str:
    return (
        "Eres un asistente clínico que estructura transcripciones de voz de pacientes "
        "en un historial médico digital. Aísla la paja administrativa y extrae solo la "
        "información clínica relevante.\n\n"
        f"{JSON_CONTRACT_INSTRUCTIONS}\n\n"
        f"{RED_FLAG_INSTRUCTIONS}\n\n"
        "Historial longitudinal actual del paciente:\n"
        f"{patient_context}"
    )


def build_image_classification_prompt(patient_context: str) -> str:
    return (
        "Eres un asistente clínico que estructura informes médicos fotografiados "
        "(recetas, altas, analíticas) en un historial médico digital. Aísla los "
        "encabezados administrativos innecesarios y extrae solo la información clínica "
        "relevante (diagnóstico, centro médico, doctores firmantes, medicación).\n\n"
        f"{JSON_CONTRACT_INSTRUCTIONS}\n\n"
        f"{RED_FLAG_INSTRUCTIONS}\n\n"
        "Historial longitudinal actual del paciente:\n"
        f"{patient_context}"
    )
