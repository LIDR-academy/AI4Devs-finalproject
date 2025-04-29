# User Story: US-044

## Feature Asociada
Feature 8: Mejoras Adicionales de Usabilidad y Funcionalidad

## Título
Exportar Información Básica de un Candidato

## Narrativa
Como Reclutador
Quiero poder exportar los datos básicos de contacto y el último CV de un candidato a un archivo
Para poder compartir su información fácilmente fuera del sistema si es necesario.

## Detalles
Permite la extracción de datos de un candidato a un formato portable.

## Criterios de Aceptación (SMART y Testables - Revisados por QAL)
1.  Dado que estoy viendo el detalle de una candidatura.
2.  Existe un botón o enlace "Exportar Datos".
3.  Dado que hago clic en "Exportar Datos".
4.  El sistema genera un archivo descargable (ej. un archivo ZIP).
5.  El archivo ZIP contiene:
    * Un archivo de texto o CSV con Nombre, Email, Teléfono del candidato.
    * El archivo del último CV adjuntado por el candidato para esa candidatura (si existe).
6.  La descarga del archivo se inicia en mi navegador.

## Requisito(s) Funcional(es) Asociado(s)
RF-35

## Prioridad: Could Have
* **Justificación:** Funcionalidad de conveniencia para casos de uso específicos, no esencial para el flujo principal.

## Estimación Preliminar (SP): 2
* **Justificación:** Requiere lógica de backend para recopilar los datos básicos, recuperar el archivo del CV del almacenamiento, empaquetarlos (si es ZIP) y generar la descarga. Baja complejidad.