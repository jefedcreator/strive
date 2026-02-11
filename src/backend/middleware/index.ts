import { db } from "@/server/db";
import { parseHttpError } from "@/utils";
import { NextResponse } from "next/server";
import type z from "zod";
import type {
  AuthRequest,
  MiddlewareFunction,
  ValidationResult,
} from "./types";
/**
 *
 * @param handler (request: AuthRequest) => Promise<Response>
 *
 * @param middlewares MiddlewareFunction[]
 *
 * @returns
 */

export const withMiddleware = <T = any, B = any, Q = any>(
  handler: (
    request: AuthRequest<T, B, Q>,
    context: { params: Record<string, string> },
  ) => Promise<any>,
  middlewares: MiddlewareFunction<T, B, Q>[],
) => {
  return async (
    request: AuthRequest<T, B, Q>,
    context: { params: Promise<any> },
  ) => {
    try {
      // Parse Query Parameters
      const searchParams = request.nextUrl.searchParams;
      const query: Record<string, string> = {};
      searchParams.forEach((value, key) => {
        query[key] = value;
      });
      request.query = query as any;

      const contentType =
        request.headers.get("content-type") ?? "application/json";

      if (contentType.includes("application/json")) {
        const body = await request.json().catch(() => null);
        if (body) {
          request.parsedBody = body;
          request.files = {};
        }
      } else if (contentType.includes("multipart/form-data")) {
        const formData = await request.formData();
        const parsedBody: Record<string, any> = {};
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

        request.parsedBody = parsedBody as any;
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
    } catch (error: any) {
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
export const authMiddleware = async <T = any, B = any, Q = any>(
  request: AuthRequest<T, B, Q>,
  context?: any,
) => {
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
    //  const decoded = jwt.verify(auth_token?.trim(), JWT_SECRET!) as I_JwtPayload;
    // if (!decoded) {
    //   return {
    //     message: "Unauthorized",
    //     statusCode: 401,
    //     next: false,
    //   };
    // }

    const user = await db.user.findUnique({
      where: {
        id: "",
      },
    });

    if (!user) {
      return {
        message: "Unauthorized",
        statusCode: 401,
        next: false,
      };
    }
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
export const queryMiddleware = async <T = any, B = any, Q = any>(
  request: AuthRequest<T, B, Q>,
) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      query[key] = value;
    });
    request.query = query as any;
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
  <T>(schema: z.ZodSchema<T>) =>
  async (request: AuthRequest<T, any, any>): Promise<ValidationResult> => {
    const body = request.parsedBody ?? {};
    const query = request.query ?? {};
    const files = request.files ?? {};

    const dataToValidate = { ...body, ...query, ...files };
    const result = schema.safeParse(dataToValidate);

    if (result.success) {
      request.validatedData = result.data;

      return {
        statusCode: 200,
        next: true,
        validatedData: result.data,
      };
    } else {
      const firstError = result.error.issues[0];
      const errorPath = firstError?.path.join(".");
      const errorMessage = firstError?.message;

      return {
        message: errorPath ? `${errorPath}: ${errorMessage}` : errorMessage,
        statusCode: 422,
        next: false,
        errors: result.error,
      };
    }
  };
