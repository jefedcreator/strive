import * as React from 'react';
import { Resend } from 'resend';
import { env } from '@/env';
import RewardNotification from './templates/RewardNotification';
import ClubMilestoneNotification from './templates/ClubMilestoneNotification';
import WelcomeNotification from './templates/WelcomeNotification';

const resend = new Resend(env.RESEND_API_KEY);

export const sendWelcomeEmail = async (to: string, fullname: string) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Strive <hello@usestrive.run>',
      to,
      subject: 'Welcome to Strive! 🚀',
      react: WelcomeNotification({ fullname }),
    });

    if (error) {
      console.error('Error sending welcome email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error sending welcome email:', error);
    return { success: false, error };
  }
};

export const sendRewardEmail = async (
  to: string,
  badgeType: string,
  leaderboardName: string,
  contextType: 'leaderboard' | 'challenge',
  badgeUrl?: string,
  rewardUrl?: string
) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Strive <hello@usestrive.run>', // Update this with the verified domain if applicable
      to,
      subject: `You won a ${badgeType} badge in ${leaderboardName}!`,
      react: RewardNotification({
        badgeType,
        leaderboardName,
        contextType,
        badgeUrl,
        rewardUrl,
      }),
    });

    if (error) {
      console.error('Error sending reward email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error sending reward email:', error);
    return { success: false, error };
  }
};

export const sendClubMilestoneEmail = async (
  to: string,
  clubName: string,
  milestoneKm: number,
  badgeUrl?: string,
  rewardUrl?: string
) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Strive <hello@usestrive.run>', // Update this with the verified domain if applicable
      to,
      subject: `Your club ${clubName} hit the ${milestoneKm}km milestone!`,
      react: ClubMilestoneNotification({
        clubName,
        milestoneKm,
        badgeUrl,
        rewardUrl,
      }),
    });

    if (error) {
      console.error('Error sending club milestone email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error sending club milestone email:', error);
    return { success: false, error };
  }
};
