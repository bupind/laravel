<div class="app-sidebar-logo px-6" id="kt_app_sidebar_logo">
    <a href="{{ route('dashboard') }}">
        <img alt="Logo" src="{{asset("img/default-dark.svg")}}" class="h-25px app-sidebar-logo-default"/>
        <img alt="Logo" src="{{asset("img/default-dark.svg")}}" class="h-20px app-sidebar-logo-minimize"/> </a>
    <div id="kt_app_sidebar_toggle" class="app-sidebar-toggle btn btn-icon btn-shadow btn-sm btn-color-muted btn-active-color-primary h-30px w-30px position-absolute top-50 start-100 translate-middle rotate" data-kt-toggle="true" data-kt-toggle-state="active" data-kt-toggle-target="body" data-kt-toggle-name="app-sidebar-minimize">
        <i class="ki-outline ki-burger-menu-3 fs-1"></i>
    </div>
</div>
<div class="app-sidebar-menu overflow-hidden flex-column-fluid">
    <div id="kt_app_sidebar_menu_wrapper" class="app-sidebar-wrapper">
        <div id="kt_app_sidebar_menu_scroll" class="scroll-y my-5 mx-3" data-kt-scroll="true" data-kt-scroll-activate="true" data-kt-scroll-height="auto" data-kt-scroll-dependencies="#kt_app_sidebar_logo, #kt_app_sidebar_footer" data-kt-scroll-wrappers="#kt_app_sidebar_menu" data-kt-scroll-offset="5px" data-kt-scroll-save-state="true">
            <div class="menu menu-column menu-rounded menu-sub-indention fw-semibold fs-6" id="#kt_app_sidebar_menu" data-kt-menu="true" data-kt-menu-expand="false">

                <div class="menu-item pt-5">
                    <div class="menu-content">
                        <span class="menu-heading fw-bold text-uppercase fs-7">User Management</span>
                    </div>
                </div>
                @role('superuser')
                <div data-kt-menu-trigger="click" class="menu-item menu-accordion @yield('users')">
                    <span class="menu-link">
                        <span class="menu-icon"><i class="ki-outline ki-security-user fs-2"></i></span>
                        <span class="menu-title">Administrator</span>
                        <span class="menu-arrow"></span>
                    </span>
                    <div class="menu-sub menu-sub-accordion">
                        <div class="menu-item">
                            <a class="menu-link" href="{{ route('roles.index') }}">
                                <span class="menu-bullet"><span class="bullet bullet-dot"></span></span>
                                <span class="menu-title">Roles</span> </a>
                        </div>
                        <div class="menu-item">
                            <a class="menu-link" href="{{ route('permissions.index') }}">
                                <span class="menu-bullet"><span class="bullet bullet-dot"></span></span>
                                <span class="menu-title">Permissions</span> </a>
                        </div>
                        <div class="menu-item">
                            <a class="menu-link" href="{{ route('users.index') }}">
                                <span class="menu-bullet"><span class="bullet bullet-dot"></span></span>
                                <span class="menu-title">Users</span> </a>
                        </div>
                    </div>
                </div>
                @endrole
            </div>
        </div>
    </div>
</div>
<div class="app-sidebar-footer flex-column-auto pt-2 pb-6 px-6" id="kt_app_sidebar_footer">
    <a href="https://preview.keenthemes.com/html/metronic/docs" class="btn btn-flex flex-center btn-custom btn-primary overflow-hidden text-nowrap px-0 h-40px w-100" data-bs-toggle="tooltip" data-bs-trigger="hover" data-bs-dismiss-="click" title="200+ in-house components and 3rd-party plugins">
        <span class="btn-label">Docs & Components</span>
        <i class="ki-duotone ki-document btn-icon fs-2 m-0"><span class="path1"></span> <span class="path2"></span></i>
    </a>
</div>
