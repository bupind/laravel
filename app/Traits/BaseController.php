<?php

namespace App\Traits;

use App\Exports\GeneralExport;
use App\Jobs\ImportBatchJob;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Request;
use Illuminate\Routing\Redirector;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Facades\Excel;
use ReflectionClass;

trait BaseController
{
    protected        $repository;
    protected        $moreActions;
    protected        $request;
    protected string $route;
    protected array  $data           = [];
    protected bool   $enableImport   = false;
    protected string $importClass    = '';
    protected string $importTemplate = '';

    public function boot(): void
    {
        $this->route = $this->route ?? $this->getRouteName();
        $this->setData([
            'route' => $this->route,
            'title' => Str::title(str_replace('-', ' ', $this->route)),
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
            'view',
            'add',
            'edit',
            'show',
            'delete',
            'import'
        ];
        $permissionRoute = str_replace('-', '_', $this->route);
        foreach($actions as $action) {
            $this->data["permission_{$action}"] = "{$permissionRoute}_{$action}";
        }
    }

    private function registerPermissionsMiddleware(): void
    {
        if(!method_exists($this, 'middleware')) return;

        $map = [
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
            'import' => [
                'import',
                'importStore'
            ],
        ];
        foreach($map as $key => $methods) {
            $permission = $this->data['permission_' . $key];
            $this->middleware("can:{$permission}", ['only' => $methods]);
        }
    }

    public function index()
    {
        $permissions = $this->syncPermissionsToRepository();
        $data = $this->buildPageData([
            'permissions' => $permissions,
            'table'       => [
                'heads'       => $this->repository->buildHeads(),
                'data'        => $this->repository->buildConfig($this->route),
                'config'      => $this->repository->config(),
                'moreActions' => $this->moreActions,
            ]
        ]);
        return view($this->resolveView('index'), $data);
    }

    protected function syncPermissionsToRepository(): array
    {
        $permissions = collect($this->data)
            ->filter(fn($v, $k) => str_starts_with($k, 'permission_'))
            ->mapWithKeys(fn($v, $k) => [
                str_replace('permission_', '', $k) => auth()->user()->can($v)
            ])
            ->toArray();
        if(method_exists($this->repository, 'setPermissions')) {
            $this->repository->setPermissions($permissions);
        }
        return $permissions;
    }

    protected function buildPageData(array $extra = []): array
    {
        return array_merge(
            collect($this->data)->reject(fn($v, $k) => str_starts_with($k, 'permission_'))->toArray(),
            $extra
        );
    }

    protected function resolveView(string $name): string
    {
        $pageView = "{$this->route}.{$name}";
        return view()->exists($pageView) ? $pageView : "base-page.{$name}";
    }

    public function create()
    {
        return $this->renderForm('create', __('Create'));
    }

    protected function renderForm(string $titleKey, string $titleText, $item = null, string $scenario = 'create')
    {
        $fields = $this->repository->formFields($item, $scenario);
        $data   = $this->buildPageData([
            'fields'   => $fields,
            'isForm'   => true,
            'title'    => $titleText . ' ' . Str::title(str_replace('-', ' ', $this->route)),
            'item'     => $item,
            'useModal' => request()->query('useModal')
        ]);
        $view   = $data['useModal'] ? 'modal' : 'page';
        return view($this->resolveView($view), $data);
    }

    public function edit($id)
    {
        $item = $this->repository->getById($id);
        return $this->renderForm('update', __('Update'), $item, 'update');
    }

    public function show($id)
    {
        $item   = $this->repository->getById($id);
        $fields = $this->repository->formFields($item, 'update');
        $data   = $this->buildPageData([
            'item'     => $item,
            'fields'   => $fields,
            'isForm'   => false,
            'useModal' => request()->query('useModal'),
            'title'    => __('Detail') . ' ' . Str::title(str_replace('-', ' ', $this->route)),
        ]);
        $view   = $data['useModal'] ? 'modal' : 'page';
        return view($this->resolveView($view), $data);
    }

    public function store()
    {
        $this->handleFormAction('store');
    }

    protected function handleFormAction(string $method)
    {
        $this->request = $this->resolveRequest();
        $validated     = $this->request->validated();
        $data          = array_merge($validated, $this->request->all());
        $callback      = $this->repository->beforeAction($data, $method);
        if(!empty($callback['error'])) {
            throw_exception(500, $callback['message'], $this->route . '.index');
        }
        if($method === 'store') {
            $this->repository->store($callback['data']);
        } else {
            $this->repository->update($this->request->id, $callback['data']);
        }
        throw_exception(200, ucfirst($method) . ' successfully', $this->route . '.index');
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

    public function update()
    {
        $this->handleFormAction('update');
    }

    public function destroy($id)
    {
        $record   = $this->repository->getById($id)->toArray();
        $callback = $this->repository->beforeAction($record, 'delete');
        if($callback['error']) {
            throw_exception(500, $callback['message'], $this->route . '.index');
        }
        $this->repository->delete($id);
        throw_exception(200, 'Deleted successfully', $this->route . '.index');
    }

    public function import()
    {
        abort_if(!$this->enableImport, 403, 'Import disabled');
        $data = $this->buildPageData([
            'isForm'   => true,
            'title'    => __('Import') . ' ' . Str::title(str_replace('-', ' ', $this->route)),
            'useModal' => true,
            'template' => url($this->importTemplate)
        ]);
        return view($this->resolveView('import'), $data);
    }

    public function importStore(Request $request)
    {
        abort_if(!$this->enableImport, 403);
        $request->validate(['file' => 'required|file|mimes:xlsx,xls,csv']);
        $file = $request->file('file');
        abort_if(!$file || !$file->isValid(), 500, 'Invalid File');
        $destination = storage_path('app/public/import');
        if(!file_exists($destination)) mkdir($destination, 0777, true);
        $fileName = 'import_' . $this->route . '_' . now()->format('Ymd_His') . '.' . $file->getClientOriginalExtension();
        $file->move($destination, $fileName);
        ImportBatchJob::dispatch($destination . DIRECTORY_SEPARATOR . $fileName, $this->importClass);
        throw_exception(200, 'Import was processing', $this->route . '.index');
    }

    public function datatable()
    {
        abort_if(!request()->ajax(), 403, 'Forbidden');
        $referer = request()->headers->get('referer');
        abort_if(!$referer || !str_contains($referer, "/{$this->route}"), 403, 'Forbidden');
        $this->syncPermissionsToRepository();
        return $this->repository->datatable();
    }

    public function export(Request $request)
    {
        $request->validate([
            'format'  => 'nullable|in:xls,csv,pdf',
            'scope'   => 'nullable|in:page,all',
            'start'   => 'nullable|integer|min:0',
            'length'  => 'nullable|integer|min:1',
            'columns' => 'nullable|array'
        ]);
        $exportData = $request->all();
        return Excel::download(new GeneralExport($this->repository, $exportData), $this->route . ".{$request->input('format','xls')}");
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
