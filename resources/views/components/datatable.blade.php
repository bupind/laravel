@php
    use App\Constants\DataConstant;$heads = $table['heads'] ?? [];
    $datas = $table['data'] ?? [];
    $config = $table['config'] ?? [];
@endphp

<div class="card bg-light shadow-sm border border-gray-300 rounded-2 datatable-wrapper"
     data-table-id="{{ $id }}"
     data-route="{{ route($route.'.datatable') }}"
     data-export="{{ Route::has($route.'.export') ? route($route.'.export') : '' }}"
     data-batch="{{ (int)($config['batch'] ?? false) }}"
     data-options='@json($datas)'>

    <div class="card-header p-1 d-flex flex-stack">
        <div class="card-title d-flex align-items-center gap-2">
            <select class="form-select form-select-sm w-auto entriesSelect">
                @foreach([10,25,50,100,500] as $n)
                    <option value="{{ $n }}">{{ $n }}</option>
                @endforeach
            </select>

            <div class="btn-group btn-group-sm">
                @can($add ?? false)
                    @if(Route::has($route.'.create'))
                        <a href="{{ route($route.'.create') }}"
                           class="btn btn-primary p-2 @if($config['modal']) --modal @endif"
                           data-modalsize="{{ $config['modal.size'] }}"> <i class="ki-outline ki-plus fs-3"></i> </a>
                    @endif
                @endcan
                <button class="btn btn-secondary toggleSearchBtn">
                    <i class="ki-outline ki-filter-search"></i>
                </button>

                @if($config['batch'] ?? false)
                    <button class="btn btn-danger deleteSelectedBtn d-none">
                        <i class="ki-outline ki-trash"></i>
                    </button>
                @endif

                <input type="text" class="form-control form-control-sm tableSearch d-none"
                       placeholder="Search..."
                       style="width:200px">

                <button class="btn btn-warning reloadTableBtn">
                    <i class="ki-outline ki-arrows-circle"></i>
                </button>
            </div>
        </div>

        <div class="card-toolbar d-flex gap-1">
            <div class="dropdown">
                <button class="btn btn-sm btn-secondary" data-bs-toggle="dropdown">
                    <i class="ki-outline ki-eye"></i>
                </button>
                <ul class="dropdown-menu p-2 columnVisibilityMenu"></ul>
            </div>

            @if(Route::has($route.'.export'))
                <div class="dropdown">
                    <button class="btn btn-sm btn-success" data-bs-toggle="dropdown">
                        <i class="ki-outline ki-cloud-download"></i>
                    </button>
                    <ul class="dropdown-menu">
                        @foreach(['xls','csv','pdf'] as $f)
                            <li>
                                <a href="#" class="dropdown-item exportBtn" data-format="{{ $f }}">
                                    {{ strtoupper($f) }}
                                </a>
                            </li>
                        @endforeach
                    </ul>
                </div>
            @endif
        </div>
    </div>
    <div class="card-body p-1">
        <table id="{{ $id }}" class="table table-striped table-row-bordered gy-1 gs-1 w-100 align-middle">
            <thead>
            <tr>
                @if($config['batch'] ?? false)
                    <th data-field="_checkbox" width="1">
                        <input type="checkbox" class="form-check-input checkAll">
                    </th>
                @endif
                <th data-field="_rownum" width="1">#</th>
                @foreach($heads as $head)
                    <th data-field="{{ $head['data'] }}" width="{{ $head['width'] ?? ''}}">
                        {{ $head['label'] }}
                    </th>
                @endforeach
            </tr>
            <tr class="filters d-none">
                @if($config['batch'] ?? false)
                    <th></th>
                @endif
                <th></th>
                @foreach($heads as $head)
                    <th>
                        @if(isset($head['filter']))
                            @if($head['filter'] === DataConstant::FILTER_LIKE)
                                <input type="text" class="form-control form-control-sm column-filter" data-field="{{ $head['filter_field'] ?? $head['data'] }}">
                            @elseif($head['filter'] === DataConstant::FILTER_SELECT)
                                <select class="form-select form-select-sm column-filter" data-field="{{ $head['filter_field'] ?? $head['data'] }}">
                                    <option value="">All</option>
                                    @foreach($head['options'] ?? [] as $val => $label)
                                        <option value="{{ $val }}">{{ $label }}</option>
                                    @endforeach
                                </select>
                            @endif
                        @endif
                    </th>
                @endforeach
            </tr>

            </thead>
        </table>
    </div>
    <div class="card-footer d-flex justify-content-between py-3 px-1">
        <div id="dtInfo"></div>
        <div id="dtPagination"></div>
    </div>
</div>
