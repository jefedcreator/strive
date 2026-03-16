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
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';

interface InviteEmailProps {
  invitedByUsername?: string;
  invitedByEmail?: string;
  entityName?: string;
  entityType?: 'club' | 'leaderboard';
  inviteLink?: string;
  invitedUserAvatar?: string | null;
}

export const InviteEmail = ({
  invitedByUsername = 'A fellow runner',
  invitedByEmail,
  entityName = 'our community',
  entityType = 'club',
  inviteLink = 'https://strive.app',
  invitedUserAvatar,
}: InviteEmailProps) => {
  const inviter = invitedByUsername || invitedByEmail || 'A fellow runner';
  const typeLabel = entityType === 'club' ? 'Club' : 'Leaderboard';
  const previewText = `You've been invited to join ${entityName} on Strive!`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
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
              <header className="border-b border-solid border-gray-100 px-8 py-6">
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
              </header>

              {/* Content Section */}
              <div className="flex flex-col items-center px-8 py-12 text-center">
                <div className="mb-6 inline-block bg-orange-100 px-4 py-1 rounded-full">
                  <Text className="text-primary text-[10px] m-0 font-bold uppercase tracking-wider">
                    You&apos;re Invited
                  </Text>
                </div>

                <Heading className="text-gray-900 tracking-tight text-3xl font-extrabold leading-tight mb-2 mt-0">
                  Join the Pack!
                </Heading>

                <Text className="text-gray-600 text-lg font-normal mb-8 max-w-sm mx-auto leading-relaxed">
                  <strong>{inviter}</strong> has invited you to join the{' '}
                  <span className="text-primary font-semibold">
                    {entityName}
                  </span>{' '}
                  {entityType}.
                </Text>

                {/* Visualizer */}
                <Section className="mb-10 mx-auto w-[280px]">
                  <div className="relative h-[280px] w-[280px] rounded-full shadow-2xl border-8 border-white bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-600 overflow-hidden">
                    {invitedUserAvatar ? (
                      <Img
                        src={invitedUserAvatar}
                        width="280"
                        height="280"
                        alt={inviter}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex flex-col items-center justify-center text-white">
                        <Text className="m-0 text-6xl drop-shadow-md">
                          👋
                        </Text>
                        <Text className="m-0 font-black text-3xl uppercase tracking-[0.1em]">
                          JOIN
                        </Text>
                      </div>
                    )}
                  </div>
                </Section>

                {/* Details Section */}
                <Section className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-100">
                  <Row className="mb-4 pb-4 border-b border-gray-200">
                    <Column>
                      <Text className="text-gray-500 text-[10px] font-medium uppercase tracking-wider m-0">
                        Invited By
                      </Text>
                    </Column>
                    <Column align="right">
                      <Text className="text-gray-900 font-bold m-0 text-sm">
                        {inviter}
                      </Text>
                    </Column>
                  </Row>
                  <Row>
                    <Column>
                      <Text className="text-gray-500 text-[10px] font-medium uppercase tracking-wider m-0">
                        {typeLabel}
                      </Text>
                    </Column>
                    <Column align="right">
                      <Text className="text-gray-900 font-bold m-0 text-sm">
                        {entityName}
                      </Text>
                    </Column>
                  </Row>
                </Section>

                {/* CTA */}
                <Section className="space-y-4">
                  <Button
                    className="bg-primary text-white text-base font-bold tracking-wide rounded-xl py-4 w-full block text-center shadow-lg"
                    href={inviteLink}
                  >
                    Accept Invitation
                  </Button>
                  <Text className="text-gray-500 text-sm font-medium mt-4">
                    <Link
                      href={`${inviteLink}/learn-more`}
                      className="text-gray-500 hover:text-primary transition-colors no-underline"
                    >
                      Learn More
                    </Link>
                  </Text>
                </Section>
              </div>

              {/* Footer Message */}
              <footer className="bg-gray-50 px-8 py-8 border-t border-gray-100 text-center">
                <Text className="text-gray-500 text-xs leading-relaxed m-0">
                  Ready to hit the ground running? Accept the invitation to
                  connect with others, share your progress, and stay motivated.
                </Text>
                <Section className="mt-6 flex justify-center gap-6">
                  <Text className="text-gray-400 m-0">
                    🏃 &nbsp;&bull;&nbsp; 🤝 &nbsp;&bull;&nbsp; 🚀
                  </Text>
                </Section>
              </footer>
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

export default InviteEmail;
