import { SidebarProvider } from '@/components/ui/sidebar';

interface AppShellProps {
    children: React.ReactNode;
    variant?: 'header' | 'sidebar';
}

const SIDEBAR_COOKIE_NAME = 'sidebar:state';

function readSidebarCookie(): boolean {
    if (typeof document === 'undefined') return true;
    const match = document.cookie.split('; ').find((row) => row.startsWith(`${SIDEBAR_COOKIE_NAME}=`));
    return match ? match.split('=')[1] !== 'false' : true;
}

export function AppShell({ children, variant = 'header' }: AppShellProps) {
    if (variant === 'header') {
        return <div className="flex min-h-screen w-full flex-col">{children}</div>;
    }
    return <SidebarProvider defaultOpen={readSidebarCookie()}>{children}</SidebarProvider>;
}
