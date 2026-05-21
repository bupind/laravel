<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

trait UsesUuid
{
    use HasUuids;

    public function initializeUsesUuid(): void
    {
        $this->incrementing = false;
        $this->keyType      = 'string';
    }
}
