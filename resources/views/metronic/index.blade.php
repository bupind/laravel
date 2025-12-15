<!DOCTYPE html>
<html lang="es">
<head>
    <base href=""/>
    <title>@yield('title') | Laravel</title>
    <meta charset="utf-8"/>
    <meta name="csrf-token" content="{{ csrf_token() }}"/>
    <link rel="shortcut icon" href="{{asset('favicon.ico')}}"/>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Inter:300,400,500,600,700"/>
    <link href="{{asset('assets/css/plugins.bundle.css')}}" rel="stylesheet" type="text/css"/>
    <link href="{{asset('assets/css/style.bundle.css')}}" rel="stylesheet" type="text/css"/>
    <link href="{{asset('assets/css/icons/style.css')}}" rel="stylesheet" type="text/css"/>
    <link href="{{asset('assets/css/loader.css')}}" rel="stylesheet" type="text/css"/>
    @yield('styles')
    <script>
        if (window.top != window.self) {
            window.top.location.replace(window.self.location.href);
        }
    </script>
</head>
<body id="kt_app_body" data-kt-app-layout="dark-sidebar" data-kt-app-header-fixed="true" data-kt-app-sidebar-enabled="true" data-kt-app-sidebar-fixed="true" data-kt-app-sidebar-hoverable="true" data-kt-app-sidebar-push-header="true" data-kt-app-sidebar-push-toolbar="true" data-kt-app-sidebar-push-footer="true" data-kt-app-toolbar-enabled="true" class="app-default">
@include("metronic/partials/theme-mode/_init")

<div class="d-flex flex-column flex-root app-root" id="kt_app_root">
    <div class="app-page flex-column flex-column-fluid" id="kt_app_page">
        <div id="kt_app_header" class="app-header" data-kt-sticky="true" data-kt-sticky-activate="{default: true, lg: true}" data-kt-sticky-name="app-header-minimize" data-kt-sticky-offset="{default: '200px', lg: '0'}" data-kt-sticky-animation="false">
            @include("metronic/layout/_header")
        </div>
        <div class="app-wrapper flex-column flex-row-fluid" id="kt_app_wrapper">
            <div id="kt_app_sidebar" class="app-sidebar flex-column" data-kt-drawer="true" data-kt-drawer-name="app-sidebar" data-kt-drawer-activate="{default: true, lg: false}" data-kt-drawer-overlay="true" data-kt-drawer-width="225px" data-kt-drawer-direction="start" data-kt-drawer-toggle="#kt_app_sidebar_mobile_toggle">
                @include("metronic/layout/_sidebar")
            </div>
            <div class="app-main flex-column flex-row-fluid" id="kt_app_main">
                <div class="d-flex flex-column flex-column-fluid">
                    @yield('content_header')
                    @yield('content')
                </div>
                <div id="kt_app_footer" class="app-footer">
                    @include("metronic/layout/_footer")
                </div>
            </div>
        </div>

    </div>
</div>

@include("metronic/partials/_scrolltop")
<script src="{{asset('assets/js/global/plugins.bundle.js')}}"></script>
<script src="{{asset('assets/js/scripts.bundle.js')}}"></script>
<script>

    function isDesktop() {
        return window.innerWidth >= 992;
    }

    function openMetronicModal(contentHtml, title = '', size = 'md') {
        const existingModal = document.getElementById('globalMetronicModal');
        if (existingModal) existingModal.remove();
        const modalSizeClass = size === 'sm' ? 'modal-sm' : size === 'lg' ? 'modal-lg' : size === 'xl' ? 'modal-xl' : 'modal-md';
        const modalHtml = `
    <div class="modal fade" id="globalMetronicModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog ${modalSizeClass} modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">${title}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body"></div>
        </div>
      </div>
    </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        const modalBody = document.querySelector('#globalMetronicModal .modal-body');
        modalBody.innerHTML = contentHtml;
        const bsModal = new bootstrap.Modal(document.getElementById('globalMetronicModal'));
        bsModal.show();
    }

    document.addEventListener('click', function (e) {
        const link = e.target.closest('a.--modal');
        if (!link) return;
        if (!isDesktop()) return;
        e.preventDefault();
        const url = new URL(link.href);
        const modalSize = link.dataset.modalsize || 'md';
        url.searchParams.set('useModal', '1');
        const title = link.dataset.title || 'Modal';
        fetch(url.toString(), {headers: {'X-Requested-With': 'XMLHttpRequest'}})
            .then(res => res.text())
            .then(html => openMetronicModal(html, title, modalSize))
            .catch(err => console.error('Error loading modal content:', err));
    });

</script>
@stack('scripts')
</body>
</html>
