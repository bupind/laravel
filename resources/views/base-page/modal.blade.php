@if($isForm)
    @php
        $isEdit = isset($item) && $item->id;
        $formAction = $isEdit ? route($route . '.update', $item->id) : route($route . '.store');
        $formMethod = $isEdit ? 'PUT' : 'POST';
    @endphp
    {{ html()->form($formMethod, $formAction)->attribute('enctype', 'multipart/form-data')->attribute('data-modal-form', '1')->open() }}
    @csrf
    @if($isEdit)
        <input type="hidden" name="id" value="{{ $item->id }}">
    @endif
    @if (isset($route) && view()->exists($route . '.form'))
        @include($route . '.form')
    @else
        @include('base-page.form')
    @endif
    <div class="modal-footer d-flex justify-content-between p-0">
        <button type="button" class="btn btn-sm btn-light border" data-bs-dismiss="modal">
            <i class="ki-outline ki-arrow-back me-1"></i> Close
        </button>
        <div class="btn-group">
            <button type="reset" class="btn btn-sm btn-danger">
                <i class="ki-outline ki-refresh me-1"></i> Reset
            </button>
            <button type="submit" class="btn btn-sm btn-primary">
                <i class="ki-outline ki-check-square me-1"></i> Submit
            </button>
        </div>
    </div>

    {{ html()->form()->close() }}
@else
    @if (isset($route) && view()->exists($route . '.show'))
        @include($route . '.show')
    @else
        @include('base-page.show')
    @endif
@endif
