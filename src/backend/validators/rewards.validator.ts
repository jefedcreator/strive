import { z } from 'zod';
import { baseQueryValidatorSchema } from './index.validator';

export const rewardsQueryValidatorSchema = baseQueryValidatorSchema.partial().extend({

});

export type RewardsQueryValidatorSchema = z.infer<
  typeof rewardsQueryValidatorSchema
>;
