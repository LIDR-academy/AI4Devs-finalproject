# Requisito Funcional: RF-26B

## 1. Título Descriptivo
* **Propósito:** Mostrar Historial Unificado (ATS MVP)

## 2. Descripción Funcional (QUÉ debe hacer el sistema)
* **Propósito:** Al visualizar el perfil detallado de una `Candidatura` en el ATS MVP, el sistema debería poder consultar a TalentIA Core AI (Servicio Perfil) para obtener la lista de otras candidaturas (`candidaturas_ids`) asociadas al mismo `CandidatoIA` (la misma persona, identificada por email). El ATS MVP debería entonces mostrar información básica o enlaces a estas otras postulaciones del mismo candidato dentro del sistema, proporcionando una visión de su historial de interacciones.

## 3. Justificación de Valor / Objetivo de Negocio (POR QUÉ es necesario)
* **Propósito:** Ofrece una visión 360º del candidato dentro de la organización, mostrando si ha aplicado a otros puestos, cuándo, y potencialmente en qué estado quedaron esas otras aplicaciones. Ayuda a tomar decisiones más informadas y a gestionar la relación con el candidato de forma más coherente.

## 4. User Persona(s) / Rol(es) Afectado(s) (PARA QUIÉN)
* **Propósito:** Reclutador, Hiring Manager.

## 5. Criterios de Aceptación Principales (Condiciones Clave de Éxito)
* **Propósito:**
    1.  En la vista de detalle de una `Candidatura`, ATS MVP identifica el `CandidatoIA` asociado (probablemente vía email del `Candidato` ATS).
    2.  Realiza una llamada a la API del Servicio Perfil de Core AI solicitando el `CandidatoIA` (pasando email o ID si lo conoce).
    3.  Core AI devuelve el `CandidatoIA` incluyendo la lista `candidaturas_ids`.
    4.  ATS MVP recibe la lista de IDs de otras candidaturas.
    5.  ATS MVP busca en su propia BBDD la información básica de esas otras `Candidatura` (ej. título vacante, fecha aplicación, estado final).
    6.  Muestra esta información resumida (ej. una lista de enlaces "Aplicó a 'Puesto X' en fecha Y (Estado Z)") en una sección del perfil de la candidatura actual.

## 6. Origen / Fuente del Requisito
* **Propósito:** PRD TalentIA FInal.md - Sección 8 (RF-26B), Sección 7 (UC4), Sección 11 (Modelo Datos - CandidatoIA).

## 7. Prioridad Inicial (Sugerida por PO)
* **Propósito:** `Alta` (Basado en Should Have del PRD).

## 8. Dependencias Funcionales (Opcional pero Recomendado)
* **Propósito:** RF-09B (Creación/Actualización de `CandidatoIA` con `candidaturas_ids`), RF-21 (API Interna).

## 9. Notas y Suposiciones del PO
* **Propósito:** Requiere una llamada adicional a Core AI al ver el detalle. La cantidad de información mostrada sobre las otras candidaturas debe ser limitada para no sobrecargar la interfaz. Considerar performance si un candidato tiene muchísimas aplicaciones previas.