import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback } from 'react';
import { FieldValues, Path, useForm as useReactHookForm, UseFormProps, UseFormReturn } from 'react-hook-form';
import { ZodSchema } from 'zod';

interface UseFormWithSchemaProps<T extends FieldValues> extends Omit<UseFormProps<T>, 'resolver'> {
    schema: ZodSchema;
    onSuccess?: (data: T) => void | Promise<void>;
    onError?: (error: unknown) => void;
}

export function useFormWithSchema<T extends FieldValues>({
    schema,
    onSuccess,
    onError,
    ...props
}: UseFormWithSchemaProps<T>): UseFormReturn<T> & {
    onSubmit: (callback: (data: T) => void | Promise<void>) => (e: React.FormEvent) => Promise<void>;
} {
    const form = useReactHookForm<T>({
        ...props,
        resolver: zodResolver(schema),
        mode: 'onBlur',
    });

    const onSubmit = useCallback(
        (callback: (data: T) => void | Promise<void>) => {
            return form.handleSubmit(
                async (data) => {
                    try {
                        await callback(data);
                        onSuccess?.(data);
                    } catch (error) {
                        onError?.(error);
                        throw error;
                    }
                },
                (errors) => {
                    console.error('Form validation errors:', errors);
                    onError?.(errors);
                },
            );
        },
        [form, onSuccess, onError],
    );

    return {
        ...form,
        onSubmit,
    };
}

export function getFieldError<T extends FieldValues>(errors: Record<string, any>, fieldName: Path<T>): string | undefined {
    const parts = String(fieldName).split('.');
    let current: any = errors;

    for (const part of parts) {
        current = current?.[part];
    }

    return current?.message;
}

export function getFieldValue<T extends FieldValues>(data: T, fieldName: Path<T>): any {
    const parts = String(fieldName).split('.');
    let current: any = data;

    for (const part of parts) {
        current = current?.[part];
    }

    return current;
}
