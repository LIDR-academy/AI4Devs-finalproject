## Feature 2: Asistencia IA para Descripción de Puesto (JD)

* **Descripción:** Integra la capacidad de TalentIA Core AI para generar automáticamente borradores de Descripciones de Puesto (JD), permitiendo al Reclutador solicitar, recibir, editar y configurar parámetros específicos de IA (como el score de corte y etapas sugeridas) asociados a esa JD.
* **Valor Aportado:** Reduce drásticamente el tiempo de creación de JDs, mejora la calidad potencial del contenido y permite configurar cómo la IA evaluará a los candidatos para esa vacante específica.
* **Requisitos Funcionales Asociados:**
    * RF-04: Solicitar Generación IA de JD (Must Have)
    * RF-04B: Configurar Parámetros IA en JD (Must Have)
    * RF-05: Recibir y Editar JD generada (Must Have)
    * RF-06: Generar Contenido JD (Core AI) (Must Have)
    * RF-06B: Almacenar Parámetros IA en JD (Core AI) (Must Have)
    * RF-23: Usar Datos Internos para JD (Core AI) (Should Have)


```plantuml	
@startuml
!theme plain
left to right direction

actor "Reclutador" as R
actor "<<System>>\nTalentIA Core AI" as CoreAI
actor "<<System>>\nProveedor LLM" as LLM_Ext <<External>>

rectangle "ATS MVP & Core AI - Asistencia JD" {
  usecase "Solicitar Generación IA de JD" as UC_Request <<US-012>>
  usecase "Configurar Parámetros IA (Corte, Etapas)" as UC_Config <<US-013>>
  usecase "Recibir y Editar JD Generada" as UC_Edit <<US-014>>

  R -- UC_Request
  R -- UC_Config
  R -- UC_Edit

  rectangle "TalentIA Core AI" {
    usecase "Generar Borrador JD" as UC_Generate <<US-015>>
    usecase "Almacenar Parámetros IA" as UC_StoreParams <<US-016>>
    usecase "Usar Datos Internos (Opcional)" as UC_InternalData <<US-017>>
  }

  UC_Request ..> UC_Generate : <<triggers>>
  UC_Config ..> UC_StoreParams : <<triggers>>
  UC_Generate ..> UC_Edit : (Devuelve JD)

  UC_Generate ..> LLM_Ext : <<invokes>>
  UC_Generate ..> UC_InternalData : <<includes>> (Opcional)

}
@enduml
```