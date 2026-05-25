import { Bot, Loader2, MessageCircle, Send, X } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { usePage } from '@inertiajs/react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface AiChatBubbleProps {
    chatRoute?: string;
}

function TypingDots() {
    return (
        <span className="inline-flex items-end gap-[3px] h-4">
            {[0, 1, 2].map((i) => (
                <span
                    key={i}
                    className="block w-1.5 h-1.5 rounded-full bg-current opacity-60"
                    style={{ animation: `aichat-bounce 1.2s ${i * 0.2}s ease-in-out infinite` }}
                />
            ))}
        </span>
    );
}

function MessageBubble({ msg }: { msg: Message }) {
    const isUser = msg.role === 'user';
    return (
        <div
            className={`flex gap-2 aichat-fadein ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
        >
            {!isUser && (
                <div className="shrink-0 w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-primary" />
                </div>
            )}
            <div
                className={[
                    'max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed shadow-sm',
                    isUser
                        ? 'bg-primary text-primary-foreground rounded-tr-sm'
                        : 'bg-muted text-foreground rounded-tl-sm',
                ].join(' ')}
            >
                {msg.content.split('\n').map((line, i, arr) => (
                    <React.Fragment key={i}>
                        {line}
                        {i < arr.length - 1 && <br />}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
}

export default function AiChatBubble({ chatRoute = '/ai-chat' }: AiChatBubbleProps) {
    const [open, setOpen]             = useState(false);
    const [visible, setVisible]       = useState(false);
    const [messages, setMessages]     = useState<Message[]>([]);
    const [input, setInput]           = useState('');
    const [loading, setLoading]       = useState(false);
    const [error, setError]           = useState<string | null>(null);
    const [hasGreeted, setHasGreeted] = useState(false);
    const messagesEndRef              = useRef<HTMLDivElement>(null);
    const inputRef                    = useRef<HTMLTextAreaElement>(null);

    const page     = usePage();
    const setting  = (page.props as { setting?: { app_name?: string } }).setting;
    const appName  = setting?.app_name ?? 'Kami';

    // Handle open/close with CSS animation
    useEffect(() => {
        if (open) {
            setVisible(true);
            setTimeout(() => inputRef.current?.focus(), 300);
            if (!hasGreeted) {
                setHasGreeted(true);
                setMessages([{
                    role: 'assistant',
                    content: `Halo! Saya asisten virtual ${appName}. Ada yang bisa saya bantu? 😊`,
                }]);
            }
        } else {
            // Delay unmount for exit animation
            const t = setTimeout(() => setVisible(false), 250);
            return () => clearTimeout(t);
        }
    }, [open]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const send = useCallback(async () => {
        const text = input.trim();
        if (!text || loading) return;

        const userMsg: Message  = { role: 'user', content: text };
        const newMessages       = [...messages, userMsg];
        setMessages(newMessages);
        setInput('');
        setLoading(true);
        setError(null);

        // Reset textarea height
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
        }

        try {
            const csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';
            const res  = await fetch(chatRoute, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept':       'application/json',
                    'X-CSRF-TOKEN': csrf,
                },
                body: JSON.stringify({
                    message: text,
                    history: newMessages.slice(0, -1),
                }),
            });

            const data = await res.json();

            if (!res.ok || data.error) {
                setError(data.error ?? 'Terjadi kesalahan. Coba lagi.');
            } else {
                setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
            }
        } catch {
            setError('Gagal terhubung. Periksa koneksi internet Anda.');
        } finally {
            setLoading(false);
        }
    }, [input, loading, messages, chatRoute]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    };

    const clearChat = () => {
        setMessages([{
            role: 'assistant',
            content: `Halo! Saya asisten virtual ${appName}. Ada yang bisa saya bantu? 😊`,
        }]);
        setError(null);
    };

    return (
        <>
            <style>{`
                @keyframes aichat-bounce {
                    0%, 60%, 100% { transform: translateY(0); }
                    30%           { transform: translateY(-4px); }
                }
                @keyframes aichat-pulse-ring {
                    0%   { transform: scale(1); opacity: 0.4; }
                    100% { transform: scale(1.7); opacity: 0; }
                }
                @keyframes aichat-slidein {
                    from { opacity: 0; transform: translateY(16px) scale(0.96); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes aichat-slideout {
                    from { opacity: 1; transform: translateY(0) scale(1); }
                    to   { opacity: 0; transform: translateY(16px) scale(0.96); }
                }
                @keyframes aichat-fadein {
                    from { opacity: 0; transform: translateY(6px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .aichat-fadein {
                    animation: aichat-fadein 0.2s ease-out both;
                }
                .aichat-panel-enter {
                    animation: aichat-slidein 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) both;
                }
                .aichat-panel-exit {
                    animation: aichat-slideout 0.2s ease-in both;
                }
            `}</style>

            {/* Chat Panel */}
            {visible && (
                <div
                    className={`fixed bottom-24 right-4 z-50 w-[calc(100vw-2rem)] max-w-sm sm:right-6 ${open ? 'aichat-panel-enter' : 'aichat-panel-exit'}`}
                    style={{ transformOrigin: 'bottom right' }}
                >
                    <div
                        className="bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                        style={{ height: '480px' }}
                    >
                        {/* Header */}
                        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-primary/5">
                            <div className="relative">
                                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shadow">
                                    <Bot className="w-5 h-5 text-primary-foreground" />
                                </div>
                                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-foreground leading-none">AI Assistant</p>
                                <p className="text-[11px] text-muted-foreground mt-0.5">{appName} · Online</p>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={clearChat}
                                    title="Mulai percakapan baru"
                                    className="px-2 py-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-[11px]"
                                >
                                    Baru
                                </button>
                                <button
                                    onClick={() => setOpen(false)}
                                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scroll-smooth">
                            {messages.map((msg, i) => (
                                <MessageBubble key={i} msg={msg} />
                            ))}

                            {loading && (
                                <div className="flex gap-2 aichat-fadein">
                                    <div className="shrink-0 w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mt-0.5">
                                        <Bot className="w-3.5 h-3.5 text-primary" />
                                    </div>
                                    <div className="bg-muted rounded-2xl rounded-tl-sm px-3.5 py-3 text-muted-foreground">
                                        <TypingDots />
                                    </div>
                                </div>
                            )}

                            {error && !loading && (
                                <div className="text-center aichat-fadein">
                                    <p className="text-[12px] text-destructive bg-destructive/10 rounded-xl px-3 py-2 inline-block">
                                        {error}
                                    </p>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="px-3 py-3 border-t border-border bg-background">
                            <div className="flex items-end gap-2 bg-muted rounded-xl px-3 py-2">
                                <textarea
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => {
                                        setInput(e.target.value);
                                        e.target.style.height = 'auto';
                                        e.target.style.height = Math.min(e.target.scrollHeight, 96) + 'px';
                                    }}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ketik pesan... (Enter untuk kirim)"
                                    disabled={loading}
                                    rows={1}
                                    className="flex-1 bg-transparent resize-none outline-none text-[13px] text-foreground placeholder:text-muted-foreground disabled:opacity-50 leading-relaxed py-0.5 max-h-24"
                                    style={{ minHeight: '22px' }}
                                />
                                <button
                                    onClick={send}
                                    disabled={!input.trim() || loading}
                                    className="shrink-0 w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed mb-0.5"
                                >
                                    {loading
                                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        : <Send className="w-3.5 h-3.5" />
                                    }
                                </button>
                            </div>
                            <p className="text-[10px] text-muted-foreground text-center mt-1.5">
                                Shift+Enter untuk baris baru
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Button */}
            <div className="fixed bottom-5 right-4 z-50 sm:right-6">
                {!open && (
                    <span
                        className="absolute inset-0 rounded-full bg-primary pointer-events-none"
                        style={{ animation: 'aichat-pulse-ring 2s ease-out infinite' }}
                    />
                )}
                <button
                    onClick={() => setOpen((v) => !v)}
                    className="relative w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
                    style={{ boxShadow: '0 4px 24px 0 color-mix(in srgb, var(--primary) 35%, transparent)' }}
                    aria-label={open ? 'Tutup chat' : 'Buka chat AI'}
                >
                    {open
                        ? <X className="w-6 h-6" />
                        : <MessageCircle className="w-6 h-6" />
                    }
                </button>
            </div>
        </>
    );
}
