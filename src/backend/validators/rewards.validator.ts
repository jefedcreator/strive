import { z } from 'zod';
import { baseQueryValidatorSchema } from './index.validator';
import { mongoIdValidator } from '@/utils';

export const rewardsQueryValidatorSchema = baseQueryValidatorSchema
  .partial()
  .extend({});

export type RewardsQueryValidatorSchema = z.infer<
  typeof rewardsQueryValidatorSchema
>;

export const clubRewardParamValidator = z.object({
  id: mongoIdValidator,
  // rewardId: mongoIdValidator.optional(),
});

export type ClubRewardParamValidator = z.infer<typeof clubRewardParamValidator>;
