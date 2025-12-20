@props([
    'name' => 'password',
    'label' => 'Password',
    'confirmLabel' => 'Repeat Password',
])

<div class="row g-2 password-wrapper">

    {{-- PASSWORD --}}
    <div class="col-md-6">
        <div class="input-group">
            <input
                type="password"
                name="{{ $name }}"
                class="form-control password-input {{ $errors->has($name) ? 'is-invalid' : '' }}"
                autocomplete="new-password"
            >
            <button type="button" class="btn btn-outline-secondary toggle-password">
                Show
            </button>
        </div>

        @error($name)
        <div class="invalid-feedback d-block">{{ $message }}</div>
        @enderror
    </div>

    <div class="col-md-6">
        <div class="input-group">
            <input
                type="password"
                name="{{ $name }}_confirmation"
                class="form-control password-confirm-input"
                autocomplete="new-password"
            >
            <button type="button" class="btn btn-outline-secondary toggle-password">
                Show
            </button>
        </div>

        <div class="invalid-feedback d-none password-match-error">
            Password tidak sama
        </div>
    </div>

</div>

@push('scripts')
    <script>
        document.addEventListener('click', function (e) {
            const btn = e.target.closest('.toggle-password');
            if (!btn) return;
            const input = btn.closest('.input-group').querySelector('input');
            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';
            btn.textContent = isPassword ? 'Hide' : 'Show';
        });
        document.addEventListener('input', function (e) {
            if (!e.target.matches('.password-input, .password-confirm-input')) return;
            const wrapper = e.target.closest('.password-wrapper');
            const pass = wrapper.querySelector('.password-input');
            const confirm = wrapper.querySelector('.password-confirm-input');
            const error = wrapper.querySelector('.password-match-error');
            if (confirm.value && pass.value !== confirm.value) {
                confirm.classList.add('is-invalid');
                error.classList.remove('d-none');
            } else {
                confirm.classList.remove('is-invalid');
                error.classList.add('d-none');
            }
        });
    </script>
@endpush
