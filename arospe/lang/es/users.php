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
