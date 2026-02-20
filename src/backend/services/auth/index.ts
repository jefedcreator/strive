import type { Prisma, User, UserType } from '@prisma/client';
import prisma from 'prisma';
import { generateUsername } from 'unique-username-generator';

class AuthService {
  async findOrCreateUser({
    type,
    token,
    email = '',
    fullname,
    avatar,
  }: {
    type: UserType;
    email: string;
    token: string | null;
    fullname: string | null;
    avatar?: string | null;
  }): Promise<User> {
    const user = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    const data: Prisma.UserUpdateInput = {
      fullname: fullname ?? (await this.generateUniqueUsername()),
      type,
      access_token: token,
      lastLoginAt: new Date(),
      avatar: avatar ?? user?.avatar,
    };

    if (user?.type == type) {
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data,
      });
      return user;
    }

    console.log('userData', user);

    try {
      const data: Prisma.UserCreateInput = {
        fullname: fullname ?? (await this.generateUniqueUsername()),
        type,
        email,
        avatar,
        access_token: token,
        lastLoginAt: new Date(),
      };

      const createdUser = await prisma.user.create({
        data,
      });

      return createdUser;
    } catch (error) {
      console.error('Error in findOrCreateUser:', error);
      throw error;
    }
  }

  private async generateUniqueUsername(): Promise<string> {
    const generatedUsername = generateUsername();
    const uniqueUsername = await this.checkUserName(generatedUsername);
    return uniqueUsername;
  }

  private async checkUserName(
    baseUsername: string,
    attempts = 0
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
      where: { fullname: baseUsername.toLowerCase() },
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
