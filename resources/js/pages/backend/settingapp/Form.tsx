import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/hooks/use-language';
import BackendLayout from '@/layouts/backend-layout';
import { Head, useForm } from '@inertiajs/react';
import { Eye, EyeOff, Loader2, LogOut, Plus, QrCode, Send, Trash2 } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

type SettingRow = {
    key: string;
    value: string;
    type?: 'text' | 'textarea' | 'color' | 'file' | 'json' | 'whatsapp' | 'email_service';
    is_system?: boolean;
};

type WhatsAppConfig = {
    provider?: string;
    endpoint?: string | null;
    token?: string | null;
    qr_endpoint?: string | null;
    status_endpoint?: string | null;
    test_recipient?: string | null;
    timeout?: number | string;
    retry?: number | string;
    retry_sleep_ms?: number | string;
};

type EmailConfig = {
    driver?: string | null;
    host?: string | null;
    port?: number | string;
    encryption?: string | null;
    username?: string | null;
    password?: string | null;
    from_name?: string | null;
    from_address?: string | null;
    test_recipient?: string | null;
};

type ServiceFeature = { enabled: boolean; label: string };

interface Props {
    settings?: SettingRow[];
    serviceFeatures?: Record<string, ServiceFeature>;
}

type ServiceResult = { loading: boolean; message?: string; image?: string; text?: string; status?: string; connected?: boolean; lastCheckedAt?: string };
type SettingTab = 'general' | 'services' | 'custom';

// ─── Constants ───────────────────────────────────────────────────────────────

const whatsappProviderOptions = [
    { value: 'wwebjs', label: 'wwebjs (Whatsapp Web.js)' },
    { value: 'qontak', label: 'Qontak' },
    { value: 'custom', label: 'Custom API' },
];

const emailDriverOptions = [
    { value: 'gmail', label: 'Gmail (SMTP)' },
    { value: 'smtp', label: 'SMTP Lainnya' },
];

const encryptionOptions = [
    { value: 'tls', label: 'TLS (port 587)' },
    { value: 'ssl', label: 'SSL (port 465)' },
    { value: 'none', label: 'Tanpa enkripsi' },
];

const defaultWhatsappConfig: Required<WhatsAppConfig> = {
    provider: 'wwebjs',
    endpoint: '',
    token: '',
    qr_endpoint: '',
    status_endpoint: '',
    test_recipient: '',
    timeout: 20,
    retry: 3,
    retry_sleep_ms: 300,
};

const defaultEmailConfig: Required<EmailConfig> = {
    driver: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    encryption: 'tls',
    username: '',
    password: '',
    from_name: '',
    from_address: '',
    test_recipient: '',
};

// ─── Config parsers ──────────────────────────────────────────────────────────

function parseWhatsappConfig(value: string): Required<WhatsAppConfig> {
    let parsed: WhatsAppConfig = {};
    try { parsed = value.trim() ? (JSON.parse(value) as WhatsAppConfig) : {}; } catch { parsed = {}; }
    const provider = String(parsed.provider || defaultWhatsappConfig.provider);
    return { ...defaultWhatsappConfig, ...parsed, provider };
}

function stringifyWhatsappConfig(config: Required<WhatsAppConfig>): string {
    return JSON.stringify(config, null, 2);
}

function parseEmailConfig(value: string): Required<EmailConfig> {
    let parsed: EmailConfig = {};
    try { parsed = value.trim() ? (JSON.parse(value) as EmailConfig) : {}; } catch { parsed = {}; }
    return { ...defaultEmailConfig, ...parsed };
}

function stringifyEmailConfig(config: Required<EmailConfig>): string {
    return JSON.stringify(config, null, 2);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function labelFor(key: string): string {
    return key.replaceAll('_', ' ').replaceAll('.', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

function storageUrl(path?: string | null): string | null {
    return path ? `/storage/${path}` : null;
}

const serviceKeys = ['whatsapp', 'email', 'payment_gateway'];
const generalKeys = ['nama_app', 'deskripsi', 'logo', 'favicon', 'warna', 'seo'];

// ─── Component ───────────────────────────────────────────────────────────────

export default function SettingForm({ settings = [], serviceFeatures = {} }: Props) {
    const { t } = useLanguage();
    const initialRows = useMemo(() => settings.map((row) => ({ ...row, value: row.value ?? '' })), [settings]);
    const { data, setData, post, processing, errors } = useForm<{
        settings: SettingRow[];
        files: Record<string, File | null>;
    }>({ settings: initialRows, files: {} });

    const [previews, setPreviews] = useState<Record<string, string | null>>(
        Object.fromEntries(initialRows.filter((r) => r.type === 'file').map((r) => [r.key, storageUrl(r.value)])),
    );
    const [activeTab, setActiveTab] = useState<SettingTab>('general');
    const [qrResult, setQrResult] = useState<ServiceResult>({ loading: false });
    const [testWaResult, setTestWaResult] = useState<ServiceResult>({ loading: false });
    const [emailTestResult, setEmailTestResult] = useState<ServiceResult>({ loading: false });
    const [showPassword, setShowPassword] = useState(false);
    const statusPollingRef = useRef(false);
    const whatsappRow = useMemo(
        () => data.settings.find((row) => row.key === 'whatsapp' && row.type === 'whatsapp'),
        [data.settings],
    );

    // ── Submit ──────────────────────────────────────────────────────────────

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        post(route('setting.update'), { forceFormData: true, preserveScroll: true });
    };

    // ── Row helpers ─────────────────────────────────────────────────────────

    const updateRow = (index: number, patch: Partial<SettingRow>) => {
        const next = [...data.settings];
        next[index] = { ...next[index], ...patch };
        setData('settings', next);
    };

    const addRow = () => setData('settings', [{ key: '', value: '', type: 'text', is_system: false }, ...data.settings]);

    const removeRow = (index: number) => {
        const row = data.settings[index];
        setData('settings', data.settings.filter((_, i) => i !== index));
        if (row?.type === 'file') {
            const f = { ...data.files };
            delete f[row.key];
            setData('files', f);
        }
    };

    const handleFileChange = (row: SettingRow, file: File | null) => {
        setData('files', { ...data.files, [row.key]: file });
        if (!file) {
            setPreviews((c) => ({ ...c, [row.key]: storageUrl(row.value) }));
            return;
        }
        setPreviews((c) => {
            if (c[row.key]?.startsWith('blob:')) URL.revokeObjectURL(c[row.key]!);
            return { ...c, [row.key]: URL.createObjectURL(file) };
        });
    };

    const updateWhatsappRow = (index: number, updater: (c: Required<WhatsAppConfig>) => Required<WhatsAppConfig>) => {
        const current = parseWhatsappConfig(data.settings[index]?.value ?? '');
        updateRow(index, { value: stringifyWhatsappConfig(updater(current)) });
    };

    const updateEmailRow = (index: number, updater: (c: Required<EmailConfig>) => Required<EmailConfig>) => {
        const current = parseEmailConfig(data.settings[index]?.value ?? '');
        updateRow(index, { value: stringifyEmailConfig(updater(current)) });
    };

    // ── Service HTTP actions ─────────────────────────────────────────────────

    const postServiceAction = async (url: string, payload: Record<string, unknown>) => {
        const csrf = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';
        const res = await fetch(url, {
            method: 'POST',
            headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf },
            body: JSON.stringify(payload),
        });
        const result = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(result.message || 'Request failed.');
        return result as { ok?: boolean; status?: number; data?: Record<string, unknown>; message?: string };
    };

    const normalizeServicePayload = (payload: Record<string, unknown> = {}): Record<string, unknown> => {
        return typeof payload.data === 'object' && payload.data !== null ? (payload.data as Record<string, unknown>) : payload;
    };

    const extractQrResult = (payload: Record<string, unknown> = {}): Pick<ServiceResult, 'image' | 'text' | 'message' | 'status' | 'connected'> => {
        const nested = normalizeServicePayload(payload);
        const image = typeof nested.image === 'string' ? nested.image : undefined;
        const qr = typeof nested.qr === 'string' ? nested.qr : undefined;
        const raw = typeof nested.raw === 'string' ? nested.raw : undefined;
        const status = typeof nested.status === 'string' ? nested.status : undefined;
        const connected = nested.connected === true || status === 'CONNECTED';
        const msg = typeof nested.message === 'string' ? nested.message : typeof payload.message === 'string' ? payload.message : undefined;

        const base = { status, connected, message: msg || (connected ? 'WhatsApp sudah terhubung.' : 'QR belum tersedia.') };

        if (connected) {
            return { ...base, image: undefined, text: undefined, message: msg || 'WhatsApp sudah terhubung.' };
        }

        if (image) return { ...base, image, message: msg || 'QR berhasil diambil.' };
        if (qr?.startsWith('data:image/')) return { ...base, image: qr, message: msg || 'QR berhasil diambil.' };

        return { ...base, text: qr || raw || JSON.stringify(nested, null, 2) };
    };

    const fetchWhatsappQr = async (row: SettingRow) => {
        setQrResult({ loading: true });
        try {
            const result = await postServiceAction(route('setting.services.whatsapp.qr'), { config: row.value });
            setQrResult({ loading: false, ...extractQrResult((result.data ?? {}) as Record<string, unknown>) });
        } catch (err) {
            setQrResult({ loading: false, message: err instanceof Error ? err.message : 'QR gagal diambil.' });
        }
    };

    const disconnectWhatsapp = async (row: SettingRow) => {
        setQrResult((current) => ({ ...current, loading: true }));
        try {
            const result = await postServiceAction(route('setting.services.whatsapp.logout'), { config: row.value });
            const data = (result.data ?? {}) as Record<string, unknown>;
            setQrResult({
                loading: false,
                status: typeof data.status === 'string' ? data.status : undefined,
                connected: data.connected === true,
                image: undefined,
                message: typeof data.message === 'string' ? data.message : 'Session WhatsApp berhasil dihapus. Klik Scan QR Login untuk membuat QR baru.',
                text: JSON.stringify(data, null, 2),
            });
        } catch (err) {
            setQrResult({ loading: false, message: err instanceof Error ? err.message : 'Gagal disconnect WhatsApp.' });
        }
    };

    const checkWhatsappStatus = async (row: SettingRow, silent = true) => {
        if (!silent) setQrResult((current) => ({ ...current, loading: true }));

        try {
            const result = await postServiceAction(route('setting.services.whatsapp.status'), { config: row.value });
            const state = extractQrResult((result.data ?? {}) as Record<string, unknown>);

            setQrResult((current) => {
                // Saat QR masih tampil lalu status berubah CONNECTED, tutup QR otomatis.
                if (state.connected) {
                    return {
                        ...current,
                        loading: false,
                        connected: true,
                        status: state.status,
                        image: undefined,
                        text: undefined,
                        message: state.message || 'WhatsApp sudah terhubung.',
                        lastCheckedAt: new Date().toLocaleTimeString(),
                    };
                }

                // Jangan hilangkan QR yang sedang discan hanya karena polling status belum punya QR baru.
                return {
                    ...current,
                    loading: false,
                    connected: false,
                    status: state.status,
                    message: current.image ? current.message : state.message,
                    lastCheckedAt: new Date().toLocaleTimeString(),
                };
            });
        } catch (err) {
            if (!silent) {
                setQrResult({ loading: false, message: err instanceof Error ? err.message : 'Gagal cek status WhatsApp.' });
            }
        }
    };

    useEffect(() => {
        if (!whatsappRow) return;

        const config = parseWhatsappConfig(whatsappRow.value);
        if (config.provider !== 'wwebjs' || !config.endpoint) return;

        let cancelled = false;

        const tick = async () => {
            if (cancelled || statusPollingRef.current) return;
            statusPollingRef.current = true;
            try {
                await checkWhatsappStatus(whatsappRow, true);
            } finally {
                statusPollingRef.current = false;
            }
        };

        tick();
        const timer = window.setInterval(tick, 3000);

        return () => {
            cancelled = true;
            window.clearInterval(timer);
        };
    }, [whatsappRow?.value]);

    const testWhatsapp = async (row: SettingRow) => {
        const config = parseWhatsappConfig(row.value);
        setTestWaResult({ loading: true });
        try {
            const result = await postServiceAction(route('setting.services.whatsapp.test'), {
                config: row.value,
                to: config.test_recipient,
            });
            setTestWaResult({
                loading: false,
                message: result.ok === false ? `Test gagal. HTTP ${result.status ?? ''}` : 'Test WhatsApp berhasil dikirim.',
                text: JSON.stringify(result.data ?? {}, null, 2),
            });
        } catch (err) {
            setTestWaResult({ loading: false, message: err instanceof Error ? err.message : 'Test WhatsApp gagal.' });
        }
    };

    const testEmail = async (row: SettingRow) => {
        setEmailTestResult({ loading: true });
        const config = parseEmailConfig(row.value);
        try {
            const result = await postServiceAction(route('setting.services.email.test'), {
                config: row.value,
                to: config.test_recipient,
                subject: 'Test Email dari Setting',
            });
            setEmailTestResult({
                loading: false,
                message: result.ok === false ? `Test gagal. HTTP ${result.status ?? ''}` : 'Test email berhasil dikirim.',
                text: JSON.stringify(result.data ?? {}, null, 2),
            });
        } catch (err) {
            setEmailTestResult({ loading: false, message: err instanceof Error ? err.message : 'Test email gagal.' });
        }
    };

    // ── Field renderers ──────────────────────────────────────────────────────

    const renderWhatsappField = (row: SettingRow, index: number) => {
        const config   = parseWhatsappConfig(row.value);
        const provider = config.provider || 'wwebjs';

        const providerOptions = whatsappProviderOptions.some((o) => o.value === provider)
            ? whatsappProviderOptions
            : [{ value: provider, label: provider }, ...whatsappProviderOptions];

        const setStr = (field: keyof WhatsAppConfig, val: string) =>
            updateWhatsappRow(index, (c) => ({ ...c, [field]: val }));
        const setNum = (field: 'timeout' | 'retry' | 'retry_sleep_ms', val: string) => {
            const n = Number(val);
            updateWhatsappRow(index, (c) => ({ ...c, [field]: Number.isFinite(n) ? n : Number(defaultWhatsappConfig[field]) }));
        };

        // ── wwebjs: simple mode (endpoint + scan + test saja) ──────────────
        if (provider === 'wwebjs') {
            return (
                <div className="bg-muted/20 space-y-4 rounded-md border p-4">
                    <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-1">
                            <Label>Provider</Label>
                            <Select value={provider} onValueChange={(v) => setStr('provider', v)}>
                                <SelectTrigger><SelectValue placeholder="Provider" /></SelectTrigger>
                                <SelectContent>
                                    {providerOptions.map((o) => (
                                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label>Endpoint</Label>
                            <Input
                                value={config.endpoint ?? ''}
                                onChange={(e) => setStr('endpoint', e.target.value)}
                                placeholder="http://localhost:3000/api/send"
                            />
                            <p className="text-muted-foreground text-xs">
                                URL endpoint wwebjs server Anda. Token tidak diperlukan untuk wwebjs.
                            </p>
                        </div>
                    </div>

                    <Separator />

                    {/* Nomor test (opsional untuk wwebjs) */}
                    <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-1">
                            <Label>Nomor Test (opsional)</Label>
                            <Input
                                value={config.test_recipient ?? ''}
                                onChange={(e) => setStr('test_recipient', e.target.value)}
                                placeholder="628123456789"
                            />
                        </div>
                    </div>

                    <Separator />

                    {/* Action buttons */}
                    <div className="grid gap-4 lg:grid-cols-2">
                        <div className="space-y-3">
                            <p className="text-sm font-medium">Status Login WhatsApp</p>
                            <Button
                                type="button"
                                variant={qrResult.connected ? 'destructive' : 'secondary'}
                                onClick={() => (qrResult.connected ? disconnectWhatsapp(row) : fetchWhatsappQr(row))}
                                disabled={qrResult.loading}
                            >
                                {qrResult.loading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : qrResult.connected ? (
                                    <LogOut className="h-4 w-4" />
                                ) : (
                                    <QrCode className="h-4 w-4" />
                                )}
                                {qrResult.connected ? 'Disconnect / Hapus Session' : 'Tampilkan QR Login'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => checkWhatsappStatus(row, false)}
                                disabled={qrResult.loading}
                            >
                                {qrResult.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                Cek Status
                            </Button>
                            {qrResult.message && <p className="text-muted-foreground text-sm">{qrResult.message}</p>}
                            {qrResult.lastCheckedAt && <p className="text-muted-foreground text-xs">Auto check terakhir: {qrResult.lastCheckedAt}</p>}
                            {qrResult.image && (
                                <img src={qrResult.image} alt="WhatsApp QR" className="h-52 w-52 rounded-md border bg-white object-contain p-2" />
                            )}
                            {qrResult.text && <Textarea readOnly value={qrResult.text} className="min-h-28 font-mono text-xs" />}
                        </div>

                        <div className="space-y-3">
                            <p className="text-sm font-medium">Test kirim pesan</p>
                            <Button type="button" variant="secondary" onClick={() => testWhatsapp(row)} disabled={testWaResult.loading}>
                                {testWaResult.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                Test Send
                            </Button>
                            {testWaResult.message && <p className="text-muted-foreground text-sm">{testWaResult.message}</p>}
                            {testWaResult.text && <Textarea readOnly value={testWaResult.text} className="min-h-28 font-mono text-xs" />}
                        </div>
                    </div>
                </div>
            );
        }

        // ── Non-wwebjs: advanced mode (semua field) ────────────────────────
        return (
            <div className="bg-muted/20 space-y-4 rounded-md border p-4">
                <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-1">
                        <Label>Provider</Label>
                        <Select value={provider} onValueChange={(v) => setStr('provider', v)}>
                            <SelectTrigger><SelectValue placeholder="Provider" /></SelectTrigger>
                            <SelectContent>
                                {providerOptions.map((o) => (
                                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <Label>Endpoint (Send)</Label>
                        <Input value={config.endpoint ?? ''} onChange={(e) => setStr('endpoint', e.target.value)} placeholder="https://api.example.com/whatsapp/send" />
                    </div>
                    <div className="space-y-1">
                        <Label>Token / API Key</Label>
                        <Input type="password" autoComplete="new-password" value={config.token ?? ''} onChange={(e) => setStr('token', e.target.value)} placeholder="Bearer token" />
                    </div>
                    <div className="space-y-1">
                        <Label>QR Login Endpoint</Label>
                        <Input value={config.qr_endpoint ?? ''} onChange={(e) => setStr('qr_endpoint', e.target.value)} placeholder="https://api.example.com/whatsapp/qr" />
                    </div>
                    <div className="space-y-1">
                        <Label>Status Endpoint</Label>
                        <Input value={config.status_endpoint ?? ''} onChange={(e) => setStr('status_endpoint', e.target.value)} placeholder="https://api.example.com/whatsapp/status" />
                    </div>
                    <div className="space-y-1">
                        <Label>Test Recipient</Label>
                        <Input value={config.test_recipient ?? ''} onChange={(e) => setStr('test_recipient', e.target.value)} placeholder="628123456789" />
                    </div>
                    <div className="col-span-full grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                            <Label>Timeout (s)</Label>
                            <Input type="number" min={1} value={config.timeout} onChange={(e) => setNum('timeout', e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <Label>Retry</Label>
                            <Input type="number" min={0} value={config.retry} onChange={(e) => setNum('retry', e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <Label>Retry Delay (ms)</Label>
                            <Input type="number" min={0} value={config.retry_sleep_ms} onChange={(e) => setNum('retry_sleep_ms', e.target.value)} />
                        </div>
                    </div>
                </div>

                <Separator />

                <div className="grid gap-4 lg:grid-cols-2">
                    <div className="space-y-3">
                        <Button type="button" variant="secondary" onClick={() => fetchWhatsappQr(row)} disabled={qrResult.loading}>
                            {qrResult.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <QrCode className="h-4 w-4" />}
                            QR Login
                        </Button>
                        {qrResult.message && <p className="text-muted-foreground text-sm">{qrResult.message}</p>}
                        {qrResult.image && <img src={qrResult.image} alt="QR" className="h-52 w-52 rounded-md border bg-white object-contain p-2" />}
                        {qrResult.text && <Textarea readOnly value={qrResult.text} className="min-h-28 font-mono text-xs" />}
                    </div>
                    <div className="space-y-3">
                        <Button type="button" variant="secondary" onClick={() => testWhatsapp(row)} disabled={testWaResult.loading}>
                            {testWaResult.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            Test Send
                        </Button>
                        {testWaResult.message && <p className="text-muted-foreground text-sm">{testWaResult.message}</p>}
                        {testWaResult.text && <Textarea readOnly value={testWaResult.text} className="min-h-28 font-mono text-xs" />}
                    </div>
                </div>
            </div>
        );
    };

    const renderEmailField = (row: SettingRow, index: number) => {
        const config = parseEmailConfig(row.value);

        const setStr = (field: keyof EmailConfig, val: string) =>
            updateEmailRow(index, (c) => ({ ...c, [field]: val }));
        const setPort = (val: string) => {
            const n = Number(val);
            updateEmailRow(index, (c) => ({ ...c, port: Number.isFinite(n) && n > 0 ? n : 587 }));
        };

        // Auto-fill host saat driver berubah
        const handleDriverChange = (driver: string) => {
            updateEmailRow(index, (c) => ({
                ...c,
                driver,
                host: driver === 'gmail' ? 'smtp.gmail.com' : c.host ?? '',
                port: driver === 'gmail' ? 587 : c.port,
                encryption: driver === 'gmail' ? 'tls' : c.encryption,
            }));
        };

        const handleEncryptionChange = (enc: string) => {
            const encryption = enc === 'none' ? '' : enc;
            updateEmailRow(index, (c) => ({
                ...c,
                encryption,
                port: encryption === 'ssl' ? 465 : encryption === 'tls' ? 587 : c.port,
            }));
        };

        return (
            <div className="bg-muted/20 space-y-4 rounded-md border p-4">
                {/* Provider / driver */}
                <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-1">
                        <Label>Provider Email</Label>
                        <Select value={config.driver ?? 'gmail'} onValueChange={handleDriverChange}>
                            <SelectTrigger><SelectValue placeholder="Provider" /></SelectTrigger>
                            <SelectContent>
                                {emailDriverOptions.map((o) => (
                                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <Label>Enkripsi</Label>
                        <Select value={config.encryption || 'none'} onValueChange={handleEncryptionChange}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {encryptionOptions.map((o) => (
                                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <Label>SMTP Host</Label>
                        <Input value={config.host ?? ''} onChange={(e) => setStr('host', e.target.value)} placeholder="smtp.gmail.com" />
                    </div>

                    <div className="space-y-1">
                        <Label>SMTP Port</Label>
                        <Input type="number" value={config.port} onChange={(e) => setPort(e.target.value)} placeholder="587" />
                    </div>

                    <div className="space-y-1">
                        <Label>Username / Gmail</Label>
                        <Input
                            type="email"
                            value={config.username ?? ''}
                            onChange={(e) => setStr('username', e.target.value)}
                            placeholder="nama@gmail.com"
                            autoComplete="username"
                        />
                        {config.driver === 'gmail' && (
                            <p className="text-muted-foreground text-xs">
                                Gunakan alamat Gmail Anda. Password harus berupa{' '}
                                <a
                                    href="https://myaccount.google.com/apppasswords"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline"
                                >
                                    App Password Google
                                </a>
                                , bukan password akun biasa.
                            </p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <Label>Password / App Password</Label>
                        <div className="relative">
                            <Input
                                type={showPassword ? 'text' : 'password'}
                                value={config.password ?? ''}
                                onChange={(e) => setStr('password', e.target.value)}
                                placeholder={config.driver === 'gmail' ? 'xxxx xxxx xxxx xxxx' : 'SMTP password'}
                                autoComplete="new-password"
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((s) => !s)}
                                className="text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label>From Name</Label>
                        <Input value={config.from_name ?? ''} onChange={(e) => setStr('from_name', e.target.value)} placeholder="Nama Pengirim" />
                    </div>

                    <div className="space-y-1">
                        <Label>From Address</Label>
                        <Input type="email" value={config.from_address ?? ''} onChange={(e) => setStr('from_address', e.target.value)} placeholder="noreply@gmail.com" />
                    </div>

                    <div className="space-y-1">
                        <Label>Test Recipient</Label>
                        <Input type="email" value={config.test_recipient ?? ''} onChange={(e) => setStr('test_recipient', e.target.value)} placeholder="test@example.com" />
                    </div>
                </div>

                <Separator />

                {/* Test button */}
                <div className="space-y-3">
                    <Button type="button" variant="secondary" onClick={() => testEmail(row)} disabled={emailTestResult.loading}>
                        {emailTestResult.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        Test Kirim Email
                    </Button>
                    {emailTestResult.message && (
                        <p className={`text-sm ${emailTestResult.message.toLowerCase().includes('gagal') ? 'text-red-500' : 'text-green-600'}`}>
                            {emailTestResult.message}
                        </p>
                    )}
                    {emailTestResult.text && <Textarea readOnly value={emailTestResult.text} className="min-h-20 font-mono text-xs" />}
                </div>
            </div>
        );
    };

    const renderValueField = (row: SettingRow, index: number) => {
        if (row.type === 'whatsapp') return renderWhatsappField(row, index);
        if (row.type === 'email_service') return renderEmailField(row, index);

        if (row.type === 'textarea' || row.type === 'json') {
            return (
                <Textarea
                    value={row.value}
                    onChange={(e) => updateRow(index, { value: e.target.value })}
                    className={row.type === 'json' ? 'min-h-28 font-mono text-xs' : undefined}
                />
            );
        }
        if (row.type === 'color') {
            return (
                <div className="flex items-center gap-3">
                    <Input type="color" value={row.value || '#0ea5e9'} onChange={(e) => updateRow(index, { value: e.target.value })} className="h-10 w-16 p-1" />
                    <Input value={row.value} onChange={(e) => updateRow(index, { value: e.target.value })} className="font-mono" />
                </div>
            );
        }
        if (row.type === 'file') {
            return (
                <div className="space-y-2">
                    <Input type="file" accept="image/jpg,image/jpeg,image/png,image/webp,image/svg+xml,image/x-icon" onChange={(e) => handleFileChange(row, e.target.files?.[0] ?? null)} />
                    {previews[row.key] && <img src={previews[row.key] ?? ''} alt={labelFor(row.key)} className="h-14 max-w-48 rounded border object-contain p-1" />}
                    <Input value={row.value} onChange={(e) => updateRow(index, { value: e.target.value })} placeholder="path/in/storage" />
                </div>
            );
        }
        return <Input value={row.value} onChange={(e) => updateRow(index, { value: e.target.value })} />;
    };

    // ── Tabs ─────────────────────────────────────────────────────────────────

    const indexedRows = data.settings.map((row, index) => ({ row, index }));
    const rowsForActiveTab = indexedRows.filter(({ row }) => {
        if (activeTab === 'general') return generalKeys.includes(row.key);
        if (activeTab === 'services') return serviceKeys.includes(row.key) && serviceFeatures[row.key]?.enabled;
        return !row.is_system && !serviceKeys.includes(row.key);
    });

    const tabButtons: { key: SettingTab; label: string }[] = [
        { key: 'general', label: 'General' },
        { key: 'services', label: 'Service' },
        { key: 'custom', label: 'Custom' },
    ];

    const renderRows = () => {
        if (rowsForActiveTab.length === 0) {
            return (
                <p className="text-muted-foreground rounded-md border border-dashed px-3 py-6 text-center text-sm">
                    {activeTab === 'services' ? 'Tidak ada service aktif dari env.' : t('pages.settingapp.noCustomSettings')}
                </p>
            );
        }
        return rowsForActiveTab.map(({ row, index }) => (
            <div key={`${row.key}-${index}`} className="rounded-md border p-4">
                <div className="grid gap-3 lg:grid-cols-[240px_1fr_auto]">
                    <div className="space-y-1">
                        <Label htmlFor={`setting-key-${index}`}>{t('settings.translations.key')}</Label>
                        <Input
                            id={`setting-key-${index}`}
                            value={row.key}
                            onChange={(e) => updateRow(index, { key: e.target.value })}
                            disabled={row.is_system}
                            placeholder="support_email"
                            className={errors[`settings.${index}.key`] ? 'border-red-500' : ''}
                        />
                        <p className="text-muted-foreground text-xs">{labelFor(row.key || 'custom_setting')}</p>
                    </div>
                    <div className="space-y-1">
                        <Label>{t('pages.settingapp.customValue')}</Label>
                        {renderValueField(row, index)}
                    </div>
                    <div className="flex items-end">
                        {!row.is_system && (
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeRow(index)} aria-label={t('buttons.delete')}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        ));
    };

    // ── Render ───────────────────────────────────────────────────────────────

    return (
        <BackendLayout breadcrumbs={[{ title: t('pages.settingapp.title', { fallback: 'Application Settings' }), href: '/backend/settingsapp' }]} title={t('pages.settingapp.title', { fallback: 'Application Settings' })}>
            <Head title={t('pages.settingapp.title', { fallback: 'Application Settings' })} />
            <div className="flex-1 p-4 md:p-6">
                <Card className="mx-auto">
                    <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <CardTitle className="text-2xl font-bold tracking-tight">{t('pages.settingapp.title', { fallback: 'Application Settings' })}</CardTitle>
                            <p className="text-muted-foreground mt-1 text-sm">{t('pages.settingapp.description', { fallback: 'Configure application identity, theme, logo, services, and SEO metadata.' })}</p>
                        </div>
                        {activeTab === 'custom' && (
                            <Button type="button" variant="secondary" onClick={addRow}>
                                <Plus className="h-4 w-4" />
                                {t('buttons.add')}
                            </Button>
                        )}
                    </CardHeader>

                    <Separator />

                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="flex flex-wrap gap-2 border-b">
                                {tabButtons.map((tab) => (
                                    <button
                                        key={tab.key}
                                        type="button"
                                        onClick={() => setActiveTab(tab.key)}
                                        className={`border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
                                            activeTab === tab.key
                                                ? 'border-primary text-foreground'
                                                : 'text-muted-foreground hover:text-foreground border-transparent'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-4">{renderRows()}</div>

                            <div className="flex justify-end pt-4">
                                <Button type="submit" disabled={processing} className="px-6">
                                    {processing ? t('buttons.saving') : t('buttons.save')}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </BackendLayout>
    );
}
