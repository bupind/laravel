<div class="card card-flush h-md-100">
    <div class="card-header py-0 d-flex flex-stack">
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
                           class="btn btn-sm btn-primary px-2 @if($config['modal.use']) --modal @endif"
                           data-modalsize="{{ $config['modal.size'] }}"
                           data-title="Create {{ \Illuminate\Support\Str::title(str_replace('-', ' ', $route)) }}">
                            <i class="ki-outline ki-plus fs-3"></i> </a>
                    @endif
                @endcan

                <button class="btn btn-sm btn-secondary" id="toggleSearchBtn">
                    <i class="ki-outline ki-filter-search"></i>
                </button>

                @if($config['checkbox.all'])
                    <button class="btn btn-sm btn-danger" id="deleteSelectedBtn" disabled>
                        <i class="ki-outline ki-trash"></i>
                    </button>
                @endif

                <input type="text" id="tableSearch"
                       class="form-control form-control-sm rounded-0"
                       placeholder="Search..."
                       style="display:none;width:250px;">
                <button class="btn btn-sm btn-warning px-2" id="reloadTableBtn">
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
        <div class="table-responsive">
            <table id="{{ $id }}" class="table table-striped table-bordered align-middle">
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
    </div>
</div>
@push('scripts')
    <script src="{{asset('assets/custom/datatables/datatables.bundle.js')}}"></script>
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
                fixedHeader: {
                    header: true,
                    headerOffset: 5
                },
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
                ]
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
    <link href="{{asset('assets/custom/datatables/datatables.bundle.css')}}" rel="stylesheet" type="text/css"/>
    <style>
        th.text-center {
            text-align: center;
        }

        .card-header .btn {
            font-size: 0.75rem;
            padding: 0.375rem 0.75rem;
        }

        /*table.dataTable thead th {*/
        /*    background-color: #0073ea !important;*/
        /*    color: #fff !important;*/
        /*    font-weight: 600;*/
        /*}*/

        /*table.dataTable tbody td {*/
        /*    vertical-align: middle !important;*/
        /*}*/

        /*.table-responsive {*/
        /*    overflow-x: auto;*/
        /*}*/
    </style>
@endpush
