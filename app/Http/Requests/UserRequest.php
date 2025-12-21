<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'name'      => 'required|string',
            'roles'     => [
                'required',
                'array'
            ],
            'roles.*'   => [
                'required',
                Rule::exists('roles', 'id')
            ],
            'email'     => [
                'required',
                'email',
                Rule::unique('users', 'email')->ignore(request()->id)
            ],
            'phone_number'     => [
                'required',
                Rule::unique('users', 'phone_number')->ignore(request()->id)
            ]
        ];
        if(request()->isMethod('post')) {
            $rules['password'] = [
                'required',
                Password::min(8)
            ];
        }
        if(request()->isMethod('patch') || request()->isMethod('put')) {
            $rules['id']       = 'required';
            $rules['password'] = [
                'nullable',
                Password::min(8)
            ];
        }
        return $rules;
    }
}
