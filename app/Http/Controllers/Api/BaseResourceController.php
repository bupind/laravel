<?php

namespace App\Http\Controllers\Api;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

abstract class BaseResourceController extends ApiController
{
    protected int    $perPage           = 10;
    protected array  $searchableColumns = [];
    protected array  $sortableColumns   = [];
    protected string $orderBy           = 'id';
    protected string $orderDirection    = 'desc';
    protected bool   $useTransactions   = false;

    public function index(Request $request): JsonResponse
    {
        $rows = $this->makeQuery($request)
            ->paginate($this->resolvedPerPage($request))
            ->withQueryString();
        return $this->respondList(
            $this->listName(),
            $rows,
            $this->resourceName() . 's successfully loaded.',
        );
    }

    protected function makeQuery(Request $request): Builder
    {
        /** @var class-string<Model> $modelClass */
        $modelClass = $this->modelClass();
        $query      = $modelClass::query();
        $this->applyFilters($query, $request);
        $this->applySearch($query, $request);
        $this->applySorting($query, $request);
        return $query;
    }

    abstract protected function modelClass(): string;

    protected function applyFilters(Builder $query, Request $request): void
    {
    }

    protected function applySearch(Builder $query, Request $request): void
    {
        $search = trim((string)$request->query('search', ''));
        if($search === '' || $this->searchableColumns === []) {
            return;
        }
        $query->where(function(Builder $builder) use ($search): void {
            foreach($this->searchableColumns as $column) {
                $builder->orWhere($column, 'like', '%' . $search . '%');
            }
        });
    }

    protected function applySorting(Builder $query, Request $request): void
    {
        $sortBy         = (string)$request->query('sort_by', $this->orderBy);
        $allowedColumns = $this->sortableColumns !== [] ? $this->sortableColumns : [$this->orderBy];
        if(!in_array($sortBy, $allowedColumns, true)) {
            $sortBy = $this->orderBy;
        }
        $direction = strtolower((string)$request->query('sort_dir', $this->orderDirection));
        $direction = in_array($direction, [
            'asc',
            'desc',
        ], true) ? $direction : $this->orderDirection;
        $query->orderBy($sortBy, $direction);
    }

    protected function resolvedPerPage(Request $request): int
    {
        return min(max($request->integer('per_page', $this->perPage), 1), 100);
    }

    protected function listName(): string
    {
        return $this->resourceName() . ' List';
    }

    protected function resourceName(): string
    {
        return str(class_basename($this->modelClass()))->headline()->toString();
    }

    public function form(Request $request, mixed $id = null): JsonResponse
    {
        $record = $id === null ? null : $this->resolveRecord($id);
        return $this->respondForm(
            $this->resourceName() . ' Form',
            $this->formSchema($request, $record),
            $record,
        );
    }

    protected function resolveRecord(mixed $id): Model
    {
        /** @var Model $model */
        $model  = new ($this->modelClass())();
        $record = $model->resolveRouteBinding($id);
        abort_unless($record !== null, 404);
        return $record;
    }

    protected function formSchema(Request $request, ?Model $record = null): array
    {
        return [];
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $this->validatePayload($request, $this->storeRules($request));
        if($validated instanceof JsonResponse) {
            return $validated;
        }
        $validated = $this->beforeStore($validated, $request);
        $record    = $this->persist(fn() => $this->createRecord($validated, $request));
        return $this->respondCreated(
            $this->resourceName() . ' Create',
            $record,
            $this->resourceName() . ' successfully created.',
        );
    }

    protected function validatePayload(Request $request, array $rules): array|JsonResponse
    {
        $validator = Validator::make($request->all(), $rules);
        if($validator->fails()) {
            return $this->respond(
                $this->resourceName() . ' Validation',
                'Validation failed.',
                42201,
                422,
                ['Errors' => $validator->errors()],
            );
        }
        return $validator->validated();
    }

    protected function storeRules(Request $request): array
    {
        return $this->rules($request);
    }

    protected function rules(Request $request, ?Model $record = null): array
    {
        return [];
    }

    protected function beforeStore(array $validated, Request $request): array
    {
        return $validated;
    }

    protected function persist(callable $callback): mixed
    {
        return $this->useTransactions ? DB::transaction($callback) : $callback();
    }

    protected function createRecord(array $validated, Request $request): Model
    {
        /** @var Model $record */
        $record = new ($this->modelClass())();
        $record->fill($validated);
        $record->save();
        return $record;
    }

    public function show(mixed $id): JsonResponse
    {
        return $this->respond(
            $this->resourceName() . ' Detail',
            $this->resourceName() . ' successfully loaded.',
            10001,
            200,
            $this->resolveRecord($id),
        );
    }

    public function update(Request $request, mixed $id): JsonResponse
    {
        $record    = $this->resolveRecord($id);
        $validated = $this->validatePayload($request, $this->updateRules($request, $record));
        if($validated instanceof JsonResponse) {
            return $validated;
        }
        $validated = $this->beforeUpdate($validated, $request, $record);
        $record    = $this->persist(fn() => $this->updateRecord($record, $validated, $request));
        return $this->respondUpdated(
            $this->resourceName() . ' Update',
            $record,
            $this->resourceName() . ' successfully updated.',
        );
    }

    protected function updateRules(Request $request, Model $record): array
    {
        return $this->rules($request, $record);
    }

    protected function beforeUpdate(array $validated, Request $request, Model $record): array
    {
        return $validated;
    }

    protected function updateRecord(Model $record, array $validated, Request $request): Model
    {
        $record->fill($validated);
        $record->save();
        return $record;
    }

    public function destroy(mixed $id): JsonResponse
    {
        $record = $this->resolveRecord($id);
        $this->persist(function() use ($record): void {
            $record->delete();
        });
        return $this->respondDeleted(
            $this->resourceName() . ' Delete',
            $this->resourceName() . ' successfully deleted.',
        );
    }
}
