import * as React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Heading,
  Tailwind,
  Section,
} from '@react-email/components';

interface ClubMilestoneNotificationProps {
  clubName: string;
  milestoneKm: number;
}

const ClubMilestoneNotification: React.FC<ClubMilestoneNotificationProps> = ({
  clubName = 'Your Club',
  milestoneKm = 100,
}) => {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-white font-sans">
          <Container className="mx-auto my-10 p-5 border border-gray-200 rounded-lg max-w-xl">
            <Section className="text-center mb-6">
              <Heading className="text-2xl font-bold text-gray-900">
                Incredible Work! 🛡️
              </Heading>
            </Section>
            
            <Section className="text-center">
              <Text className="text-lg text-gray-700">
                You and your team at <strong>{clubName}</strong> have officially reached the <strong className="text-indigo-600">{milestoneKm}km</strong> milestone! 
              </Text>
              
              <Text className="text-base text-gray-500 mt-4">
                Thank you for contributing to your club's success. Your Club Milestone Badge has been awarded!
              </Text>
            </Section>

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
