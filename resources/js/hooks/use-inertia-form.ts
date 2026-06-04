import { zodResolver } from '@hookform/resolvers/zod';
import { router, useForm as useInertiaForm } from '@inertiajs/react';
import { FieldValues, useForm as useReactHookForm, UseFormReturn } from 'react-hook-form';
import { ZodSchema } from 'zod';

interface UseInertiaFormWithSchemaProps<T extends FieldValues> {
    schema: ZodSchema;
    endpoint: string;
    method?: 'post' | 'put' | 'patch' | 'delete';
    defaultValues?: Partial<T>;
    onSuccess?: () => void;
    onError?: (errors: Record<string, string>) => void;
}

export function useInertiaFormWithSchema<T extends FieldValues>({
    schema,
    endpoint,
    method = 'post',
    defaultValues,
    onSuccess,
    onError,
}: UseInertiaFormWithSchemaProps<T>) {
    const form = useReactHookForm<T>({
        resolver: zodResolver(schema),
        defaultValues: defaultValues as T,
        mode: 'onBlur',
    });

    const inertiaForm = useInertiaForm({
        ...defaultValues,
    });

    const handleSubmit = form.handleSubmit(
        async (data) => {
            const submitMethod = {
                post: () => router.post(endpoint, data),
                put: () => router.put(endpoint, data),
                patch: () => router.patch(endpoint, data),
                delete: () => router.delete(endpoint),
            };

            submitMethod[method]();

            onSuccess?.();
        },
        (errors) => {
            onError?.(errors as Record<string, string>);
        },
    );

    return {
        form,
        inertiaForm,
        handleSubmit,
        isSubmitting: form.formState.isSubmitting || inertiaForm.processing,
    };
}

export function useFormWithServerValidation<T extends FieldValues>(
    schema: ZodSchema,
    onSubmit: (data: T) => void | Promise<void>,
): UseFormReturn<T> & { onSubmit: (callback: (data: T) => void | Promise<void>) => (e: React.FormEvent) => Promise<void> } {
    const form = useReactHookForm<T>({
        resolver: zodResolver(schema),
        mode: 'onBlur',
    });

    const submitHandler = form.handleSubmit(async (data) => {
        try {
            await onSubmit(data);
        } catch (error) {
            if (error instanceof Error) {
                form.setError('root', { message: error.message });
            }
        }
    });

    return {
        ...form,
        onSubmit: (callback) => submitHandler,
    };
}
