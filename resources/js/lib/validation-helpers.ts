import { z } from 'zod';

type TranslateFn = (key: string, options?: Record<string, any>) => string;

export function createValidationSchemas(t: TranslateFn) {
    return {
        loginSchema: z.object({
            email: z.string().email(t('validation.email')),
            password: z.string().min(6, t('validation.passwordMinLength')),
        }),

        registerSchema: z
            .object({
                name: z.string().min(1, t('validation.nameRequired')).max(255, t('validation.nameTooLong')),
                email: z.string().email(t('validation.email')),
                password: z.string().min(6, t('validation.passwordMinLength')),
                password_confirmation: z.string(),
            })
            .refine((data) => data.password === data.password_confirmation, {
                message: t('validation.passwordMismatch'),
                path: ['password_confirmation'],
            }),

        userSchema: z.object({
            name: z.string().min(1, t('validation.nameRequired')).max(255, t('validation.nameTooLong')),
            email: z.string().email(t('validation.email')),
            password: z.string().optional().default(''),
            roles: z.array(z.string()).default([]),
        }),

        userUpdateSchema: z.object({
            name: z.string().min(1, t('validation.nameRequired')).max(255, t('validation.nameTooLong')),
            email: z.string().email(t('validation.email')),
            password: z.string().optional().default(''),
            roles: z.array(z.string()).default([]),
        }),

        roleSchema: z.object({
            name: z.string().min(1, t('validation.roleNameRequired')).max(255),
            display_name: z.string().min(1, t('validation.displayNameRequired')).max(255),
            description: z.string().optional().default(''),
            permissions: z.array(z.string()).default([]),
        }),

        permissionSchema: z.object({
            name: z.string().min(1, t('validation.permissionNameRequired')).max(255),
            display_name: z.string().min(1, t('validation.displayNameRequired')).max(255),
            description: z.string().optional().default(''),
        }),

        changePasswordSchema: z
            .object({
                current_password: z.string().min(1, t('validation.currentPasswordRequired')),
                password: z.string().min(6, t('validation.passwordMinLength')),
                password_confirmation: z.string(),
            })
            .refine((data) => data.password === data.password_confirmation, {
                message: t('validation.passwordMismatch'),
                path: ['password_confirmation'],
            }),

        profileSchema: z.object({
            name: z.string().min(1, t('validation.nameRequired')).max(255),
            email: z.string().email(t('validation.email')),
        }),
    };
}

export const fallbackValidationSchemas = {
    loginSchema: z.object({
        email: z.string().email('Invalid email'),
        password: z.string().min(6, 'Password must be at least 6 characters'),
    }),

    registerSchema: z
        .object({
            name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
            email: z.string().email('Invalid email'),
            password: z.string().min(6, 'Password must be at least 6 characters'),
            password_confirmation: z.string(),
        })
        .refine((data) => data.password === data.password_confirmation, {
            message: 'Passwords do not match',
            path: ['password_confirmation'],
        }),

    userSchema: z.object({
        name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
        email: z.string().email('Invalid email'),
        password: z.string().optional().default(''),
        roles: z.array(z.string()).default([]),
    }),

    userUpdateSchema: z.object({
        name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
        email: z.string().email('Invalid email'),
        password: z.string().optional().default(''),
        roles: z.array(z.string()).default([]),
    }),

    roleSchema: z.object({
        name: z.string().min(1, 'Role name is required').max(255),
        display_name: z.string().min(1, 'Display name is required').max(255),
        description: z.string().optional().default(''),
        permissions: z.array(z.string()).default([]),
    }),

    permissionSchema: z.object({
        name: z.string().min(1, 'Permission name is required').max(255),
        display_name: z.string().min(1, 'Display name is required').max(255),
        description: z.string().optional().default(''),
    }),

    changePasswordSchema: z
        .object({
            current_password: z.string().min(1, 'Current password is required'),
            password: z.string().min(6, 'Password must be at least 6 characters'),
            password_confirmation: z.string(),
        })
        .refine((data) => data.password === data.password_confirmation, {
            message: 'Passwords do not match',
            path: ['password_confirmation'],
        }),

    profileSchema: z.object({
        name: z.string().min(1, 'Name is required').max(255),
        email: z.string().email('Invalid email'),
    }),
};

export type LoginFormData = z.infer<typeof fallbackValidationSchemas.loginSchema>;
export type RegisterFormData = z.infer<typeof fallbackValidationSchemas.registerSchema>;
export type UserFormData = z.infer<typeof fallbackValidationSchemas.userSchema>;
export type UserUpdateFormData = z.infer<typeof fallbackValidationSchemas.userUpdateSchema>;
export type RoleFormData = z.infer<typeof fallbackValidationSchemas.roleSchema>;
export type PermissionFormData = z.infer<typeof fallbackValidationSchemas.permissionSchema>;
export type ChangePasswordFormData = z.infer<typeof fallbackValidationSchemas.changePasswordSchema>;
export type ProfileFormData = z.infer<typeof fallbackValidationSchemas.profileSchema>;
