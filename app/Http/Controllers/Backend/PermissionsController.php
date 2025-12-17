<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use App\Http\Requests\PermissionRequest;
use App\Repositories\PermissionRepository;
use App\Support\ConfigDTO;
use App\Traits\BaseController;
use Illuminate\Http\Request;

class PermissionsController extends Controller
{
    use BaseController;

    public function __construct(Request $request, PermissionRepository $repository)
    {
        $this->repository = $repository;
        $this->request    = new PermissionRequest($request->all());
        $config           = new ConfigDTO([
            'modal.use'  => true,
            'modal.size' => 'md',
        ]);
        $this->repository->setConfig($config);
        $this->boot();
    }
}
