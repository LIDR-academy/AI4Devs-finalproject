<?php

return [

    /*
    |--------------------------------------------------------------------------
    | User Status Labels
    |--------------------------------------------------------------------------
    |
    | Human-readable labels for the App\Enums\UserStatus cases, resolved by
    | UserStatus::label().
    |
    */

    'statuses' => [
        'active' => 'Active',
        'inactive' => 'Inactive',
        'suspended' => 'Suspended',
    ],

    /*
    |--------------------------------------------------------------------------
    | Pending Email Change
    |--------------------------------------------------------------------------
    |
    | Copy used by the pending-email-change mechanism: the notification sent
    | to the new address, the profile-page notice, and the flash messages
    | shown after using (or failing to use) the confirmation link.
    |
    */

    'email_change' => [
        'notification_subject' => 'Confirm your new email address',
        'notification_line' => 'You (or an administrator) requested to change the email address on your account. Click below to confirm this is your new address.',
        'notification_action' => 'Confirm Email Address',
        'notification_expire' => 'This verification link will expire in 60 minutes.',
        'pending_notice' => 'A change to :email is pending. Use the link sent to that address to confirm it.',
        'confirmed' => 'Your email address has been updated.',
        'refused' => 'This email verification link is no longer valid.',
        'throttled' => 'Too many email change requests. Please try again later.',
    ],

];
