<?php

namespace App\Http\Controllers;

use App\Http\Requests\UserRequest;
use App\Repositories\UserRepository;
use App\Support\ConfigDTO;
use App\Traits\BaseController;
use Illuminate\Http\Request;

class UsersController extends Controller
{
    use BaseController;

    public function __construct(Request $request, UserRepository $repository)
    {
        $this->request    = new UserRequest($request->all());
        $this->repository = $repository;
        $config           = new ConfigDTO([
            'modal.use'      => true,
            'modal.size'     => 'xl',
            'checkbox.all'   => true,
            'checkbox.route' => 'bulk',
        ]);
        $this->repository->setConfig($config);
        $this->boot();
    }
}
