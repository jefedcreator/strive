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

export type LoginValidatorSchema = z.infer<typeof loginValidatorSchema>;

export const validateLogin = (data: unknown) => {
  return loginValidatorSchema.parse(data);
};

export const safeValidateLogin = (data: unknown) => {
  return loginValidatorSchema.safeParse(data);
};
