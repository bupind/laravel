<div class="d-flex align-items-center">
    <a href="#" class="btn btn-sm btn-bg-light btn-color-gray-500 btn-active-color-primary me-2">
        <span class="fw-bold me-1" id="kt_dashboard_daterangepicker_title" id="prueba">Hoy es:</span>
        <span class="fw-bolder" id="kt_dashboard_daterangepicker_date">
            @php
                use Carbon\Carbon;
                Carbon::setLocale('es');
                $fecha = Carbon::now()->translatedFormat('j \d\e F \d\e Y');
                echo $fecha
            @endphp
        </span>
    </a>
</div>
@role('tefs')
    <div class="d-flex align-items-center">
        <a href="#"
            class="btn btn-sm btn-bg-light-success hoverable"
            id="" data-bs-toggle="tooltip" data-bs-dismiss="click"
            data-bs-trigger="hover" title="Select dashboard daterange">
            <input type="text" class="d-none" id="id_user_general" value="{{Auth::user()->id}}">
            <span class="fw-bold me-1" id="kt_dashboard_daterangepicker_title" id="prueba">Usuario: {{Auth::user()->name.' '.Auth::user()->last_name}}</span>
        </a>
    </div>
@endrole
