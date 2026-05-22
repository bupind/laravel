<?php
/**
 * Permission
 * @author  bupind
 * @created 2026-05-19
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Spatie\Permission\Models\Permission as SpatiePermission;

class Permission extends SpatiePermission
{
    use HasUuids;

    public    $incrementing = false;
    protected $keyType      = 'string';
}
