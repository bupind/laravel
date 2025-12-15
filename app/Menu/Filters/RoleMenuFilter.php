<?php

namespace App\Menu\Filters;

use Illuminate\Support\Facades\Auth;
use JeroenNoten\LaravelAdminLte\Menu\Filters\FilterInterface;

class RoleMenuFilter implements FilterInterface
{
    public function transform($item)
    {
        if (isset($item['role'])) {
            if (! Auth::check()) {
                return false;
            }

            $roles = is_array($item['role']) ? $item['role'] : [$item['role']];

            if (! Auth::user()->hasAnyRole($roles)) {
                return false;
            }
        }

        return $item;
    }
}
