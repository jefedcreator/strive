import { NextRequest } from "next/server";
import type { DateRangeFilters } from "@/types";
import type z from "zod";
import type { User } from "@prisma/client";

export type MiddlewareFunction<T = any, B = any, Q = any> = (
  req: AuthRequest<T, B, Q>,
) => Promise<{ message?: string; statusCode: number; next: boolean }>;

export interface I_JwtPayload {
  workspaceId: string;
  email: string;
  uid: string;
  permissions: any;
}

export interface AuthRequest<T = any, B = any, Q = any> extends NextRequest {
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
  validatedData?: any;
  errors?: z.ZodError;
}
