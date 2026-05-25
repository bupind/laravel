<?php

namespace Database\Seeders;

use App\Models\SettingApp;
use Illuminate\Database\Seeder;

class SettingAppSeeder extends Seeder
{
    public function run(): void
    {
        SettingApp::setMany([
            'app_name'    => config('app.name', 'Laravel'),
            'description' => null,
            'logo'        => null,
            'favicon'     => null,
            'color'       => '#0ea5e9',
            'seo'         => [
                'title'       => config('app.name', 'Laravel'),
                'description' => null,
                'keywords'    => null,
            ],
        ]);
    }
}
