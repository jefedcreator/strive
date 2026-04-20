import Logo from '@/primitives/logo';
import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Row,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface ClubMilestoneNotificationProps {
  clubName: string;
  milestoneKm: number;
  badgeUrl?: string;
  rewardUrl?: string;
  clubId:string
}

const ClubMilestoneNotification = ({
  clubName = 'Your Club',
  milestoneKm = 100,
  badgeUrl,
  rewardUrl = 'https://usestrive.run/rewards',
  clubId
}: ClubMilestoneNotificationProps) => {
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
          <Container
            className="bg-white shadow-xl rounded-xl overflow-hidden border border-solid border-gray-200"
            style={{ maxWidth: '600px', width: '100%', margin: '0 auto' }}
          >
            {/* Header */}
            <Section
              className="border-b border-solid border-gray-100 px-8 py-6"
              style={{ width: '100%' }}
            >
              <Row style={{ width: '100%' }}>
                <Column align="left" style={{ width: '50%' }}>
                  <Text className="text-gray-900 text-xl font-bold leading-tight tracking-tight m-0">
                    <Logo />
                  </Text>
                </Column>
              </Row>
            </Section>

            {/* Content Section */}
            <Section className="px-8 py-12" style={{ width: '100%' }}>
              {/* Pill */}
              <Section
                align="center"
                style={{
                  width: '100%',
                  textAlign: 'center',
                  marginBottom: '24px',
                }}
              >
                <Text className="inline-block bg-orange-100 text-primary text-[10px] m-0 py-1 px-4 rounded-full font-bold uppercase tracking-wider">
                  Club Milestone Reached
                </Text>
              </Section>

              <Heading className="text-gray-900 tracking-tight text-3xl font-extrabold leading-tight mb-2 mt-0 text-center">
                Epic Milestone!
              </Heading>

              <Text className="text-gray-600 text-lg font-normal mb-8 max-w-sm mx-auto leading-relaxed text-center">
                Your club <strong>{clubName}</strong> has collectively conquered
                the{' '}
                <span className="text-primary font-semibold">
                  {milestoneKm.toLocaleString()} km
                </span>{' '}
                mark.
              </Text>

              {/* Badge Visualizer */}
              <Section
                style={{
                  width: '100%',
                  textAlign: 'center',
                  marginBottom: '40px',
                }}
              >
                {badgeUrl ? (
                  <Img
                    src={badgeUrl}
                    width="280"
                    height="280"
                    alt={`${milestoneKm}km Milestone Badge`}
                    className="rounded-full border-8 border-solid border-white object-cover"
                    style={{ margin: '0 auto', display: 'block' }}
                  />
                ) : (
                  <div
                    className="h-[280px] w-[280px] rounded-full border-8 border-solid border-white bg-amber-500"
                    style={{
                      background:
                        'linear-gradient(135deg, #fcd34d 0%, #f59e0b 50%, #d97706 100%)',
                      margin: '0 auto', // Crucial for centering in email clients
                      display: 'block',
                    }}
                  >
                    <Text className="m-0 text-6xl text-center text-white mt-[80px]">
                      🏁
                    </Text>
                    <Text className="m-0 font-black text-3xl text-center text-white uppercase tracking-[0.1em] mt-2">
                      {milestoneKm}K
                    </Text>
                  </div>
                )}
              </Section>

              {/* CTA */}
              <Section
                align="center"
                style={{ width: '100%', textAlign: 'center' }}
              >
                <Button
                  className="text-white text-base font-bold tracking-wide rounded-xl py-4 px-8"
                  style={{ backgroundColor: '#f97316', color: '#ffffff' }} // Inline fallback for safety
                  href={rewardUrl}
                >
                  {rewardUrl.includes('rewards')
                    ? 'Claim Milestone Reward'
                    : 'Celebrate with Club'}
                </Button>
                <Text className="text-gray-500 text-sm font-medium mt-6 text-center">
                  <Link
                    href={`https://usestrive.run/clubs/${clubId}`}
                    className="text-gray-500 hover:text-primary transition-colors no-underline"
                  >
                    View Club
                  </Link>
                </Text>
              </Section>
            </Section>

            {/* Footer Message */}
            <Section
              className="bg-gray-50 px-8 py-8 border-t border-solid border-gray-100"
              style={{ width: '100%' }}
            >
              <Text className="text-gray-500 text-xs leading-relaxed m-0 text-center">
                Outstanding teamwork! Your club&apos;s dedication to the run is
                paying off. Keep pushing your limits together and stay ahead of
                the pack.
              </Text>
              <Text className="text-gray-400 m-0 mt-6 text-center text-lg">
                👥 &nbsp;&bull;&nbsp; 🏅 &nbsp;&bull;&nbsp; 🚀
              </Text>
            </Section>
          </Container>

          {/* Unsubscribe / Compliance */}
          <Section
            className="py-10"
            style={{
              width: '100%',
              maxWidth: '600px',
              margin: '0 auto',
              textAlign: 'center',
            }}
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

export default ClubMilestoneNotification;
