## Feature 8: Mejoras Adicionales de Usabilidad y Funcionalidad

* **Descripción:** Conjunto de funcionalidades clasificadas como "Could Have" que mejoran la experiencia de usuario o añaden capacidades convenientes, pero no son esenciales para el flujo principal del MVP. Incluye notificaciones, búsqueda, dashboard básico y exportación.
* **Valor Aportado:** Aumenta la comodidad y eficiencia del uso del sistema para tareas secundarias o de conveniencia.
* **Requisitos Funcionales Asociados:**
    * RF-32: Notificaciones en ATS MVP (Could Have)
    * RF-33: Búsqueda Básica de Candidatos (Could Have)
    * RF-34: Dashboard Analítico Básico (Could Have)
    * RF-35: Exportar Datos Candidato (Could Have)

```plantuml	
@startuml
!theme plain
left to right direction

actor "Reclutador / HM" as User
actor "Admin"

rectangle "ATS MVP - Mejoras Adicionales" {
  usecase "Recibir Notificaciones Internas" as UC_Notify <<US-041>>
  usecase "Buscar Candidatos" as UC_Search <<US-042>>
  usecase "Visualizar Dashboard Básico" as UC_Dashboard <<US-043>>
  usecase "Exportar Datos Candidato" as UC_Export <<US-044>>

  User -- UC_Notify
  User -- UC_Search
  (User, Admin) -- UC_Dashboard 'Admin también podría verlo
  User -- UC_Export 'O quizá Admin también? Asumimos Rec/HM por ahora
}
@enduml
```