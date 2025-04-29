## Feature 4: Evaluación Inteligente de Candidaturas

* **Descripción:** Orquesta el proceso de análisis de las candidaturas recibidas utilizando TalentIA Core AI. Incluye la creación/actualización del perfil unificado del candidato en IA, el envío del CV para análisis, el parsing de datos, el cálculo del score de idoneidad, la comparación con el umbral definido, la determinación de una etapa inicial sugerida, la generación opcional de un resumen, y la devolución de toda esta evaluación al ATS MVP.
* **Valor Aportado:** Automatiza y objetiviza la criba inicial de candidatos, proporcionando scores, resúmenes y sugerencias de acción que ahorran tiempo y mejoran la calidad del proceso de selección.
* **Requisitos Funcionales Asociados:**
    * RF-09B: Crear/Actualizar CandidatoIA (Core AI) (Must Have)
    * RF-10: Invocar Evaluación IA (Must Have)
    * RF-11: Parsear CV (Core AI) (Must Have)
    * RF-12: Calcular Score Idoneidad (Core AI) (Must Have)
    * RF-12B: Comparar Score con Corte (Core AI) (Must Have)
    * RF-12C: Determinar Etapa Sugerida (Core AI) (Must Have)
    * RF-13: Devolver Evaluación (Core AI) (Must Have)
    * RF-22: Invocación Proveedor LLM (Core AI) (Must Have) - *Relacionado con capacidades subyacentes de IA*
    * RF-24: Generar Resumen Candidato (Core AI) (Should Have)
    * RF-36: Considerar Soft Skills (Core AI) (Could Have)

```plantuml	
@startuml
!theme plain
left to right direction

actor "<<System>>\nATS MVP" as ATS
actor "<<System>>\nTalentIA Core AI" as CoreAI
actor "<<System>>\nProveedor LLM" as LLM_Ext <<External>>

rectangle "ATS MVP & Core AI - Evaluación IA" {

  usecase "Invocar Evaluación IA" as UC_Invoke <<US-019>>
  ATS -- UC_Invoke

  rectangle "TalentIA Core AI" {
    usecase "Gestionar Perfil CandidatoIA" as UC_Profile <<US-018>>
    usecase "Extraer Datos CV (Parsear)" as UC_Parse <<US-020>>
    usecase "Calcular Score Idoneidad" as UC_Score <<US-021>>
    usecase "Comparar Score con Corte" as UC_Compare <<US-022>>
    usecase "Determinar Etapa Sugerida" as UC_Suggest <<US-023>>
    usecase "Devolver Evaluación Completa" as UC_Return <<US-024>>
    usecase "Generar Resumen Candidato (Opcional)" as UC_Summary <<US-025>>
    usecase "Considerar Soft Skills (Opcional)" as UC_SoftSkills <<US-026>>
  }

  UC_Invoke ..> UC_Profile : <<triggers>>
  UC_Invoke ..> UC_Parse : <<triggers>>

  UC_Parse ..> UC_Score : <<includes>>
  UC_Parse ..> UC_SoftSkills : <<includes>> (Opcional)
  UC_Score ..> UC_Compare : <<includes>>
  UC_Compare ..> UC_Suggest : <<includes>>

  UC_Parse ..> LLM_Ext : <<invokes>> (Potencialmente)
  UC_Summary ..> LLM_Ext : <<invokes>> (Potencialmente)
  UC_SoftSkills ..> LLM_Ext : <<invokes>> (Potencialmente)

  UC_Score ..> UC_Return : (Resultado)
  UC_Suggest ..> UC_Return : (Resultado)
  UC_Summary ..> UC_Return : (Resultado Opcional)

  UC_Return ..> ATS : (Respuesta a US-019)

  note right of UC_Profile
    También es invocado
    al recepcionar candidatura
    (ver F3)
  end note

}
@enduml
```