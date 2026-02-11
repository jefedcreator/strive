import { z } from "zod";

export const leaderboardValidatorSchema = z
  .object({
    name: z
      .string({
        required_error: "name is required",
        invalid_type_error: "name must be a valid string",
      })
      .min(1, "name cannot be empty")
      .max(255, "name cannot exceed 255 characters"),

    description: z
      .string({
        invalid_type_error: "description must be a valid string",
      })
      .nullable()
      .optional(),

    isPublic: z
      .boolean({
        invalid_type_error: "isPublic must be a boolean value",
      })
      .default(false)
      .optional(),

    isActive: z
      .boolean({
        invalid_type_error: "isActive must be a boolean value",
      })
      .default(true)
      .optional(),

    createdById: z
      .string({
        required_error: "createdById is required",
        invalid_type_error: "createdById must be a valid string",
      })
      .min(1, "createdById cannot be empty"),

    clubId: z
      .number({
        invalid_type_error: "clubId must be a valid number",
      })
      .int("clubId must be an integer")
      .positive("clubId must be a positive number")
      .nullable()
      .optional(),

    userId: z
      .string({
        invalid_type_error: "userId must be a valid string",
      })
      .nullable()
      .optional(),
  })
  .strict();

export const updateLeaderboardValidatorSchema = z
  .object({
    id: z
      .number({
        required_error: "id is required for updates",
        invalid_type_error: "id must be a valid number",
      })
      .int("id must be an integer")
      .positive("id must be a positive number"),

    name: z
      .string({
        invalid_type_error: "name must be a valid string",
      })
      .min(1, "name cannot be empty")
      .max(255, "name cannot exceed 255 characters")
      .optional(),

    description: z
      .string({
        invalid_type_error: "description must be a valid string",
      })
      .nullable()
      .optional(),

    isPublic: z
      .boolean({
        invalid_type_error: "isPublic must be a boolean value",
      })
      .optional(),

    isActive: z
      .boolean({
        invalid_type_error: "isActive must be a boolean value",
      })
      .optional(),

    clubId: z
      .number({
        invalid_type_error: "clubId must be a valid number",
      })
      .int("clubId must be an integer")
      .positive("clubId must be a positive number")
      .nullable()
      .optional(),

    userId: z
      .string({
        invalid_type_error: "userId must be a valid string",
      })
      .nullable()
      .optional(),
  })
  .strict();

export const leaderboardQueryValidatorSchema = z
  .object({
    page: z
      .string()
      .transform((val) => parseInt(val, 10))
      .pipe(
        z
          .number({
            invalid_type_error: "page must be a valid number",
          })
          .int("page must be an integer")
          .min(1, "page must be at least 1"),
      )
      .default("1"),

    limit: z
      .string()
      .transform((val) => parseInt(val, 10))
      .pipe(
        z
          .number({
            invalid_type_error: "limit must be a valid number",
          })
          .int("limit must be an integer")
          .min(1, "limit must be at least 1")
          .max(100, "limit cannot exceed 100"),
      )
      .default("10"),

    search: z
      .string({
        invalid_type_error: "search must be a valid string",
      })
      .max(255, "search cannot exceed 255 characters")
      .optional(),

    isPublic: z
      .string()
      .transform((val) => val === "true")
      .pipe(
        z.boolean({
          invalid_type_error: "isPublic must be a boolean value",
        }),
      )
      .optional(),

    isActive: z
      .string()
      .transform((val) => val === "true")
      .pipe(
        z.boolean({
          invalid_type_error: "isActive must be a boolean value",
        }),
      )
      .optional(),

    clubId: z
      .string()
      .transform((val) => parseInt(val, 10))
      .pipe(
        z
          .number({
            invalid_type_error: "clubId must be a valid number",
          })
          .int("clubId must be an integer")
          .positive("clubId must be a positive number"),
      )
      .optional(),

    createdById: z
      .string({
        invalid_type_error: "createdById must be a valid string",
      })
      .optional(),

    sortBy: z
      .enum(["name", "createdAt", "updatedAt"], {
        errorMap: () => ({
          message: "sortBy must be one of: name, createdAt, updatedAt",
        }),
      })
      .default("createdAt")
      .optional(),

    sortOrder: z
      .enum(["asc", "desc"], {
        errorMap: () => ({
          message: "sortOrder must be either 'asc' or 'desc'",
        }),
      })
      .default("desc")
      .optional(),
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

// Usage examples:
// const validatedData = leaderboardValidatorSchema.parse(requestBody);
// const safeData = leaderboardValidatorSchema.safeParse(requestBody);

// For API route handlers:
export const validateLeaderboard = (data: unknown) => {
  return leaderboardValidatorSchema.parse(data);
};

export const validateLeaderboardUpdate = (data: unknown) => {
  return updateLeaderboardValidatorSchema.parse(data);
};

export const validateLeaderboardQuery = (data: unknown) => {
  return leaderboardQueryValidatorSchema.parse(data);
};

// Safe validation (returns success/error object)
export const safeValidateLeaderboard = (data: unknown) => {
  return leaderboardValidatorSchema.safeParse(data);
};

export const safeValidateLeaderboardUpdate = (data: unknown) => {
  return updateLeaderboardValidatorSchema.safeParse(data);
};

export const safeValidateLeaderboardQuery = (data: unknown) => {
  return leaderboardQueryValidatorSchema.safeParse(data);
};
