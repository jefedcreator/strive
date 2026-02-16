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
      .any()
      .refine((file) => file instanceof File, 'image must be a valid file')
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
      .boolean({
        invalid_type_error: 'isPublic must be a boolean value',
      })
      .default(false)
      .optional(),
    isActive: z
      .boolean({
        invalid_type_error: 'isActive must be a boolean value',
      })
      .default(true)
      .optional(),
  })
  .strict();

export const updateClubValidatorSchema = clubValidatorSchema.partial().strict();

export const clubQueryValidatorSchema = baseQueryValidatorSchema
  .partial()
  .extend({
    isPublic: z
      .string()
      .transform((val) => val === 'true')
      .pipe(
        z.boolean({
          invalid_type_error: 'isPublic must be a boolean value',
        })
      )
      .optional(),
    isActive: z
      .string()
      .transform((val) => val === 'true')
      .pipe(
        z.boolean({
          invalid_type_error: 'isActive must be a boolean value',
        })
      )
      .optional(),
    createdById: mongoIdValidator.optional(),
  })
  .strict();

export type ClubValidatorSchema = z.infer<typeof clubValidatorSchema>;
export type UpdateClubValidatorSchema = z.infer<
  typeof updateClubValidatorSchema
>;
export type ClubQueryValidatorSchema = z.infer<typeof clubQueryValidatorSchema>;
