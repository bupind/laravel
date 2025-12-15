<div class="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-800 menu-state-bg menu-state-color fw-semibold py-4 fs-6 w-275px" data-kt-menu="true">
    <div class="menu-item px-3">
        <div class="menu-content d-flex align-items-center px-3">
            <div class="symbol symbol-50px me-5">
                <img alt="Logo" src="{{Auth::user()->profile_photo_url }}"/>
            </div>
            <div class="d-flex flex-column">
                <div class="fw-bold d-flex align-items-center fs-5">
                    {{ Auth::user()->name }}
                    <span class="badge badge-light-success fw-bold fs-8 px-2 py-1 ms-2">Grusefi</span>
                </div>
                <a href="#" class="fw-semibold text-muted text-hover-primary fs-7">
                    {{ Auth::user()->email }}
                </a>
            </div>
        </div>
    </div>
    <div class="separator my-2"></div>
    @can(["ver_admin"])
        <div class="menu-item px-5" data-kt-menu-trigger="hover" data-kt-menu-placement="left-start">
            <a href="#" class="menu-link px-5">
                <span class="menu-title">Administración</span>
                <span class="menu-arrow"></span>
            </a>
            <div class="menu-sub menu-sub-dropdown w-175px py-4">
                <div class="menu-item px-3">
                    <a href="/admin/roles" class="menu-link px-5">Roles</a>
                </div>
                <div class="menu-item px-3">
                    <a href="/admin/users" class="menu-link px-5">Usuarios</a>
                </div>
            </div>
        </div>
    @endcan
    <div class="menu-item px-5">
        <a href="user/profile" class="menu-link px-5">Mi Perfil</a>
    </div>
    <div class="separator my-2"></div>
    <div class="menu-item px-5">
        <form method="POST" action="{{ route('logout') }}" x-data>
            @csrf
            <button type="submit" @click.prevent="$root.submit();"
            class="menu-link px-5 btn btn-white"><span class="svg-icon svg-icon-1"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect opacity="0.3" x="4" y="11" width="12" height="2" rx="1" fill="black"/>
                <path d="M5.86875 11.6927L7.62435 10.2297C8.09457 9.83785 8.12683 9.12683 7.69401 8.69401C7.3043 8.3043 6.67836 8.28591 6.26643 8.65206L3.34084 11.2526C2.89332 11.6504 2.89332 12.3496 3.34084 12.7474L6.26643 15.3479C6.67836 15.7141 7.3043 15.6957 7.69401 15.306C8.12683 14.8732 8.09458 14.1621 7.62435 13.7703L5.86875 12.3073C5.67684 12.1474 5.67684 11.8526 5.86875 11.6927Z" fill="black"/>
                <path d="M8 5V6C8 6.55228 8.44772 7 9 7C9.55228 7 10 6.55228 10 6C10 5.44772 10.4477 5 11 5H18C18.5523 5 19 5.44772 19 6V18C19 18.5523 18.5523 19 18 19H11C10.4477 19 10 18.5523 10 18C10 17.4477 9.55228 17 9 17C8.44772 17 8 17.4477 8 18V19C8 20.1046 8.89543 21 10 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3H10C8.89543 3 8 3.89543 8 5Z" fill="#C4C4C4"/>
                </svg></span>Cerrar Sesión</button>
        </form>
    </div>
</div>
