<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

abstract class BaseCrudController extends Controller
{
    protected static array $schemaColumnsCache = [];
    protected bool $modal = true;
    protected int $perPage = 10;
    protected array $perPageOptions = [10, 25, 50, 100];
    protected array $sortableColumns = [];
    protected array $excludeSortableColumns = [];
    protected array $sortColumnMap = [];
    protected array $searchableColumns = [];
    protected bool $searchPrefix = false;
    protected array $select = [];
    protected array $with = [];
    protected array $withCount = [];
    protected array $exportColumns = [];
    protected array $excludeExportColumns = [];
    protected array $exportColumnLabels = [];
    protected string $orderBy = 'id';
    protected string $orderDirection = 'desc';

    abstract protected function modelClass(): string;
    abstract protected function routeName(): string;
    abstract protected function indexComponent(): string;
    abstract protected function formComponent(): string;
    abstract protected function rules(?Model $record = null): array;

    protected function filters(Request $request): array
    {
        return [
            'search' => (string) $request->string('search'),
            'sort_by' => (string) $request->string('sort_by', $this->orderBy),
            'sort_dir' => strtolower((string) $request->string('sort_dir', $this->orderDirection)),
            'per_page' => $this->resolvedPerPage($request),
        ];
    }

    protected function applyFilters(Builder $query, Request $request): void
    {
        //
    }

    protected function applySearch(Builder $query, Request $request): void
    {
        $search = trim((string) $request->string('search'));

        if ($search === '' || $this->searchableColumns === []) {
            return;
        }

        $pattern = $this->searchPrefix
            ? $search . '%'
            : '%' . $search . '%';

        $query->where(function (Builder $builder) use ($pattern) {
            foreach ($this->searchableColumns as $column) {
                $builder->orWhere($column, 'like', $pattern);
            }
        });
    }

    protected function applySorting(Builder $query, Request $request): void
    {
        $sortBy = (string) $request->string('sort_by', $this->orderBy);
        $sortDir = strtolower((string) $request->string('sort_dir', $this->orderDirection));
        $sortableColumns = $this->resolvedSortableColumns();

        if (!in_array($sortBy, $sortableColumns, true)) {
            $sortBy = in_array($this->orderBy, $sortableColumns, true)
                ? $this->orderBy
                : ($sortableColumns[0] ?? '');
        }

        if ($sortBy === '') {
            return;
        }

        if (!in_array($sortDir, ['asc', 'desc'], true)) {
            $sortDir = $this->orderDirection;
        }

        $query->orderBy($this->sortColumnMap[$sortBy] ?? $sortBy, $sortDir);
    }

    protected function resolvedPerPage(Request $request): int
    {
        $perPage = $request->integer('per_page', $this->perPage);

        return in_array($perPage, $this->perPageOptions, true)
            ? $perPage
            : $this->perPage;
    }

    protected function resolvedSortableColumns(): array
    {
        $columns = $this->sortableColumns;

        if ($columns === []) {
            /** @var Model $model */
            $model = new ($this->modelClass())();
            $table = $model->getTable();
            $columns = self::$schemaColumnsCache[$table] ??= Schema::getColumnListing($table);
        }

        $columns = array_values(array_unique(array_merge($columns, array_keys($this->sortColumnMap))));

        return array_values(array_diff($columns, $this->excludeSortableColumns));
    }

    protected function resolvedExportColumns(): array
    {
        $columns = $this->exportColumns;

        if ($columns === []) {
            /** @var Model $model */
            $model = new ($this->modelClass())();
            $table = $model->getTable();
            $columns = self::$schemaColumnsCache[$table] ??= Schema::getColumnListing($table);
        }

        $columns = array_values(array_unique(array_merge($columns, array_keys($this->exportColumnLabels))));

        return array_values(array_diff($columns, $this->excludeExportColumns));
    }

    protected function exportFileName(): string
    {
        return $this->routeName() . '_' . now()->format('Ymd_His') . '.csv';
    }

    protected function exportColumnLabel(string $column): string
    {
        return $this->exportColumnLabels[$column] ?? $column;
    }

    protected function exportValue(Model $record, string $column): mixed
    {
        return data_get($record, $column);
    }

    protected function transformExportRow(Model $record, array $columns): array
    {
        $values = [];

        foreach ($columns as $column) {
            $value = $this->exportValue($record, $column);

            if (is_scalar($value) || $value === null) {
                $values[] = $value;
                continue;
            }

            $values[] = json_encode($value, JSON_UNESCAPED_UNICODE);
        }

        return $values;
    }

    protected function makeExportQuery(Request $request): Builder
    {
        return $this->makeQuery($request);
    }

    protected function additionalIndexProps(Request $request): array
    {
        return [];
    }

    protected function additionalFormProps(Request $request, ?Model $record = null): array
    {
        return [];
    }

    protected function beforeStore(array $validated, Request $request): array
    {
        return $validated;
    }

    protected function beforeUpdate(array $validated, Request $request, Model $record): array
    {
        return $validated;
    }

    protected function storeSuccessMessage(): string
    {
        return 'notifications.common.created';
    }

    protected function updateSuccessMessage(): string
    {
        return 'notifications.common.updated';
    }

    protected function deleteSuccessMessage(): string
    {
        return 'notifications.common.deleted';
    }

    protected function usesModal(): bool
    {
        return $this->modal;
    }

    protected function resourceSingular(): string
    {
        $name = $this->routeName();

        if (str_ends_with($name, 'ies')) {
            return substr($name, 0, -3) . 'y';
        }

        if (str_ends_with($name, 's')) {
            return substr($name, 0, -1);
        }

        return $name;
    }

    protected function collectionProp(): string
    {
        return $this->routeName();
    }

    protected function recordProp(): string
    {
        return $this->resourceSingular();
    }

    protected function makeQuery(Request $request): Builder
    {
        /** @var class-string<Model> $modelClass */
        $modelClass = $this->modelClass();
        $query = $modelClass::query();

        if ($this->with !== []) {
            $query->with($this->with);
        }

        if ($this->withCount !== []) {
            $query->withCount($this->withCount);
        }

        if ($this->select !== []) {
            $query->select($this->select);
        }

        $this->applyFilters($query, $request);
        $this->applySearch($query, $request);
        $this->applySorting($query, $request);

        return $query;
    }

    protected function indexPayload(Request $request): array
    {
        return array_merge([
            $this->collectionProp() => $this->makeQuery($request)
                ->paginate($this->resolvedPerPage($request))
                ->withQueryString(),
            'filters' => $this->filters($request),
            'datatable' => [
                'per_page_options' => $this->perPageOptions,
                'sortable_columns' => $this->resolvedSortableColumns(),
            ],
            'crud' => [
                'modal' => $this->usesModal(),
                'mode' => null,
                'open' => false,
            ],
        ], $this->additionalIndexProps($request));
    }

    protected function resolveRecord(mixed $value): Model
    {
        /** @var Model $model */
        $model = new ($this->modelClass())();

        if ($value instanceof Model) {
            return $value;
        }

        $record = $model->resolveRouteBinding($value);

        if (!$record) {
            abort(404);
        }

        return $record;
    }

    public function index(Request $request): Response
    {
        return Inertia::render($this->indexComponent(), $this->indexPayload($request));
    }

    public function create(Request $request): Response
    {
        if (!$this->usesModal()) {
            return Inertia::render($this->formComponent(), $this->additionalFormProps($request));
        }

        $payload = $this->indexPayload($request);
        $payload['crud'] = [
            'modal' => true,
            'mode' => 'create',
            'open' => true,
        ];
        $payload['form'] = array_merge([
            $this->recordProp() => null,
        ], $this->additionalFormProps($request));

        return Inertia::render($this->indexComponent(), $payload);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate($this->rules());
        $validated = $this->beforeStore($validated, $request);

        /** @var Model $record */
        $record = new ($this->modelClass())();
        $record->fill($validated);
        $record->save();

        return redirect()
            ->route($this->routeName() . '.index')
            ->with('success', $this->flashMessage($this->storeSuccessMessage()));
    }

    public function edit(Request $request, mixed $record): Response
    {
        $record = $this->resolveRecord($record);

        $formProps = array_merge([
            $this->recordProp() => $record,
        ], $this->additionalFormProps($request, $record));

        if (!$this->usesModal()) {
            return Inertia::render($this->formComponent(), $formProps);
        }

        $payload = $this->indexPayload($request);
        $payload['crud'] = [
            'modal' => true,
            'mode' => 'edit',
            'open' => true,
        ];
        $payload['form'] = $formProps;

        return Inertia::render($this->indexComponent(), $payload);
    }

    public function update(Request $request, mixed $record): RedirectResponse
    {
        $record = $this->resolveRecord($record);

        $validated = $request->validate($this->rules($record));
        $validated = $this->beforeUpdate($validated, $request, $record);

        $record->fill($validated);
        $record->save();

        return redirect()
            ->route($this->routeName() . '.index')
            ->with('success', $this->flashMessage($this->updateSuccessMessage()));
    }

    public function destroy(mixed $record): RedirectResponse
    {
        $record = $this->resolveRecord($record);
        $record->delete();

        return redirect()
            ->route($this->routeName() . '.index')
            ->with('success', $this->flashMessage($this->deleteSuccessMessage()));
    }

    public function export(Request $request): StreamedResponse
    {
        $columns = $this->resolvedExportColumns();
        $scope = strtolower((string) $request->string('scope', 'all'));
        $scope = in_array($scope, ['all', 'current'], true) ? $scope : 'all';

        return response()->streamDownload(function () use ($request, $columns, $scope) {
            $output = fopen('php://output', 'w');

            if ($output === false) {
                return;
            }

            fwrite($output, "\xEF\xBB\xBF");
            fputcsv($output, array_map(fn (string $column) => $this->exportColumnLabel($column), $columns));

            $query = $this->makeExportQuery($request);

            if ($scope === 'current') {
                $page = max(1, (int) $request->integer('page', 1));
                $rows = $query
                    ->forPage($page, $this->resolvedPerPage($request))
                    ->get();

                foreach ($rows as $row) {
                    fputcsv($output, $this->transformExportRow($row, $columns));
                }
            } else {
                foreach ($query->cursor() as $row) {
                    fputcsv($output, $this->transformExportRow($row, $columns));
                }
            }

            fclose($output);
        }, $this->exportFileName(), [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }
}
