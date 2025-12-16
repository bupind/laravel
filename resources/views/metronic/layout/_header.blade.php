<div class="app-container container-fluid d-flex align-items-stretch justify-content-between" id="kt_app_header_container">
    <div class="d-flex align-items-center d-lg-none ms-n3 me-1 me-md-2" title="Show sidebar menu">
        <div class="btn btn-icon btn-active-color-primary w-35px h-35px" id="kt_app_sidebar_mobile_toggle">
            <i class="ki-outline ki-abstract-14 fs-1"></i>
        </div>
    </div>

    <div class="d-flex align-items-center flex-grow-1 flex-lg-grow-0">
        <a href="index.html" class="d-lg-none"> <img alt="Logo" src="{{asset("img/default-dark.svg")}}" class="h-30px"/>
        </a>
    </div>
    <div class="d-flex align-items-stretch justify-content-between flex-lg-grow-1" id="kt_app_header_wrapper">
        <div class="app-header-menu app-header-mobile-drawer align-items-stretch" data-kt-drawer="true" data-kt-drawer-name="app-header-menu" data-kt-drawer-activate="{default: true, lg: false}" data-kt-drawer-overlay="true" data-kt-drawer-width="250px" data-kt-drawer-direction="end" data-kt-drawer-toggle="#kt_app_header_menu_toggle" data-kt-swapper="true" data-kt-swapper-mode="{default: 'append', lg: 'prepend'}" data-kt-swapper-parent="{default: '#kt_app_body', lg: '#kt_app_header_wrapper'}">
            <div class="menu menu-rounded menu-column menu-lg-row my-5 my-lg-0 align-items-stretch fw-semibold px-2 px-lg-0" id="kt_app_header_menu" data-kt-menu="true"></div>
        </div>
        <div class="app-navbar flex-shrink-0">
            <div class="d-flex align-items-center">
                <a href="#" class="btn btn-sm btn-bg-light btn-color-gray-500 btn-active-color-primary me-2">
                    <span class="fw-bolder" id="kt_dashboard_daterangepicker_date">
            @php
                use Carbon\Carbon;
                Carbon::setLocale('en');
                $fecha = Carbon::now()->translatedFormat('j F Y');
                echo $fecha
            @endphp
        </span> </a>
            </div>

            <div class="app-navbar-item ms-1 ms-md-4">
                <div class="d-flex align-items-center ms-1 ms-lg-3">
                    @include("metronic/partials/_mode")
                </div>
            </div>
            <div class="app-navbar-item ms-1 ms-md-4" id="kt_header_user_menu_toggle">
                <div class="cursor-pointer symbol symbol-35px" data-kt-menu-trigger="{default: 'click', lg: 'hover'}" data-kt-menu-attach="parent" data-kt-menu-placement="bottom-end">
                    <img src="{{ Auth::user()->profile_photo_url }}" class="rounded-3" alt="image"/>
                </div>
                @include("metronic.partials._top-menu")
            </div>
        </div>
    </div>
</div>
