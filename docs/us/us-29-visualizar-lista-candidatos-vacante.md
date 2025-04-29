# User Story: US-029

## Feature Asociada
Feature 5: Visualización y Gestión del Pipeline de Selección

## Título
Visualizar Lista de Candidatos por Vacante

## Narrativa
Como Reclutador/Hiring Manager
Quiero poder ver una lista de todos los candidatos que han aplicado a una vacante específica, con su información clave (incluyendo score y etapa sugerida IA)
Para tener una visión general y poder acceder a sus perfiles.

## Detalles
Proporciona la vista de tabla/lista principal para gestionar los candidatos de una vacante.

## Criterios de Aceptación (SMART y Testables - Revisados por QAL)
1.  Dado que selecciono una vacante, puedo acceder a una vista que lista sus candidaturas asociadas.
2.  La lista muestra columnas para: Nombre Candidato, Fecha Aplicación, Etapa Actual, Score IA (si evaluado, US-027), Etapa Sugerida IA (si evaluado, US-028).
3.  La lista es paginada si el número de candidatos supera un umbral razonable (ej. 20 por página).
4.  Puedo hacer clic en una fila para navegar al detalle de esa candidatura.
5.  (Opcional - US-033) La lista permite ordenar por las columnas principales, incluyendo Score IA.

## Requisito(s) Funcional(es) Asociado(s)
RF-15

## Prioridad: Must Have
* **Justificación:** Vista operativa esencial para la gestión diaria de las candidaturas de una vacante.

## Estimación Preliminar (SP): 3
* **Justificación:** Requiere desarrollo de UI (tabla/lista paginada) y lógica de backend para consultar y devolver los datos relevantes de las candidaturas asociadas a una vacante. Complejidad baja-moderada.