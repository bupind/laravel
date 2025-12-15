<div class="hover-scroll-y my-2 my-lg-5 scroll-ms" id="kt_aside_menu_wrapper" data-kt-scroll="true" data-kt-scroll-height="auto" data-kt-scroll-dependencies="#kt_aside_logo, #kt_aside_footer"
    data-kt-scroll-wrappers="#kt_aside, #kt_aside_menu" data-kt-scroll-offset="5px">
    <div class="menu menu-column menu-title-gray-700 menu-state-title-primary menu-state-icon-primary menu-state-bullet-primary menu-arrow-gray-500 fw-semibold" id="#kt_aside_menu"        data-kt-menu="true">
        @can(["ver_zonas"])
            <div data-kt-menu-trigger="hover" data-kt-menu-placement="right-start"
                class="menu-item py-2">
                <span class="menu-link menu-center @yield("zones")" data-bs-trigger="hover" data-bs-dismiss="click"
                    data-bs-placement="right">
                    <span class="menu-icon me-0">
                        <i class="ki-outline ki-geolocation fs-1"></i>
                    </span>
                    <span class="menu-title center">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Zona Geográfica</span>
                </span>
                <div class="menu-sub menu-sub-dropdown w-225px px-1 py-4">
                    <div class="menu-item">
                        <div class="menu-content">
                            <span class="menu-section fs-5 fw-bolder ps-1 py-1">Zonas</span>
                        </div>
                    </div>
                    <div class="menu-item">
                        <a class="menu-link" href="{{route('paises.index')}}">
                            {{-- <span class="menu-icon"><i class="bi bi-tag fs-1"></i></span> --}}
                            <span class="menu-bullet">
                                <span class="bullet bullet-dot"></span>
                            </span>
                            <span class="menu-title">Paises</span>
                        </a>
                    </div>
                    <div class="menu-item">
                        <a class="menu-link" href="{{route('estados.index')}}">
                            <span class="menu-bullet">
                                <span class="bullet bullet-dot"></span>
                            </span>
                            <span class="menu-title">Estados</span>
                        </a>
                    </div>
                    <div class="menu-item">
                        <a class="menu-link" href="{{route('municipios.index')}}">
                            <span class="menu-bullet">
                                <span class="bullet bullet-dot"></span>
                            </span>
                            <span class="menu-title">Municipios</span>
                        </a>
                    </div>
                    <div class="menu-item">
                        <a class="menu-link" href="{{route('localidades.index')}}">
                            <span class="menu-bullet">
                                <span class="bullet bullet-dot"></span>
                            </span>
                            <span class="menu-title">Localidades</span>
                        </a>
                    </div>
                </div>
            </div>
        @endcan
        @can(["ver_configuracion"])
            <div data-kt-menu-trigger="hover" data-kt-menu-placement="right-start"
                class="menu-item py-2">
                <span class="menu-link menu-center @yield("config")" data-bs-trigger="hover" data-bs-dismiss="click"
                    data-bs-placement="right">
                    <span class="menu-icon me-0">
                        <i class="ki-outline ki-wrench fs-1"></i>
                    </span>
                    <span class="menu-title center">Configuración</span>
                </span>
                <div class="menu-sub menu-sub-dropdown w-225px px-1 py-4">
                    <div class="menu-item center">
                        <div class="menu-content text-center">
                            <span class="menu-section fs-5 fw-bolder ps-1 py-1">Configuración General</span>
                        </div>
                    </div>
                    @canany(['config_tef', 'admin_config'])
                        <div data-kt-menu-trigger="click" class="menu-item menu-accordion">
                            <span class="menu-link">
                                <span class="menu-bullet">
                                    <span class="bullet bullet-dot"></span>
                                </span>
                                <span class="menu-title">Clientes</span>
                                <span class="menu-arrow"></span>
                            </span>
                            <div class="menu-sub menu-sub-accordion">
                                <div class="menu-item">
                                    <a class="menu-link"
                                        href="{{route('empaques.index')}}">
                                        <span class="menu-bullet">
                                            <span class="bullet bullet-dot"></span>
                                        </span>
                                        <span class="menu-title">Nuevo</span>
                                    </a>
                                </div>
                                <div class="menu-item">
                                    <a class="menu-link"
                                        href="{{route('destinatarios.index')}}">
                                        <span class="menu-bullet">
                                            <span class="bullet bullet-dot"></span>
                                        </span>
                                        <span class="menu-title">Destinatarios</span>
                                    </a>
                                </div>
                                <div class="menu-item">
                                    <a class="menu-link"
                                        href="{{route('marcas.index')}}">
                                        <span class="menu-bullet">
                                            <span class="bullet bullet-dot"></span>
                                        </span>
                                        <span class="menu-title">Marcas</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    @endcanany
                    @can(['admin_config'])
                        <div class="menu-item">
                            <a class="menu-link" href="{{route('presentaciones.index')}}">
                                <span class="menu-bullet">
                                    <span class="bullet bullet-dot"></span>
                                </span>
                                <span class="menu-title">Presentaciones</span>
                            </a>
                        </div>
                        <div class="menu-item">
                            <a class="menu-link" href="{{route('puertos.index')}}">
                                <span class="menu-bullet">
                                    <span class="bullet bullet-dot"></span>
                                </span>
                                <span class="menu-title">Puntos de Entrada</span>
                            </a>
                        </div>
                        <div class="menu-item">
                            <a class="menu-link" href="{{route('tipo_cultivos.index')}}">
                                <span class="menu-bullet">
                                    <span class="bullet bullet-dot"></span>
                                </span>
                                <span class="menu-title">Tipo de Cultivos</span>
                            </a>
                        </div>
                        <div class="menu-item">
                            <a class="menu-link" href="{{route('usos.index')}}">
                                <span class="menu-bullet">
                                    <span class="bullet bullet-dot"></span>
                                </span>
                                <span class="menu-title">Usos</span>
                            </a>
                        </div>
                        <div class="menu-item">
                            <a class="menu-link" href="{{route('variedades.index')}}">
                                <span class="menu-bullet">
                                    <span class="bullet bullet-dot"></span>
                                </span>
                                <span class="menu-title">Productos</span>
                            </a>
                        </div>
                    @endcan
                </div>
            </div>
        @endcan
        @can(["ver_plantillas"])
            <div data-kt-menu-trigger="hover" data-kt-menu-placement="right-start"
                class="menu-item py-2">
                <span class="menu-link menu-center  @yield("purchases")" data-bs-trigger="hover" data-bs-dismiss="click"
                    data-bs-placement="right">
                    <span class="menu-icon me-0">
                        <i class="ki-outline ki-document fs-1"></i>
                    </span>
                    <span class="menu-title">Plantillas</span>
                </span>
                <div class="menu-sub menu-sub-dropdown w-225px px-1 py-4">
                    <div class="menu-item">
                        <div class="menu-content">
                            <span class="menu-section fs-5 fw-bolder ps-1 py-1">Plantillas</span>
                        </div>
                    </div>
                    <div class="menu-item">
                        <a class="menu-link" href="{{route('plantillas_rpv')}}">
                            <span class="menu-bullet">
                                <span class="bullet bullet-dot"></span>
                            </span>
                            <span class="menu-title">DV</span>
                        </a>
                    </div>
                </div>
            </div>
        @endcan
        @can(["ver_embarques"])
            <div data-kt-menu-trigger="hover" data-kt-menu-placement="right-start"
                class="menu-item py-2">
                <span class="menu-link menu-center  @yield("embarques")" data-bs-trigger="hover" data-bs-dismiss="click"
                    data-bs-placement="right">
                    <span class="menu-icon me-0">
                        <i class="ki-outline ki-parcel fs-1"></i>
                    </span>
                    <span class="menu-title">DV</span>
                </span>
                <div class="menu-sub menu-sub-dropdown w-225px px-1 py-4">
                    <div class="menu-item">
                        <div class="menu-content">
                            <span class="menu-section fs-5 fw-bolder ps-1 py-1">DV</span>
                        </div>
                    </div>
                    @can(['admin_embarques'])
                        <div class="menu-item">
                            <a class="menu-link" href="{{route('embarques_small')}}">
                                <span class="menu-bullet">
                                    <span class="bullet bullet-dot"></span>
                                </span>
                                <span class="menu-title">Aperturar DV</span>
                            </a>
                        </div>
                        <div class="menu-item">
                            <a class="menu-link" href="{{route('embarques.index')}}">
                                <span class="menu-bullet">
                                    <span class="bullet bullet-dot"></span>
                                </span>
                                <span class="menu-title">Generar nuevo DV</span>
                            </a>
                        </div>
                        <div class="menu-item">
                            <a class="menu-link" href="{{route('new_dv_template')}}">
                                <span class="menu-bullet">
                                    <span class="bullet bullet-dot"></span>
                                </span>
                                <span class="menu-title">Generar nuevo DV - Plantilla</span>
                            </a>
                        </div>
                    @endcan
                    <div class="menu-item">
                        <a class="menu-link" href="{{route('embarques_admin')}}">
                            <span class="menu-bullet">
                                <span class="bullet bullet-dot"></span>
                            </span>
                            <span class="menu-title">Consultar DV's</span>
                        </a>
                    </div>
                </div>
            </div>
        @endcan
        @can(["ver_admin"])
            <div data-kt-menu-trigger="hover" data-kt-menu-placement="right-start"
                class="menu-item py-2">
                <span class="menu-link @yield('admin') menu-center" data-bs-trigger="hover" data-bs-dismiss="click"
                    data-bs-placement="right">
                    <span class="menu-icon me-0">
                        <i class="ki-outline ki-security-user fs-1"></i>
                    </span>
                    <span class="menu-title">Administración</span>
                </span>
                <div class="menu-sub menu-sub-dropdown w-225px px-1 py-4">
                    <div class="menu-item">
                        <div class="menu-content">
                            <span class="menu-section fs-5 fw-bolder ps-1 py-1">Administración</span>
                        </div>
                    </div>
                    @role('Super Admin')
                        <div class="menu-item">
                            <a class="menu-link" href="{{route('permissions.index')}}">
                                <span class="menu-bullet">
                                    <span class="bullet bullet-dot"></span>
                                </span>
                                <span class="menu-title">Permisos</span>
                            </a>
                        </div>
                    @endrole
                    <div class="menu-item">
                        <a class="menu-link" href="{{route('roles.index')}}">
                            <span class="menu-bullet">
                                <span class="bullet bullet-dot"></span>
                            </span>
                            <span class="menu-title">Roles</span>
                        </a>
                    </div>
                    <div class="menu-item">
                        <a class="menu-link" href="/catalogs/standards">
                            <span class="menu-bullet">
                                <span class="bullet bullet-dot"></span>
                            </span>
                            <span class="menu-title">Normas
                            </span>
                        </a>
                    </div>
                    <div class="menu-item">
                        <a class="menu-link" href="{{route('users.index')}}">
                            <span class="menu-bullet">
                                <span class="bullet bullet-dot"></span>
                            </span>
                            <span class="menu-title">Usuarios</span>
                        </a>
                    </div>
                    <div class="menu-item">
                        <a class="menu-link" href="{{route('vigencias.index')}}">
                            <span class="menu-bullet">
                                <span class="bullet bullet-dot"></span>
                            </span>
                            <span class="menu-title">Vigencias Tercería</span>
                        </a>
                    </div>
                </div>
            </div>
        @endcan
        @can(["ver_reportes"])
            <div data-kt-menu-trigger="hover" data-kt-menu-placement="right-start"
                class="menu-item py-2">
                <span class="menu-link menu-center" data-bs-trigger="hover" data-bs-dismiss="click"
                    data-bs-placement="right">
                    <span class="menu-icon me-0">
                        <i class="ki-outline ki-graph-up fs-1"></i>
                    </span>
                    <span class="menu-title">Reportes</span>
                </span>
                <div class="menu-sub menu-sub-dropdown w-225px px-1 py-4">
                    <div class="menu-item">
                        <div class="menu-content">
                            <span class="menu-section fs-5 fw-bolder ps-1 py-1">Reportes</span>
                        </div>
                    </div>
                    <div data-kt-menu-trigger="click" class="menu-item menu-accordion">
                        <span class="menu-link">
                            <span class="menu-bullet">
                                <span class="bullet bullet-dot"></span>
                            </span>
                            <span class="menu-title">Ventas</span>
                            <span class="menu-arrow"></span>
                        </span>
                        <div class="menu-sub menu-sub-accordion">
                            <div class="menu-item">
                                <a class="menu-link"
                                    href="../../demo6/dist/authentication/flows/basic/sign-in.html">
                                    <span class="menu-bullet">
                                        <span class="bullet bullet-dot"></span>
                                    </span>
                                    <span class="menu-title">Fechas</span>
                                </a>
                            </div>
                            <div class="menu-item">
                                <a class="menu-link"
                                    href="../../demo6/dist/authentication/flows/basic/sign-up.html">
                                    <span class="menu-bullet">
                                        <span class="bullet bullet-dot"></span>
                                    </span>
                                    <span class="menu-title">Sucursal</span>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div data-kt-menu-trigger="click" class="menu-item menu-accordion">
                        <span class="menu-link">
                            <span class="menu-bullet">
                                <span class="bullet bullet-dot"></span>
                            </span>
                            <span class="menu-title">Ventas</span>
                            <span class="menu-arrow"></span>
                        </span>
                        <div class="menu-sub menu-sub-accordion">
                            <div class="menu-item">
                                <a class="menu-link"
                                    href="../../demo6/dist/authentication/flows/basic/sign-in.html">
                                    <span class="menu-bullet">
                                        <span class="bullet bullet-dot"></span>
                                    </span>
                                    <span class="menu-title">Fechas</span>
                                </a>
                            </div>
                            <div class="menu-item">
                                <a class="menu-link"
                                    href="../../demo6/dist/authentication/flows/basic/sign-up.html">
                                    <span class="menu-bullet">
                                        <span class="bullet bullet-dot"></span>
                                    </span>
                                    <span class="menu-title">Sucursal</span>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div data-kt-menu-trigger="click" class="menu-item menu-accordion">
                        <span class="menu-link">
                            <span class="menu-bullet">
                                <span class="bullet bullet-dot"></span>
                            </span>
                            <span class="menu-title">Ventas</span>
                            <span class="menu-arrow"></span>
                        </span>
                        <div class="menu-sub menu-sub-accordion">
                            <div class="menu-item">
                                <a class="menu-link"
                                    href="../../demo6/dist/authentication/flows/basic/sign-in.html">
                                    <span class="menu-bullet">
                                        <span class="bullet bullet-dot"></span>
                                    </span>
                                    <span class="menu-title">Fechas</span>
                                </a>
                            </div>
                            <div class="menu-item">
                                <a class="menu-link"
                                    href="../../demo6/dist/authentication/flows/basic/sign-up.html">
                                    <span class="menu-bullet">
                                        <span class="bullet bullet-dot"></span>
                                    </span>
                                    <span class="menu-title">Sucursal</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        @endcan
    </div>
</div>
