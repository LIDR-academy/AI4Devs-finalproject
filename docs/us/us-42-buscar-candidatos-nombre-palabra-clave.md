# User Story: US-042

## Feature Asociada
Feature 8: Mejoras Adicionales de Usabilidad y Funcionalidad

## Título
Buscar Candidatos por Nombre o Palabra Clave

## Narrativa
Como Reclutador/Hiring Manager
Quiero poder buscar candidatos dentro del ATS introduciendo su nombre o alguna palabra clave
Para localizar rápidamente un perfil específico.

## Detalles
Añade una función de búsqueda básica al sistema.

## Criterios de Aceptación (SMART y Testables - Revisados por QAL)
1.  Dado que estoy en una vista principal del ATS (ej. dashboard, lista de vacantes), existe un campo de búsqueda visible.
2.  Dado que introduzco un texto (ej. nombre de candidato, email parcial) y presiono Enter o un botón de buscar.
3.  El sistema realiza una búsqueda en los campos relevantes de los registros `Candidato` (Nombre, Email) y potencialmente `Candidatura` (¿tags?, ¿notas?).
4.  Se muestra una página de resultados con la lista de candidaturas que coinciden con el término de búsqueda.
5.  Cada resultado enlaza al perfil de la candidatura correspondiente.
6.  Si no hay resultados, se muestra un mensaje indicándolo.
7.  La búsqueda devuelve resultados en un tiempo razonable (ej. < 3 segundos).

## Requisito(s) Funcional(es) Asociado(s)
RF-33

## Prioridad: Could Have
* **Justificación:** Conveniente para encontrar candidatos, pero no bloquea el flujo principal.

## Estimación Preliminar (SP): 3
* **Justificación:** Requiere añadir el campo de búsqueda en la UI y lógica de backend para realizar consultas simples (LIKE o similar) en la base de datos y presentar los resultados. Complejidad baja-moderada.