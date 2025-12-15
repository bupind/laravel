<?php

namespace App\Traits;

use Illuminate\Support\Facades\Auth;

trait LogsActivity
{
    protected function logActivity(
        $event,
        $performedOn,
        $logMessage,
        $causedBy = null,
        $request = null
    )
    {
        $request = $request ?? request();
        $causer  = $causedBy ?? Auth::user();
        activity()
            ->event($event)
            ->causedBy($causer)
            ->performedOn($performedOn)
            ->withProperties([
                'ip'         => $request->ip(),
                'user_agent' => $request->userAgent(),
                'timestamp'  => now(),
            ])
            ->log($logMessage);
    }
}
