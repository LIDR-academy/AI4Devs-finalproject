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
    | Users Index Screen
    |--------------------------------------------------------------------------
    |
    | Copy for the Users list screen (App\Livewire\Users\Index). Story 0006
    | owns the full markup; this key is used by both this story's placeholder
    | view and 0006's real one.
    |
    */

    'index' => [
        'summary' => ':total users · :active active',
        'action_not_allowed' => 'Action not allowed',
    ],

    /*
    |--------------------------------------------------------------------------
    | User Creation
    |--------------------------------------------------------------------------
    |
    | Copy for App\Actions\Users\CreateUser's own rate limit (story 0015
    | finding F6 part 1).
    |
    */

    'create' => [
        'throttled' => 'Too many user creation requests. Please try again later.',
    ],

    /*
    |--------------------------------------------------------------------------
    | Sign-in
    |--------------------------------------------------------------------------
    |
    | Copy shown to a user with otherwise-valid credentials whose account
    | status blocks sign-in (App\Actions\Fortify\AuthenticateUser). Must
    | never name which non-active status applies.
    |
    */

    'login' => [
        'not_active' => 'This account is not active. Please contact an administrator.',
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
        'pending_notice_admin' => 'A change to :email is pending confirmation from the account holder.',
        'confirmed' => 'Your email address has been updated.',
        'refused' => 'This email verification link is no longer valid.',
        'throttled' => 'Too many email change requests. Please try again later.',
    ],

    /*
    |--------------------------------------------------------------------------
    | User Invitation
    |--------------------------------------------------------------------------
    |
    | Copy for the invitation mailed to a user created by an administrator
    | from the Users screen, inviting them to set their own password.
    |
    */

    'invitation' => [
        'subject' => 'You have been invited to Arospe',
        'line' => 'An administrator created an account for you. Click below to set your password and get started.',
        'action' => 'Set Your Password',
        'expire' => 'This invitation link will expire soon.',
    ],

];
