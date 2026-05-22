<?php
/**
 * UsesUuid
 * @author  bupind
 * @created 2026-05-20
 */

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
