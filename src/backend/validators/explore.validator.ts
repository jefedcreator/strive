import { z } from 'zod';
import { baseQueryValidatorSchema } from './index.validator';

export const exploreQueryValidatorSchema = baseQueryValidatorSchema
  .partial()
  .extend({
    type: z.enum(['clubs', 'leaderboards']).optional(),
  })
  .strict();

export type ExploreQueryValidatorSchema = z.infer<
  typeof exploreQueryValidatorSchema
>;
