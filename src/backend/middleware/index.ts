import { db } from '@/server/db';
import { parseHttpError } from '@/utils';
import { HttpException } from '@/utils/exceptions';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { type z } from 'zod';
import type {
  AuthRequest,
  I_JwtPayload,
  MiddlewareFunction,
  MiddlewareResponse,
  QueryParameters,
} from './types';

/**
 *
 * @param handler (request: AuthRequest) => Promise<Response>
 *
 * @param middlewares MiddlewareFunction[]
 *
 * @returns
 */

export const withMiddleware = <B = unknown, Q = QueryParameters>(
  handler: (
    request: AuthRequest<B, Q>,
    context: { params: Record<string, string> }
  ) => Promise<Response>,
  middlewares: MiddlewareFunction<B, Q>[]
) => {
  return async (
    req: NextResponse | Request | any,
    context: { params: Promise<Record<string, string>> } | any
  ) => {
    const request = req as AuthRequest<B, Q>;
    try {
      // Resolve and attach path parameters
      const resolvedParams = await (context?.params ?? Promise.resolve({}));
      request.params = resolvedParams;

      // Parse Query Parameters
      const searchParams = request.nextUrl?.searchParams || new URL(request.url).searchParams;
      const query: Record<string, string> = {};
      searchParams.forEach((value: string, key: string) => {
        query[key] = value;
      });
      request.query = query as Q;

      const contentType =
        request.headers.get('content-type') ?? 'application/json';

      if (contentType.includes('application/json')) {
        const body = (await request.json().catch(() => null)) as B;
        if (body) {
          request.parsedBody = body;
          request.files = {};
        }
      } else if (contentType.includes('multipart/form-data')) {
        const formData = await request.formData();
        const parsedBody: Record<string, unknown> = {};
        const files: Record<string, File> = {};

        for (const [key, value] of formData.entries()) {
          if (value instanceof File) {
            if (value.size > 0 && value.name) {
              files[key] = value;
            }
          } else {
            parsedBody[key] = value;
          }
        }
        console.log('parsedBody', parsedBody);

        request.parsedBody = parsedBody as B;
        request.files = files;
      }
    } catch (_error) {
      // Silently handle parsing errors
    }

    try {
      for (const middleware of middlewares) {
        const { next, message, statusCode } = await middleware(request);
        if (!next) {
          return NextResponse.json({ message }, { status: statusCode });
        }
      }
    } catch (error) {
      console.error('Middleware error:', error);
      return NextResponse.json(
        { message: parseHttpError(error) ?? 'Internal server error' },
        { status: 500 }
      );
    }

    try {
      return await handler(request, { params: request.params! });
    } catch (error: any) {
      console.error('Handler error:', error);
      const statusCode =
        error instanceof HttpException
          ? error.statusCode
          : (error.statusCode ?? 500);
      return NextResponse.json(
        { message: parseHttpError(error) ?? 'Internal server error' },
        { status: statusCode }
      );
    }
  };
};

/**
 * Validates path parameters using a Zod schema.
 * @param schema Zod schema to validate params against (e.g. z.object({ id: mongoIdValidator }))
 */
export const pathParamValidatorMiddleware =
  (schema: z.ZodObject<any>) =>
    async (request: AuthRequest<any, any>): Promise<MiddlewareResponse> => {
      const params = request.params ?? {};
      const result = schema.safeParse(params);

      if (result.success) {
        return {
          message: 'Invalid ID parameter',
          statusCode: 200,
          next: true,
        };
      } else {
        const firstError = result.error.issues[0];
        const errorPath = firstError?.path.join('.');
        const errorMessage = firstError?.message;

        return {
          message: errorPath
            ? `${errorPath}: ${errorMessage}`
            : (errorMessage ?? ''),
          statusCode: 422,
          next: false,
        };
      }
    };

/**
 *
 * @param request AuthRequest
 *
 * @returns
 */
export const authMiddleware = async <B = unknown, Q = QueryParameters>(
  request: AuthRequest<B, Q>
): Promise<MiddlewareResponse> => {
  const token = request.headers.get('authorization')!;

  try {
    if (!token) {
      return {
        message: 'Unauthorized',
        statusCode: 401,
        next: false,
      };
    }

    const auth_token = token?.split('Bearer')[1];
    if (!auth_token) {
      return {
        message: 'Invalid auth token format',
        statusCode: 401,
        next: false,
      };
    }

    const decoded = jwt.verify(
      auth_token.trim(),
      process.env.AUTH_SECRET!
    ) as I_JwtPayload;

    if (!decoded || !decoded.uid) {
      return {
        message: 'Unauthorized',
        statusCode: 401,
        next: false,
      };
    }

    const user = await db.user.findUnique({
      where: {
        id: decoded.uid,
      },
    });

    if (!user) {
      return {
        message: 'User not found',
        statusCode: 401,
        next: false,
      };
    }

    request.user = user;
  } catch (error) {
    console.error(error);
    return {
      message: 'Invalid auth token',
      statusCode: 401,
      next: false,
    };
  }

  return {
    message: '',
    statusCode: 200,
    next: true,
  };
};

/**
 *
 * @param request AuthRequest
 *
 * @returns
 */
export const queryValidatorMiddleware =
  <Q extends z.ZodTypeAny>(schema: Q) =>
    async (
      request: AuthRequest<unknown, z.infer<Q>>
    ): Promise<MiddlewareResponse> => {
      try {
        const searchParams = request.nextUrl.searchParams;
        const query: Record<string, string> = {};
        searchParams.forEach((value, key) => {
          query[key] = value;
        });

        const result = schema.safeParse(query);

        if (!result.success) {
          const errorPath = result.error.issues[0]?.message;

          return {
            message: errorPath
              ? `Invalid query parameter: ${errorPath}`
              : 'Invalid query parameters',
            statusCode: 422,
            next: false,
          };
        }

        request.query = result.data;
      } catch (error) {
        console.error(error);
        return {
          message: 'Error parsing query parameters',
          statusCode: 400,
          next: false,
        };
      }

      return {
        message: '',
        statusCode: 200,
        next: true,
      };
    };

/**
 *
 * @param request AuthRequest
 *
 * @returns
 */

export const bodyValidatorMiddleware =
  <B extends z.ZodTypeAny>(schema: B) =>
    async (
      request: AuthRequest<z.infer<B>, unknown>
    ): Promise<MiddlewareResponse> => {
      const body = request.parsedBody ?? {};
      // const query = request.query ?? {};
      const files = (request.files as Record<string, unknown>) ?? {};

      const dataToValidate = {
        ...(body as Record<string, unknown>),
        // ...(query as Record<string, unknown>),
        ...files,
      };
      const result = schema.safeParse(dataToValidate);

      if (result.success) {
        request.validatedData = result.data;

        return {
          message: '',
          statusCode: 200,
          next: true,
        };
      } else {
        const firstError = result.error.issues[0];
        const errorPath = firstError?.path.join('.');
        const errorMessage = firstError?.message;

        return {
          message: errorPath
            ? `${errorPath}: ${errorMessage}`
            : (errorMessage ?? 'Validation failed'),
          statusCode: 422,
          next: false,
        };
      }
    };
