import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useFormWithSchema } from '@/hooks/use-form-with-schema';
import { cn } from '@/lib/utils';
import React from 'react';
import { FieldValues } from 'react-hook-form';
import { ZodSchema } from 'zod';

interface FormLayoutProps<T extends FieldValues> {
    schema: ZodSchema;
    defaultValues?: Partial<T>;
    onSubmit: (data: T) => void | Promise<void>;
    title?: string;
    description?: string;
    isLoading?: boolean;
    submitLabel?: string;
    cancelLabel?: string;
    onCancel?: () => void;
    className?: string;
    children: (form: ReturnType<typeof useFormWithSchema<T>>) => React.ReactNode;
}

export function FormLayout<T extends FieldValues>({
    schema,
    defaultValues,
    onSubmit,
    title,
    description,
    isLoading,
    submitLabel = 'Submit',
    cancelLabel = 'Cancel',
    onCancel,
    className,
    children,
}: FormLayoutProps<T>) {
    const form = useFormWithSchema({
        schema,
        defaultValues: defaultValues as T,
        onSuccess: onSubmit,
    });

    const handleSubmit = form.onSubmit(onSubmit);

    return (
        <form onSubmit={handleSubmit} className={cn('w-full', className)}>
            <Card>
                {(title || description) && (
                    <>
                        <CardHeader className="pb-3">
                            {title && <CardTitle className="text-2xl">{title}</CardTitle>}
                            {description && <CardDescription>{description}</CardDescription>}
                        </CardHeader>
                        <Separator />
                    </>
                )}

                <CardContent className={cn(title || description ? 'pt-5' : 'pt-6')}>
                    <div className="space-y-6">{children(form)}</div>
                </CardContent>

                <div className="bg-muted/50 border-t px-6 py-4">
                    <div className="flex justify-end gap-3">
                        {onCancel && (
                            <Button type="button" variant="outline" onClick={onCancel} disabled={form.formState.isSubmitting || isLoading}>
                                {cancelLabel}
                            </Button>
                        )}
                        <Button type="submit" disabled={form.formState.isSubmitting || isLoading || !form.formState.isDirty}>
                            {form.formState.isSubmitting || isLoading ? (
                                <>
                                    <span className="animate-spin">⟳</span> {submitLabel}
                                </>
                            ) : (
                                submitLabel
                            )}
                        </Button>
                    </div>
                </div>
            </Card>
        </form>
    );
}

interface FormSectionProps<T extends FieldValues> {
    title?: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
}

export function FormSection({ title, description, children, className }: FormSectionProps<any>) {
    return (
        <div className={cn('space-y-4', className)}>
            {(title || description) && (
                <div>
                    {title && <h3 className="text-lg font-semibold">{title}</h3>}
                    {description && <p className="text-muted-foreground text-sm">{description}</p>}
                </div>
            )}
            <div className="space-y-4">{children}</div>
        </div>
    );
}

interface FormGridProps {
    children: React.ReactNode;
    columns?: 1 | 2 | 3;
    className?: string;
}

export function FormGrid({ children, columns = 1, className }: FormGridProps) {
    const gridClass = columns === 1 ? 'grid-cols-1' : columns === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

    return <div className={cn(`grid gap-4 ${gridClass}`, className)}>{children}</div>;
}
