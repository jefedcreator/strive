import { mongoIdValidator } from '@/utils';
import { z } from 'zod';
import { baseQueryValidatorSchema } from './index.validator';

export const clubValidatorSchema = z
  .object({
    name: z
      .string({
        required_error: 'name is required',
        invalid_type_error: 'name must be a valid string',
      })
      .min(1, 'name cannot be empty')
      .max(255, 'name cannot exceed 255 characters'),
    description: z
      .string({
        invalid_type_error: 'description must be a valid string',
      })
      .nullable()
      .optional(),
    image: z
      .custom<File>((file) => file instanceof File, {
        message: 'image must be a valid file',
      })
      .nullable()
      .optional(),
    slug: z
      .string({
        required_error: 'slug is required',
        invalid_type_error: 'slug must be a valid string',
      })
      .min(1, 'slug cannot be empty')
      .max(255, 'slug cannot exceed 255 characters')
      .regex(
        /^[a-z0-9-]+$/,
        'slug must only contain lowercase letters, numbers, and hyphens'
      ),
    isPublic: z
      .union([z.boolean(), z.string().transform((val) => val === 'true')])
      .default(true),
    isActive: z
      .union([z.boolean(), z.string().transform((val) => val === 'true')])
      .default(true),
  })
  .strict();

export const updateClubValidatorSchema = clubValidatorSchema.partial().strict();

export const clubQueryValidatorSchema = baseQueryValidatorSchema
  .partial()
  .extend({
    isPublic: z
      .preprocess((val) => {
        if (typeof val === 'string') return val === 'true';
        return val;
      }, z.boolean())
      .optional(),
    isActive: z
      .preprocess((val) => {
        if (typeof val === 'string') return val === 'true';
        return val;
      }, z.boolean())
      .optional(),
    createdById: mongoIdValidator.optional(),
  })
  .strict();

export const clubInviteValidatorSchema = z
  .object({
    userId: mongoIdValidator.optional(),
  })
  .strict();

export const acceptInviteValidatorSchema = z
  .object({
    userId: mongoIdValidator,
  })
  .strict();

export type ClubValidatorSchema = z.infer<typeof clubValidatorSchema>;
export type UpdateClubValidatorSchema = z.infer<
  typeof updateClubValidatorSchema
>;
export type ClubQueryValidatorSchema = z.infer<typeof clubQueryValidatorSchema>;
export type ClubInviteValidatorSchema = z.infer<
  typeof clubInviteValidatorSchema
>;
export type AcceptInviteValidatorSchema = z.infer<
  typeof acceptInviteValidatorSchema
>;
