<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Etiquetas de estado de usuario
    |--------------------------------------------------------------------------
    |
    | Etiquetas legibles para los valores de App\Enums\UserStatus, resueltas
    | por UserStatus::label().
    |
    */

    'statuses' => [
        'active' => 'Activo',
        'inactive' => 'Inactivo',
        'suspended' => 'Suspendido',
    ],

    /*
    |--------------------------------------------------------------------------
    | Pantalla de listado de usuarios
    |--------------------------------------------------------------------------
    |
    | Textos de la pantalla de listado de usuarios (App\Livewire\Users\Index).
    | La historia 0006 posee el marcado completo; esta clave la usa tanto la
    | vista provisional de esta historia como la definitiva de 0006.
    |
    */

    'index' => [
        'summary' => ':total usuarios · :active activos',
        'action_not_allowed' => 'Acción no permitida',
    ],

    /*
    |--------------------------------------------------------------------------
    | Creación de usuarios
    |--------------------------------------------------------------------------
    |
    | Texto del límite de solicitudes propio de App\Actions\Users\CreateUser
    | (historia 0015, hallazgo F6 parte 1).
    |
    */

    'create' => [
        'throttled' => 'Demasiadas solicitudes de creación de usuarios. Inténtalo de nuevo más tarde.',
    ],

    /*
    |--------------------------------------------------------------------------
    | Inicio de sesión
    |--------------------------------------------------------------------------
    |
    | Texto mostrado a un usuario con credenciales por lo demás válidas cuyo
    | estado de cuenta bloquea el inicio de sesión
    | (App\Actions\Fortify\AuthenticateUser). No debe indicar nunca qué
    | estado no activo aplica.
    |
    */

    'login' => [
        'not_active' => 'Esta cuenta no está activa. Contacta con un administrador.',
    ],

    /*
    |--------------------------------------------------------------------------
    | Cambio de correo pendiente
    |--------------------------------------------------------------------------
    |
    | Textos del mecanismo de cambio de correo pendiente: la notificación
    | enviada a la nueva dirección, el aviso en la página de perfil y los
    | mensajes flash mostrados tras usar (o no poder usar) el enlace de
    | confirmación.
    |
    */

    'email_change' => [
        'notification_subject' => 'Confirma tu nueva dirección de correo',
        'notification_line' => 'Se ha solicitado un cambio de dirección de correo en tu cuenta (por ti o por un administrador). Haz clic abajo para confirmar que esta es tu nueva dirección.',
        'notification_action' => 'Confirmar dirección de correo',
        'notification_expire' => 'Este enlace de verificación caduca en 60 minutos.',
        'pending_notice' => 'Hay un cambio pendiente a :email. Usa el enlace enviado a esa dirección para confirmarlo.',
        'pending_notice_admin' => 'Hay un cambio pendiente a :email, a la espera de confirmación por parte del titular de la cuenta.',
        'confirmed' => 'Tu dirección de correo ha sido actualizada.',
        'refused' => 'Este enlace de verificación de correo ya no es válido.',
        'throttled' => 'Demasiadas solicitudes de cambio de correo. Inténtalo de nuevo más tarde.',
    ],

    /*
    |--------------------------------------------------------------------------
    | Invitación de usuario
    |--------------------------------------------------------------------------
    |
    | Textos de la invitación enviada a un usuario creado por un
    | administrador desde la pantalla de Usuarios, invitándole a establecer
    | su propia contraseña.
    |
    */

    'invitation' => [
        'subject' => 'Has sido invitado a Arospe',
        'line' => 'Un administrador ha creado una cuenta para ti. Haz clic abajo para establecer tu contraseña y comenzar.',
        'action' => 'Establecer contraseña',
        'expire' => 'Este enlace de invitación caducará pronto.',
    ],

];
