<?php

namespace App\Http\Controllers\Backend;

use App\Models\Activity;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AuditLogController extends BaseCrudController
{
    protected ?string $permissionPrefix = 'activity-logs';

    protected array $permissionMap = [
        'export' => 'activity-logs-view',
    ];

    protected function modelClass(): string
    {
        return Activity::class;
    }

    protected function routeName(): string
    {
        return 'audit-logs';
    }

    public function index(Request $request): Response
    {
        $this->authorize('view');

        $search = trim((string) $request->string('search'));
        $event = trim((string) $request->string('event'));
        $perPage = $request->integer('per_page', 20);
        $perPage = in_array($perPage, [
            10,
            20,
            50,
            100,
        ], true) ? $perPage : 20;
        $query = $this->makeAuditLogQuery($request);
        $logs = $query->paginate($perPage)->withQueryString();

        return Inertia::render('backend/auditlogs/Index', [
            'logs' => $logs,
            'filters' => [
                'search' => $search,
                'event' => $event,
                'per_page' => $perPage,
            ],
            'datatable' => [
                'per_page_options' => [
                    10,
                    20,
                    50,
                    100,
                ],
            ],
            'crud' => $this->auditLogCrudPayload($request),
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $this->authorize('export');

        return response()->streamDownload(function () use ($request) {
            $output = fopen('php://output', 'w');
            fwrite($output, "\xEF\xBB\xBF");
            fputcsv($output, [
                'ID',
                'Description',
                'Event',
                'Subject Type',
                'Subject ID',
                'Causer',
                'Created At',
            ]);
            $this->makeAuditLogQuery($request)
                ->cursor()
                ->each(function ($log) use ($output) {
                    fputcsv($output, [
                        $log->id,
                        $log->description,
                        $log->event,
                        $log->subject_type,
                        $log->subject_id,
                        $log->causer?->name ?? 'System',
                        $log->created_at?->toDateTimeString(),
                    ]);
                });
            fclose($output);
        }, 'audit_logs_'.now()->format('Ymd_His').'.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    public function destroyAll(Request $request): RedirectResponse
    {
        $this->authorize('delete');

        Activity::query()->delete();

        return redirect()
            ->route('audit-logs.index', $this->auditLogRedirectQuery($request))
            ->with('success', $this->resolveFlashMessage('notifications.common.deleted'));
    }

    protected function resolvedPermissions(): array
    {
        return array_merge(parent::resolvedPermissions(), [
            'delete_all' => $this->userCan('delete'),
        ]);
    }

    private function auditLogCrudPayload(Request $request): array
    {
        return [
            'modal' => false,
            'mode' => null,
            'open' => false,
            'permissions' => $this->resolvedPermissions(),
            'resource' => [
                'name' => $this->routeName(),
                'routes' => [
                    'index' => $this->routePath('audit-logs.index'),
                    'export' => $this->routePathIfExists('audit-logs.export'),
                    'delete_all' => $this->routePathIfExists('audit-logs.destroy-all'),
                ],
            ],
        ];
    }

    private function auditLogRedirectQuery(Request $request): array
    {
        return collect($request->only([
            'search',
            'event',
            'per_page',
        ]))
            ->reject(fn (mixed $value) => $value === null || $value === '')
            ->all();
    }

    private function makeAuditLogQuery(Request $request): Builder
    {
        $search = trim((string) $request->string('search'));
        $event = trim((string) $request->string('event'));

        return Activity::with('causer:id,name,email')
            ->when($search !== '', function (Builder $query) use ($search): void {
                $query->where(function (Builder $builder) use ($search): void {
                    $builder->where('description', 'like', '%'.$search.'%')
                        ->orWhere('subject_type', 'like', '%'.$search.'%')
                        ->orWhereHas('causer', fn (Builder $causerQuery) => $causerQuery->where('name', 'like', '%'.$search.'%'));
                });
            })
            ->when($event !== '', fn (Builder $query) => $query->where('event', $event))
            ->orderByDesc('created_at');
    }
}
