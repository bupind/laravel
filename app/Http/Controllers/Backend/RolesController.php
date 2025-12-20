<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use App\Http\Requests\RoleRequest;
use App\Models\Roles;
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


    public function destroy($id)
    {
        $role = Roles::with('permissions')->findOrFail($id);
        $callback = $this->repository->beforeAction($role->toArray(), 'delete');

        if ($callback['error']) {
            throw_exception(500, $callback['message'], $this->route . '.index');
        }

        $this->repository->delete($id);

        throw_exception(200, 'Deleted successfully', $this->route . '.index');
    }


}
