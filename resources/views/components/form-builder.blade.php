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
                @case('checkbox')
                    @php
                        $checkedValues = collect($value ?? [])->map(fn($v) => (string) $v)->toArray();
                    @endphp
                    <div class="row">
                        @foreach(($field['options'] ?? []) as $val => $text)
                            <div class="col-md-3">
                                <div class="form-check form-check-custom form-check-solid">
                                    <input
                                        class="form-check-input"
                                        type="checkbox"
                                        name="{{ $name }}[]"
                                        value="{{ $val }}"
                                        {{ in_array((string)$val, $checkedValues, true) ? 'checked' : '' }}
                                    > <label class="form-check-label">
                                        {{ $text }}
                                    </label>
                                </div>
                            </div>
                        @endforeach
                    </div>
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
