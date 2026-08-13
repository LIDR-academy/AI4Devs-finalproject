<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Queue\SerializesModels;

class UserInvitation extends Notification implements ShouldQueue
{
    use Queueable, SerializesModels;

    /**
     * Create a new notification instance.
     *
     * `$token` is a password-reset broker token
     * (`Password::broker()->createToken($user)`), not Fortify's own
     * `ResetPassword` notification — see App\Actions\Users\CreateUser for
     * why the two must not be conflated. `$email` is passed explicitly
     * rather than read off `$notifiable` in toMail(), matching
     * PendingEmailVerification's convention.
     */
    public function __construct(
        public string $token,
        public string $email,
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $url = url(route('password.reset', [
            'token' => $this->token,
            'email' => $this->email,
        ], false));

        return (new MailMessage)
            ->subject(trans('users.invitation.subject'))
            ->line(trans('users.invitation.line'))
            ->action(trans('users.invitation.action'), $url)
            ->line(trans('users.invitation.expire'));
    }
}
