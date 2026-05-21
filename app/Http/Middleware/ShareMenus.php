<?php

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
        $user = $request->user();
        Inertia::share('menus', function() use ($user) {
            if(!$user) {
                return [];
            }
            // Cache menus per user role set
            $roleKey  = $user->roles->pluck('name')->sort()->implode(',');
            $cacheKey = "menus_v3_user_{$roleKey}";
            return Cache::remember($cacheKey, 180, function() use ($user) {
                $allMenus = Menu::orderBy('order')->get();
                $indexed  = $allMenus->keyBy('id');
                $buildTree = function($parentId = null) use (&$buildTree, $indexed, $user) {
                    return $indexed
                        ->filter(
                            fn($menu) => $menu->parent_id === $parentId
                                         && (!$menu->permission_name || $user->can($menu->permission_name))
                        )
                        ->map(function($menu) use (&$buildTree) {
                            // Ensure backend prefix
                            if(
                                $menu->route
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
}
