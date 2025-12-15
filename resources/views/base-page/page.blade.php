@extends('metronic.index')
@section('title')
    {{ __($title ?? '') }}
@endsection

@section('content')
    <div class="card shadow-sm">
        <div class="card-body">
            @if($isForm)
                <form method="POST" action="{{ route($route . '.store') }}" enctype="multipart/form-data">
                    @csrf
                    @if (isset($route) && view()->exists($route . '.form'))
                        @include($route . '.form')
                    @else
                        @include('base-page.form')
                    @endif
                    <div class="card-footer d-flex justify-content-between">
                        <a href="{{ route($route . '.index') }}" class="btn btn-light border">
                            <i class="fas fa-times me-1"></i> Back </a>
                        <div class="btn-group btn-group-xs" role="group">
                            <button type="reset" class="btn btn-danger">
                                <i class="fas fa-save me-1"></i> Reset
                            </button>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save me-1"></i> Submit
                            </button>
                        </div>
                    </div>
                </form>
            @else
                @if (isset($route) && view()->exists($route . '.show'))
                    @include($route . '.show')
                @else
                    @include('base-page.show')
                @endif
            @endif
        </div>
    </div>
@endsection
