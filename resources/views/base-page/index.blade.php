@extends('metronic.index')
@section('title')
    {{ $title ?? '' }}
@endsection
@section('content')
    @include("metronic/partials/_toolbar")
    <div id="kt_app_content" class="app-content  flex-column-fluid ">
        <div id="kt_app_content_container" class="app-container  container-fluid ">
            <div class="row">
                @isset($heads)
                    <x-datatable id="xtable" :heads="$heads" :datas="$datas" :route="$route" :config="$config"/>
                @endisset
            </div>
        </div>
    </div>
@stop
@section('scripts')
    <script>

    </script>
@stop
