# User Story: US-005

## Feature Asociada
Feature 1: Gestión del Ciclo de Vida de la Vacante

## Título
Crear Nueva Vacante

## Narrativa
Como Reclutador
Quiero poder crear una nueva vacante en el sistema introduciendo su información básica
Para iniciar formalmente un proceso de selección.

## Detalles
Cubre la creación inicial del registro de la vacante con sus datos fundamentales.

## Criterios de Aceptación (SMART y Testables - Revisados por QAL)
1.  Dado que he iniciado sesión como Reclutador, puedo acceder a la opción "Crear Nueva Vacante".
2.  Dado que estoy en el formulario de creación, puedo introducir Título (obligatorio, texto no vacío), Departamento (opcional, texto), Ubicación (obligatorio, texto no vacío), y Requisitos Clave iniciales (opcional, texto).
3.  Dado que hago clic en "Guardar", se crea un nuevo registro `Vacante` en la BBDD con los datos introducidos y un estado inicial "Borrador".
4.  Dado que se guarda la vacante, el sistema le asigna un ID único.
5.  Dado que se guarda la vacante, soy redirigido a la vista de detalle/edición de la vacante recién creada.
6.  Dado que intento guardar sin completar un campo obligatorio (Título, Ubicación), se muestra un mensaje de error específico por campo y la vacante no se guarda.

## Requisito(s) Funcional(es) Asociado(s)
RF-01

## Prioridad: Must Have
* **Justificación:** Funcionalidad absolutamente esencial para iniciar cualquier proceso en el ATS.

## Estimación Preliminar (SP): 3
* **Justificación:** Implica un formulario de UI, validaciones básicas y una operación de creación (INSERT) en la base de datos. Complejidad baja-moderada.