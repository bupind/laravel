<?php
/**
 * User
 * @author  bupind
 * @created 2026-05-19
 */

namespace App\Models;

use App\Models\Concerns\UsesUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements HasMedia
{
    use HasFactory, HasRoles, InteractsWithMedia, Notifiable, UsesUuid;

    protected $fillable = [
        'name',
        'email',
        'password',
    ];
    protected $hidden   = [
        'password',
        'remember_token',
    ];

    public function mediaFolders()
    {
        return $this->hasMany(MediaFolder::class);
    }

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
        ];
    }
}
