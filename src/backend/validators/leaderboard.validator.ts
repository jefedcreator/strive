import { mongoIdValidator } from '@/utils';
import { z } from 'zod';
import { baseQueryValidatorSchema } from './index.validator';

export const leaderboardValidatorSchema = z
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
    expiryDate: z.coerce
      .date({
        invalid_type_error: 'expiryDate must be a valid date',
      })
      .min(new Date(), 'expiryDate cannot be in the past')
      .nullable()
      .optional(),
    clubId: mongoIdValidator.nullable().optional(),
  })
  .strict();

export const updateLeaderboardValidatorSchema = leaderboardValidatorSchema
  .partial()
  .strict();

export const leaderboardQueryValidatorSchema = baseQueryValidatorSchema
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
    clubId: mongoIdValidator.optional(),
    createdById: mongoIdValidator.optional(),
  })
  .strict();

export const leaderboardInviteValidatorSchema = z
  .object({
    userId: mongoIdValidator,
  })
  .strict();

export const acceptLeaderboardInviteValidatorSchema = z
  .object({
    userId: mongoIdValidator,
  })
  .strict();

export type LeaderboardValidatorSchema = z.infer<
  typeof leaderboardValidatorSchema
>;
export type UpdateLeaderboardValidatorSchema = z.infer<
  typeof updateLeaderboardValidatorSchema
>;
export type LeaderboardQueryValidatorSchema = z.infer<
  typeof leaderboardQueryValidatorSchema
>;
export type LeaderboardInviteValidatorSchema = z.infer<
  typeof leaderboardInviteValidatorSchema
>;
export type AcceptLeaderboardInviteValidatorSchema = z.infer<
  typeof acceptLeaderboardInviteValidatorSchema
>;
