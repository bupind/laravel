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
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class ShareMenus
{
    public function handle(Request $request, Closure $next): Response
    {
        $user      = $request->user();
        $menuScope = $this->isFrontendRequest($request) ? 'frontend' : 'backend';
        Inertia::share('menus', function() use ($user, $menuScope) {
            if($menuScope === 'backend' && !$user) {
                return [];
            }
            $roleKey  = $user ? $user->roles->pluck('name')->sort()->implode(',') : 'guest';
            $cacheKey = "menus_v4_{$menuScope}_user_{$roleKey}";
            return Cache::remember($cacheKey, 180, function() use ($user, $menuScope) {
                $allMenus  = Menu::where('scope', $menuScope)->orderBy('order')->get();
                $indexed   = $allMenus->keyBy('id');
                $buildTree = function($parentId = null) use (&$buildTree, $indexed, $user, $menuScope) {
                    return $indexed
                        ->filter(
                            fn($menu) => $menu->parent_id === $parentId && (!$menu->permission_name || ($user && $user->can($menu->permission_name)))
                        )
                        ->map(function($menu) use (&$buildTree, $menuScope) {
                            if(
                                $menuScope === 'backend'
                                && $menu->route !== '#'
                                && $menu->route
                                && str_starts_with($menu->route, '/')
                                && !str_starts_with($menu->route, '/backend')
                                && !str_starts_with($menu->route, '/api')
                            ) {
                                $menu->route = '/backend' . $menu->route;
                            }
                            $menu->children = $buildTree($menu->id)->values();
                            return $menu;
                        })
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
}
