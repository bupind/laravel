<?php

namespace App\Http\Controllers;

use App\Http\Requests\RoleRequest;
use App\Repositories\RoleRepository;
use App\Support\ConfigDTO;
use App\Traits\BaseController;
use Illuminate\Http\Request;

class RolesController extends Controller
{
    use BaseController;

    public function __construct(Request $request, RoleRepository $repository)
    {
        $this->repository = $repository;
        $this->request    = new RoleRequest($request->all());
        $config           = new ConfigDTO([
            'modal.use'  => true,
            'modal.size' => 'md',
        ]);
        $this->repository->setConfig($config);
        $this->boot();
    }
}
