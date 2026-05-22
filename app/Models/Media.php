<?php
/**
 * Media
 * @author  bupind
 * @created 2026-05-20
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Spatie\MediaLibrary\MediaCollections\Models\Media as SpatieMedia;

class Media extends SpatieMedia
{
    use HasUuids;

    public    $incrementing = false;
    protected $keyType      = 'string';
}
