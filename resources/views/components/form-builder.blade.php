<div class="row g-2">
    @foreach ($fields as $key => $field)
        @php
            $name  = $field['name'] ?? $key;
            $type  = $field['type'] ?? 'text';
            $label = $field['label'] ?? ucfirst($name);
            $col   = $field['col'] ?? 'col-12';
            $value = $field['value'] ?? ($item->$name ?? null);
        @endphp

        <div class="{{ $col }}">
            <x-label :value="$label"/>
            @switch($type)
                {{--                @case('textarea')--}}
                {{--                    <x-textarea--}}
                {{--                        :name="$name"--}}
                {{--                        :value="$value"--}}
                {{--                        :rows="$field['rows'] ?? 4"--}}
                {{--                        {{ $attributes ?? '' }}--}}
                {{--                    />--}}
                {{--                    @break--}}
                @case('select')
                    <x-select :name="$name" :options="$field['options'] ?? []" :value="$value" :placeholder="$field['placeholder'] ?? null"/>
                    @break
                @case('file')
                    <x-input type="file" :name="$name"/>
                    @break
                @default
                    <x-input
                        :type="$type"
                        :name="$name"
                        :value="$value"
                    />
            @endswitch
        </div>
    @endforeach
</div>
