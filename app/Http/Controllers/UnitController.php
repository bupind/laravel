<?php

namespace App\Http\Controllers;

use App\Http\Requests\UnitRequest;
use App\Repositories\UnitRepository;
use App\Support\ConfigDTO;
use App\Traits\BaseController;
use Illuminate\Http\Request;

class UnitController extends Controller
{
    use BaseController;

    protected string $requestClass = UnitRequest::class;

    public function __construct(Request $request, UnitRepository $repository)
    {
        $this->repository = $repository;
        $config           = new ConfigDTO([
            'modal.use'  => true,
            'modal.size' => 'md'
        ]);
        $this->repository->setConfig($config);
        $this->moreActions = [
            [
                'icon'       => 'ki-upload',
                'url'        => '#importModal',
                'class'      => 'btn-warning',
                'attributes' => 'data-bs-toggle=modal',
            ]
        ];
        $this->boot();
    }
}
