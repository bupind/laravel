<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ContactController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'    => [
                'required',
                'string',
                'max:120'
            ],
            'email'   => [
                'required',
                'email:rfc,dns',
                'max:180'
            ],
            'phone'   => [
                'nullable',
                'string',
                'max:40'
            ],
            'subject' => [
                'required',
                'string',
                'max:180'
            ],
            'message' => [
                'required',
                'string',
                'min:10',
                'max:5000'
            ],
            'website' => [
                'nullable',
                'max:0'
            ],
            // honeypot
        ]);
        unset($validated['website']);
        ContactMessage::create([
            ...$validated,
            'status' => ContactMessage::STATUS_NEW,
            'meta'   => [
                'ip'         => $request->ip(),
                'user_agent' => substr((string)$request->userAgent(), 0, 500),
                'source'     => 'frontend_contact_form',
            ],
        ]);
        return back()->with('success', 'Pesan berhasil dikirim. Kami akan membalas melalui email Anda.');
    }

    public function create(): Response
    {
        return Inertia::render('frontend/contact');
    }
}
