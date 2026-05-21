<?php

namespace App\Models;

use App\Models\Concerns\UsesUuid;
use Illuminate\Database\Eloquent\Model;

class SettingApp extends Model
{
    use UsesUuid;

    protected $table = 'settingapp';
    protected $fillable = [
        'nama_app',
        'deskripsi',
        'logo',
        'favicon',
        'warna',
        'seo',
        'translations',
    ];
    protected $casts = [
        'seo'          => 'array',
        'translations' => 'array',
    ];
}
