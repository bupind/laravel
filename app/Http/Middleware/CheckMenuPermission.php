<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Menu;

class CheckMenuPermission
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Abaikan jika belum login
        if (!$user) {
            return redirect()->route('login');
        }

        // Ambil route yang sedang diakses, contoh: "backend/permissions"
        $currentRoute = '/' . ltrim($request->route()->uri(), '/');
        $legacyRoute = preg_replace('#^/backend#', '', $currentRoute, 1) ?: $currentRoute;

        // Cek route backend terbaru dan fallback ke route lama tanpa prefix
        $menu = Menu::whereIn('route', [$currentRoute, $legacyRoute])->first();

        // Jika menu ditemukan dan punya permission
        if ($menu && $menu->permission_name) {
            if (!$user->can($menu->permission_name)) {
                abort(403, 'Anda tidak memiliki izin untuk mengakses halaman ini.');
            }
        }

        return $next($request);
    }
}
