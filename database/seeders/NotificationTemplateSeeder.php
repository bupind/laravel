<?php

namespace Database\Seeders;

use App\Models\NotificationTemplate;
use Illuminate\Database\Seeder;

class NotificationTemplateSeeder extends Seeder
{
    public function run(): void
    {
        foreach(NotificationTemplate::defaults() as $attributes) {
            $template = NotificationTemplate::query()->firstOrNew([
                'channel' => $attributes['channel'],
                'event'   => $attributes['event'],
            ]);

            if($template->exists) {
                continue;
            }

            $template->fill([
                ...$attributes,
                'is_active' => true,
            ])->save();
        }
    }
}
