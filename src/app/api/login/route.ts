import prisma from "prisma";
import { withMiddleware, schemaValidatorMiddleware } from "@/backend/middleware";
import type { AuthRequest } from "@/backend/middleware/types";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import moment from "moment";
import { loginValidatorSchema, type LoginValidatorSchema } from "@/backend/validators/auth.validator";
import { puppeteerService } from "@/backend/services/puppeteer";
import { authService } from "@/backend/services/auth";

/**
 * @body LoginValidatorSchema
 * @bodyDescription Authenticates a user and returns a JWT token. Currently supports Nike (NRC) login via puppeteer
 */
export const POST = withMiddleware<LoginValidatorSchema>(
    async (request) => {
        const payload = request.validatedData;

        if (payload?.type == "nrc") {
            const { email, token, username } = await puppeteerService.captureNikeAuth()
            if (!email || !token || !username) {
                throw new Error("Missing required user information from Nike authentication.");
            }
            const user = await authService.findOrCreateUser({
                type: "NRC", email, token, username
            })
            const jwtPayload = {
                uid: user.id,
                email: user.email,
            };
            const jwtExpirationTimeInSec = 1 * 60 * 60 * 24
            const expiresAt = moment().add(6, "hours").toISOString();

            const auth_token = jwt.sign(jwtPayload, process.env.AUTH_SECRET!, {
                expiresIn: jwtExpirationTimeInSec,
            });
            return Response.json(
                {
                    status: 201,
                    data: {
                        ...user,
                        token: auth_token, expiresAt
                    },
                },
                {
                    status: 201,
                }
            );
        }

    },
    [schemaValidatorMiddleware(loginValidatorSchema)]
);
