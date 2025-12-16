<?php

namespace App\Traits;

use App\Exports\GeneralExport;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Routing\Redirector;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Facades\Excel;
use ReflectionClass;

trait BaseController
{
    protected $repository;
    protected $moreActions;
    protected $request;
    protected $route;
    protected $data = [];

    public function boot(): void
    {
        if(empty($this->route)) {
            $this->route = $this->getRouteName();
        }
        $this->setData([
            'route' => $this->route,
            'title' => Str::title(Str::of($this->route)->replace('-', ' ')),
        ]);
        $this->setPermissions();
        $this->registerPermissionsMiddleware();
    }

    private function getRouteName(): string
    {
        return Str::of((new ReflectionClass($this))->getShortName())
            ->remove('Controller')
            ->kebab();
    }

    private function setData(array $data): void
    {
        $this->data = array_merge($this->data, $data);
    }

    private function setPermissions(): void
    {
        $actions         = [
            'add',
            'view',
            'edit',
            'show',
            'delete'
        ];
        $permissionRoute = Str::of($this->route)->replace('-', '_');
        foreach($actions as $action) {
            $this->data["permission_{$action}"] = "{$action}_{$permissionRoute}";
        }
    }

    private function registerPermissionsMiddleware(): void
    {
        if(!method_exists($this, 'middleware')) {
            return;
        }
        $permissions = [
            'view'   => ['index'],
            'add'    => [
                'create',
                'store'
            ],
            'edit'   => [
                'edit',
                'update'
            ],
            'show'   => ['show'],
            'delete' => ['destroy'],
        ];
        foreach($permissions as $key => $methods) {
            $this->middleware(
                "can:{$this->data['permission_' . $key]}",
                ['only' => $methods]
            );
        }
    }

    public function index()
    {
        $permissions = collect($this->data)
            ->filter(fn($v, $k) => str_starts_with($k, 'permission_'))
            ->toArray();
        if(method_exists($this->repository, 'setPermissions')) {
            $this->repository->setPermissions($permissions);
        }
        $data = array_merge($this->data, [
            'heads'       => $this->repository->buildHeads(),
            'datas'       => $this->repository->buildConfig($this->route),
            'config'      => $this->repository->config(),
            'moreActions' => $this->moreActions,
        ]);
        $data = array_merge($data, $permissions);
        return view($this->resolveView('index'), $data);
    }

    private function resolveView(string $name): string
    {
        $pageView = "{$this->route}.{$name}";
        return view()->exists($pageView) ? $pageView : "base-page.{$name}";
    }

    public function datatable()
    {
        if(!request()->ajax()) abort(403, 'Forbidden');
        $referer = request()->headers->get('referer');
        if(!$referer || !str_contains($referer, "/{$this->route}")) abort(403, 'Forbidden');
        return $this->repository->datatable();
    }

    public function store()
    {
        $request  = $this->resolveRequest();
        $data     = $request->validated();
        $callback = $this->repository->beforeAction($data, 'store');
        if(!empty($callback['error'])) {
            return back()->with('error', $callback['message'])->withInput();
        }
        $this->repository->create($callback['data']);
        return $request->wantsJson()
            ? response()->json(['status' => true])
            : redirect()->route($this->route . '.index')
                ->with('success', 'Created successfully');
    }

    protected function resolveRequest(): FormRequest
    {
        $formRequest = app($this->requestClass);
        $current     = request();
        $formRequest->initialize(
            $current->query->all(),
            $current->request->all(),
            $current->attributes->all(),
            $current->cookies->all(),
            $current->files->all(),
            $current->server->all()
        );
        $formRequest->setContainer(app())->setRedirector(app(Redirector::class));
        $formRequest->validateResolved();
        return $formRequest;
    }

    public function create()
    {
        $fields = $this->repository->formFields(null, 'create');
        $data   = array_merge($this->data, [
            'fields'   => $fields,
            'isForm'   => true,
            'title'    => __('Create') . ' ' . Str::title(str_replace('-', ' ', $this->route)),
            'useModal' => request()->query('useModal'),
        ]);
        $view   = $data['useModal'] ? 'modal' : 'page';
        return view($this->resolveView($view), $data);
    }

    public function edit($id)
    {
        $item   = $this->repository->getById($id);
        $fields = $this->repository->formFields($item, 'update');
        $data   = array_merge($this->data, [
            'item'     => $item,
            'fields'   => $fields,
            'isForm'   => true,
            'title'    => __('Update') . ' ' . Str::title(str_replace('-', ' ', $this->route)),
            'useModal' => request()->query('useModal'),
        ]);
        $view   = $data['useModal'] ? 'modal' : 'page';
        return view($this->resolveView($view), $data);
    }

    public function update()
    {
        $validated = $this->request->validate($this->request->rules());
        $data      = array_merge($validated, $this->request->all());
        $callback  = $this->repository->beforeAction($data, 'update');
        if($callback['error']) {
            return back()->with('error', $callback['message'])->withInput();
        }
        $model = $this->repository->update($this->request->id, $callback['data']);
        return $this->request->wantsJson()
            ? $model
            : redirect()->route($this->route . '.index')->with('success', 'Updated successfully');
    }

    public function show($id)
    {
        $item   = $this->repository->getById($id);
        $fields = $this->repository->formFields($item, 'update');
        $data   = array_merge($this->data, [
            'item'     => $item,
            'fields'   => $fields,
            'isForm'   => false,
            'useModal' => request()->query('useModal'),
            'title'    => __('Detail') . ' ' . Str::title(str_replace('-', ' ', $this->route)),
        ]);
        $view   = $data['useModal'] ? 'modal' : 'page';
        return view($this->resolveView($view), $data);
    }

    public function destroy($id)
    {
        $record   = $this->repository->getById($id)->toArray();
        $callback = $this->repository->beforeAction($record, 'delete');
        if($callback['error']) {
            return back()->with('error', $callback['message']);
        }
        $this->repository->delete($id);
        return redirect()->route($this->route . '.index')
            ->with('success', 'Deleted successfully');
    }

    public function export()
    {
        $this->request->validate([
            'format' => 'nullable|in:xls,csv,pdf',
            'scope'  => 'nullable|in:page,all',
            'start'  => 'nullable|integer|min:0',
            'length' => 'nullable|integer|min:1',
        ]);
        $format     = $this->request->input('format', 'xls');
        $scope      = $this->request->input('scope', 'page');
        $filename   = "{$this->route}.{$format}";
        $exportData = [
            'scope'   => $scope,
            'start'   => (int)$this->request->input('start', 0),
            'length'  => (int)$this->request->input('length', 10),
            'filters' => $this->request->except([
                'format',
                'scope',
                'start',
                'length'
            ]),
        ];
        return Excel::download(
            new GeneralExport($this->repository, $exportData),
            $filename
        );
    }

    public function bulk(Request $request)
    {
        $request->validate([
            'action' => 'required|string',
            'ids'    => 'required|array'
        ]);
        if($request->action === 'delete-all') {
            $this->repository->bulkDelete($request->ids);
        }
        return response()->json(['status' => true]);
    }

    protected function addCustomMiddleware(string $permission, array $methods): void
    {
        if(method_exists($this, 'middleware')) {
            $this->middleware("can:{$permission}", ['only' => $methods]);
        }
    }
}
