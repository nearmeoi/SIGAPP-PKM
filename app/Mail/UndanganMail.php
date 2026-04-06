<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class UndanganMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $recipientName;
    public string $judulKegiatan;
    public string $subject_text;
    public string $body_text;

    public function __construct(string $recipientName, string $judulKegiatan, string $subject, string $body)
    {
        $this->recipientName = $recipientName;
        $this->judulKegiatan = $judulKegiatan;
        $this->subject_text = $subject;
        $this->body_text = $body;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->subject_text,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.undangan',
        );
    }
}
