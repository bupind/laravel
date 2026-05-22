<?php
/**
 * Activity
 * @author  bupind
 * @created 2026-05-20
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Spatie\Activitylog\Models\Activity as SpatieActivity;

class Activity extends SpatieActivity
{
    use HasUuids;

    public    $incrementing = false;
    protected $keyType      = 'string';
}
