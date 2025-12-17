<?php

namespace App\Http\Controllers\Backend;

use App\Http\Requests\RoomRequest;
use App\Repositories\RoomRepository;
use App\Support\ConfigDTO;
use App\Traits\BaseController;

class RoomController extends Controller
{
    use BaseController;

    public function __construct(Request $request, RoomRepository $repository)
    {
        $this->repository = $repository;
        $this->request    = new RoomRequest($request->all());
        $config           = new ConfigDTO([
            'modal.use'  => true,
            'modal.size' => 'md',
        ]);
        $this->repository->setConfig($config);
        $this->boot();
    }
}
