import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Heading,
  Tailwind,
  Section,
  Button,
} from '@react-email/components';
import * as React from 'react';

interface WelcomeNotificationProps {
  fullname: string;
}

const WelcomeNotification = ({
  fullname = 'Runner',
}: WelcomeNotificationProps) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://usestrive.run';

  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-white font-sans">
          <Container className="mx-auto my-10 p-5 border border-gray-200 rounded-lg max-w-xl">
            <Section className="text-center mb-6">
              <Heading className="text-3xl font-bold text-gray-900">
                Welcome to Strive! 🏃‍♂️
              </Heading>
            </Section>
            
            <Section className="text-center">
              <Text className="text-xl text-gray-700">
                Hi <strong>{fullname}</strong>,
              </Text>
              
              <Text className="text-lg text-gray-700 mt-4 text-left">
                We're thrilled to have you join our community of runners. At Strive, we believe in pushing boundaries, hitting milestones, and celebrating every win.
              </Text>

              <Text className="text-lg text-gray-700 mt-4 text-left">
                Whether you're aiming for your first 5k or training for a marathon, we're here to help you track your progress, join clubs, and earn badges along the way.
              </Text>
            </Section>

            <Section className="text-center mt-8">
              <Button
                className="bg-orange-500 text-white font-bold py-4 px-8 rounded-md text-lg"
                href={`${baseUrl}/dashboard`}
              >
                Start Your Journey
              </Button>
            </Section>

            <Section className="mt-12 pt-8 border-t border-gray-100 text-center">
              <Text className="text-base text-gray-600">
                Let's make every mile count.
              </Text>
              <Text className="text-sm text-gray-400 mt-4">
                © {new Date().getFullYear()} Strive. All rights reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default WelcomeNotification;
