# User Story: US-008

## Feature Asociada
Feature 1: Gestión del Ciclo de Vida de la Vacante

## Título
Utilizar Plantillas para Crear Vacantes

## Narrativa
Como Reclutador
Quiero poder guardar una vacante como plantilla y usar plantillas existentes al crear una nueva vacante
Para reutilizar contenido y acelerar la creación de puestos de trabajo similares.

## Detalles
Permite guardar y cargar configuraciones de vacantes predefinidas.

## Criterios de Aceptación (SMART y Testables - Revisados por QAL)
1.  Dado que estoy editando una vacante (US-006), existe una opción "Guardar como Plantilla". Al usarla, se me pide un nombre para la plantilla y se guarda una copia de la información relevante de la vacante (ej. título, descripción, requisitos) como una plantilla reutilizable.
2.  Dado que estoy creando una nueva vacante (US-005), existe una opción "Cargar desde Plantilla".
3.  Dado que elijo "Cargar desde Plantilla", se me presenta una lista de plantillas guardadas previamente.
4.  Dado que selecciono una plantilla de la lista, los campos correspondientes en el formulario de creación de vacante (título, descripción, requisitos, etc.) se rellenan automáticamente con los valores de la plantilla seleccionada.
5.  Puedo editar los campos rellenados por la plantilla antes de guardar la nueva vacante.
6.  Puedo gestionar (ver, eliminar) las plantillas guardadas desde una sección de configuración (puede ser parte de US-002 o separada).

## Requisito(s) Funcional(es) Asociado(s)
RF-31

## Prioridad: Could Have
* **Justificación:** Mejora la eficiencia pero no es estrictamente necesaria para el flujo MVP básico.

## Estimación Preliminar (SP): 5
* **Justificación:** Requiere un nuevo modelo de datos para las plantillas, lógica para guardar/cargar, y desarrollo de UI para la selección y gestión de plantillas. Complejidad moderada.