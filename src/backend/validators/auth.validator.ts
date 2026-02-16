import { z } from 'zod';

export const loginValidatorSchema = z
  .object({
    type: z.enum(['strava', 'nrc'], {
      required_error: 'type is required',
      invalid_type_error: 'type must be a valid string',
    }),
    code: z.string().optional(),
  })
  .strict();

export const updateUserValidatorSchema = z
  .object({
    username: z
      .string()
      .min(3, 'username must be at least 3 characters')
      .max(25, 'username cannot exceed 25 characters')
      .regex(
        /^[a-zA-Z0-9_]+$/,
        'username can only contain letters, numbers, and underscores'
      )
      .optional(),
    avatar: z
      .any()
      .refine((file) => file instanceof File, 'avatar must be a valid file')
      .nullable()
      .optional(),
  })
  .strict();

export type LoginValidatorSchema = z.infer<typeof loginValidatorSchema>;
export type UpdateUserValidatorSchema = z.infer<
  typeof updateUserValidatorSchema
>;

export const validateLogin = (data: unknown) => {
  return loginValidatorSchema.parse(data);
};

export const safeValidateLogin = (data: unknown) => {
  return loginValidatorSchema.safeParse(data);
};
