import { db } from "@/server/db";
import { parseHttpError } from "@/utils";
import { NextResponse } from "next/server";
import { z } from "zod";
import jwt from "jsonwebtoken";
import type {
  AuthRequest,
  I_JwtPayload,
  MiddlewareFunction,
  ValidationResult,
  QueryParameters,
  MiddlewareResponse,
} from "./types";

const querySchema = z
  .object({
    page: z.string().optional(),
    size: z.string().optional(),
    query: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    clubId: z.string().optional(),
    createdById: z.string().optional(),
    isPublic: z.string().optional(),
    isActive: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.string().optional(),
  })
  .strict();

/**
 *
 * @param handler (request: AuthRequest) => Promise<Response>
 *
 * @param middlewares MiddlewareFunction[]
 *
 * @returns
 */

export const withMiddleware = <
  T = unknown,
  B = unknown,
  Q = QueryParameters,
>(
  handler: (
    request: AuthRequest<T, B, Q>,
    context: { params: Record<string, string> },
  ) => Promise<Response>,
  middlewares: MiddlewareFunction<T, B, Q>[],
) => {
  return async (
    request: AuthRequest<T, B, Q>,
    context: { params: Promise<Record<string, string>> },
  ) => {
    try {
      // Parse Query Parameters
      const searchParams = request.nextUrl.searchParams;
      const query: Record<string, string> = {};
      searchParams.forEach((value, key) => {
        query[key] = value;
      });
      request.query = query as Q;

      const contentType =
        request.headers.get("content-type") ?? "application/json";

      if (contentType.includes("application/json")) {
        const body = (await request.json().catch(() => null)) as B;
        if (body) {
          request.parsedBody = body;
          request.files = {};
        }
      } else if (contentType.includes("multipart/form-data")) {
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
        console.log("parsedBody", parsedBody);

        request.parsedBody = parsedBody as B;
        request.files = files;
      }
    } catch (error) {
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
      console.error("Middleware error:", error);
      return NextResponse.json(
        { message: parseHttpError(error) ?? "Internal server error" },
        { status: 500 },
      );
    }

    try {
      const resolvedParams = await context.params;
      return handler(request, { params: resolvedParams });
    } catch (error: unknown) {
      console.error("Handler error:", error);
      return NextResponse.json(
        { message: parseHttpError(error) ?? "Internal server error" },
        { status: 500 },
      );
    }
  };
};

/**
 *
 * @param request AuthRequest
 *
 * @returns
 */
export const authMiddleware = async <
  T = unknown,
  B = unknown,
  Q = QueryParameters,
>(
  request: AuthRequest<T, B, Q>,
): Promise<MiddlewareResponse> => {
  const token = request.headers.get("authorization")!;

  try {
    if (!token) {
      return {
        message: "Unauthorized",
        statusCode: 401,
        next: false,
      };
    }

    const auth_token = token?.split("Bearer")[1];
    if (!auth_token) {
      return {
        message: "Invalid auth token format",
        statusCode: 401,
        next: false,
      };
    }

    const decoded = jwt.verify(
      auth_token.trim(),
      process.env.AUTH_SECRET!,
    ) as I_JwtPayload;

    if (!decoded || !decoded.uid) {
      return {
        message: "Unauthorized",
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
        message: "User not found",
        statusCode: 401,
        next: false,
      };
    }

    request.user = user;
  } catch (error) {
    console.error(error);
    return {
      message: "Invalid auth token",
      statusCode: 401,
      next: false,
    };
  }

  return {
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
export const queryMiddleware = async <
  T = unknown,
  B = unknown,
  Q = QueryParameters,
>(
  request: AuthRequest<T, B, Q>,
): Promise<MiddlewareResponse> => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      query[key] = value;
    });

    const result = querySchema.safeParse(query);

    if (!result.success) {
      const firstError = result.error.issues[0];
      const errorPath = firstError?.path.join(".");

      return {
        message: errorPath
          ? `Invalid query parameter: ${errorPath}`
          : "Invalid query parameters",
        statusCode: 422,
        next: false,
      };
    }

    request.query = result.data as Q;
  } catch (error) {
    console.error(error);
    return {
      message: "Error parsing query parameters",
      statusCode: 400,
      next: false,
    };
  }

  return {
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

export const schemaValidatorMiddleware =
  <T extends z.ZodTypeAny>(schema: T) =>
  async (
    request: AuthRequest<z.infer<T>, unknown, unknown>,
  ): Promise<MiddlewareResponse> => {
    const body = request.parsedBody ?? {};
    const query = request.query ?? {};
    const files = (request.files as Record<string, unknown>) ?? {};

    const dataToValidate = {
      ...(body as Record<string, unknown>),
      ...(query as Record<string, unknown>),
      ...files,
    };
    const result = schema.safeParse(dataToValidate);

    if (result.success) {
      request.validatedData = result.data;

      return {
        statusCode: 200,
        next: true,
      };
    } else {
      const firstError = result.error.issues[0];
      const errorPath = firstError?.path.join(".");
      const errorMessage = firstError?.message;

      return {
        message: errorPath
          ? `${errorPath}: ${errorMessage}`
          : errorMessage ?? "Validation failed",
        statusCode: 422,
        next: false,
      };
    }
  };
