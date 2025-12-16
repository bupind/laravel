@extends('metronic.index')
@section('title')
    {{ __($title ?? '') }}
@endsection

@section('content')
    <div class="card shadow-sm">
        <div class="card-body">
            @if($isForm)
                @php
                    $isEdit = isset($item) && $item->id;
                    $formAction = $isEdit ? route($route . '.update', $item->id) : route($route . '.store');
                    $formMethod = $isEdit ? 'PUT' : 'POST';
                @endphp
                {{ html()->form($formMethod, $formAction)->attribute('enctype', 'multipart/form-data')->open() }}
                @csrf
                @if($isEdit)
                    <input type="hidden" name="id" value="{{ $item->id }}">
                @endif
                @if (isset($route) && view()->exists($route . '.form'))
                    @include($route . '.form')
                @else
                    @include('base-page.form')
                @endif
                <div class="card-footer d-flex justify-content-between px-0">
                    <a href="{{ route($route . '.index') }}" class="btn btn-sm btn-light border">
                        <i class="ki-outline ki-arrow-back me-1"></i> Back </a>
                    <div class="btn-group btn-group-sm" role="group">
                        <button type="reset" class="btn btn-danger btn-sm">
                            <i class="ki-outline ki-refresh me-1"></i> Reset
                        </button>
                        <button type="submit" class="btn btn-primary btn-sm">
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
        </div>
    </div>
@endsection
