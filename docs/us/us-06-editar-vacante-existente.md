# User Story: US-006

## Feature Asociada
Feature 1: Gestión del Ciclo de Vida de la Vacante

## Título
Editar Información de Vacante Existente

## Narrativa
Como Reclutador
Quiero poder modificar la información básica y la descripción de una vacante ya creada
Para corregir errores, actualizar requisitos o refinar detalles.

## Detalles
Permite la modificación de los datos principales de una vacante guardada.

## Criterios de Aceptación (SMART y Testables - Revisados por QAL)
1.  Dado que he iniciado sesión como Reclutador y estoy viendo la lista de vacantes o el detalle de una, puedo acceder a la opción "Editar Vacante".
2.  Dado que estoy en el formulario de edición, se cargan y muestran los datos actuales de la vacante (Título, Departamento, Ubicación, Requisitos Clave, Descripción - vinculada a US de F2).
3.  Dado que estoy en el formulario de edición, puedo modificar los campos Título, Departamento, Ubicación, Requisitos Clave y Descripción.
4.  Dado que hago clic en "Guardar Cambios", los datos modificados se actualizan en el registro `Vacante` correspondiente en la BBDD.
5.  Dado que guardo los cambios, se actualiza la fecha de `fecha_actualizacion` de la vacante.
6.  Dado que intento guardar con un campo obligatorio vacío (Título, Ubicación), se muestra un error y los cambios no se guardan.

## Requisito(s) Funcional(es) Asociado(s)
RF-02

## Prioridad: Must Have
* **Justificación:** Fundamental para mantener la información de las vacantes actualizada y corregir errores.

## Estimación Preliminar (SP): 3
* **Justificación:** Similar a Crear, pero implica cargar datos existentes antes de editar y realizar una operación de actualización (UPDATE). Complejidad baja-moderada.