<div class="d-flex align-items-stretch flex-shrink-0">
    <div class="d-flex align-items-center flex-wrap">
        @include("metronic/partials/menus/_date_user")
    </div>
    <div class="d-flex align-items-center ms-1 ms-lg-3">
        <div class="btn btn-icon btn-active-light-primary position-relative btn btn-icon btn-active-light-primary w-30px h-30px w-md-40px h-md-40px pulse pulse-success" id="kt_drawer_chat_toggle">
            <i class="ki-outline ki-notification-2 fs-1 text-gray-600"></i>
            <span class="pulse-ring w-45px h-45px"></span>
        </div>
    </div>
    <div class="d-flex align-items-center ms-1 ms-lg-3">
        @include("metronic/partials/theme-mode/_main")
    </div>
    <div class="d-flex align-items-center ms-1 ms-lg-3" id="kt_header_user_menu_toggle">
        <div class="cursor-pointer symbol symbol-30px symbol-md-40px" data-kt-menu-trigger="click" data-kt-menu-attach="parent" data-kt-menu-placement="bottom-end">
            <img src="{{ Auth::user()->profile_photo_url }}" alt="image"/>
        </div>
        @include("metronic.partials._user-account-menu")
    </div>
    <div class="d-flex align-items-center d-lg-none ms-2 me-n2" title="Show header menu">
        <div class="btn btn-icon btn-active-color-primary w-30px h-30px w-md-40px h-md-40px" id="kt_header_menu_mobile_toggle">
            <i class="ki-outline ki-burger-menu-2 fs-1"></i>
        </div>
    </div>
</div>
