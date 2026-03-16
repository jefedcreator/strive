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
  Link,
  Hr,
  Row,
  Column,
} from '@react-email/components';
import type { RewardType } from '@prisma/client';

interface RewardNotificationProps {
  badgeType: RewardType;
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
  rewardUrl = 'https://strive.app/rewards',
}: RewardNotificationProps) => {
  const isGold = badgeType === 'GOLD';
  const isSilver = badgeType === 'SILVER';
  const isBronze = badgeType === 'BRONZE';

  const badgeColors = isGold
    ? 'from-amber-300 via-yellow-500 to-amber-600'
    : isSilver
      ? 'from-gray-300 via-gray-400 to-gray-500'
      : isBronze
        ? 'from-orange-700 via-orange-800 to-orange-900'
        : 'from-indigo-400 via-indigo-500 to-indigo-600';

  return (
    <Html>
      <Head />
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                primary: '#f97316', // Typical Strive orange
              },
            },
          },
        }}
      >
        <Body className="bg-gray-50 py-10 px-4 font-sans">
          <Container className="max-w-[600px] mx-auto">
            {/* Main Card Container */}
            <Section className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200">
              {/* Header */}
              <Section className="border-b border-solid border-gray-100 px-8 py-6">
                <Row>
                  <Column>
                    <Section className="flex items-center">
                      <div className="bg-primary rounded-lg p-2 mr-3">
                        <Text className="text-white text-lg font-bold m-0 leading-none">
                          ⚡
                        </Text>
                      </div>
                      <Text className="text-gray-900 text-xl font-bold leading-tight tracking-tight m-0">
                        Strive
                      </Text>
                    </Section>
                  </Column>
                  <Column align="right">
                    <div className="bg-gray-100 rounded-xl p-2">
                        <Text className="m-0 text-gray-600">🔔</Text>
                    </div>
                  </Column>
                </Row>
              </Section>

              {/* Content Section */}
              <Section className="px-8 py-12 text-center">
                <Section className="mb-6 inline-block bg-orange-100 px-4 py-1 rounded-full">
                  <Text className="text-primary text-[10px] m-0 font-bold uppercase tracking-wider">
                    New Achievement Unlocked
                  </Text>
                </Section>

                <Heading className="text-gray-900 tracking-tight text-3xl font-extrabold leading-tight mb-2 mt-0">
                  Incredible Effort!
                </Heading>

                <Text className="text-gray-600 text-lg font-normal mb-8 max-w-sm mx-auto leading-relaxed">
                  You&apos;ve earned the <span className="font-bold text-gray-900">{badgeType} Badge</span> in the{' '}
                  <span className="text-primary font-semibold">
                    {leaderboardName}
                  </span>{' '}
                  {contextType}.
                </Text>

                {/* Badge Visualizer */}
                <Section className="mb-10 mx-auto w-[280px]">
                  {badgeUrl ? (
                    <Img
                      src={badgeUrl}
                      width="280"
                      height="280"
                      alt={`${badgeType} Badge`}
                      className="rounded-full shadow-2xl border-8 border-white mx-auto"
                    />
                  ) : (
                    <Section
                      className={`h-[280px] w-[280px] rounded-full shadow-2xl border-8 border-white bg-gradient-to-br ${badgeColors} flex items-center justify-center`}
                    >
                      <div className="text-center">
                        <Text className="m-0 text-6xl text-white drop-shadow-md">
                          🏆
                        </Text>
                        <Text className="m-0 font-extrabold text-xl text-white uppercase tracking-[0.2em]">
                          {badgeType}
                        </Text>
                      </div>
                    </Section>
                  )}
                </Section>

                {/* Details Section */}
                <Section className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-100">
                  <Row className="mb-4 pb-4 border-b border-gray-200">
                    <Column>
                      <Text className="text-gray-500 text-[10px] font-medium uppercase tracking-wider m-0">
                        Context
                      </Text>
                    </Column>
                    <Column align="right">
                      <Text className="text-gray-900 font-bold m-0 text-sm">
                        {contextType === 'leaderboard' ? 'Leaderboard Reward' : 'Challenge Reward'}
                      </Text>
                    </Column>
                  </Row>
                  <Row>
                    <Column>
                      <Text className="text-gray-500 text-[10px] font-medium uppercase tracking-wider m-0">
                        Target
                      </Text>
                    </Column>
                    <Column align="right">
                      <Text className="text-gray-900 font-bold m-0 text-sm">
                        {leaderboardName}
                      </Text>
                    </Column>
                  </Row>
                </Section>

                {/* CTA */}
                <Section className="space-y-4">
                  <Button
                    className="bg-primary text-white text-base font-bold tracking-wide rounded-xl py-4 w-full block text-center shadow-lg"
                    href={rewardUrl}
                  >
                    Claim My Reward
                  </Button>
                  <Text className="text-gray-500 text-sm font-medium mt-4">
                    <Link
                      href={`${rewardUrl}/leaderboards`}
                      className="text-gray-500 hover:text-primary transition-colors no-underline"
                    >
                      View Leaderboard Standings
                    </Link>
                  </Text>
                </Section>
              </Section>

              {/* Footer Message */}
              <Section className="bg-gray-50 px-8 py-8 border-t border-gray-100 text-center">
                <Text className="text-gray-500 text-xs leading-relaxed m-0">
                  Outstanding performance! Your dedication to the run is paying
                  off. Keep pushing your limits and stay ahead of the pack.
                </Text>
                <Section className="mt-6 flex justify-center gap-6">
                   <Text className="text-gray-400 m-0">
                     ✨ &nbsp;&bull;&nbsp; 🏅 &nbsp;&bull;&nbsp; 🚀
                   </Text>
                </Section>
              </Section>
            </Section>

            {/* Unsubscribe / Compliance */}
            <Section className="py-10 text-center">
              <Text className="text-gray-400 text-xs mb-2 m-0">
                Sent with ❤️ from the Strive Team
              </Text>
              <Text className="text-gray-400 text-[10px] uppercase tracking-widest m-0">
                <Link className="underline text-gray-400">Unsubscribe</Link>
                &nbsp;&bull;&nbsp;
                <Link className="underline text-gray-400">Privacy Policy</Link>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default RewardNotification;
