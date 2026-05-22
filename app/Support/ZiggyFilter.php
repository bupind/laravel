<?php

namespace App\Support;

/**
 * ZiggyFilter
 *
 * Tentukan route mana yang boleh di-emit ke JavaScript (via @routes).
 *
 * Gunakan di blade template:
 *   @routes(App\Support\ZiggyFilter::frontend())
 *   @routes(App\Support\ZiggyFilter::backend())
 *
 * Mengapa:
 *   Secara default @routes meng-emit SEMUA named routes ke HTML sebagai
 *   const Ziggy = {...} yang bisa dibaca siapa saja. Filter ini membatasi
 *   hanya route yang memang dibutuhkan oleh halaman tersebut, sehingga:
 *   - Struktur route internal tidak bocor ke publik.
 *   - Payload HTML lebih kecil (terutama jika ada banyak route backend).
 */
class ZiggyFilter
{
    /**
     * Route yang dikirim ke halaman frontend (publik).
     * Hanya route yang memang perlu di-link dari sisi client.
     */
    public static function frontend(): array
    {
        return [
            'home',
            'frontend.*',
            // Auth flow yang mungkin diakses dari frontend
            'login',
            'logout',
            'password.*',
            'verification.*',
        ];
    }

    /**
     * Route yang dikirim ke halaman backend (authenticated).
     * Tidak perlu menyertakan route frontend/api.
     */
    public static function backend(): array
    {
        return [
            'dashboard',
            'backend.*',
            'logout',
            'password.*',
            'verification.*',
            'settings.*',
            'profile.*',
        ];
    }

    /**
     * Tidak emit route apapun (misal untuk error pages).
     */
    public static function none(): array
    {
        return [];
    }
}
