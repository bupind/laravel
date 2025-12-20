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

    public function getPermissions(): array
    {
        return $this->permissions;
    }

    public function setPermissions(array $permissions): static
    {
        $this->permissions = $permissions;
        return $this;
    }

    public function datatable()
    {
        $table = DataTables::eloquent($this->datatableQuery());
        foreach($this->dtColumns as $col) {
            $name     = $col['name'];
            $callback = $col['callback'];
            if($this->isDbColumn($name)) {
                if($callback) $table->editColumn($name, $callback);
            } else {
                $table->addColumn($name, $callback ?: fn($row) => data_get($row, $name));
            }
        }
        if($this->addActionColumn) {
            $table->addColumn('action', fn($model) => $this->renderActionColumn($model));
        }
        $table->filter(function($query) {
            $filters = request()->get('filters', []);
            foreach($filters as $field => $value) {
                if(!$value) continue;
                if(str_contains($field, '.')) {
                    $relations = explode('.', $field);
                    $column    = array_pop($relations);
                    $query->whereHas($relations[0], function($q) use ($relations, $column, $value) {
                        $this->applyNestedRelationFilter($q, $relations, $column, $value);
                    });
                } elseif($this->isDbColumn($field)) {
                    $query->where($field, 'like', "%{$value}%");
                }
            }
        });
        return $table->addIndexColumn()->make(true);
    }

    public function datatableQuery(): Builder
    {
        return $this->model->newQuery()
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

    public function addColumn(string $name, callable|string|null $callback = null, array $config = []): static
    {
        $this->dtColumns[] = array_merge([
            'name'     => $name,
            'callback' => $callback,
        ], $config);
        return $this;
    }

    protected function renderActionColumn($model): string
    {
        $route    = str_replace('.datatable', '', request()->route()->getName());
        $pageView = view()->exists("$route.action") ? "$route.action" : "base-page.action";
        return view($pageView, array_merge([
            'model'  => $model,
            'route'  => $route,
            'config' => $this->config(),
        ], $this->permissions))->render();
    }

    protected function applyNestedRelationFilter($query, array $relations, string $column, $value)
    {
        $currentRelation = array_shift($relations);
        if(count($relations) > 0) {
            $query->whereHas($currentRelation, function($q) use ($relations, $column, $value) {
                $this->applyNestedRelationFilter($q, $relations, $column, $value);
            });
        } else {
            $query->where($column, 'like', "%{$value}%");
        }
    }

    public function addColumns(array $columns): static
    {
        foreach($columns as $col) {
            $config = $col;
            unset($config['name'], $config['callback']);
            $this->addColumn(
                $col['name'],
                $col['callback'] ?? null,
                $config
            );
        }
        return $this;
    }

    public function buildHeads(): array
    {
        $heads = array_map(fn($col) => [
            'label'        => __(ucwords(str_replace('_', ' ', $col['name']))),
            'data'         => $col['name'],
            'searchable'   => $this->isDbColumn($col['name']),
            'filter'       => $col['filter'] ?? 'text',
            'options'      => $col['options'] ?? [],
            'filter_field' => $col['filter_field'] ?? $col['name'],
        ], $this->dtColumns);
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
        $columns = array_map(fn($col) => [
            'data' => $col['name'],
            'name' => $col['name']
        ], $this->dtColumns);
        if($this->addActionColumn) {
            $columns[] = [
                'data'       => 'action',
                'name'       => 'action',
                'orderable'  => false,
                'searchable' => false,
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
