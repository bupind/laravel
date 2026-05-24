<?php

namespace Database\Seeders;

use App\Models\Page;
use Illuminate\Database\Seeder;

class PageSeeder extends Seeder
{
    public function run(): void
    {
        Page::query()->where('slug', 'contact')->delete();

        $pages = [
            [
                'title' => 'Privacy Policy',
                'slug' => 'privacy-policy',
                'template' => 'privacy',
                'placement' => 'footer',
                'excerpt' => 'Kebijakan privasi penggunaan layanan dan pengelolaan data pengguna.',
                'content' => '<p>Kami menjaga privasi pengguna dan hanya menggunakan data sesuai kebutuhan operasional layanan.</p><h2>Data yang Dikumpulkan</h2><p>Data dapat mencakup nama, email, nomor telepon, dan aktivitas penggunaan aplikasi.</p><h2>Penggunaan Data</h2><p>Data digunakan untuk autentikasi, layanan pelanggan, keamanan, dan peningkatan kualitas aplikasi.</p>',
                'meta_title' => 'Privacy Policy',
                'meta_description' => 'Kebijakan privasi penggunaan layanan.',
                'sort_order' => 1,
                'is_published' => true,
            ],
            [
                'title' => 'About Us',
                'slug' => 'about-us',
                'template' => 'about',
                'placement' => 'footer',
                'excerpt' => 'Informasi singkat tentang aplikasi, layanan, dan tujuan kami.',
                'content' => '<p>Kami membangun aplikasi ini untuk membantu pengelolaan layanan digital secara lebih rapi, cepat, dan mudah digunakan.</p><p>Halaman ini dapat Anda sesuaikan dari menu Pages di backend.</p>',
                'meta_title' => 'About Us',
                'meta_description' => 'Tentang aplikasi dan layanan kami.',
                'sort_order' => 2,
                'is_published' => true,
            ],
            [
                'title' => 'FAQs',
                'slug' => 'faqs',
                'template' => 'faqs',
                'placement' => 'footer',
                'excerpt' => 'Pertanyaan yang sering diajukan oleh pengguna.',
                'content' => '<h2>Bagaimana cara menggunakan aplikasi?</h2><p>Gunakan menu yang tersedia sesuai kebutuhan Anda.</p><h2>Bagaimana menghubungi admin?</h2><p>Gunakan halaman Contact atau informasi kontak yang tersedia di aplikasi.</p>',
                'meta_title' => 'FAQs',
                'meta_description' => 'Pertanyaan yang sering diajukan.',
                'sort_order' => 3,
                'is_published' => true,
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
