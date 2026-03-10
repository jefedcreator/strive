import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
} from '@react-email/components';
import * as React from 'react';

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
  entityName = 'a group',
  entityType = 'club',
  inviteLink = 'https://strive.run',
  invitedUserAvatar,
}: InviteEmailProps) => {
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
                primary: '#FC4C02',
              },
            },
          },
        }}
      >
        <Body className="bg-[#F7F9FB] my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px] bg-white text-center">
            <Section className="mt-[32px]">
              <Text className="text-[#FC4C02] text-[28px] font-bold text-center p-0 my-[10px] mx-0">
                STRIVE
              </Text>
            </Section>

            {invitedUserAvatar && (
              <Section className="mb-[20px] text-center">
                <Img
                  src={invitedUserAvatar}
                  width="64"
                  height="64"
                  alt="Avatar"
                  className="rounded-full mx-auto"
                />
              </Section>
            )}

            <Heading className="text-[#0B0F19] text-[24px] font-normal text-center p-0 my-[20px] mx-0">
              Join <strong>{entityName}</strong> on Strive
            </Heading>

            <Text className="text-[#0B0F19] text-[14px] leading-[24px]">
              <strong>{invitedByUsername}</strong> has invited you to join their{' '}
              {entityType}, <strong>{entityName}</strong>, on Strive. Get ready
              to compete and run together!
            </Text>

            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#FC4C02] rounded-md text-white text-[14px] font-semibold no-underline text-center px-6 py-3"
                href={inviteLink}
              >
                Join {entityType === 'club' ? 'Club' : 'Leaderboard'}
              </Button>
            </Section>

            <Text className="text-[#0B0F19] text-[14px] leading-[24px] break-all">
              or copy and paste this URL into your browser: <br />
              <Link href={inviteLink} className="text-[#FC4C02] no-underline">
                {inviteLink}
              </Link>
            </Text>

            <Text className="text-[#64748b] text-[12px] leading-[24px] mt-[40px]">
              If you did not expect this invitation, you can safely ignore this
              email.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default InviteEmail;
