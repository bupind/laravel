<?php
/**
 * CheckMenuPermission
 * @author  bupind
 * @created 2026-05-21
 */

namespace App\Http\Middleware;

use App\Models\Menu;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckMenuPermission
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if(!$user) {
            return redirect()->route('login');
        }
        $currentRoute = '/' . ltrim($request->route()->uri(), '/');
        $legacyRoute  = preg_replace('#^/backend#', '', $currentRoute, 1) ?: $currentRoute;
        $menu         = Menu::where('scope', 'backend')
            ->whereIn('route', [
                $currentRoute,
                $legacyRoute,
            ])->first();
        if($menu && $menu->permission_name) {
            if(!$user->can($menu->permission_name)) {
                abort(403, 'Anda tidak memiliki izin untuk mengakses halaman ini.');
            }
        }
        return $next($request);
    }
}
