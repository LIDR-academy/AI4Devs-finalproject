# User Story: US-010

## Feature Asociada
Feature 3: Portal de Empleo y Proceso de Aplicación

## Título
Aplicar a una Vacante

## Narrativa
Como Candidato interesado
Quiero poder completar un formulario sencillo con mis datos básicos y adjuntar mi CV
Para enviar mi candidatura a una vacante específica que he visto en el portal.

## Detalles
Cubre la interfaz y la acción del candidato para postular a una oferta.

## Criterios de Aceptación (SMART y Testables - Revisados por QAL)
1.  Dado que hago clic en el enlace "Aplicar" de una vacante en el portal (US-009), se me presenta un formulario de aplicación web.
2.  Dado que estoy en el formulario, veo claramente a qué vacante estoy aplicando.
3.  Dado que estoy en el formulario, puedo introducir mi Nombre Completo (obligatorio, texto no vacío) y mi Email (obligatorio, formato email válido).
4.  Dado que estoy en el formulario, puedo (opcionalmente) introducir mi Número de Teléfono.
5.  Dado que estoy en el formulario, puedo seleccionar un archivo de mi dispositivo usando un campo de carga de archivos.
6.  Dado que selecciono un archivo, el sistema valida que la extensión sea .pdf o .docx (se muestra error si no lo es).
7.  Dado que (opcional pero recomendado GDPR) existe un checkbox para aceptar la política de privacidad, debo marcarlo para poder enviar.
8.  Dado que relleno los campos obligatorios, adjunto un CV válido y hago clic en "Enviar Aplicación", mi solicitud es enviada al sistema (ver US-011).

## Requisito(s) Funcional(es) Asociado(s)
RF-08

## Prioridad: Must Have
* **Justificación:** El mecanismo por el cual el candidato envía su información; crítico para el flujo.

## Estimación Preliminar (SP): 5
* **Justificación:** Requiere desarrollo de frontend (formulario, validaciones, manejo de carga de archivo), lógica de validación de tipos de archivo, y la llamada al backend para enviar los datos. Complejidad moderada.