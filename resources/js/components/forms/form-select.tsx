import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Controller, FieldValues, UseFormReturn } from 'react-hook-form';

interface FormSelectProps<T extends FieldValues> {
    form: UseFormReturn<T>;
    name: keyof T & string;
    label?: string;
    placeholder?: string;
    description?: string;
    disabled?: boolean;
    required?: boolean;
    className?: string;
    options: Array<{ value: string | number; label: string }>;
}

export function FormSelect<T extends FieldValues>({
    form,
    name,
    label,
    placeholder,
    description,
    disabled,
    required,
    className,
    options,
}: FormSelectProps<T>) {
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
                    <Select value={String(field.value ?? '')} onValueChange={field.onChange} disabled={disabled || form.formState.isSubmitting}>
                        <SelectTrigger id={name} className={cn(error && 'border-destructive')}>
                            <SelectValue placeholder={placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                            {options.map((option) => (
                                <SelectItem key={option.value} value={String(option.value)}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            />
            {error && <p className="text-destructive text-sm">{error}</p>}
            {description && <p className="text-muted-foreground text-xs">{description}</p>}
        </div>
    );
}

interface FormMultiSelectProps<T extends FieldValues> {
    form: UseFormReturn<T>;
    name: keyof T & string;
    label?: string;
    description?: string;
    disabled?: boolean;
    required?: boolean;
    className?: string;
    options: Array<{ value: string | number; label: string }>;
    maxSelected?: number;
}

export function FormMultiSelect<T extends FieldValues>({
    form,
    name,
    label,
    description,
    disabled,
    required,
    className,
    options,
    maxSelected,
}: FormMultiSelectProps<T>) {
    const error = form.formState.errors[name]?.message as string | undefined;
    const selectedValues = (form.getValues(name) as (string | number)[]) || [];

    const handleSelectChange = (value: string | number) => {
        const current = selectedValues as (string | number)[];
        const newValues = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];

        if (maxSelected && newValues.length > maxSelected) {
            return;
        }

        form.setValue(name, newValues as any);
    };

    return (
        <div className={cn('space-y-2', className)}>
            {label && (
                <Label>
                    {label}
                    {required && <span className="text-destructive ml-1">*</span>}
                </Label>
            )}
            <div className={cn('space-y-2 rounded-md border p-3', error && 'border-destructive')}>
                {options.map((option) => (
                    <label key={option.value} className="flex cursor-pointer items-center gap-2">
                        <input
                            type="checkbox"
                            checked={selectedValues.includes(option.value)}
                            onChange={() => handleSelectChange(option.value)}
                            disabled={disabled || form.formState.isSubmitting}
                            className="rounded border-gray-300"
                        />
                        <span className="text-sm">{option.label}</span>
                    </label>
                ))}
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
            {description && <p className="text-muted-foreground text-xs">{description}</p>}
        </div>
    );
}
