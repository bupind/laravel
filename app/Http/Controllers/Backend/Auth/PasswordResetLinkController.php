<?php
/**
 * PasswordResetLinkController
 * @author  bupind
 * @created 2026-05-20
 */

namespace App\Http\Controllers\Backend\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetLinkController extends Controller
{
    public function create(Request $request): Response
    {
        return Inertia::render('backend/auth/forgot-password', [
            'status' => $request->session()->get('status'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => 'required|email',
        ]);
        Password::sendResetLink(
            $request->only('email')
        );
        return back()->with('status', __('A reset link will be sent if the account exists.'));
    }
}
