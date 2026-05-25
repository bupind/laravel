import AiChatBubble from '@/components/ai-chat-bubble';
import { FrontendFooter } from '@/components/frontend-footer';
import { FrontendHeader } from '@/components/frontend-header';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect, type ReactNode } from 'react';

interface FrontendLayoutProps {
    children: ReactNode;
}

export default function FrontendLayout({ children }: FrontendLayoutProps) {
    const page = usePage<SharedData>();
    const { auth, setting } = page.props;
    const primaryColor = setting?.color || '#ef3b2d';

    useEffect(() => {
        document.documentElement.style.setProperty('--primary', primaryColor);
        document.documentElement.style.setProperty('--color-primary', primaryColor);
    }, [primaryColor]);

    return (
        <div className="bg-background text-foreground flex min-h-screen flex-col">
            <FrontendHeader setting={setting} auth={auth} />
            <div key={page.url} className="frontend-page-transition flex-1">
                {children}
            </div>
            <FrontendFooter setting={setting} />
            {/*<AiChatBubble chatRoute="/ai-chat" />*/}
        </div>
    );
}
