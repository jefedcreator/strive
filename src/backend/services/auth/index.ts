import type { Prisma, User, UserType } from "@prisma/client";
import prisma from "prisma";
import { generateUsername } from "unique-username-generator";

class AuthService {
    async findOrCreateUser(
        {
            type, token, email="", username, avatar, name
        }: {
            type: UserType,
            email: string,
            token: string | null,
            username: string | null,
            avatar?: string | null,
            name?: string | null,
        }
    ): Promise<User> {
        const user = await prisma.user.findFirst({
            where: {
                email,
            },
        });

        console.log('userData', user);

        if (user) {
            await prisma.user.update({
                where: {
                    id: user.id
                }, data: {
                    type,
                    access_token: token,
                    lastLoginAt: new Date(),
                    avatar: avatar ?? user.avatar,
                    name: name ?? user.name,
                }
            });
            return user;
        }

        try {
            const data: Prisma.UserCreateInput = {
                username,
                type,
                email,
                avatar,
                name,
                access_token: token,
                lastLoginAt: new Date(),
            };

            if (!username) {
                const generatedUsername = generateUsername();
                data.username = await this.checkUserName(generatedUsername);
            }

            const createdUser = await prisma.user.create({
                data,
            });

            return createdUser;
        } catch (error) {
            console.error('Error in findOrCreateUser:', error);
            throw error;
        }
    }

    private async checkUserName(
        baseUsername: string,
        attempts = 0,
    ): Promise<string> {
        const MAX_ATTEMPTS = 10;

        if (attempts >= MAX_ATTEMPTS) {
            const timestamp = Date.now().toString().slice(-6);
            const random = Math.floor(Math.random() * 10000)
                .toString()
                .padStart(4, '0');
            return `user${timestamp}${random}`.toLowerCase();
        }

        const isUsernameTaken = await prisma.user.findFirst({
            where: { username: baseUsername.toLowerCase() },
        });

        if (isUsernameTaken) {
            let newUserName: string;

            try {
                // You could use a utility here, but for now we'll just append a suffix
                const suffix = Math.floor(Math.random() * 10000)
                    .toString()
                    .padStart(4, '0');
                newUserName = `${baseUsername}${suffix}`.substring(0, 15);
            } catch {
                const suffix = Math.floor(Math.random() * 10000)
                    .toString()
                    .padStart(4, '0');
                newUserName = `${baseUsername}${suffix}`.substring(0, 15);
            }

            return this.checkUserName(newUserName, attempts + 1);
        }

        return baseUsername.toLowerCase();
    }
}

export const authService = new AuthService();
