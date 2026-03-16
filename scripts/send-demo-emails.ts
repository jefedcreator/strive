import 'dotenv/config';
import { RewardType } from '@prisma/client';
import { emailService } from '../src/backend/services/email'
const TARGET_EMAIL = 'jefiene77@gmail.com';

async function main() {
  console.log(`🚀 Starting demo email sequence to: ${TARGET_EMAIL}\n`);

  try {
    // 1. Welcome Email
    console.log('📬 Sending Welcome Email...');
    // const welcomeResult = await emailService.sendWelcomeEmail(TARGET_EMAIL, 'Jace');
    // console.log(`Result: ${welcomeResult.success ? '✅ Sent' : '❌ Failed'}`);

    // 2. Invite Email
    console.log('\n📬 Sending Invite Email (Leaderboard)...');
    // const inviteResult = await emailService.sendInviteEmail({
    //   to: TARGET_EMAIL,
    //   invitedByUsername: 'Elite Runner',
    //   invitedByEmail: 'elite@strive.app',
    //   entityName: 'Summer Marathon Prep',
    //   entityType: 'leaderboard',
    //   inviteLink: 'https://usestrive.run/join/summer-marathon',
    //   invitedUserAvatar: null,
    // });
    // console.log(`Result: ${inviteResult.success ? '✅ Sent' : '❌ Failed'}`);

    // 3. Reward Notification (Gold)
    console.log('\n📬 Sending Reward Notification (Gold)...');
    const rewardResult = await emailService.sendRewardEmail(
      TARGET_EMAIL,
      RewardType.SILVER,
      'Strive Global Leaderboard',
      'leaderboard'
    );
    console.log(`Result: ${rewardResult.success ? '✅ Sent' : '❌ Failed'}`);

    // 4. Club Milestone Notification
    console.log('\n📬 Sending Club Milestone Notification...');
    // const milestoneResult = await emailService.sendClubMilestoneEmail(
    //   TARGET_EMAIL,
    //   'Urban Sprinters Club',
    //   5000 // 5000km milestone
    // );
    // console.log(`Result: ${milestoneResult.success ? '✅ Sent' : '❌ Failed'}`);

    console.log('\n✨ All demo emails processed!');
  } catch (error) {
    console.error('\n💥 Critical error in send-demo-emails script:', error);
    process.exit(1);
  }
}

main();
