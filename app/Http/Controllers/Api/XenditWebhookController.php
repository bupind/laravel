<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Payments\XenditClient;
use App\Services\Payments\PaymentNotificationService;
use App\Services\Payments\XenditTransactionStore;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class XenditWebhookController extends Controller
{
    public function __invoke(
        Request $request,
        XenditClient $xenditClient,
        PaymentNotificationService $paymentNotificationService,
        XenditTransactionStore $transactionStore,
    ): JsonResponse
    {
        $config = $xenditClient->webhookConfig();
        $expectedToken = trim((string)($config['webhook_token'] ?? ''));

        if($expectedToken === '') {
            return response()->json([
                'ok'      => false,
                'message' => 'Xendit webhook token belum dikonfigurasi.',
            ], 503);
        }

        $callbackToken = trim((string)$request->header('x-callback-token', ''));
        $tokenValid = $callbackToken !== '' && hash_equals($expectedToken, $callbackToken);

        try {
            $event = $transactionStore->recordWebhook($request, $tokenValid, $config);
        } catch(Throwable $exception) {
            return response()->json([
                'ok'      => false,
                'message' => $exception->getMessage(),
            ], 500);
        }

        if(!$tokenValid) {
            return response()->json([
                'ok'      => false,
                'message' => 'Invalid Xendit callback token.',
            ], 401);
        }

        if($event->processing_error) {
            return response()->json([
                'ok'      => false,
                'message' => $event->processing_error,
            ], 422);
        }

        if($event->wasRecentlyCreated && $event->paymentTransaction) {
            $paymentNotificationService->notifyTransactionStatus($event->paymentTransaction, (string)$event->status);
        }

        return response()->json([
            'ok'       => true,
            'message'  => 'Webhook processed.',
            'event_id' => $event->id,
        ]);
    }
}
