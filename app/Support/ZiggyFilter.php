<?php
/**
 * ZiggyFilter
 * @author  bupind
 * @created 2026-05-18
 */

namespace App\Support;
class ZiggyFilter
{
    public static function frontend(): array
    {
        return [
            'home',
            'frontend.*',
            'login',
            'logout',
            'password.*',
            'verification.*',
        ];
    }

    public static function backend(): array
    {
        return [
            'dashboard',
            'backend.*',
            'logout',
            'password.*',
            'verification.*',
            'settings.*',
            'profile.*',
        ];
    }

    public static function none(): array
    {
        return [];
    }
}
