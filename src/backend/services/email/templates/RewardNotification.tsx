import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Heading,
  Tailwind,
  Section,
  Img,
  Button,
} from '@react-email/components';

interface RewardNotificationProps {
  badgeType: string;
  leaderboardName: string;
  contextType: 'leaderboard' | 'challenge';
  badgeUrl?: string;
  rewardUrl?: string;
}

const RewardNotification = ({
  badgeType = 'GOLD',
  leaderboardName = 'Weekly Challenge',
  contextType = 'leaderboard',
  badgeUrl,
  rewardUrl,
}:RewardNotificationProps) => {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-white font-sans">
          <Container className="mx-auto my-10 p-5 border border-gray-200 rounded-lg max-w-xl">
            <Section className="text-center mb-6">
              <Heading className="text-2xl font-bold text-gray-900">
                Congratulations! 🎉
              </Heading>
            </Section>
            
            <Section className="text-center">
              {badgeUrl && (
                <Img
                  src={badgeUrl}
                  width="200"
                  height="200"
                  alt={`${badgeType} Badge`}
                  className="mx-auto mb-6 rounded-lg"
                />
              )}
              
              <Text className="text-lg text-gray-700">
                You've earned a <strong className="text-indigo-600">{badgeType}</strong> badge for your performance in the <strong>{leaderboardName}</strong> {contextType}!
              </Text>
              
              <Text className="text-base text-gray-500 mt-4">
                Keep up the great work and continue striving for more achievements.
              </Text>
            </Section>

            {rewardUrl && (
              <Section className="text-center mt-8">
                <Button
                  className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-md"
                  href={rewardUrl}
                >
                  View Your Reward
                </Button>
              </Section>
            )}

            <Section className="mt-8 text-center">
              <Text className="text-sm text-gray-400">
                © {new Date().getFullYear()} Strive. All rights reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default RewardNotification;
