<?php

namespace App\Observers;

use App\Models\Menu;
use Illuminate\Support\Facades\Cache;

class MenuObserver
{
    public function saved(Menu $menu): void
    {
        Cache::forget('menus');
    }

    public function deleted(Menu $menu): void
    {
        Cache::forget('menus');
    }
}
