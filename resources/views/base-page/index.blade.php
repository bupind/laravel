@extends('metronic.index')
@section('title')
    {{ $title ?? '' }}
@endsection
@section('content')
    @include("metronic/partials/_toolbar")
    <div id="kt_app_content" class="app-content  flex-column-fluid pt-5">
        <div id="kt_app_content_container" class="app-container  container-fluid ">
            <div class="row">
                @isset($heads)
                    <x-datatable id="xtable" :heads="$heads" :datas="$datas" :route="$route" :config="$config" :moreActions="$moreActions"/>
                @endisset
            </div>
        </div>
    </div>
@stop
@push('scripts')
    <script src="{{asset('assets/plugins/custom/datatables/datatables.bundle.js')}}"></script>
    <script>
        function isDesktop() {
            return window.innerWidth >= 992;
        }

        let activeModal = null;

        function openMetronicModal(contentHtml, title = '', size = 'md') {
            const existingModal = document.getElementById('globalMetronicModal');
            if (existingModal) existingModal.remove();
            const modalSizeClass =
                size === 'sm' ? 'modal-sm' :
                    size === 'lg' ? 'modal-lg' :
                        size === 'xl' ? 'modal-xl' :
                            'modal-md';
            const modalHtml = `
        <div class="modal fade" id="globalMetronicModal" tabindex="-1">
            <div class="modal-dialog ${modalSizeClass} modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body"></div>
                </div>
            </div>
        </div>`;
            document.body.insertAdjacentHTML('beforeend', modalHtml);
            const modalEl = document.getElementById('globalMetronicModal');
            modalEl.querySelector('.modal-body').innerHTML = contentHtml;
            activeModal = new bootstrap.Modal(modalEl);
            activeModal.show();
        }

        document.addEventListener('click', function (e) {
            const link = e.target.closest('a.--modal');
            if (!link || !isDesktop()) return;
            e.preventDefault();
            const url = new URL(link.href);
            url.searchParams.set('useModal', '1');
            const modalSize = link.dataset.modalsize || 'md';
            const title = link.dataset.title || 'Form';
            fetch(url.toString(), {
                headers: {'X-Requested-With': 'XMLHttpRequest'}
            })
                .then(res => res.text())
                .then(html => openMetronicModal(html, title, modalSize))
                .catch(console.error);
        });
        document.addEventListener('submit', function (e) {
            const form = e.target.closest('#globalMetronicModal form');
            if (!form) return;
            e.preventDefault();
            fetch(form.action, {
                method: form.method.toUpperCase(),
                body: new FormData(form),
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json'
                }
            })
                .then(async res => {
                    if (res.status === 422) {
                        const data = await res.json();
                        renderModalErrors(form, data.errors);
                        return;
                    }
                    if (res.ok) {
                        activeModal.hide();
                        location.reload();
                    }
                })
                .catch(console.error);
        });

        function renderModalErrors(form, errors) {
            form.querySelectorAll('.is-invalid').forEach(el => {
                el.classList.remove('is-invalid');
            });
            form.querySelectorAll('.invalid-feedback').forEach(el => {
                el.remove();
            });
            Object.keys(errors).forEach(field => {
                const input = form.querySelector(`[name="${field}"]`);
                if (!input) return;
                input.classList.add('is-invalid');
                const feedback = document.createElement('div');
                feedback.className = 'invalid-feedback';
                feedback.innerText = errors[field][0];
                if (input.type === 'checkbox' || input.type === 'radio') {
                    input.closest('.form-check')?.appendChild(feedback);
                } else {
                    input.parentNode.appendChild(feedback);
                }
            });
            const firstError = form.querySelector('.is-invalid');
            firstError?.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }


    </script>

@endpush
@push('styles')
    <link href="{{asset('assets/plugins/custom/datatables/datatables.bundle.css')}}" rel="stylesheet" type="text/css"/>
@endpush
