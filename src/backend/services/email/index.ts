import { Resend } from 'resend';
import { env } from '@/env';
import RewardNotification from './templates/RewardNotification';

const resend = new Resend(env.RESEND_API_KEY);

export const sendRewardEmail = async (
  to: string,
  badgeType: string,
  leaderboardName: string,
  contextType: 'leaderboard' | 'challenge'
) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Strive <hello@yourstrive.com>', // Update this with the verified domain if applicable
      to,
      subject: `You won a ${badgeType} badge in ${leaderboardName}!`,
      react: RewardNotification({ badgeType, leaderboardName, contextType }),
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
