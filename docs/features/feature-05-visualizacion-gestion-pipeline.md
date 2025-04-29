## Feature 5: Visualización y Gestión del Pipeline de Selección

* **Descripción:** Proporciona las herramientas visuales para que Reclutadores y Managers revisen a los candidatos dentro de una vacante, vean los resultados de la evaluación IA (score, resumen, etapa sugerida), consulten el historial unificado del candidato, gestionen el avance de las candidaturas a través de las distintas etapas del pipeline (ej. vista Kanban), y ordenen/filtren la información para facilitar la gestión.
* **Valor Aportado:** Ofrece visibilidad y control sobre el flujo de candidatos, permitiendo una gestión eficiente del proceso de selección basada en la información disponible (incluida la IA).
* **Requisitos Funcionales Asociados:**
    * RF-14: Mostrar Evaluación IA (ATS MVP) (Must Have)
    * RF-14B: Mostrar Etapa Sugerida (ATS MVP) (Must Have)
    * RF-15: Visualizar Candidatos por Vacante (Must Have)
    * RF-16: Visualizar Pipeline Básico (Must Have)
    * RF-17: Mover Candidatos entre Etapas (Must Have)
    * RF-14C: Automatizar Movimiento Inicial (Could Have)
    * RF-25: Mostrar Resumen IA (ATS MVP) (Should Have)
    * RF-26: Ordenar/Filtrar por Score (ATS MVP) (Should Have)
    * RF-26B: Mostrar Historial Unificado (ATS MVP) (Should Have)
    * RF-37: Comparativa Candidatos (ATS MVP) (Could Have)

```plantuml	
@startuml
!theme plain
left to right direction

actor "Reclutador / HM" as User
actor "<<System>>\nATS MVP" as ATS
actor "<<System>>\nTalentIA Core AI" as CoreAI

rectangle "ATS MVP - Pipeline y Revisión" {
  usecase "Visualizar Lista Candidatos" as UC_List <<US-029>>
  usecase "Visualizar Pipeline Kanban" as UC_Kanban <<US-030>>
  usecase "Mover Candidato entre Etapas" as UC_Move <<US-031>>
  usecase "Ordenar/Filtrar por Score IA" as UC_SortFilter <<US-034>>
  usecase "Consultar Historial Candidato" as UC_History <<US-035>>
  usecase "Comparar Candidatos" as UC_Compare <<US-036>>

  User -- UC_List
  User -- UC_Kanban
  User -- UC_Move
  User -- UC_SortFilter
  User -- UC_History
  User -- UC_Compare

  usecase "Mostrar Evaluación IA (Score)" as UC_ShowScore <<US-027>>
  usecase "Mostrar Etapa Sugerida IA" as UC_ShowStage <<US-028>>
  usecase "Mostrar Resumen IA" as UC_ShowSummary <<US-033>>
  usecase "Automatizar Movimiento Inicial (Opc)" as UC_AutoMove <<US-032>>

  ATS -- UC_ShowScore
  ATS -- UC_ShowStage
  ATS -- UC_ShowSummary
  ATS -- UC_AutoMove

  UC_List ..> UC_ShowScore : <<includes>>
  UC_Kanban ..> UC_ShowScore : <<includes>>
  UC_List ..> UC_ShowStage : <<includes>>
  UC_Kanban ..> UC_ShowStage : <<includes>>
  (UC_List, UC_Kanban) ..> UC_ShowSummary : <<includes>> (Opcional)

  UC_History ..> CoreAI : (Consulta Perfil CandidatoIA)

  UC_AutoMove ..> UC_Move : <<includes>> (Caso automático)
}
@enduml
```