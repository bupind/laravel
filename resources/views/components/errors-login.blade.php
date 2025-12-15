@props(['errors'])

@if ($errors->any())
    <div class="alert alert-danger d-flex align-items-center p-5 mb-10">
       <i class="ki-outline ki-shield-slash fs-2qx mx-4 text-danger"></i>
        <div class="d-flex flex-column">
            <h4 class="mb-1 text-danger">Ocurrio un error!</h4>
            @foreach ($errors->all() as $error)
                <span>{{ $error}}</span>
            @endforeach
        </div>
    </div>
@endif
