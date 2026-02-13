import { type NextRequest, NextResponse } from "next/server";
import { stravaService } from "@/backend/services/strava";
import { authService } from "@/backend/services/auth";
import { signIn } from "@/server/auth";
import jwt from "jsonwebtoken";
import moment from "moment";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");

    if (!code) {
        return NextResponse.redirect(new URL("/login?error=no_code", request.url));
    }

    try {
        const { auth, user: stravaUser } = await stravaService.exchangeToken(code);
        const user = await authService.findOrCreateUser({
            type: "STRAVA",
            email: stravaUser.email,
            username: stravaUser.fullName,
            avatar: stravaUser.avatar,
            token: auth.accessToken,
        });



        const jwtPayload = { uid: user.id, email: user.email };
        const jwtExpirationTimeInSec = 1 * 60 * 60 * 24; // 24 Hours
        const expiresAt = moment().add(jwtExpirationTimeInSec, "seconds").toISOString();

        const auth_token = jwt.sign(jwtPayload, process.env.AUTH_SECRET!, {
            expiresIn: jwtExpirationTimeInSec,
        });

        console.log('accessToken', auth_token);


        await signIn("credentials", {
            userId: user.id,
            token: auth_token,
            redirect: false,
        });


        return NextResponse.redirect(new URL("/home", request.url));

    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.redirect(new URL("/login?error=auth_failed", request.url));
    }
}