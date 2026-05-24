<?php
/**
 * SettingAppController
 * @author  bupind
 * @created 2026-05-21
 */

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use App\Models\SettingApp;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Throwable;

class SettingAppController extends Controller
{
    public function edit()
    {
        $serviceFeatures = $this->serviceFeatures();
        $serviceKeys     = array_keys($serviceFeatures);
        $settings        = collect(SettingApp::formRows())
            ->reject(fn(array $row) => in_array($row['key'], $serviceKeys, true)
                                       && !($serviceFeatures[$row['key']]['enabled'] ?? false))
            ->values()
            ->all();
        return Inertia::render('backend/settingapp/Form', [
            'settings'        => $settings,
            'serviceFeatures' => $serviceFeatures,
        ]);
    }

    private function serviceFeatures(): array
    {
        return [
            'whatsapp'        => [
                'enabled' => $this->isServiceEnabled('whatsapp'),
                'label'   => 'WhatsApp',
            ],
            'email'           => [
                'enabled' => $this->isServiceEnabled('email'),
                'label'   => 'Email',
            ],
            'payment_gateway' => [
                'enabled' => $this->isServiceEnabled('payment_gateway'),
                'label'   => 'Payment Gateway',
            ],
        ];
    }

    private function isServiceEnabled(string $service): bool
    {
        return filter_var(config("services.{$service}.enabled", false), FILTER_VALIDATE_BOOL);
    }

    public function update(Request $request)
    {
        $request->validate([
            'settings'         => 'required|array',
            'settings.*.key'   => 'required|string|max:100|regex:/^[A-Za-z0-9_.-]+$/',
            'settings.*.value' => 'nullable|string',
            'files'            => 'nullable|array',
            'files.logo'       => 'nullable|file|image|mimes:jpg,jpeg,png,webp,svg|max:2048',
            'files.favicon'    => 'nullable|file|image|mimes:jpg,jpeg,png,webp,ico|max:1024',
        ]);
        $existingSettings = SettingApp::settings();
        $rows             = collect($request->input('settings', []))
            ->map(fn(array $row) => [
                'key'   => trim((string)($row['key'] ?? '')),
                'value' => (string)($row['value'] ?? ''),
            ])
            ->filter(fn(array $row) => $row['key'] !== '')
            ->unique('key')
            ->values();
        foreach([
                    'logo',
                    'favicon'
                ] as $fileKey) {
            $file = $request->file("files.{$fileKey}");
            if($file instanceof UploadedFile && $file->isValid()) {
                if(($existingSettings[$fileKey] ?? null) && Storage::disk('public')
                        ->exists($existingSettings[$fileKey])) {
                    Storage::disk('public')->delete($existingSettings[$fileKey]);
                }
                $uploadedPath = $this->uploadFile($file, $fileKey);
                $rows         = $rows
                    ->reject(fn(array $row) => $row['key'] === $fileKey)
                    ->push([
                        'key'   => $fileKey,
                        'value' => $uploadedPath
                    ])
                    ->values();
            }
        }
        $existingKeys  = SettingApp::rows()->pluck('key')->all();
        $submittedKeys = $rows->pluck('key')->all();
        $deletableKeys = array_values(array_diff($existingKeys, SettingApp::RESERVED_KEYS));
        SettingApp::deleteKeys(array_values(array_diff($deletableKeys, $submittedKeys)));
        SettingApp::setMany($rows->pluck('value', 'key')->all());
        Cache::forget('setting_app');
        return redirect()->back()->with('success', 'Pengaturan berhasil disimpan.');
    }

    private function uploadFile(UploadedFile $file, string $folder): string
    {
        $extension = $file->getClientOriginalExtension() ?: $file->guessExtension();
        $filename  = Str::uuid() . '.' . $extension;
        $destDir   = storage_path('app/public/' . $folder);
        if(!is_dir($destDir)) {
            mkdir($destDir, 0755, true);
        }
        $file->move($destDir, $filename);
        return $folder . '/' . $filename;
    }

    public function whatsappQr(Request $request)
    {
        if(!$this->isServiceEnabled('whatsapp')) {
            return response()->json(['message' => 'WhatsApp service tidak aktif.'], 404);
        }
        $config   = $this->resolveWhatsappConfig($request);
        $provider = (string)($config['provider'] ?? 'wwebjs');
        $endpoint = $provider === 'wwebjs'
            ? $this->resolveWwebjsEndpoint($config, 'qr')
            : (string)($config['qr_endpoint'] ?? '');
        if($endpoint === '') {
            return response()->json([
                'message' => $provider === 'wwebjs'
                    ? 'Endpoint WhatsApp belum diisi. Isi dengan server lokal wwebjs, contoh: http://localhost:3001/api/send. Jangan isi https://wwebjs.dev karena itu hanya situs dokumentasi.'
                    : 'QR endpoint WhatsApp belum diisi.',
            ], 422);
        }
        if($provider === 'wwebjs' && str_contains(strtolower($endpoint), 'wwebjs.dev')) {
            return response()->json([
                'message' => 'https://wwebjs.dev adalah situs dokumentasi, bukan server API. Jalankan node whatsapp-server.cjs lalu pakai endpoint http://localhost:3001/api/send.',
            ], 422);
        }
        try {
            $response = $this->whatsappHttp($config)->get($endpoint);
            return response()->json($this->externalResponse($response));
        } catch(Throwable $exception) {
            return response()->json(['message' => $exception->getMessage()], 422);
        }
    }

    private function resolveWhatsappConfig(Request $request): array
    {
        $storedConfig  = SettingApp::query()->where('key', 'whatsapp')->value('value');
        $settingConfig = $storedConfig === null ? [] : SettingApp::normalizeWhatsappConfig($storedConfig);
        $requestConfig = $request->filled('config') ? SettingApp::normalizeWhatsappConfig($request->input('config')) : [];
        return SettingApp::normalizeWhatsappConfig(array_replace_recursive(
            (array)config('services.whatsapp', []),
            $settingConfig,
            $requestConfig,
        ));
    }

    // ─── Private Helpers ────────────────────────────────────────────────────

    private function resolveWwebjsEndpoint(array $config, string $type = 'send'): string
    {
        $explicit = match ($type) {
            'qr'     => (string)($config['qr_endpoint'] ?? ''),
            'status' => (string)($config['status_endpoint'] ?? ''),
            default  => '',
        };
        if($explicit !== '') {
            return $explicit;
        }
        $endpoint = trim((string)($config['endpoint'] ?? ''));
        if($endpoint === '') {
            return '';
        }
        $endpoint = rtrim($endpoint, '/');
        if($type === 'send') {
            return $endpoint;
        }
        $target  = match ($type) {
            'status'  => '/api/status',
            'logout'  => '/api/logout',
            'restart' => '/api/restart',
            default   => '/api/qr',
        };
        $derived = preg_replace('~/api/(sendText|send|qr|status|logout|restart)$~', $target, $endpoint);
        if(is_string($derived) && $derived !== $endpoint) {
            return $derived;
        }
        return $endpoint . $target;
    }

    private function whatsappHttp(array $config)
    {
        return $this->serviceHttp($config);
    }

    private function serviceHttp(array $config)
    {
        $http  = Http::timeout((int)($config['timeout'] ?? 20))
            ->retry((int)($config['retry'] ?? 3), (int)($config['retry_sleep_ms'] ?? 300))
            ->acceptJson()
            ->asJson();
        $token = (string)($config['token'] ?? '');
        return $token !== '' ? $http->withToken($token) : $http;
    }

    private function externalResponse($response): array
    {
        $contentType = (string)$response->header('Content-Type', '');
        if(str_contains($contentType, 'application/json')) {
            $data = $response->json();
        } elseif(str_starts_with($contentType, 'image/')) {
            $data = ['image' => 'data:' . $contentType . ';base64,' . base64_encode($response->body())];
        } else {
            $data = ['raw' => $response->body()];
        }
        return [
            'ok'     => $response->successful(),
            'status' => $response->status(),
            'data'   => $data,
        ];
    }

    public function whatsappStatus(Request $request)
    {
        if(!$this->isServiceEnabled('whatsapp')) {
            return response()->json(['message' => 'WhatsApp service tidak aktif.'], 404);
        }
        $config   = $this->resolveWhatsappConfig($request);
        $provider = (string)($config['provider'] ?? 'wwebjs');
        if($provider !== 'wwebjs') {
            return response()->json(['message' => 'Status otomatis hanya tersedia untuk provider wwebjs.'], 422);
        }
        $endpoint = $this->resolveWwebjsEndpoint($config, 'status');
        if($endpoint === '') {
            return response()->json([
                'message' => 'Endpoint WhatsApp belum diisi. Isi dengan server lokal wwebjs, contoh: http://localhost:3001/api/send.',
            ], 422);
        }
        try {
            $response = $this->whatsappHttp($config)->get($endpoint);
            return response()->json($this->externalResponse($response));
        } catch(Throwable $exception) {
            return response()->json(['message' => $exception->getMessage()], 422);
        }
    }

    public function logoutWhatsapp(Request $request)
    {
        if(!$this->isServiceEnabled('whatsapp')) {
            return response()->json(['message' => 'WhatsApp service tidak aktif.'], 404);
        }
        $config   = $this->resolveWhatsappConfig($request);
        $provider = (string)($config['provider'] ?? 'wwebjs');
        if($provider !== 'wwebjs') {
            return response()->json(['message' => 'Logout session hanya tersedia untuk provider wwebjs.'], 422);
        }
        $endpoint = $this->resolveWwebjsEndpoint($config, 'logout');
        if($endpoint === '') {
            return response()->json([
                'message' => 'Endpoint WhatsApp belum diisi. Isi dengan server lokal wwebjs, contoh: http://localhost:3001/api/send.',
            ], 422);
        }
        try {
            $response = $this->whatsappHttp($config)->post($endpoint);
            return response()->json($this->externalResponse($response));
        } catch(Throwable $exception) {
            return response()->json(['message' => $exception->getMessage()], 422);
        }
    }

    public function testWhatsapp(Request $request)
    {
        if(!$this->isServiceEnabled('whatsapp')) {
            return response()->json(['message' => 'WhatsApp service tidak aktif.'], 404);
        }
        $validated = $request->validate([
            'config'  => 'nullable|string',
            'to'      => 'nullable|string|max:50',
            'message' => 'nullable|string|max:500',
        ]);
        $config   = $this->resolveWhatsappConfig($request);
        $provider = (string)($config['provider'] ?? 'wwebjs');
        $endpoint = $provider === 'wwebjs'
            ? $this->resolveWwebjsEndpoint($config, 'send')
            : (string)($config['endpoint'] ?? '');
        $to       = trim((string)($validated['to'] ?? $config['test_recipient'] ?? ''));
        $message  = trim((string)($validated['message'] ?? ''));
        if($endpoint === '') {
            return response()->json(['message' => 'Endpoint WhatsApp belum diisi.'], 422);
        }
        if($provider !== 'wwebjs' && $to === '') {
            return response()->json(['message' => 'Nomor tujuan test belum diisi.'], 422);
        }
        try {
            $payload = [
                'provider' => $provider,
                'message'  => $message !== '' ? $message : 'Test WhatsApp dari setting.',
                'meta'     => ['source' => 'settings-test'],
            ];
            if($to !== '') {
                $payload['to'] = $to;
            }
            $response = $this->whatsappHttp($config)->post($endpoint, $payload);
            return response()->json($this->externalResponse($response));
        } catch(Throwable $exception) {
            return response()->json(['message' => $exception->getMessage()], 422);
        }
    }

    public function testEmail(Request $request)
    {
        if(!$this->isServiceEnabled('email')) {
            return response()->json(['message' => 'Email service tidak aktif.'], 404);
        }
        $validated = $request->validate([
            'config'  => 'nullable|string',
            'to'      => 'nullable|string|max:255',
            'subject' => 'nullable|string|max:255',
            'message' => 'nullable|string|max:5000',
        ]);
        $config  = $this->resolveEmailConfig($request);
        $to      = trim((string)($validated['to'] ?? $config['test_recipient'] ?? ''));
        $subject = trim((string)($validated['subject'] ?? 'Test Email'));
        $message = trim((string)($validated['message'] ?? 'Test email dari setting.'));
        if($to === '') {
            return response()->json(['message' => 'Tujuan test email belum diisi.'], 422);
        }
        // Terapkan SMTP config dari database ke runtime Laravel
        $this->applyMailConfig($config);
        try {
            Mail::raw($message, function($mail) use ($to, $subject, $config): void {
                $fromAddress = (string)($config['from_address'] ?? config('mail.from.address', ''));
                $fromName    = (string)($config['from_name'] ?? config('mail.from.name', ''));
                $mail->to($to)
                    ->subject($subject)
                    ->from($fromAddress, $fromName);
            });
            return response()->json([
                'ok'     => true,
                'status' => 200,
                'data'   => ['message' => 'Email berhasil dikirim ke ' . $to],
            ]);
        } catch(Throwable $exception) {
            return response()->json(['message' => $exception->getMessage()], 422);
        }
    }

    private function resolveEmailConfig(Request $request): array
    {
        $storedConfig  = SettingApp::query()->where('key', 'email')->value('value');
        $settingConfig = $storedConfig === null ? [] : SettingApp::normalizeEmailConfig($storedConfig);
        $requestConfig = $request->filled('config') ? SettingApp::normalizeEmailConfig($request->input('config')) : [];
        return SettingApp::normalizeEmailConfig(array_replace_recursive(
            $settingConfig,
            $requestConfig,
        ));
    }

    private function applyMailConfig(array $config): void
    {
        $driver     = (string)($config['driver'] ?? 'smtp');
        $host       = (string)($config['host'] ?? '');
        $port       = (int)($config['port'] ?? 587);
        $encryption = (string)($config['encryption'] ?? 'tls');
        $username   = (string)($config['username'] ?? '');
        $password   = (string)($config['password'] ?? '');
        $fromName   = (string)($config['from_name'] ?? config('app.name'));
        $fromAddr   = (string)($config['from_address'] ?? '');
        Config::set('mail.mailer', 'smtp');
        Config::set('mail.mailers.smtp.host', $host);
        Config::set('mail.mailers.smtp.port', $port);
        Config::set('mail.mailers.smtp.encryption', $encryption ?: null);
        Config::set('mail.mailers.smtp.username', $username);
        Config::set('mail.mailers.smtp.password', $password);
        Config::set('mail.from.address', $fromAddr);
        Config::set('mail.from.name', $fromName);
        // Reset mailer agar Laravel re-build dengan config baru
        app()->forgetInstance('mailer');
        app()->forgetInstance('swift.mailer');
        app()->forgetInstance('swift.transport');
    }
}
