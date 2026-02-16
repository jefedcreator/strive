import type { User } from "@prisma/client";
import { type NextRequest } from "next/server";
import type z from "zod";

import type { LeaderboardQueryValidatorSchema } from "@/backend/validators/leaderboard.validator";

export type MiddlewareResponse =
  | { message: string; statusCode: number; next: boolean }
  | { statusCode: number; next: boolean; message?: undefined };

export type MiddlewareFunction<
  T = unknown,
  B = unknown,
  Q = QueryParameters,
> = (req: AuthRequest<T, B, Q>) => Promise<MiddlewareResponse>;

export interface I_JwtPayload {
  workspaceId: string;
  email: string;
  uid: string;
  permissions: any;
}

export type QueryParameters = LeaderboardQueryValidatorSchema;

export interface AuthRequest<T = unknown, B = unknown, Q = QueryParameters>
  extends NextRequest {
  parsedBody?: B;
  query?: Q;
  files?: Record<string, File>;
  validatedData?: T;
  user: User | null;
}

export interface ValidationResult {
  message?: string;
  statusCode: number;
  next: boolean;
  validatedData?: unknown;
  errors?: z.ZodError;
}
