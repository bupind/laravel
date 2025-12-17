<div class="btn-group btn-group-xs" role="group" style="font-size: 0.75rem;">
    @can($data['permission_show'] ?? null)
        <a href="{{ route($route . '.show', $model->id) }}"
           class="btn btn-light-primary p-2 @if($config['modal.use']) --modal @endif"
           data-modalsize="{{ $config['modal.size'] }}"
           data-title="{{ __('Detail') . ' ' . \Illuminate\Support\Str::title(str_replace('-', ' ', $route)) }}">
            <i class="ki-outline ki-eye fs-3"></i>
        </a>
    @endcan

    @can($data['permission_edit'] ?? null)
        <a href="{{ route($route . '.edit', $model->id) }}"
           class="btn btn-light-warning p-2 @if($config['modal.use']) --modal @endif"
           data-modalsize="{{ $config['modal.size'] }}"
           data-title="{{ __('Update') . ' ' . \Illuminate\Support\Str::title(str_replace('-', ' ', $route)) }}">
            <i class="ki-outline ki-pencil fs-3"></i>
        </a>
    @endcan

    @can($data['permission_delete'] ?? null)
        <form method="POST" action="{{ route($route . '.destroy', $model->id) }}" onsubmit="return confirm('Are you sure?')" style="display:inline-block;">
            @csrf
            @method('DELETE')
            <button type="submit" class="btn btn-light-danger p-2">
                <i class="ki-outline ki-trash fs-3"></i>
            </button>
        </form>
    @endcan

    @hasSection('action_buttons')
        <div class="btn-group">
            <button type="button" class="btn btn-light btn-icon p-1 dropdown-toggle fs-6"
                    data-bs-toggle="dropdown" aria-expanded="false">
                <i class="ki-outline ki-dots-horizontal"></i>
            </button>

            <ul class="dropdown-menu dropdown-menu-end shadow-sm">
                @yield('action_buttons')
            </ul>
        </div>
    @endif
</div>
