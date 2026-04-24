import type { NikeAuthResult } from '@/types';
import type { Prisma, User, UserType } from '@prisma/client';
import moment from 'moment';
import { db as prisma } from '@/server/db';
import { generateUsername } from 'unique-username-generator';
import jwt from 'jsonwebtoken';
import { signIn } from '@/server/auth';

class AuthService {
  async findOrCreateUser({
    type,
    token,
    email = '',
    fullname,
    avatar,
    refreshToken,
    tokenExpiresAt,
  }: NikeAuthResult & {
    refreshToken?: string;
    tokenExpiresAt?: number;
  }): Promise<Pick<User, 'id' | 'type' | 'fullname' | 'avatar' | 'email'>> {
    console.log('avatar', avatar);

    const user = await prisma.user.findFirst({
      where: {
        email,
      },
      select: {
        id: true,
        type: true,
        fullname: true,
        avatar: true,
        email: true,
      },
    });

    const data: Prisma.UserUpdateInput = {
      fullname: fullname ?? (await this.generateUniqueUsername()),
      type,
      access_token: token,
      lastLoginAt: new Date(),
      avatar: avatar ?? user?.avatar,
      ...(refreshToken && { refresh_token: refreshToken }),
      ...(tokenExpiresAt && { token_expires_at: tokenExpiresAt }),
    };

    console.log('data', data);
    console.log('userData', user);

    if (user?.type == type) {
      const updatedUser = await prisma.user.update({
        where: {
          id: user.id,
        },
        data,
      });
      return updatedUser;
    }

    try {
      const data: Prisma.UserCreateInput = {
        fullname: fullname ?? (await this.generateUniqueUsername()),
        type,
        email,
        avatar,
        access_token: token,
        lastLoginAt: new Date(),
        ...(refreshToken && { refresh_token: refreshToken }),
        ...(tokenExpiresAt && { token_expires_at: tokenExpiresAt }),
      };

      const createdUser = await prisma.user.create({
        data,
      });

      // Send welcome email to newly registered user
      if (createdUser.email) {
        // Use dynamic import to avoid potential circular dependencies if email service imports AuthService
        const { emailService } = await import('../email');
        void emailService.sendWelcomeEmail(
          createdUser.email,
          createdUser.fullname ?? 'Runner'
        );
      }

      return createdUser;
    } catch (error) {
      console.error('Error in findOrCreateUser:', error);
      throw error;
    }
  }

  async syncUserMemberships({
    user,
    clubId,
    leaderboardId,
    inviteId,
    rewardId,
  }: {
    user: Pick<User, 'id' | 'fullname'>;
    clubId?: string;
    leaderboardId?: string;
    inviteId?: string;
    rewardId?: string;
  }): Promise<void> {
    try {
      const transactions: any[] = [];
      const joinedClubIds = new Set<string>();

      // --- 1. Handle Direct Club Join ---
      if (clubId && inviteId) {
        const existingMember = await prisma.userClub.findUnique({
          where: {
            userId_clubId: {
              userId: user.id,
              clubId,
            },
          },
        });

        if (!existingMember) {
          const club = await prisma.club.findUnique({
            where: { id: clubId },
            select: { createdById: true, name: true },
          });

          const invite = await prisma.clubInvites.findUnique({
            where: { id: inviteId },
          });

          transactions.push(
            prisma.userClub.create({
              data: {
                userId: user.id,
                clubId,
                role: 'MEMBER',
                isActive: true,
              },
            }),
            prisma.notification.create({
              data: {
                userId: club?.createdById ?? '',
                message: `${user.fullname} joined your club ${club?.name}`,
                type: 'info',
              },
            }),
            prisma.club.update({
              where: { id: clubId },
              data: { memberCount: { increment: 1 } },
            })
          );

          joinedClubIds.add(clubId);

          if (invite?.userId) {
            transactions.push(
              prisma.clubInvites.delete({
                where: { id: inviteId },
              })
            );
          }
        }
      }

      // --- 2. Handle Leaderboard Join ---
      if (leaderboardId) {
        const existingEntry = await prisma.userLeaderboard.findUnique({
          where: {
            userId_leaderboardId: {
              userId: user.id,
              leaderboardId,
            },
          },
        });

        if (!existingEntry) {
          const leaderboard = await prisma.leaderboard.findUnique({
            where: { id: leaderboardId },
            select: { createdById: true, name: true, clubId: true },
          });

          transactions.push(
            prisma.userLeaderboard.create({
              data: {
                userId: user.id,
                leaderboardId,
              },
            }),
            prisma.notification.create({
              data: {
                userId: leaderboard?.createdById ?? '',
                message: `${user.fullname} joined your leaderboard ${leaderboard?.name}`,
                type: 'info',
              },
            })
          );

          // If leaderboard belongs to a club, ensure user is in that club too
          if (leaderboard?.clubId && !joinedClubIds.has(leaderboard.clubId)) {
            const lClubId = leaderboard.clubId;
            const existingMember = await prisma.userClub.findUnique({
              where: {
                userId_clubId: {
                  userId: user.id,
                  clubId: lClubId,
                },
              },
            });

            if (!existingMember) {
              const club = await prisma.club.findUnique({
                where: { id: lClubId },
                select: { createdById: true, name: true, isPublic: true },
              });

              if (club?.isPublic) {
                transactions.push(
                  prisma.userClub.create({
                    data: {
                      userId: user.id,
                      clubId: lClubId,
                      role: 'MEMBER',
                      isActive: true,
                    },
                  }),
                  prisma.notification.create({
                    data: {
                      userId: club?.createdById ?? '',
                      message: `${user.fullname} joined your club ${club?.name}`,
                      type: 'info',
                    },
                  }),
                  prisma.club.update({
                    where: { id: lClubId },
                    data: { memberCount: { increment: 1 } },
                  })
                );
                joinedClubIds.add(lClubId);
              } else {
                // Private club: generate a join request instead
                const existingInvite = await prisma.clubInvites.findFirst({
                  where: {
                    userId: user.id,
                    clubId: lClubId,
                  },
                });

                if (!existingInvite) {
                  transactions.push(
                    prisma.clubInvites.create({
                      data: {
                        userId: user.id,
                        clubId: lClubId,
                        isRequest: true,
                      },
                    }),
                    prisma.notification.create({
                      data: {
                        userId: club?.createdById ?? '',
                        message: `${user.fullname} wants to join your club ${club?.name}`,
                        type: 'club',
                        clubId: lClubId,
                      },
                    })
                  );
                }
              }
            }
          }

          // Handle leaderboard invite cleanup (if inviteId was for a leaderboard)
          if (inviteId) {
            const invite = await prisma.leaderboardInvites.findUnique({
              where: { id: inviteId },
            });
            if (invite?.userId) {
              transactions.push(
                prisma.leaderboardInvites.delete({
                  where: { id: inviteId },
                })
              );
            }
          }
        }
      }

      // --- 3. Handle Reward Claim & Club Join ---
      if (rewardId) {
        const reward = await prisma.reward.findUnique({
          where: { id: rewardId },
          include: {
            club: { select: { name: true, createdById: true, isPublic: true } },
          },
        });

        if (reward?.clubId) {
          const rClubId = reward.clubId;
          let isMemberOrJoined = joinedClubIds.has(rClubId);

          if (!isMemberOrJoined) {
            const existingMember = await prisma.userClub.findUnique({
              where: {
                userId_clubId: {
                  userId: user.id,
                  clubId: rClubId,
                },
              },
            });

            if (existingMember) {
              isMemberOrJoined = true;
            } else {
              // Join if public, otherwise request
              if (reward.club?.isPublic) {
                transactions.push(
                  prisma.userClub.create({
                    data: {
                      userId: user.id,
                      clubId: rClubId,
                      role: 'MEMBER',
                      isActive: true,
                    },
                  }),
                  prisma.notification.create({
                    data: {
                      userId: reward.club?.createdById ?? '',
                      message: `${user.fullname} joined your club ${reward.club?.name} to claim a reward`,
                      type: 'info',
                    },
                  }),
                  prisma.club.update({
                    where: { id: rClubId },
                    data: { memberCount: { increment: 1 } },
                  })
                );
                joinedClubIds.add(rClubId);
                isMemberOrJoined = true;
              } else {
                // Private club: generate a join request
                const existingInvite = await prisma.clubInvites.findFirst({
                  where: {
                    userId: user.id,
                    clubId: rClubId,
                  },
                });

                if (!existingInvite) {
                  transactions.push(
                    prisma.clubInvites.create({
                      data: {
                        userId: user.id,
                        clubId: rClubId,
                        isRequest: true,
                      },
                    }),
                    prisma.notification.create({
                      data: {
                        userId: reward.club?.createdById ?? '',
                        message: `${user.fullname} wants to join your club ${reward.club?.name} to claim a reward`,
                        type: 'club',
                        clubId: rClubId,
                      },
                    })
                  );
                }
              }
            }
          }

          // If the user is now a member (or was already one), claim the reward
          if (isMemberOrJoined) {
            transactions.push(
              prisma.userReward.upsert({
                where: {
                  userId_rewardId: { userId: user.id, rewardId: reward.id },
                },
                create: { userId: user.id, rewardId: reward.id },
                update: {},
              })
            );
          }
        }
      }

      if (transactions.length > 0) {
        await prisma.$transaction(transactions);
      }

      // If we joined a leaderboard, recalculate its positions
      if (leaderboardId) {
        // Use dynamic import to avoid potential circular dependencies
        const { recalculateLeaderboardPositions } = await import(
          '../leaderboards'
        );
        await recalculateLeaderboardPositions(leaderboardId);
      }
    } catch (error) {
      console.error('Error in syncUserMemberships:', error);
      throw error;
    }
  }

  async generateUserSession({
    id,
    email,
    avatar,
    type,
  }: {
    id: string;
    email: string;
    avatar: string | null;
    type: UserType;
  }) {
    try {
      const jwtPayload = { uid: id, email };
      const jwtExpirationTimeInSec = 30 * 60 * 60 * 24; // 30 Days
      const expiresAt = moment()
        .add(jwtExpirationTimeInSec, 'seconds')
        .toISOString();

      const auth_token = jwt.sign(jwtPayload, process.env.AUTH_SECRET!, {
        expiresIn: jwtExpirationTimeInSec,
      });

      await signIn('credentials', {
        userId: id,
        token: auth_token,
        image: avatar,
        type,
        redirect: false,
      });
    } catch (error) {
      console.error('Error in generateUserSession:', error);
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
