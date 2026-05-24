<?php
/**
 * NotificationController
 * @author  bupind
 * @created 2026-05-22
 */

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function index(Request $request): Response
    {
        $notifications = $request->user()
            ->notifications()
            ->latest()
            ->paginate(15)
            ->through(fn($notification): array => $this->notificationPayload($notification));
        return Inertia::render('backend/notifications/Index', [
            'notifications' => $notifications,
        ]);
    }

    private function notificationPayload($notification): array
    {
        return [
            'id'         => $notification->id,
            'type'       => $notification->type,
            'data'       => $this->notificationData($notification->data),
            'read_at'    => $notification->read_at?->toISOString(),
            'created_at' => $notification->created_at?->toISOString(),
        ];
    }

    private function notificationData(mixed $data): array
    {
        if(is_array($data)) {
            return $data;
        }
        if(is_string($data)) {
            $decoded = json_decode($data, true);
            if(is_array($decoded)) {
                return $decoded;
            }
        }
        return [];
    }

    public function show(Request $request, string $id): Response
    {
        $notification = $this->resolveUserNotification($request, $id);
        if($notification->read_at === null) {
            $notification->markAsRead();
        }
        return Inertia::render('backend/notifications/Show', [
            'notification' => $this->notificationPayload($notification->refresh()),
        ]);
    }

    private function resolveUserNotification(Request $request, string $id): DatabaseNotification
    {
        $user = $request->user();
        abort_unless($user !== null, 403);
        return $user->notifications()
            ->whereKey($id)
            ->firstOrFail();
    }

    public function read(Request $request, string $id): RedirectResponse
    {
        $this->resolveUserNotification($request, $id)->markAsRead();
        return back();
    }
}
