<?php

namespace Database\Seeders;

use App\Models\SettingApp;
use Illuminate\Database\Seeder;

class SettingAppSeeder extends Seeder
{
    public function run(): void
    {
        SettingApp::setMany([
            'nama_app'  => config('app.name', 'Laravel'),
            'deskripsi' => null,
            'logo'      => null,
            'favicon'   => null,
            'warna'     => '#0ea5e9',
            'seo'       => [
                'title'       => config('app.name', 'Laravel'),
                'description' => null,
                'keywords'    => null,
            ],
        ]);
    }
}
