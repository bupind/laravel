@extends('metronic.index')
@section('title')
    {{ $title ?? '' }}
@endsection
@section('content')
    <div id="kt_app_content" class="app-content  flex-column-fluid pt-5">
        <div id="kt_app_content_container" class="app-container container-fluid ">
            <div class="row">
                @isset($table)
                    <x-datatable id="xtable" :permissions="$permissions" :table="$table" :route="$route"/>
                @endisset
            </div>
        </div>
    </div>
@stop
@push('scripts')
@endpush
@push('styles')
@endpush
