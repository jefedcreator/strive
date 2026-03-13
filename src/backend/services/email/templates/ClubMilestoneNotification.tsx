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

interface ClubMilestoneNotificationProps {
  clubName: string;
  milestoneKm: number;
  badgeUrl?: string;
  rewardUrl?: string;
}

const ClubMilestoneNotification = ({
  clubName = 'Your Club',
  milestoneKm = 100,
  badgeUrl,
  rewardUrl,
}:ClubMilestoneNotificationProps) => {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-white font-sans">
          <Container className="mx-auto my-10 p-5 border border-gray-200 rounded-lg max-w-xl">
            <Section className="text-center mb-6">
              <Heading className="text-2xl font-bold text-gray-900">
                Incredible Work! 🔥
              </Heading>
            </Section>
            
            <Section className="text-center">
              {badgeUrl && (
                <Img
                  src={badgeUrl}
                  width="200"
                  height="200"
                  alt={`Club Milestone Badge`}
                  className="mx-auto mb-6 rounded-lg"
                />
              )}

              <Text className="text-lg text-gray-700">
                You and your team at <strong>{clubName}</strong> have officially reached the <strong className="text-indigo-600">{milestoneKm}km</strong> milestone! 
              </Text>
              <Text className="text-base text-gray-500 mt-4">
                Thank you for contributing to your club's success. Your Club Milestone Badge has been awarded!
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

export default ClubMilestoneNotification;
