<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

/**
 * App\Models\PurchaseStatus
 *
 * @property string $currentStatus
 * @property string $status
 * @property string $latestStatus
 */

class PurchaseStatus extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'purchase_status';
    protected $fillable = [
'currentStatus',
    'status',
    'latestStatus'
    ];


}
