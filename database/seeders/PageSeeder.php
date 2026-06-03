<?php

namespace Database\Seeders;

use App\Models\Page;
use App\Services\Translations\TranslationService;
use Illuminate\Database\Seeder;

class PageSeeder extends Seeder
{
    public function run(): void
    {
        Page::query()->where('slug', 'contact')->delete();
        $locales = app(TranslationService::class)->locales();
        $text = fn(string $id, string $en): array => collect($locales)
            ->mapWithKeys(fn(string $locale) => [$locale => $locale === 'en' ? $en : $id])
            ->all();

        $pages = [
            [
                'title' => $text('Kebijakan Privasi', 'Privacy Policy'),
                'slug' => 'privacy-policy',
                'excerpt' => $text('Kebijakan privasi penggunaan layanan dan pengelolaan data pengguna.', 'Privacy policy for service usage and user data management.'),
                'content' => $text('<p>Kami menjaga privasi pengguna dan hanya menggunakan data sesuai kebutuhan operasional layanan.</p><h2>Data yang Dikumpulkan</h2><p>Data dapat mencakup nama, email, nomor telepon, dan aktivitas penggunaan aplikasi.</p><h2>Penggunaan Data</h2><p>Data digunakan untuk autentikasi, layanan pelanggan, keamanan, dan peningkatan kualitas aplikasi.</p>', '<p>We protect user privacy and only use data for operational service needs.</p><h2>Collected Data</h2><p>Data may include names, email addresses, phone numbers, and application usage activity.</p><h2>Data Usage</h2><p>Data is used for authentication, customer service, security, and application quality improvements.</p>'),
                'sort_order' => 1,
                'status' => Page::STATUS_ACTIVE,
            ],
            [
                'title' => $text('Tentang Kami', 'About Us'),
                'slug' => 'about-us',
                'excerpt' => $text('Informasi singkat tentang aplikasi, layanan, dan tujuan kami.', 'Brief information about our application, services, and purpose.'),
                'content' => $text('<p>Kami membangun aplikasi ini untuk membantu pengelolaan layanan digital secara lebih rapi, cepat, dan mudah digunakan.</p><p>Halaman ini dapat Anda sesuaikan dari menu Pages di backend.</p>', '<p>We built this application to help manage digital services in a cleaner, faster, and easier way.</p><p>You can customize this page from the Pages menu in the backend.</p>'),
                'sort_order' => 2,
                'status' => Page::STATUS_ACTIVE,
            ],
            [
                'title' => $text('FAQ', 'FAQs'),
                'slug' => 'faqs',
                'excerpt' => $text('Pertanyaan yang sering diajukan oleh pengguna.', 'Frequently asked questions from users.'),
                'content' => $text('<h2>Bagaimana cara menggunakan aplikasi?</h2><p>Gunakan menu yang tersedia sesuai kebutuhan Anda.</p><h2>Bagaimana menghubungi admin?</h2><p>Gunakan halaman Contact atau informasi kontak yang tersedia di aplikasi.</p>', '<h2>How do I use the application?</h2><p>Use the available menus according to your needs.</p><h2>How do I contact an admin?</h2><p>Use the Contact page or contact information available in the application.</p>'),
                'sort_order' => 3,
                'status' => Page::STATUS_ACTIVE,
            ],
        ];

        foreach($pages as $page) {
            Page::query()->updateOrCreate(
                ['slug' => $page['slug']],
                $page,
            );
        }
    }
}
