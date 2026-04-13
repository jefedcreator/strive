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
  Row,
  Column,
} from '@react-email/components';
import Logo from '../../../../primitives/logo';
// import type { RewardType } from '@prisma/client'; // Assuming you have this available

// Temporary type definition for standalone component
type RewardType = 'GOLD' | 'SILVER' | 'BRONZE' | string;

interface RewardNotificationProps {
  badgeType: RewardType;
  leaderboardName: string;
  contextType: 'leaderboard' | 'challenge';
  badgeUrl?: string;
  rewardUrl?: string;
  metricText?: string;
}

const RewardNotification = ({
  badgeType = 'GOLD',
  leaderboardName = 'Weekly Challenge',
  contextType = 'leaderboard',
  badgeUrl,
  rewardUrl = 'https://usestrive.run/rewards',
  metricText,
}: RewardNotificationProps) => {
  const isGold = badgeType === 'GOLD';
  const isSilver = badgeType === 'SILVER';
  const isBronze = badgeType === 'BRONZE';

  // Inline fallback for gradients because Tailwind gradients fail in many email clients
  const badgeGradient = isGold
    ? 'linear-gradient(135deg, #fcd34d 0%, #f59e0b 50%, #d97706 100%)'
    : isSilver
      ? 'linear-gradient(135deg, #d1d5db 0%, #9ca3af 50%, #6b7280 100%)'
      : isBronze
        ? 'linear-gradient(135deg, #c2410c 0%, #9a3412 50%, #7c2d12 100%)'
        : 'linear-gradient(135deg, #818cf8 0%, #6366f1 50%, #4f46e5 100%)';

  return (
    <Html>
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
        <Head />
        <Body className="bg-gray-50 py-10 px-4 font-sans">
          {/* Main Card Container */}
          <Container className="max-w-[600px] mx-auto bg-white shadow-xl rounded-xl overflow-hidden border border-solid border-gray-200">
            {/* Header */}
            <Section
              className="border-b border-solid border-gray-100 px-8 py-6"
              style={{ width: '100%' }}
            >
              <Row style={{ width: '100%' }}>
                <Column className="text-left align-middle">
                  <Text className="text-gray-900 text-xl font-bold leading-tight tracking-tight m-0">
                    <Logo
                      className="bg-primary rounded-lg mr-2 inline-block align-middle"
                      style={{ width: '32px', height: '32px' }}
                      cutoutClassName="text-white"
                    />
                    Strive
                  </Text>
                </Column>
              </Row>
            </Section>

            {/* Content Section */}
            <Section className="px-8 py-12" style={{ width: '100%' }}>
              {/* Pill */}
              <Section className="text-center mb-6">
                <Text className="inline-block bg-orange-100 text-primary text-[10px] m-0 py-1 px-4 rounded-full font-bold uppercase tracking-wider">
                  New Achievement Unlocked
                </Text>
              </Section>

              <Heading className="text-gray-900 tracking-tight text-3xl font-extrabold leading-tight mb-2 mt-0 text-center">
                Incredible Effort!
              </Heading>

              <Text className="text-gray-600 text-lg font-normal mb-8 max-w-sm mx-auto leading-relaxed text-center">
                You&apos;ve earned the{' '}
                <span className="font-bold text-gray-900">
                  {badgeType} Badge
                </span>{' '}
                in the{' '}
                <span className="text-primary font-semibold">
                  {leaderboardName}
                </span>{' '}
                {contextType}
                {metricText ? `${metricText}.` : '.'}
              </Text>

              {/* Badge Visualizer */}
              <Section className="mb-10 mx-auto" style={{ width: '280px' }}>
                {badgeUrl ? (
                  <Img
                    src={badgeUrl}
                    width="280"
                    height="280"
                    alt={`${badgeType} Badge`}
                    className="rounded-full border-8 border-solid border-white object-cover"
                    style={{ margin: '0 auto', display: 'block' }}
                  />
                ) : (
                  <div
                    className="h-[280px] w-[280px] rounded-full border-8 border-solid border-white"
                    style={{
                      background: badgeGradient,
                      margin: '0 auto',
                      display: 'block',
                    }}
                  >
                    <Text className="m-0 text-6xl text-center text-white mt-[80px]">
                      🏆
                    </Text>
                    <Text className="m-0 font-black text-xl text-center text-white uppercase tracking-[0.2em] mt-2">
                      {badgeType}
                    </Text>
                  </div>
                )}
              </Section>

              {/* CTA */}
              <Section className="text-center" style={{ width: '100%' }}>
                <Button
                  className="bg-primary text-white text-base font-bold tracking-wide rounded-xl py-4 px-8 text-center"
                  style={{ backgroundColor: '#f97316' }}
                  href={rewardUrl}
                >
                  Claim My Reward
                </Button>
                <Text className="text-gray-500 text-sm font-medium mt-6 text-center">
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
            <Section
              className="bg-gray-50 px-8 py-8 border-t border-solid border-gray-100 text-center"
              style={{ width: '100%' }}
            >
              <Text className="text-gray-500 text-xs leading-relaxed m-0 text-center">
                Outstanding performance! Your dedication to the run is paying
                off. Keep pushing your limits and stay ahead of the pack.
              </Text>
              <Text className="text-gray-400 m-0 mt-6 text-center text-lg">
                ✨ &nbsp;&bull;&nbsp; 🏅 &nbsp;&bull;&nbsp; 🚀
              </Text>
            </Section>
          </Container>

          {/* Unsubscribe / Compliance */}
          <Section
            className="py-10 text-center max-w-[600px] mx-auto"
            style={{ width: '100%' }}
          >
            <Text className="text-gray-400 text-xs mb-2 m-0 text-center">
              Sent with ❤️ from the Strive Team
            </Text>
            <Text className="text-gray-400 text-[10px] uppercase tracking-widest m-0 text-center">
              <Link className="underline text-gray-400">Unsubscribe</Link>
              &nbsp;&bull;&nbsp;
              <Link className="underline text-gray-400">Privacy Policy</Link>
            </Text>
          </Section>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default RewardNotification;
