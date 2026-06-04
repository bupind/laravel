import z from 'zod';
import { fallbackValidationSchemas as schemas } from './validation-helpers';

export { createValidationSchemas } from './validation-helpers';

export const loginSchema = schemas.loginSchema;
export const registerSchema = schemas.registerSchema;
export const userSchema = schemas.userSchema;
export const userUpdateSchema = schemas.userUpdateSchema;
export const roleSchema = schemas.roleSchema;
export const permissionSchema = schemas.permissionSchema;
export const changePasswordSchema = schemas.changePasswordSchema;
export const profileSchema = schemas.profileSchema;

export type LoginFormData = schemas.loginSchema extends z.ZodType<infer T> ? T : never;
export type RegisterFormData = schemas.registerSchema extends z.ZodType<infer T> ? T : never;
export type UserFormData = schemas.userSchema extends z.ZodType<infer T> ? T : never;
export type UserUpdateFormData = schemas.userUpdateSchema extends z.ZodType<infer T> ? T : never;
export type RoleFormData = schemas.roleSchema extends z.ZodType<infer T> ? T : never;
export type PermissionFormData = schemas.permissionSchema extends z.ZodType<infer T> ? T : never;
export type ChangePasswordFormData = schemas.changePasswordSchema extends z.ZodType<infer T> ? T : never;
export type ProfileFormData = schemas.profileSchema extends z.ZodType<infer T> ? T : never;
