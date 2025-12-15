<div class="app-sidebar-logo px-6" id="kt_app_sidebar_logo">
    <a href="index.html">
        <img alt="Logo" src="{{asset("img/default-dark.svg")}}" class="h-25px app-sidebar-logo-default"/>
        <img alt="Logo" src="{{asset("img/default-dark.svg")}}" class="h-20px app-sidebar-logo-minimize"/>
    </a>
    <div id="kt_app_sidebar_toggle" class="app-sidebar-toggle btn btn-icon btn-shadow btn-sm btn-color-muted btn-active-color-primary h-30px w-30px position-absolute top-50 start-100 translate-middle rotate" data-kt-toggle="true" data-kt-toggle-state="active" data-kt-toggle-target="body" data-kt-toggle-name="app-sidebar-minimize">
        <i class="ki-outline ki-abstract-14 fs-1"></i>
    </div>
</div>

<div class="app-sidebar-menu overflow-hidden flex-column-fluid">
    <div id="kt_app_sidebar_menu_wrapper" class="app-sidebar-wrapper">
        <div id="kt_app_sidebar_menu_scroll" class="scroll-y my-5 mx-3" data-kt-scroll="true" data-kt-scroll-activate="true" data-kt-scroll-height="auto" data-kt-scroll-dependencies="#kt_app_sidebar_logo, #kt_app_sidebar_footer" data-kt-scroll-wrappers="#kt_app_sidebar_menu" data-kt-scroll-offset="5px" data-kt-scroll-save-state="true">
            <div class="menu menu-column menu-rounded menu-sub-indention fw-semibold fs-6" id="#kt_app_sidebar_menu" data-kt-menu="true" data-kt-menu-expand="false">
                @can(["users"])
                    <div data-kt-menu-trigger="hover" data-kt-menu-placement="right-start"
                         class="menu-item py-2">
                        <span class="menu-link @yield('users') menu-center" data-bs-trigger="hover" data-bs-dismiss="click"
                              data-bs-placement="right">
                            <span class="menu-icon me-0">
                                <i class="ki-outline ki-security-user fs-1"></i>
                            </span>
                            <span class="menu-title">Administrator</span>
                        </span>
                        <div class="menu-sub menu-sub-dropdown w-225px px-1 py-4">
                            <div class="menu-item">
                                <div class="menu-content">
                                    <span class="menu-section fs-5 fw-bolder ps-1 py-1">Administración</span>
                                </div>
                            </div>
                            @role('superuser')
                            <div class="menu-item">
                                <a class="menu-link" href="{{route('permissions.index')}}">
                                <span class="menu-bullet">
                                    <span class="bullet bullet-dot"></span>
                                </span> <span class="menu-title">Permisos</span> </a>
                            </div>
                            @endrole
                            <div class="menu-item">
                                <a class="menu-link" href="{{route('roles.index')}}">
                            <span class="menu-bullet">
                                <span class="bullet bullet-dot"></span>
                            </span> <span class="menu-title">Roles</span> </a>
                            </div>
                            <div class="menu-item">
                                <a class="menu-link" href="{{route('users.index')}}">
                                    <span class="menu-bullet"><span class="bullet bullet-dot"></span></span>
                                    <span class="menu-title">Users</span>
                                </a>
                            </div>
                        </div>
                    </div>
                @endcan

                <div class="menu-item pt-5">
                    <!--begin:Menu content-->
                    <div class="menu-content">
                        <span class="menu-heading fw-bold text-uppercase fs-7">Layouts</span>
                    </div>
                    <!--end:Menu content-->
                </div>
                <div data-kt-menu-trigger="click" class="menu-item menu-accordion">
                    <!--begin:Menu link-->
                    <span class="menu-link">
												<span class="menu-icon">
													<i class="ki-duotone ki-element-7 fs-2">
														<span class="path1"></span>
														<span class="path2"></span>
													</i>
												</span>
												<span class="menu-title">Layout Options</span>
												<span class="menu-arrow"></span>
											</span>
                    <!--end:Menu link-->
                    <!--begin:Menu sub-->
                    <div class="menu-sub menu-sub-accordion">
                        <!--begin:Menu item-->
                        <div class="menu-item">
                            <!--begin:Menu link-->
                            <a class="menu-link" href="layouts/light-sidebar.html">
														<span class="menu-bullet">
															<span class="bullet bullet-dot"></span>
														</span> <span class="menu-title">Light Sidebar</span> </a>
                            <!--end:Menu link-->
                        </div>
                        <!--end:Menu item-->
                        <!--begin:Menu item-->
                        <div class="menu-item">
                            <!--begin:Menu link-->
                            <a class="menu-link" href="layouts/dark-sidebar.html">
														<span class="menu-bullet">
															<span class="bullet bullet-dot"></span>
														</span> <span class="menu-title">Dark Sidebar</span> </a>
                            <!--end:Menu link-->
                        </div>
                        <!--end:Menu item-->
                        <!--begin:Menu item-->
                        <div class="menu-item">
                            <!--begin:Menu link-->
                            <a class="menu-link" href="layouts/light-header.html">
														<span class="menu-bullet">
															<span class="bullet bullet-dot"></span>
														</span> <span class="menu-title">Light Header</span> </a>
                            <!--end:Menu link-->
                        </div>
                        <!--end:Menu item-->
                        <!--begin:Menu item-->
                        <div class="menu-item">
                            <!--begin:Menu link-->
                            <a class="menu-link" href="layouts/dark-header.html">
														<span class="menu-bullet">
															<span class="bullet bullet-dot"></span>
														</span> <span class="menu-title">Dark Header</span> </a>
                            <!--end:Menu link-->
                        </div>
                        <!--end:Menu item-->
                    </div>
                    <!--end:Menu sub-->
                </div>
                <div class="menu-item">
                    <a class="menu-link" href="https://preview.keenthemes.com/metronic8/demo1/layout-builder.html">
                        <span class="menu-icon"><i class="ki-duotone ki-abstract-13 fs-2"><span class="path1"></span><span class="path2"></span></i></span>
                        <span class="menu-title">Layout Builder</span>
                    </a>
                </div>
                <!--end:Menu item-->

            </div>
            <!--end::Menu-->
        </div>
    </div>
</div>
<div class="app-sidebar-footer flex-column-auto pt-2 pb-6 px-6" id="kt_app_sidebar_footer">
    <a href="https://preview.keenthemes.com/html/metronic/docs" class="btn btn-flex flex-center btn-custom btn-primary overflow-hidden text-nowrap px-0 h-40px w-100" data-bs-toggle="tooltip" data-bs-trigger="hover" data-bs-dismiss-="click" title="200+ in-house components and 3rd-party plugins">
        <span class="btn-label">Docs & Components</span>
        <i class="ki-duotone ki-document btn-icon fs-2 m-0"><span class="path1"></span> <span class="path2"></span></i>
    </a>
</div>
