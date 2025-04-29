# User Story: US-007

## Feature Asociada
Feature 1: Gestión del Ciclo de Vida de la Vacante

## Título
Publicar y Despublicar una Vacante

## Narrativa
Como Reclutador
Quiero poder cambiar el estado de una vacante para controlar si es visible o no en el portal de empleo
Para gestionar cuándo se aceptan nuevas candidaturas.

## Detalles
Controla la visibilidad externa de la vacante cambiando su estado (ej. Borrador, Publicada, Cerrada).

## Criterios de Aceptación (SMART y Testables - Revisados por QAL)
1.  Dado que estoy viendo el detalle o la lista de una vacante, existen controles claros (ej. botones "Publicar", "Cerrar", "Reabrir", "Archivar") para cambiar su estado.
2.  Dado que una vacante está en estado "Borrador" o "Cerrada", puedo hacer clic en "Publicar". Al hacerlo, el estado de la vacante en la BBDD cambia a "Publicada", se registra la `fecha_publicacion` (si es la primera vez), y la vacante aparece en el Portal Básico de Empleo (RF-07).
3.  Dado que una vacante está en estado "Publicada", puedo hacer clic en "Cerrar". Al hacerlo, el estado de la vacante en la BBDD cambia a "Cerrada", se registra la `fecha_cierre`, y la vacante deja de aparecer en el Portal Básico de Empleo (RF-07).
4.  Dado que una vacante está en estado "Cerrada", puedo tener la opción de "Reabrir" (la vuelve a "Publicada") o "Archivar" (la mueve a un estado final no visible y potencialmente no editable).
5.  Las transiciones de estado permitidas son lógicas (ej. no se puede publicar una vacante archivada directamente).

## Requisito(s) Funcional(es) Asociado(s)
RF-03

## Prioridad: Must Have
* **Justificación:** Esencial para controlar el flujo de candidaturas y el ciclo de vida activo de la oferta.

## Estimación Preliminar (SP): 2
* **Justificación:** Implica principalmente cambios de estado en la BBDD y lógica condicional simple para la visibilidad. La complejidad principal radica en asegurar la consistencia del estado y su reflejo en el portal (dependencia con F3). Complejidad baja.