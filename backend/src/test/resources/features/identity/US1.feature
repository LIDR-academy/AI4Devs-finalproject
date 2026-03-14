# language: en
@identity
Feature: Acceso a Meditation Builder mediante cuenta de Google
  Como usuario de Meditation Builder
  Quiero iniciar sesion con mi cuenta de Gmail
  Para que la aplicacion me reconozca siempre como la misma persona y conserve todas mis meditaciones entre sesiones

  Scenario: Primer acceso de un usuario nuevo con su cuenta de Gmail
    Given un visitante que nunca ha accedido a la aplicacion
    When hace clic en Iniciar sesion con Google
    And selecciona su cuenta de Gmail y autoriza el acceso
    Then ve la pantalla principal de la aplicacion con su nombre y foto de perfil
    And su biblioteca de meditaciones aparece vacia

  Scenario: Acceso recurrente de un usuario ya registrado
    Given un usuario que ya inicio sesion anteriormente
    When vuelve a hacer clic en Iniciar sesion con Google
    And selecciona la misma cuenta de Gmail
    Then la aplicacion le da la bienvenida y muestra directamente su biblioteca con sus meditaciones anteriores

  Scenario: Acceso a una seccion protegida sin estar identificado
    Given un visitante que no ha iniciado sesion
    When intenta acceder a la biblioteca de meditaciones o a la creacion de una nueva meditacion
    Then la aplicacion le redirige a la pantalla de inicio de sesion
    And le muestra el boton Iniciar sesion con Google

  Scenario: Cierre de sesion
    Given un usuario con sesion activa
    When hace clic en Cerrar sesion
    Then la aplicacion le desconecta y le redirige a la pantalla de inicio de sesion
    And al volver a la aplicacion ve la pantalla de acceso sin datos de sesion anteriores

  Scenario: El usuario cancela la pantalla de autorizacion de Google
    Given un visitante en la pantalla de inicio de sesion
    When hace clic en Iniciar sesion con Google
    And cancela la pantalla de autorizacion de Google sin seleccionar una cuenta
    Then regresa a la pantalla de inicio de sesion sin ningun mensaje de error bloqueante
