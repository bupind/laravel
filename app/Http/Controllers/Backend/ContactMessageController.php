<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use App\Services\Communication\EmailService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ContactMessageController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorizePermission('contact-messages-view');
        $search = trim((string)$request->string('search'));
        $status = trim((string)$request->string('status'));
        $messages = ContactMessage::query()
            ->when($search !== '', function(Builder $query) use ($search): void {
                $query->where(function(Builder $builder) use ($search): void {
                    $builder
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('subject', 'like', "%{$search}%")
                        ->orWhere('message', 'like', "%{$search}%");
                });
            })
            ->when($status !== '', fn(Builder $query) => $query->where('status', $status))
            ->latest()
            ->paginate($request->integer('per_page', 10))
            ->withQueryString()
            ->through(fn(ContactMessage $message): array => [
                'id'            => $message->id,
                'name'          => $message->name,
                'email'         => $message->email,
                'phone'         => $message->phone,
                'subject'       => $message->subject,
                'message'       => $message->message,
                'status'        => $message->status,
                'read_at'       => $message->read_at?->toISOString(),
                'replied_at'    => $message->replied_at?->toISOString(),
                'reply_subject' => $message->reply_subject,
                'reply_message' => $message->reply_message,
                'created_at'    => $message->created_at?->diffForHumans(),
            ]);
        return Inertia::render('backend/contact-messages/index', [
            'messages' => $messages,
            'filters'  => [
                'search'   => $search,
                'status'   => $status,
                'per_page' => $request->integer('per_page', 10),
            ],
            'stats'    => [
                'new'     => ContactMessage::where('status', ContactMessage::STATUS_NEW)->count(),
                'read'    => ContactMessage::where('status', ContactMessage::STATUS_READ)->count(),
                'replied' => ContactMessage::where('status', ContactMessage::STATUS_REPLIED)->count(),
                'total'   => ContactMessage::count(),
            ],
            'can'      => [
                'reply'  => $request->user()?->can('contact-messages-reply') ?? false,
                'delete' => $request->user()?->can('contact-messages-delete') ?? false,
            ],
        ]);
    }

    private function authorizePermission(string $permission): void
    {
        abort_unless(request()->user()?->can($permission), 403);
    }

    public function show(ContactMessage $contactMessage): Response
    {
        $this->authorizePermission('contact-messages-view');
        $contactMessage->markAsRead();
        return Inertia::render('backend/contact-messages/show', [
            'message' => [
                'id'            => $contactMessage->id,
                'name'          => $contactMessage->name,
                'email'         => $contactMessage->email,
                'phone'         => $contactMessage->phone,
                'subject'       => $contactMessage->subject,
                'message'       => $contactMessage->message,
                'status'        => $contactMessage->status,
                'read_at'       => $contactMessage->read_at?->toDayDateTimeString(),
                'replied_at'    => $contactMessage->replied_at?->toDayDateTimeString(),
                'reply_subject' => $contactMessage->reply_subject,
                'reply_message' => $contactMessage->reply_message,
                'created_at'    => $contactMessage->created_at?->toDayDateTimeString(),
            ],
            'can'     => [
                'reply'  => request()->user()?->can('contact-messages-reply') ?? false,
                'delete' => request()->user()?->can('contact-messages-delete') ?? false,
            ],
        ]);
    }

    public function reply(Request $request, ContactMessage $contactMessage, EmailService $emailService): RedirectResponse
    {
        $this->authorizePermission('contact-messages-reply');
        $validated = $request->validate([
            'subject' => [
                'required',
                'string',
                'max:180'
            ],
            'message' => [
                'required',
                'string',
                'min:3',
                'max:5000'
            ],
        ]);
        $emailService->queueNotification(
            to     : $contactMessage->email,
            subject: $validated['subject'],
            message: $validated['message'],
            meta   : [
                'contact_message_id' => $contactMessage->id,
                'reply_to'           => $contactMessage->email,
            ],
        );
        $contactMessage->forceFill([
            'status'        => ContactMessage::STATUS_REPLIED,
            'read_at'       => $contactMessage->read_at ?? now(),
            'replied_at'    => now(),
            'replied_by'    => $request->user()?->id,
            'reply_subject' => $validated['subject'],
            'reply_message' => $validated['message'],
        ])->save();
        return back()->with('success', 'Balasan berhasil masuk antrian email.');
    }

    public function destroy(ContactMessage $contactMessage): RedirectResponse
    {
        $this->authorizePermission('contact-messages-delete');
        $contactMessage->delete();
        return redirect()->route('contact-messages.index')->with('success', 'Pesan berhasil dihapus.');
    }
}
