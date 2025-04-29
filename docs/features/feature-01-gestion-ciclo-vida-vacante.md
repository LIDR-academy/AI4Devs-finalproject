## Feature 1: Gestión del Ciclo de Vida de la Vacante

* **Descripción:** Permite a los usuarios (principalmente Reclutadores) crear, configurar, editar, publicar y despublicar las ofertas de empleo dentro del ATS MVP. Es la base para iniciar cualquier proceso de reclutamiento.
* **Valor Aportado:** Control total sobre las ofertas de empleo, desde su creación hasta su cierre, asegurando que la información es correcta y visible cuando es necesario.
* **Requisitos Funcionales Asociados:**
    * RF-01: Crear Vacante (Must Have)
    * RF-02: Editar Vacante (Must Have)
    * RF-03: Publicar/Despublicar Vacante (Must Have)
    * RF-31: Plantillas de JD (Could Have)

```plantuml	
@startuml
!theme plain
left to right direction

actor "Reclutador" as R

rectangle "ATS MVP - Gestión de Vacantes" {
  usecase "Crear Nueva Vacante" as UC_Create <<US-005>>
  usecase "Editar Vacante Existente" as UC_Edit <<US-006>>
  usecase "Publicar / Despublicar Vacante" as UC_Publish <<US-007>>
  usecase "Utilizar Plantillas de JD" as UC_Template <<US-008>>

  R -- UC_Create
  R -- UC_Edit
  R -- UC_Publish
  R -- UC_Template

  UC_Template ..> UC_Create : <<extends>>
  UC_Edit ..> UC_Template : <<extends>> (Guardar como plantilla)

}
@enduml
```