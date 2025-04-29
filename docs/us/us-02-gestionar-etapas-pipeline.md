# User Story: US-002

## Feature Asociada
Feature 7: Administración y Configuración del Sistema

## Título
Gestionar Etapas del Pipeline de Selección

## Narrativa
Como Administrador del Sistema (o Reclutador Principal)
Quiero poder crear, editar, ordenar y eliminar las etapas del pipeline de selección
Para adaptar el flujo de trabajo del ATS a los procesos de reclutamiento específicos de nuestra organización y poder usarlas en la configuración IA.

## Detalles
Permite la personalización del flujo por el que pasan los candidatos. Es esencial para configurar cómo funciona el pipeline (RF-16) y para seleccionar etapas destino en la configuración IA (RF-04B).

## Criterios de Aceptación (SMART y Testables - Revisados por QAL)
1.  Dado que he iniciado sesión como Administrador, puedo acceder a la sección "Configuración del Pipeline".
2.  Dado que estoy en la sección de configuración, puedo ver la lista de etapas actuales con su orden.
3.  Dado que estoy en la sección de configuración, puedo añadir una nueva etapa introduciendo su nombre (no vacío) y se guarda correctamente, apareciendo al final de la lista.
4.  Dado que estoy en la sección de configuración, puedo editar el nombre de una etapa existente y el cambio se refleja en la lista.
5.  Dado que estoy en la sección de configuración, puedo cambiar el orden de las etapas (ej. mediante drag-and-drop o botones subir/bajar) y el nuevo orden se guarda y persiste.
6.  Dado que estoy en la sección de configuración, puedo marcar/desmarcar una etapa como "seleccionable para sugerencia IA" y esta marca se guarda.
7.  Dado que una etapa no está siendo utilizada por ninguna candidatura activa ni como etapa predefinida en ninguna vacante, puedo eliminarla y desaparece de la lista.
8.  Dado que intento eliminar una etapa que está en uso, el sistema muestra un mensaje de error claro y no permite la eliminación.

## Requisito(s) Funcional(es) Asociado(s)
RF-28

## Prioridad: Must Have
* **Justificación:** Aunque basado en RF-28 (Should Have), la capacidad de configurar etapas es un prerrequisito indispensable para la funcionalidad Must Have de sugerencia de etapa IA (RF-04B, RF-12C, RF-14B).

## Estimación Preliminar (SP): 5
* **Justificación:** Requiere desarrollo de interfaz de usuario (CRUD + reordenación), lógica de negocio y persistencia en base de datos para las etapas y su configuración asociada. Complejidad moderada.