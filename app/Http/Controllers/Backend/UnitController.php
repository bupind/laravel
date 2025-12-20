<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use App\Http\Requests\UnitRequest;
use App\Imports\UnitImport;
use App\Repositories\UnitRepository;
use App\Support\ConfigDTO;
use App\Traits\BaseController;
use Illuminate\Http\Request;

class UnitController extends Controller
{
    use BaseController;

    public function __construct(Request $request, UnitRepository $repository)
    {
        $this->repository     = $repository;
        $this->enableImport   = true;
        $this->importClass    = UnitImport::class;
        $this->importTemplate = 'templates/product-import.xlsx';
        $this->request        = new UnitRequest($request->all());
        $config               = new ConfigDTO([
            'modal.use'  => true,
            'modal.size' => 'md'
        ]);
        $this->repository->setConfig($config);
        $this->moreActions = [];
        $this->boot();
    }
}
