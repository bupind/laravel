<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use Illuminate\Http\JsonResponse;

class PermissionController extends Controller
{
    public function index(): JsonResponse
    {
        $permissions = Permission::query()
            ->select([
                'id',
                'name',
                'group'
            ])
            ->orderBy('group')
            ->orderBy('name')
            ->get();
        return response()->json([
            'data' => $permissions,
        ]);
    }
}
