'use client';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { type Appearance, useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';
import { Monitor, Moon, Sun } from 'lucide-react';
import { JSX, useState } from 'react';

export function AppearanceDropdown() {
    const { appearance, updateAppearance } = useAppearance();
    const [open, setOpen] = useState(false);

    const items: {
        value: Appearance;
        label: string;
        icon: JSX.Element;
    }[] = [
        {
            value: 'light',
            label: 'Light',
            icon: <Sun className="h-4 w-4 text-yellow-400" />,
        },
        {
            value: 'dark',
            label: 'Dark',
            icon: <Moon className="h-4 w-4 text-purple-400" />,
        },
        {
            value: 'system',
            label: 'System',
            icon: <Monitor className="h-4 w-4 text-blue-400" />,
        },
    ];

    const current = items.find((item) => item.value === appearance);

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn('border-border/50 rounded-full border shadow-sm transition-colors', open && 'bg-muted/50')}
                            aria-label="Change Theme"
                        >
                            {current?.icon || <Monitor className="h-4 w-4" />}
                        </Button>
                    </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs font-medium">
                    Change Theme
                </TooltipContent>
            </Tooltip>

            <DropdownMenuContent align="end" className="w-40 rounded-md shadow-lg">
                {items.map((item) => (
                    <DropdownMenuItem
                        key={item.value}
                        onClick={() => updateAppearance(item.value)}
                        className={cn(
                            'flex cursor-pointer items-center gap-2 py-2 text-sm',
                            appearance === item.value ? 'text-primary bg-muted/40 font-semibold' : 'text-muted-foreground hover:bg-muted/20',
                        )}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
