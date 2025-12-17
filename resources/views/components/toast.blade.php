<div class="toast align-items-center text-bg-{{ $type }} border-0" role="alert" aria-live="assertive" aria-atomic="true">
    <div class="toast-header">
        @if($img)
            <img src="{{ $img }}" class="rounded me-2" alt="...">
        @endif
        <strong class="me-auto">{{ $title }}</strong>
        <small class="text-muted">{{ $time }}</small>
        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
    <div class="toast-body">
        {{ $message }}
    </div>
</div>
