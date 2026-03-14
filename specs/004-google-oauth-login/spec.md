# US1 - Acceso a la aplicacion mediante cuenta de Google

**Objetivo del Feature**
El usuario puede identificarse en Meditation Builder usando su cuenta de Gmail, de modo que la aplicacion le reconoce siempre como la misma persona y conserva unicamente sus propias meditaciones entre sesiones.

**User Story**
Como usuario de Meditation Builder, quiero iniciar sesion con mi cuenta de Gmail para que la aplicacion me reconozca siempre como la misma persona y conserve todas mis meditaciones entre sesiones.

---

**Descripcion (negocio)**
Actualmente la aplicacion trabaja con una identidad de usuario fija y compartida para todos, lo que impide que cada persona tenga su propio espacio de meditaciones. Con este feature, cualquier visitante podra identificarse con su cuenta de Gmail y la aplicacion le mostrara exclusivamente su historial personal.

La primera vez que alguien accede con su cuenta de Gmail, la aplicacion crea automaticamente su perfil personal y le presenta su biblioteca vacia. Las siguientes veces, la aplicacion le reconoce y carga directamente su contenido. Si alguien no esta identificado e intenta acceder a cualquier seccion, es redirigido a la pantalla de inicio de sesion.

---

**Criterios de aceptacion (BDD, lenguaje de negocio)**

```gherkin
Feature: Acceso a Meditation Builder mediante cuenta de Google

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
    And al volver a la aplicacion ve la pantalla de acceso, sin datos de sesion anteriores

  Scenario: El usuario cancela la pantalla de autorizacion de Google
    Given un visitante en la pantalla de inicio de sesion
    When hace clic en Iniciar sesion con Google
    And cancela la pantalla de autorizacion de Google sin seleccionar una cuenta
    Then regresa a la pantalla de inicio de sesion sin ningun mensaje de error bloqueante
```

---

**Reglas de negocio (inmutables)**

- Cada usuario tiene un perfil unico en la aplicacion, vinculado exclusivamente a su cuenta de Gmail.
- Dos personas con cuentas de Gmail diferentes nunca comparten meditaciones ni historial.
- Un usuario no identificado no puede ver ni crear meditaciones.
- Una vez cerrada la sesion, no queda ningun dato de sesion accesible sin volver a identificarse.
- La identidad del usuario no cambia entre sesiones: el mismo Gmail siempre produce el mismo perfil.

---

**Notas de negocio (no tecnicas)**

- **Supuestos del negocio:**
  El usuario tiene una cuenta de Google/Gmail valida y activa. La autorizacion se realiza integramente a traves de la pantalla oficial de Google.

- **Mensajes visibles para el usuario:**
  - Bienvenida: Inicia sesion con tu cuenta de Google para acceder a tus meditaciones.
  - Boton principal: Iniciar sesion con Google
  - Cabecera autenticada: nombre, foto y enlace Cerrar sesion.
  - Error de acceso fallido: No ha sido posible iniciar sesion. Por favor, intentalo de nuevo.

- **Comportamientos en casos especiales:**
  - Si el usuario cancela la pantalla de Google, regresa al login sin error bloqueante.
  - Si el perfil ya existe (usuario recurrente), la aplicacion le reconoce sin pedirle datos adicionales.

- **Restricciones de negocio visibles:**
  - Solo se admite inicio de sesion mediante Google. No existe registro por correo y contrasena propios.

---

**Fuera de alcance (Out of Scope)**

- Registro o inicio de sesion con otros proveedores (Facebook, Microsoft, Apple, etc.).
- Recuperacion o cambio de contrasenias (gestionado integramente por Google).
- Gestion de roles o niveles de acceso diferenciados entre usuarios.
- Edicion del perfil de usuario dentro de la aplicacion.
- Eliminacion de cuentas de usuario.
- Notificaciones por correo electronico.

---

**Metadatos del Feature**

- **Feature Branch:** 004-google-oauth-login
- **Created:** 2026-02-25
- **Status:** Draft
- **Bounded Context:** Identity (nuevo bounded context)
- **Business Trigger:** Accion explicita del usuario: clic en Iniciar sesion con Google
- **Input:** quiero que crees un sistema de login para conectarme a esta aplicacion a traves de mi cuenta de gmail.
