import { schemaValidatorMiddleware, withMiddleware } from "@/backend/middleware";
import { authService } from "@/backend/services/auth";
import { puppeteerService } from "@/backend/services/puppeteer";
import { stravaService } from "@/backend/services/strava";
import { loginValidatorSchema, type LoginValidatorSchema } from "@/backend/validators/auth.validator";
import jwt from "jsonwebtoken";
import moment from "moment";

/**
 * @body LoginValidatorSchema
 * @bodyDescription Authenticates a user and returns a JWT token. Currently supports Nike (NRC) login via puppeteer
 * @tag login
 */
export const POST = withMiddleware<LoginValidatorSchema>(
    async (request) => {
        const payload = request.validatedData;
        let user;

        // ---------------------------------------------------------
        // 1. STRAVA HANDLER (Two-Step Flow)
        // ---------------------------------------------------------
        if (payload?.type === "strava") {
            if (!payload.code) {
                const authorizationUrl = stravaService.getAuthorizationUrl();
                return Response.json({
                    status: 200,
                    action: "redirect", 
                    url: authorizationUrl
                });
            }
        }

        // ---------------------------------------------------------
        // 2. NRC HANDLER (One-Step Flow)
        // ---------------------------------------------------------
        else if (payload?.type === "nrc") {
            // NRC is automated/synchronous, so we just do it all at once
            const { email, token, username } = await puppeteerService.captureNikeAuth();

            if (!email || !token || !username) {
                throw new Error("Missing required user information from Nike authentication.");
            }

            user = await authService.findOrCreateUser({
                type: "NRC",
                email,
                token,
                username
            });
        }

        else {
            throw new Error("Invalid login type provided.");
        }

        // ---------------------------------------------------------
        // 3. GENERATE SESSION (JWT)
        // ---------------------------------------------------------
        if (!user) {
            throw new Error("User authentication failed.");
        }

        const jwtPayload = { uid: user.id, email: user.email };
        const jwtExpirationTimeInSec = 1 * 60 * 60 * 24; // 24 Hours
        const expiresAt = moment().add(jwtExpirationTimeInSec, "seconds").toISOString();

        const auth_token = jwt.sign(jwtPayload, process.env.AUTH_SECRET!, {
            expiresIn: jwtExpirationTimeInSec,
        });

        return Response.json(
            {
                status: 201,
                data: {
                    ...user,
                    token: auth_token,
                    expiresAt
                },
            },
            { status: 201 }
        );
    },
    [schemaValidatorMiddleware(loginValidatorSchema)]
);
