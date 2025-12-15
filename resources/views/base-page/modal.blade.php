<form method="POST" action="{{ route($route . '.store') }}" enctype="multipart/form-data">
    @csrf
    @if($isForm)
        @if (isset($route) && view()->exists($route . '.form'))
            @include($route . '.form')
        @else
            @include('base-page.form')
        @endif
    @else
        @if (isset($route) && view()->exists($route . '.show'))
            @include($route . '.show')
        @else
            @include('base-page.show')
        @endif
    @endif
</form>
