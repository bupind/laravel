<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;

class AiChatController extends Controller
{
    public function chat(Request $request): JsonResponse
    {
        // Rate limiting per IP
        $key    = 'ai-chat:' . $request->ip();
        $limit  = (int) config('ai_chat.rate_limit', 20);

        if (RateLimiter::tooManyAttempts($key, $limit)) {
            $seconds = RateLimiter::availableIn($key);
            return response()->json([
                'error' => "Terlalu banyak permintaan. Coba lagi dalam {$seconds} detik.",
            ], 429);
        }
        RateLimiter::hit($key, 60);

        // Validasi input
        $validated = $request->validate([
            'message'   => ['required', 'string', 'max:2000'],
            'history'   => ['nullable', 'array', 'max:50'],
            'history.*.role'    => ['required', 'in:user,assistant'],
            'history.*.content' => ['required', 'string', 'max:4000'],
        ]);

        $apiKey = config('ai_chat.api_key');
        if (empty($apiKey)) {
            return response()->json(['error' => 'AI Chat belum dikonfigurasi.'], 503);
        }

        // Build messages: ambil history + pesan baru
        $maxHistory = (int) config('ai_chat.max_history', 10);
        $history    = collect($validated['history'] ?? [])
            ->takeLast($maxHistory)
            ->values()
            ->toArray();

        $messages   = array_merge($history, [
            ['role' => 'user', 'content' => $validated['message']],
        ]);

        // Build system prompt dengan context data
        $systemPrompt = $this->buildSystemPrompt();

        try {
            $response = Http::withHeaders([
                'x-api-key'         => $apiKey,
                'anthropic-version' => '2023-06-01',
                'content-type'      => 'application/json',
            ])->timeout(30)->post('https://api.anthropic.com/v1/messages', [
                'model'      => config('ai_chat.model', 'claude-haiku-4-5-20251001'),
                'max_tokens' => (int) config('ai_chat.max_tokens', 1024),
                'system'     => $systemPrompt,
                'messages'   => $messages,
            ]);

            if ($response->failed()) {
                Log::error('AI Chat API error', [
                    'status' => $response->status(),
                    'body'   => $response->body(),
                ]);
                return response()->json(['error' => 'Gagal menghubungi AI. Coba lagi.'], 502);
            }

            $data    = $response->json();
            $content = $data['content'][0]['text'] ?? '';

            return response()->json(['reply' => $content]);

        } catch (\Throwable $e) {
            Log::error('AI Chat exception', ['message' => $e->getMessage()]);
            return response()->json(['error' => 'Terjadi kesalahan. Coba lagi.'], 500);
        }
    }

    private function buildSystemPrompt(): string
    {
        $appName     = config('app.name', 'Kami');
        $contextData = $this->buildContextData();
        $template    = config('ai_chat.system_prompt', '');

        return str_replace(
            ['{app_name}', '{context_data}'],
            [$appName, $contextData],
            $template
        );
    }

    private function buildContextData(): string
    {
        $sources = config('ai_chat.data_sources', []);
        $parts   = [];

        foreach ($sources as $key => $config) {
            if (empty($config['enabled'])) {
                continue;
            }

            $modelClass = $config['model'] ?? null;
            if (! $modelClass || ! class_exists($modelClass)) {
                continue;
            }

            try {
                $query  = $modelClass::query();
                $fields = $config['fields'] ?? ['*'];
                $limit  = (int) ($config['limit'] ?? 50);
                $scope  = $config['scope'] ?? null;

                if ($fields !== ['*']) {
                    $query->select($fields);
                }

                if ($scope && method_exists($modelClass, 'scope' . ucfirst($scope))) {
                    $query->$scope();
                }

                $records = $query->limit($limit)->get();

                if ($records->isEmpty()) {
                    continue;
                }

                $label    = $config['label'] ?? ucfirst($key);
                $rows     = $records->map(function ($record) use ($fields) {
                    $data = [];
                    foreach ($fields as $field) {
                        $val = $record->$field ?? null;
                        if ($val === null || $val === '') continue;
                        // Handle JSON / array (translatable)
                        if (is_array($val)) {
                            $val = implode(' / ', array_filter($val));
                        }
                        $data[] = "{$field}: {$val}";
                    }
                    return implode(', ', $data);
                })->filter()->implode("\n");

                if ($rows) {
                    $parts[] = "=== {$label} ===\n{$rows}";
                }

            } catch (\Throwable $e) {
                Log::warning("AI Chat: gagal load data source [{$key}]", [
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return $parts ? implode("\n\n", $parts) : 'Tidak ada data tersedia saat ini.';
    }
}
