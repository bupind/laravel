import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { useLanguage } from '@/hooks/use-language';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
    {
        variants: {
            variant: {
                default: 'bg-primary text-primary-foreground hover:bg-primary/90',
                destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
                outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
                secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
                ghost: 'hover:bg-accent hover:text-accent-foreground',
                link: 'text-primary underline-offset-4 hover:underline',
            },
            size: {
                default: 'h-10 px-4 py-2',
                sm: 'h-9 rounded-md px-3',
                lg: 'h-11 rounded-md px-8',
                icon: 'h-10 w-10',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

const buttonTranslationKeys: Record<string, string> = {
    Add: 'buttons.add',
    'Adding...': 'buttons.creating',
    Back: 'buttons.back',
    Batal: 'buttons.cancel',
    Berikutnya: 'buttons.next',
    Cancel: 'buttons.cancel',
    Choose: 'buttons.choose',
    Clear: 'buttons.clear',
    'Clear filters': 'buttons.clearFilters',
    Create: 'buttons.create',
    'Delete account': 'buttons.deleteAccount',
    Delete: 'buttons.delete',
    Download: 'buttons.download',
    Export: 'buttons.export',
    Hapus: 'buttons.delete',
    Kembali: 'buttons.back',
    'Log in': 'buttons.login',
    'Membuat...': 'buttons.creating',
    'Menyimpan...': 'buttons.saving',
    Next: 'buttons.next',
    Prev: 'buttons.previous',
    Save: 'buttons.save',
    'Save Changes': 'buttons.save',
    'Save password': 'buttons.save',
    Search: 'buttons.search',
    Sebelumnya: 'buttons.previous',
    Sinkron: 'buttons.sync',
    'Sinkronisasi Semua': 'buttons.sync',
    Update: 'buttons.update',
    Upload: 'buttons.upload',
    'Upload the first file': 'buttons.uploadFirstFile',
    'Uploading...': 'buttons.uploading',
};

function translateButtonChildren(children: React.ReactNode, t: (key: string) => string): React.ReactNode {
    return React.Children.map(children, (child) => {
        if (typeof child === 'string') {
            const translationKey = buttonTranslationKeys[child.trim()];

            return translationKey ? t(translationKey) : child;
        }

        if (React.isValidElement<{ children?: React.ReactNode }>(child) && child.props.children) {
            return React.cloneElement(child, undefined, translateButtonChildren(child.props.children, t));
        }

        return child;
    });
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
    const { t } = useLanguage();
    const Comp = asChild ? Slot : 'button';
    const children = translateButtonChildren(props.children, t);

    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}>{children}</Comp>;
});
Button.displayName = 'Button';

export { Button, buttonVariants };
