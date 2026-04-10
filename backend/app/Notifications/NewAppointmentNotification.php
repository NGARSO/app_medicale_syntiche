<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewAppointmentNotification extends Notification
{
    use Queueable;

    public $rendezVous;

    /**
     * Create a new notification instance.
     */
    public function __construct($rendezVous)
    {
        $this->rendezVous = $rendezVous;
    }

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
        return (new MailMessage)
                    ->subject('Nouveau Rendez-vous Confirmé')
                    ->greeting('Bonjour ' . $notifiable->username . ',')
                    ->line('Un nouveau rendez-vous a été planifié.')
                    ->line('Patient : ' . $this->rendezVous->patient->nom . ' ' . $this->rendezVous->patient->prenom)
                    ->line('Date & Heure : ' . $this->rendezVous->date_heure)
                    ->line('Motif : ' . $this->rendezVous->motif)
                    ->action('Voir le tableau de bord', url('/dashboard'))
                    ->line('Merci d\'utiliser notre plateforme !');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}
