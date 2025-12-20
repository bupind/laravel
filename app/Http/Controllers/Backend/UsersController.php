<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use App\Http\Requests\UserRequest;
use App\Repositories\UserRepository;
use App\Support\ConfigDTO;
use App\Traits\BaseController;

class UsersController extends Controller
{
    use BaseController;

    protected string $requestClass = UserRequest::class;

    public function __construct(UserRepository $repository)
    {
        $this->repository = $repository;
        $config           = new ConfigDTO([
            'modal'       => true,
            'batch'       => true,
            'batch.route' => 'bacth',
            'modal.size'  => 'md',
        ]);
        $this->repository->setConfig($config);
        $this->boot();
    }
}
