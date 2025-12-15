<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;
use Yajra\DataTables\Facades\DataTables;

trait BaseDatatable
{
    protected array $with            = [];
    protected array $withCount       = [];
    protected array $dtColumns       = [];
    protected bool  $addActionColumn = true;
    protected array $permissions     = [];

    public function setPermissions(array $permissions): void
    {
        $this->permissions = $permissions;
    }

    public function datatable()
    {
        $query = $this->datatableQuery();
        $table = DataTables::eloquent($query);
        foreach($this->dtColumns as $col) {
            $name     = $col['name'];
            $callback = $col['callback'];
            $isDb     = $this->isDbColumn($name);
            if($isDb) {
                if($callback) $table->editColumn($name, $callback);
            } else {
                $table->addColumn($name, $callback ?: fn($row) => data_get($row, $name));
            }
        }
        if($this->addActionColumn) {
            $table->addColumn('action', function($model) {
                $route    = str_replace('.datatable', '', request()->route()->getName());
                $pageView = "$route.action";
                if(!view()->exists($pageView)) {
                    $pageView = "base-page.action";
                }
                $config = $this->config();
                return view($pageView, array_merge(
                    [
                        'model'  => $model,
                        'route'  => $route,
                        'config' => $config,
                    ],
                    $this->permissions
                ))->render();
            });
        }
        return $table->addIndexColumn()->make(true);
    }

    public function datatableQuery(): Builder
    {
        return $this->model
            ->newQuery()
            ->with($this->with)
            ->withCount($this->withCount);
    }

    protected function isDbColumn(string $name): bool
    {
        static $columns = null;
        if($columns === null) {
            $columns = $this->model->getConnection()
                ->getSchemaBuilder()
                ->getColumnListing($this->model->getTable());
        }
        return in_array($name, $columns);
    }

    public function addColumn(string $name, callable|string|null $callback = null)
    {
        $this->dtColumns[] = [
            'name'     => $name,
            'callback' => $callback
        ];
        return $this;
    }

    public function buildHeads(): array
    {
        $heads = [];
        foreach($this->dtColumns as $col) {
            $heads[] = [
                'label'      => __(ucfirst($col['name'])),
                'data'       => $col['name'],
                'searchable' => $this->isDbColumn($col['name']),
            ];
        }
        if($this->addActionColumn) {
            $heads[] = [
                'label'      => __('Action'),
                'width'      => 5,
                'data'       => 'action',
                'searchable' => false,
            ];
        }
        return $heads;
    }

    public function buildConfig(string $route): array
    {
        $columns = [];
        foreach($this->dtColumns as $col) {
            $columns[] = [
                'data' => $col['name'],
                'name' => $col['name']
            ];
        }
        if($this->addActionColumn) {
            $columns[] = [
                'data'       => 'action',
                'name'       => 'action',
                'orderable'  => false,
                'searchable' => false
            ];
        }
        return [
            'processing' => true,
            'serverSide' => true,
            'ajax'       => route("$route.datatable"),
            'columns'    => $columns,
        ];
    }
}
