<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\URL;

class PendingEmailVerification extends Notification implements ShouldQueue
{
    use Queueable, SerializesModels;

    /**
     * Create a new notification instance.
     *
     * `$newEmail` is expected to already be normalised (lowercased) by the
     * caller (App\Actions\Users\RequestEmailChange) — this class neither
     * re-normalises nor defends against a raw value, since the link's hash
     * must be built from the exact same string persisted to
     * `pending_email`.
     */
    public function __construct(
        public User $user,
        public string $newEmail,
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
        $url = URL::temporarySignedRoute(
            'email-change.confirm',
            now()->addMinutes(60),
            ['user' => $this->user->id, 'hash' => sha1($this->newEmail)],
        );

        return (new MailMessage)
            ->subject(trans('users.email_change.notification_subject'))
            ->line(trans('users.email_change.notification_line'))
            ->action(trans('users.email_change.notification_action'), $url)
            ->line(trans('users.email_change.notification_expire'));
    }
}
