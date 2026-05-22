<?php
/**
 * DashboardController
 * @author  bupind
 * @created 2026-05-20
 */

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $stats = Cache::remember('dashboard_stats', 60, function() {
            $totalUsers     = User::count();
            $totalLogs      = Activity::count();
            $monthlyUsers   = $this->getMonthlyUserStats();
            $recentActivity = Activity::with('causer:id,name')
                ->orderByDesc('created_at')
                ->limit(10)
                ->get()
                ->map(fn($log) => [
                    'id'          => $log->id,
                    'description' => $log->description,
                    'causer'      => $log->causer?->name ?? 'System',
                    'created_at'  => $log->created_at?->diffForHumans(),
                    'event'       => $log->event ?? 'unknown',
                ])
                ->toArray();
            return compact(
                'totalUsers',
                'totalLogs', 'monthlyUsers',
                'recentActivity'
            );
        });
        return Inertia::render('backend/dashboard', ['stats' => $stats]);
    }

    protected function getMonthlyUserStats(): array
    {
        $months  = collect(range(5, 0))->map(fn($i) => now()->subMonths($i)->startOfMonth());
        $results = [];
        foreach($months as $monthStart) {
            $monthEnd  = $monthStart->copy()->endOfMonth();
            $month     = $monthStart->format('M');
            $total     = User::whereBetween('created_at', [
                $monthStart,
                $monthEnd,
            ])->count();
            $results[] = compact('month', 'total');
        }
        return $results;
    }
}
