import type { User } from '@prisma/client';
import { type NextRequest } from 'next/server';
import type z from 'zod';

import type { BaseQueryValidatorInput } from '@/backend/validators/index.validator';

export type MiddlewareResponse = {
  message: string;
  statusCode: number;
  next: boolean;
};

export type MiddlewareFunction<
  // T = unknown,
  B = unknown,
  Q = QueryParameters,
> = (req: AuthRequest<B, Q>) => Promise<MiddlewareResponse>;

export interface I_JwtPayload {
  workspaceId: string;
  email: string;
  uid: string;
  permissions: any;
}

export type QueryParameters = BaseQueryValidatorInput;

export interface AuthRequest<
  B = unknown,
  //  B = unknown
  Q = QueryParameters,
> extends NextRequest {
  parsedBody?: any;
  query?: Q;
  params?: Record<string, string>;
  files?: Record<string, File>;
  validatedData?: B;
  user: User | null;
}

export interface ValidationResult {
  message?: string;
  statusCode: number;
  next: boolean;
  validatedData?: unknown;
  errors?: z.ZodError;
}
