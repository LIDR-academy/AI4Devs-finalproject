# User Story: US-004

## Feature Asociada
Feature 7: Administración y Configuración del Sistema

## Título
Autenticar Usuario para Acceder al Sistema

## Narrativa
Como usuario registrado (Reclutador, Manager, Admin)
Quiero poder iniciar sesión en el ATS MVP usando mi email y contraseña
Para acceder a las funcionalidades correspondientes a mi rol y proteger la información del sistema.

## Detalles
Cubre el proceso de login y la protección de acceso.

## Criterios de Aceptación (SMART y Testables - Revisados por QAL)
1.  Dado que intento acceder a una URL interna del ATS sin estar autenticado, soy redirigido a la página de Login.
2.  Dado que estoy en la página de Login, introduzco mi email de usuario registrado y mi contraseña correcta, y hago clic en "Iniciar Sesión", soy redirigido al dashboard o a la página interna solicitada y se establece una sesión activa.
3.  Dado que estoy en la página de Login, introduzco mi email de usuario registrado pero una contraseña incorrecta, se muestra un mensaje de error "Credenciales inválidas" y permanezco en la página de Login sin iniciar sesión.
4.  Dado que estoy en la página de Login, introduzco un email no registrado en el sistema, se muestra un mensaje de error "Credenciales inválidas" y permanezco en la página de Login sin iniciar sesión.
5.  Dado que he iniciado sesión, existe una opción visible para "Cerrar Sesión".
6.  Dado que hago clic en "Cerrar Sesión", mi sesión activa se termina y soy redirigido a la página de Login.
7.  Dado que mi cuenta de usuario está marcada como "Inactiva" (ver US-003), aunque introduzca mi email y contraseña correctos en el Login, se muestra un mensaje indicando que la cuenta está inactiva y no puedo iniciar sesión.

## Requisito(s) Funcional(es) Asociado(s)
RF-30

## Prioridad: Must Have
* **Justificación:** Requisito de seguridad fundamental. Imprescindible para proteger el acceso al sistema.

## Estimación Preliminar (SP): 3
* **Justificación:** Es una funcionalidad estándar y bien conocida (login/logout, manejo de sesión). Aunque crítica para la seguridad, la complejidad de implementación suele ser moderada usando frameworks/librerías estándar. Se asume hashing seguro de contraseñas.