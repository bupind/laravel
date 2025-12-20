<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8"/>
    <meta name="csrf-token" content="{{ csrf_token() }}"/>
    <title>@yield('title') | Laravel</title>

    <link rel="shortcut icon" href="{{ asset('favicon.ico') }}"/>
    <link href="https://fonts.googleapis.com/css?family=Inter:300,400,500,600,700" rel="stylesheet"/>
    @vite([
        'resources/css/app.css',
        'resources/js/app.js'
    ])
    @stack('styles')
    <script src="{{ asset('assets/plugins/global/plugins.bundle.js') }}"></script>
    <script src="{{ asset('assets/js/scripts.bundle.js') }}"></script>

    <script>
        if (window.top !== window.self) {
            window.top.location.replace(window.self.location.href);
        }
    </script>
</head>

<body id="kt_app_body"
      class="app-default"
      data-kt-app-layout="dark-sidebar"
      data-kt-app-header-fixed="true"
      data-kt-app-sidebar-enabled="true"
      data-kt-app-sidebar-fixed="true"
      data-kt-app-sidebar-hoverable="true"
      data-kt-app-sidebar-push-header="true"
      data-kt-app-sidebar-push-toolbar="true"
      data-kt-app-sidebar-push-footer="true"
      data-kt-app-toolbar-enabled="true"
>

@include('metronic.partials._init')

<div id="toast-container" class="position-fixed top-0 end-0 p-3" style="z-index:1080"></div>

<div class="d-flex flex-column flex-root app-root" id="kt_app_root">
    <div class="app-page flex-column flex-column-fluid" id="kt_app_page">

        <div id="kt_app_header" class="app-header" data-kt-sticky="true"
             data-kt-sticky-activate='{ "default": true, "lg": true }'
             data-kt-sticky-name="app-header-minimize"
             data-kt-sticky-offset='{ "default": "200px", "lg": "0" }'
             data-kt-sticky-animation="false">
            @include('metronic.layout._header')
        </div>

        <div class="app-wrapper flex-column flex-row-fluid" id="kt_app_wrapper">

            <div id="kt_app_sidebar" class="app-sidebar flex-column"
                 data-kt-drawer="true"
                 data-kt-drawer-name="app-sidebar"
                 data-kt-drawer-activate='{ "default": true, "lg": false }'
                 data-kt-drawer-overlay="true"
                 data-kt-drawer-width="225px"
                 data-kt-drawer-direction="start"
                 data-kt-drawer-toggle="#kt_app_sidebar_mobile_toggle">
                @include('metronic.layout._sidebar')
            </div>

            <div class="app-main flex-column flex-row-fluid" id="kt_app_main">
                <div class="d-flex flex-column flex-column-fluid">
                    <div id="spa-content">
                        @include("metronic/partials/_toolbar")
                        @yield('content')
                    </div>
                </div>

                <div id="kt_app_footer" class="app-footer">
                    @include('metronic.layout._footer')
                </div>
            </div>
        </div>
    </div>
</div>

@include('metronic.partials._scrolltop')
@stack('scripts')
</body>
</html>
