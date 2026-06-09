<?php

namespace App\Models;

use App\Models\Concerns\UsesUuid;
use Illuminate\Database\Eloquent\Model;

class NotificationTemplate extends Model
{
    use UsesUuid;

    public const CHANNEL_EMAIL = 'email';
    public const CHANNEL_WHATSAPP = 'whatsapp';
    public const CHANNEL_PAYMENT_GATEWAY = 'payment_gateway';

    public const EVENT_WELCOME = 'welcome';
    public const EVENT_PAYMENT_CREATED = 'payment_created';
    public const EVENT_PAYMENT_PAID = 'payment_paid';
    public const EVENT_PAYMENT_EXPIRED = 'payment_expired';
    public const EVENT_INVOICE_DESCRIPTION = 'invoice_description';

    protected $fillable = [
        'channel',
        'event',
        'name',
        'subject',
        'body',
        'variables',
        'is_active',
        'description',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public static function channels(): array
    {
        return [
            self::CHANNEL_EMAIL,
            self::CHANNEL_WHATSAPP,
            self::CHANNEL_PAYMENT_GATEWAY,
        ];
    }

    public static function defaults(): array
    {
        $variables = 'app_name, name, external_id, invoice_id, amount, currency, description, invoice_url, status, email, phone';

        return [
            [
                'channel'     => self::CHANNEL_EMAIL,
                'event'       => self::EVENT_WELCOME,
                'name'        => 'Email Welcome',
                'subject'     => 'Selamat datang di {app_name}',
                'body'        => 'Halo {name}, selamat datang di {app_name}.',
                'variables'   => 'app_name, name',
                'description' => 'Email sambutan untuk pengguna baru.',
            ],
            [
                'channel'     => self::CHANNEL_EMAIL,
                'event'       => self::EVENT_PAYMENT_CREATED,
                'name'        => 'Email Invoice Created',
                'subject'     => 'Invoice pembayaran {external_id}',
                'body'        => "Halo {name},\n\nInvoice pembayaran {external_id} sebesar {amount} {currency} sudah dibuat.\n\nLink pembayaran: {invoice_url}\n\nTerima kasih.",
                'variables'   => $variables,
                'description' => 'Email ketika invoice Xendit berhasil dibuat.',
            ],
            [
                'channel'     => self::CHANNEL_EMAIL,
                'event'       => self::EVENT_PAYMENT_PAID,
                'name'        => 'Email Payment Paid',
                'subject'     => 'Pembayaran {external_id} berhasil',
                'body'        => "Halo {name},\n\nPembayaran {external_id} sebesar {amount} {currency} berhasil diterima.\n\nTerima kasih.",
                'variables'   => $variables,
                'description' => 'Email ketika pembayaran dinyatakan berhasil.',
            ],
            [
                'channel'     => self::CHANNEL_EMAIL,
                'event'       => self::EVENT_PAYMENT_EXPIRED,
                'name'        => 'Email Payment Expired',
                'subject'     => 'Invoice pembayaran {external_id} kedaluwarsa',
                'body'        => "Halo {name},\n\nInvoice pembayaran {external_id} sudah kedaluwarsa. Silakan buat pembayaran baru jika masih diperlukan.",
                'variables'   => $variables,
                'description' => 'Email ketika invoice kedaluwarsa.',
            ],
            [
                'channel'     => self::CHANNEL_WHATSAPP,
                'event'       => self::EVENT_WELCOME,
                'name'        => 'WhatsApp Welcome',
                'body'        => 'Halo {name}, selamat datang di {app_name}.',
                'variables'   => 'app_name, name',
                'description' => 'Pesan WhatsApp sambutan untuk pengguna baru.',
            ],
            [
                'channel'     => self::CHANNEL_WHATSAPP,
                'event'       => self::EVENT_PAYMENT_CREATED,
                'name'        => 'WhatsApp Invoice Created',
                'body'        => 'Invoice pembayaran {external_id} sebesar {amount} {currency} sudah dibuat. Link pembayaran: {invoice_url}',
                'variables'   => $variables,
                'description' => 'WhatsApp ketika invoice Xendit berhasil dibuat.',
            ],
            [
                'channel'     => self::CHANNEL_WHATSAPP,
                'event'       => self::EVENT_PAYMENT_PAID,
                'name'        => 'WhatsApp Payment Paid',
                'body'        => 'Pembayaran {external_id} sebesar {amount} {currency} berhasil diterima. Terima kasih.',
                'variables'   => $variables,
                'description' => 'WhatsApp ketika pembayaran dinyatakan berhasil.',
            ],
            [
                'channel'     => self::CHANNEL_WHATSAPP,
                'event'       => self::EVENT_PAYMENT_EXPIRED,
                'name'        => 'WhatsApp Payment Expired',
                'body'        => 'Invoice pembayaran {external_id} sudah kedaluwarsa. Silakan buat pembayaran baru jika masih diperlukan.',
                'variables'   => $variables,
                'description' => 'WhatsApp ketika invoice kedaluwarsa.',
            ],
            [
                'channel'     => self::CHANNEL_PAYMENT_GATEWAY,
                'event'       => self::EVENT_INVOICE_DESCRIPTION,
                'name'        => 'Xendit Invoice Description',
                'body'        => 'Pembayaran {external_id} - {app_name}',
                'variables'   => 'app_name, external_id, description',
                'description' => 'Deskripsi invoice yang dikirim ke Xendit jika payload belum punya description.',
            ],
            [
                'channel'     => self::CHANNEL_PAYMENT_GATEWAY,
                'event'       => self::EVENT_PAYMENT_CREATED,
                'name'        => 'Payment Gateway Invoice Created',
                'body'        => 'Invoice pembayaran {external_id} sebesar {amount} {currency} sudah dibuat.',
                'variables'   => $variables,
                'description' => 'Template internal untuk status invoice dibuat.',
            ],
            [
                'channel'     => self::CHANNEL_PAYMENT_GATEWAY,
                'event'       => self::EVENT_PAYMENT_PAID,
                'name'        => 'Payment Gateway Paid',
                'body'        => 'Pembayaran {external_id} sebesar {amount} {currency} berhasil.',
                'variables'   => $variables,
                'description' => 'Template internal untuk status pembayaran berhasil.',
            ],
            [
                'channel'     => self::CHANNEL_PAYMENT_GATEWAY,
                'event'       => self::EVENT_PAYMENT_EXPIRED,
                'name'        => 'Payment Gateway Expired',
                'body'        => 'Invoice pembayaran {external_id} sudah kedaluwarsa.',
                'variables'   => $variables,
                'description' => 'Template internal untuk status invoice kedaluwarsa.',
            ],
        ];
    }

    public static function defaultFor(string $channel, string $event): ?array
    {
        foreach(self::defaults() as $template) {
            if($template['channel'] === $channel && $template['event'] === $event) {
                return $template;
            }
        }

        return null;
    }
}
