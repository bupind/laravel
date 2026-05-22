<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Spatie\MediaLibrary\MediaCollections\Models\Media as SpatieMedia;

class Media extends SpatieMedia
{
    use HasUuids;

    // SpatieMedia sets $incrementing = true by default in Eloquent Model.
    // We override here explicitly without using UsesUuid trait
    // to avoid "same property defined with incompatible definition" PHP error.
    public    $incrementing = false;
    protected $keyType      = 'string';
}
