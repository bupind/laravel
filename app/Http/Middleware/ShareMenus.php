<?php
/**
 * ShareMenus
 * @author  bupind
 * @created 2026-05-20
 */

namespace App\Http\Middleware;

use App\Models\Menu;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class ShareMenus
{
    public function handle(Request $request, Closure $next): Response
    {
        $user      = $request->user();
        $menuScope = $this->isFrontendRequest($request) ? 'frontend' : 'backend';
        Inertia::share('menus', function() use ($user, $menuScope) {
            if(!Schema::hasTable('menus')) {
                return [];
            }
            if($menuScope === 'backend' && !$user) {
                return [];
            }
            $permissionKey = $user
                ? $user->getAllPermissions()->pluck('name')->sort()->implode(',')
                : 'guest';
            $hasLocation   = Schema::hasColumn('menus', 'location');
            $cacheKey      = "menus_v7_{$menuScope}_" . ($hasLocation ? 'loc' : 'legacy') . '_' . md5($permissionKey);
            return Cache::remember($cacheKey, 180, function() use ($user, $menuScope) {
                $hasLocation = Schema::hasColumn('menus', 'location');
                $query = Menu::where('scope', $menuScope);
                if($hasLocation) {
                    $query->orderBy('location');
                }
                $allMenus = $query->orderBy('order')->get();
                if(!$hasLocation) {
                    $allMenus->each(function(Menu $menu): void {
                        $menu->setAttribute('location', $menu->scope === 'frontend' ? 'header' : 'sidebar');
                    });
                }
                $indexed   = $allMenus->keyBy('id');
                $buildTree = function($parentId = null) use (&$buildTree, $indexed, $user, $menuScope) {
                    return $indexed
                        ->filter(fn($menu) => $menu->parent_id === $parentId)
                        ->map(function($menu) use (&$buildTree, $menuScope, $user) {
                            $children   = $buildTree($menu->id)->values();
                            $canSeeSelf = !$menu->permission_name || ($user && $user->can($menu->permission_name));
                            if(!$canSeeSelf && $children->isEmpty()) {
                                return null;
                            }
                            $menu->route = $this->normalizeRoute($menu->route, $menuScope);
                            if(!$canSeeSelf) {
                                $menu->route = '#';
                            }
                            $menu->children = $children;
                            return $menu;
                        })
                        ->filter()
                        ->filter(fn($menu) => $menu->route || $menu->children->isNotEmpty())
                        ->values();
                };
                return $buildTree();
            });
        });
        return $next($request);
    }

    private function isFrontendRequest(Request $request): bool
    {
        return $request->routeIs('home', 'frontend.*')
               || (!$request->is('backend/*') && !$request->is('api/*'));
    }

    private function normalizeRoute(?string $route, string $scope): ?string
    {
        if($route === null || trim($route) === '' || $route === '#') {
            return $route;
        }
        $route = '/' . ltrim(trim($route), '/');
        if($scope !== 'backend' || str_starts_with($route, '/backend') || str_starts_with($route, '/api')) {
            return $route;
        }
        return '/backend' . $route;
    }
}
