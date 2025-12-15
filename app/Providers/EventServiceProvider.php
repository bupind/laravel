<?php

namespace App\Providers;

use App\Models\Menu;
use App\Observers\MenuObserver;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;
use JeroenNoten\LaravelAdminLte\Events\BuildingMenu;

class EventServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        Menu::observe(MenuObserver::class);
        Event::listen(BuildingMenu::class, function(BuildingMenu $event) {
            $allMenus = Cache::rememberForever('menus', function() {
                return Menu::orderBy('order')->get();
            });
            $menus    = $allMenus->whereNull('parent_id');
            $buildMenuTree = function(Menu $menu) use (&$buildMenuTree, $allMenus): array {
                $item = [
                    'key'    => $menu->key,
                    'text'   => $menu->text,
                    'header' => $menu->header,
                    'route'  => $menu->route,
                    'url'    => $menu->url,
                    'can'    => $menu->can,
                    'role'   => $menu->role,
                    'icon'   => $menu->icon,
                ];
                $children = $allMenus->where('parent_id', $menu->id);
                if($children->isNotEmpty()) {
                    $submenu = [];
                    foreach($children as $child) {
                        $submenu[] = $buildMenuTree($child);
                    }
                    $item['submenu'] = $submenu;
                }
                return array_filter($item, fn($value) => $value !== null);
            };
            foreach($menus as $menu) {
                $event->menu->add($buildMenuTree($menu));
            }
        });
    }
}
