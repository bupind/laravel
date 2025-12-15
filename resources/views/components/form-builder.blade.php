<div class="row g-4">
    @foreach ($fields as $key => $field)
        @php
            if(is_string($key) && !isset($field['name'])) {
                $field['name'] = $key;
            }
            $type       = $field['type'] ?? 'text';
            $name       = $field['name'];
            $label      = $field['label'] ?? ucfirst($name);
            $col        = $field['col'] ?? 'col-12';
            $value      = old($name, $field['value'] ?? ($item->$name ?? ''));
            $attributes = $field['attributes'] ?? [];
            $attrHtml   = '';
            foreach($attributes as $attrName => $attrValue) {
                $attrHtml .= " $attrName=\"$attrValue\"";
            }
            $rows = $field['rows'] ?? 4;
            $options = $field['options'] ?? [];
        @endphp

        <div class="{{ $col }}">
            <label class="form-label">{{ $label }}</label>
            @if(in_array($type, ['text','email','password','number']))
                <input type="{{ $type }}" name="{{ $name }}" class="form-control" value="{{ $type === 'password' ? '' : $value }}" {!! $attrHtml !!}>
            @endif
            @if($type === 'textarea')
                <textarea name="{{ $name }}" class="form-control" rows="{{ $rows }}" {!! $attrHtml !!}>{{ $value }}</textarea>
            @endif
            @if($type === 'ckeditor')
                <script src="{{asset('assets/custom/ckeditor/ckeditor-classic.bundle.js')}}"></script>
                <script src="{{asset('assets/custom/ckeditor/ckeditor-inline.bundle.js')}}"></script>
                <script src="{{asset('assets/custom/ckeditor/ckeditor-balloon.bundle.js')}}"></script>
                <script src="{{asset('assets/custom/ckeditor/ckeditor-balloon-block.bundle.js')}}"></script>
                <script src="{{asset('assets/custom/ckeditor/ckeditor-document.bundle.js')}}"></script>
                <textarea name="{{ $name }}" id="kt_docs_ckeditor_classic">{{ $value }}</textarea>
            @endif
            @if($type === 'select')
                <select name="{{ $name }}" class="form-select" {!! $attrHtml !!}>
                    @if(isset($field['placeholder']))
                        <option value="">{{ $field['placeholder'] }}</option>
                    @endif
                    @foreach($options as $optValue => $optLabel)
                        <option value="{{ $optValue }}" @if($value == $optValue) selected @endif>{{ $optLabel }}</option>
                    @endforeach
                </select>
            @endif
            @if($type === 'file')
                <input type="file" name="{{ $name }}" class="form-control" {!! $attrHtml !!}>
            @endif
        </div>
    @endforeach
</div>
