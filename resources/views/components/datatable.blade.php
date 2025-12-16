<div class="card bg-light shadow-sm border border-gray-300">
    <div class="card-header p-0 d-flex flex-stack">
        <div class="card-title d-flex align-items-center">
            <select class="form-select form-select-sm w-auto" id="entriesSelect">
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="500">500</option>
            </select>
            <div class="btn-group btn-group-xs mx-2">
                @can($data['permission_add'] ?? null)
                    @if(Route::has($route.'.create'))
                        <a href="{{ route($route.'.create') }}"
                           class="btn btn-primary p-2 @if($config['modal.use']) --modal @endif"
                           data-modalsize="{{ $config['modal.size'] }}"> <i class="ki-outline ki-plus fs-3"></i> </a>
                    @endif
                @endcan
                @if($moreActions)
                    @foreach($moreActions as $action)
                        @can($action['permission'] ?? null)
                            @if(isset($action['route']) && Route::has($action['route']))
                                <a href="{{ route($action['route']) }}"
                                   class="btn {{ $action['class'] ?? 'btn-light' }} p-2"
                                        {!! $action['attributes'] ?? '' !!}>
                                    @isset($action['icon'])
                                        <i class="ki-outline {{ $action['icon'] }} fs-3"></i>
                                    @endisset
                                </a>
                            @elseif(isset($action['url']))
                                <a href="{{ $action['url'] }}"
                                   class="btn {{ $action['class'] ?? 'btn-light' }} p-2"
                                        {!! $action['attributes'] ?? '' !!}>
                                    @isset($action['icon'])
                                        <i class="ki-outline {{ $action['icon'] }} fs-3"></i>
                                    @endisset
                                </a>
                            @endif
                        @endcan
                    @endforeach
                @endif
                <button class="btn btn-sm btn-secondary" id="toggleSearchBtn">
                    <i class="ki-outline ki-filter-search"></i>
                </button>
                @if($config['checkbox.route'])
                    <button class="btn btn-sm btn-danger" id="deleteSelectedBtn">
                        <i class="ki-outline ki-trash"></i>
                    </button>
                @endif
                <input type="text" id="tableSearch"
                       class="form-control form-control-sm rounded-0"
                       placeholder="Search..."
                       style="display:none;width:250px;">
                <button class="btn btn-sm btn-warning p-2" id="reloadTableBtn">
                    <i class="ki-outline ki-arrows-circle fs-3"></i>
                </button>
            </div>
        </div>
        <div class="card-toolbar d-flex gap-1">
            <div class="dropdown">
                <button class="btn btn-sm btn-secondary dropdown-toggle" data-bs-toggle="dropdown">
                    <i class="ki-outline ki-eye"></i>
                </button>
                <ul class="dropdown-menu p-2" id="columnVisibilityMenu"></ul>
            </div>
            @if(Route::has($route.'.export'))
                <div class="dropdown">
                    <button class="btn btn-sm btn-success dropdown-toggle" data-bs-toggle="dropdown">
                        <i class="ki-outline ki-cloud-download"></i>
                    </button>
                    <ul class="dropdown-menu">
                        @foreach(['xls','csv','pdf'] as $f)
                            <li>
                                <a class="dropdown-item export-btn" href="#" data-format="{{ $f }}">
                                    {{ strtoupper($f) }}
                                </a>
                            </li>
                        @endforeach
                    </ul>
                </div>
            @endif
        </div>
    </div>

    <div class="card-body p-0">
        <table id="{{ $id }}" class="table table-striped table-row-bordered gy-1 gs-1 border rounded w-100 align-middle">
            <thead>
            <tr>
                @if($config['checkbox.all'])
                    <th class="text-center" width="5">
                        <div class="form-check form-check-sm form-check-custom form-check-solid">
                            <input type="checkbox" class="form-check-input" id="checkAll">
                        </div>
                    </th>
                @endif
                <th class="text-center" width="5">#</th>
                @foreach($heads as $head)
                    <th width="{!! $head['width'] ?? null !!}">{!! $head['label'] !!}</th>
                @endforeach
            </tr>
            </thead>
        </table>
    </div>
    <div class="card-footer d-flex justify-content-between align-items-center py-3">
        <div class="dt-info"></div>
        <div class="dt-pagination"></div>
    </div>
</div>
@push('scripts')
    <script>
        $(function () {
            const checkboxAll = @json($config['checkbox.all']);
            let visibleColumns = [];
            let datas = @json($datas);
            datas.processing = true;
            datas.serverSide = true;
            datas.ajax = {
                url: "{{ route($route.'.datatable') }}",
                data: function (d) {
                    d.visible_columns = visibleColumns;
                }
            };
            datas.columns = [];
            if (checkboxAll) {
                datas.columns.push({
                    data: 'id',
                    orderable: false,
                    searchable: false,
                    className: 'text-center',
                    render: id => `<div class="form-check form-check-sm form-check-custom form-check-solid"><input type="checkbox" class="form-check-input row-check" value="${id}"></div>`
                });
            }
            datas.columns.push({
                data: null,
                name: 'rownum',
                orderable: false,
                searchable: false,
                className: 'text-center',
                render: function (data, type, row, meta) {
                    return meta.row + meta.settings._iDisplayStart + 1;
                }
            });
            @foreach($heads as $head)
            @php $d = $head['data'] ?? '' @endphp
            datas.columns.push({
                data: '{{ $d }}',
                name: '{{ $d }}',
                @if($d === 'action')
                orderable: false,
                searchable: false,
                className: 'text-center',
                @endif
            });
            @endforeach

            let table = $('#{{ $id }}').DataTable({
                ...datas,
                serverSide: true,
                stateSave: true,
                dom: 'rtip',
                order: [],
                columnDefs: [
                    {
                        targets: checkboxAll ? [0, 1] : [0],
                        orderable: false,
                        searchable: false,
                        className: 'text-center'
                    }
                ],
                initComplete: function () {
                    let wrapper = $('#{{ $id }}_wrapper');
                    wrapper.find('.dataTables_info')
                        .appendTo(wrapper.closest('.card').find('.dt-info'));
                    wrapper.find('.dataTables_paginate')
                        .appendTo(wrapper.closest('.card').find('.dt-pagination'));
                }
            });
            $('#reloadTableBtn').click(() => table.ajax.reload(null, false));
            $('#toggleSearchBtn').click(() => $('#tableSearch').toggle().focus());
            $('#tableSearch').keyup(e => table.search(e.target.value).draw());
            $('#entriesSelect').change(e => table.page.len(e.target.value).draw());
            const lockedColumns = checkboxAll ? [0, 1] : [0];
            table.columns().every(function (i) {
                if (lockedColumns.includes(i)) return;
                let title = $(this.header()).text().trim();
                let src = this.dataSrc();
                if (src === 'action' || title.includes('action')) {
                    lockedColumns.push(i);
                    return;
                }
                $('#columnVisibilityMenu').append(`
            <li>
                <label class="dropdown-item">
                    <input type="checkbox"
                           class="toggle-col"
                           data-index="${i}"
                           checked>
                    ${title}
                </label>
            </li>
        `);
                visibleColumns.push(src);
            });
            $(document).on('change', '.toggle-col', function () {
                let i = $(this).data('index');
                let col = table.column(i);
                let src = col.dataSrc();
                let show = this.checked;
                col.visible(show);
                visibleColumns = show
                    ? [...new Set([...visibleColumns, src])]
                    : visibleColumns.filter(c => c !== src);
                table.draw(false);
            });
            $('.export-btn').click(function (e) {
                e.preventDefault();
                let f = $(this).data('format');
                let url = "{{ route($route.'.export') }}" +
                          "?format=" + f +
                          "&columns=" + encodeURIComponent(JSON.stringify(visibleColumns)) +
                          "&" + $.param(table.ajax.params());
                window.location.href = url;
            });
            if (checkboxAll) {
                $('#deleteSelectedBtn').hide();
                $('#checkAll').on('change', function () {
                    $('.row-check').prop('checked', this.checked);
                    toggleDeleteBtn();
                });
                $(document).on('change', '.row-check', toggleDeleteBtn);
            }

            function toggleDeleteBtn() {
                if ($('.row-check:checked').length > 0) {
                    $('#deleteSelectedBtn').fadeIn(150);
                } else {
                    $('#deleteSelectedBtn').fadeOut(150);
                }
            }
        });
    </script>
@endpush

@push('styles')
    <style>
    </style>
@endpush
