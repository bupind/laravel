<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Spatie\Activitylog\Models\Activity as SpatieActivity;

class Activity extends SpatieActivity
{
    use HasUuids;

    // SpatieActivity inherits from Model which already defines $incrementing.
    // We set these directly to avoid trait property conflicts.
    public $incrementing = false;
    protected $keyType = 'string';
}
