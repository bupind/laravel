<?php
/**
 * DashboardController
 * @author  bupind
 * @created 2026-05-20
 */

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use App\Models\Page;
use App\Models\Product;
use App\Models\Service;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;
use Throwable;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $stats = Cache::remember('dashboard_stats_v2', 60, function() {
            $totalUsers     = User::count();
            $totalLogs      = $this->safeCount('activity_log', fn() => Activity::count());
            $totalProducts  = $this->safeCount('products', fn() => Product::count());
            $activeProducts = $this->safeCount('products', fn() => Product::where('status', Product::STATUS_ACTIVE)
                ->count());
            $totalServices  = $this->safeCount('services', fn() => Service::count());
            $publishedPages = $this->safeCount('pages', fn() => Page::where('is_published', true)->count());
            $totalMessages  = $this->safeCount('contact_messages', fn() => ContactMessage::count());
            $newMessages    = $this->safeCount('contact_messages', fn() => ContactMessage::where('status', ContactMessage::STATUS_NEW)
                ->count());
            $monthlyUsers   = $this->getMonthlyUserStats();
            $recentActivity = $this->safeCount('activity_log', fn() => Activity::with('causer:id,name')
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
                ->toArray(), []);
            return compact(
                'totalUsers',
                'totalLogs',
                'totalProducts',
                'activeProducts',
                'totalServices',
                'publishedPages',
                'totalMessages',
                'newMessages',
                'monthlyUsers',
                'recentActivity'
            );
        });
        return Inertia::render('backend/dashboard', ['stats' => $stats]);
    }

    private function safeCount(string $table, callable $callback, mixed $default = 0): mixed
    {
        if(!Schema::hasTable($table)) {
            return $default;
        }
        try {
            return $callback();
        } catch(Throwable) {
            return $default;
        }
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
