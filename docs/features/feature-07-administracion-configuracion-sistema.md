## Feature 7: Administración y Configuración del Sistema

* **Descripción:** Agrupa las funcionalidades necesarias para la configuración inicial y el mantenimiento básico del ATS MVP, incluyendo la gestión de usuarios y sus roles, la autenticación para el acceso seguro, y la configuración de elementos clave del flujo de trabajo como las etapas del pipeline. También incluye la definición de la API interna que conecta ATS y Core AI.
* **Valor Aportado:** Permite adaptar y gestionar el sistema para su uso operativo, asegurando el acceso controlado y la configuración adecuada del entorno.
* **Requisitos Funcionales Asociados:**
    * RF-21: API Interna ATS MVP <-> Core AI (Must Have)
    * RF-28: Configurar Etapas Pipeline (ATS MVP) (Should Have - *Recomendado elevar a Must Have*)
    * RF-29: Gestión Básica Usuarios (ATS MVP) (Should Have)
    * RF-30: Autenticación de Usuarios (ATS MVP) (Should Have - *Recomendado elevar a Must Have*)

```plantuml	
@startuml
!theme plain
left to right direction

actor "Administrador" as Admin
actor "<<System>>\nTalentIA Core AI" as CoreAI

rectangle "ATS MVP - Administración y Configuración" {
  usecase "Definir Contrato API Interna" as UC_API <<US-001>>
  usecase "Gestionar Etapas del Pipeline" as UC_Pipeline <<US-002>>
  usecase "Gestionar Cuentas de Usuario" as UC_Users <<US-003>>
  usecase "Autenticar Usuario" as UC_Auth <<US-004>>

  'Relaciones Actor -> Casos de Uso
  Admin -- UC_Pipeline
  Admin -- UC_Users

  'Nota: Autenticación aplica a todos los roles internos
  (UC_Auth) ..> Admin : <<includes>>
  note right of UC_Auth: Aplica a Admin, \nReclutador, Manager

  'Relación con sistema externo/interno
  UC_API ..> CoreAI : Define comunicación
  note right of UC_API : Asegura integración

  'Relación de dependencia lógica
  UC_Pipeline --> UC_API : (Configuración pipeline\nnecesita API definida\npara parámetros IA)
}

@enduml
```