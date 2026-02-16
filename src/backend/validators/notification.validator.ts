import { z } from 'zod';
import { baseQueryValidatorSchema } from './index.validator';
import { NotificationType } from '@prisma/client';

export const notificationQueryValidatorSchema = baseQueryValidatorSchema
  .partial()
  .extend({
    type: z
      .nativeEnum(NotificationType, {
        invalid_type_error: 'Invalid notification type',
      })
      .optional(),
    isRead: z
      .string()
      .transform((val) => val === 'true')
      .pipe(z.boolean())
      .optional(),
  })
  .strict();

export type NotificationQueryValidatorSchema = z.infer<
  typeof notificationQueryValidatorSchema
>;
