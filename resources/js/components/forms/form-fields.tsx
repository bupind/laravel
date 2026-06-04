import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Controller, FieldValues, UseFormReturn } from 'react-hook-form';

interface FormFieldProps<T extends FieldValues> {
    form: UseFormReturn<T>;
    name: keyof T & string;
    label?: string;
    placeholder?: string;
    description?: string;
    disabled?: boolean;
    required?: boolean;
    className?: string;
}

interface TextInputProps<T extends FieldValues> extends FormFieldProps<T> {
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
}

interface TextAreaProps<T extends FieldValues> extends FormFieldProps<T> {
    rows?: number;
}

interface CheckboxProps<T extends FieldValues> extends FormFieldProps<T> {
    checkboxLabel?: string;
}

export function FormTextField<T extends FieldValues>({
    form,
    name,
    label,
    placeholder,
    description,
    disabled,
    required,
    type = 'text',
    className,
}: TextInputProps<T>) {
    const error = form.formState.errors[name]?.message as string | undefined;

    return (
        <div className={cn('space-y-2', className)}>
            {label && (
                <Label htmlFor={name}>
                    {label}
                    {required && <span className="text-destructive ml-1">*</span>}
                </Label>
            )}
            <Controller
                control={form.control}
                name={name}
                render={({ field }) => (
                    <Input
                        {...field}
                        id={name}
                        type={type}
                        placeholder={placeholder}
                        disabled={disabled || form.formState.isSubmitting}
                        className={cn(error && 'border-destructive')}
                    />
                )}
            />
            {error && <p className="text-destructive text-sm">{error}</p>}
            {description && <p className="text-muted-foreground text-xs">{description}</p>}
        </div>
    );
}

export function FormTextArea<T extends FieldValues>({
    form,
    name,
    label,
    placeholder,
    description,
    disabled,
    required,
    rows = 4,
    className,
}: TextAreaProps<T>) {
    const error = form.formState.errors[name]?.message as string | undefined;

    return (
        <div className={cn('space-y-2', className)}>
            {label && (
                <Label htmlFor={name}>
                    {label}
                    {required && <span className="text-destructive ml-1">*</span>}
                </Label>
            )}
            <Controller
                control={form.control}
                name={name}
                render={({ field }) => (
                    <Textarea
                        {...field}
                        id={name}
                        placeholder={placeholder}
                        disabled={disabled || form.formState.isSubmitting}
                        rows={rows}
                        className={cn(error && 'border-destructive')}
                    />
                )}
            />
            {error && <p className="text-destructive text-sm">{error}</p>}
            {description && <p className="text-muted-foreground text-xs">{description}</p>}
        </div>
    );
}

export function FormCheckbox<T extends FieldValues>({ form, name, label, checkboxLabel, description, disabled, className }: CheckboxProps<T>) {
    const error = form.formState.errors[name]?.message as string | undefined;

    return (
        <div className={cn('space-y-2', className)}>
            {label && <Label>{label}</Label>}
            <Controller
                control={form.control}
                name={name}
                render={({ field }) => (
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id={name}
                            checked={field.value ?? false}
                            onCheckedChange={field.onChange}
                            disabled={disabled || form.formState.isSubmitting}
                        />
                        {checkboxLabel && (
                            <Label htmlFor={name} className="font-normal">
                                {checkboxLabel}
                            </Label>
                        )}
                    </div>
                )}
            />
            {error && <p className="text-destructive text-sm">{error}</p>}
            {description && <p className="text-muted-foreground text-xs">{description}</p>}
        </div>
    );
}
