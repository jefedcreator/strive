import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Row,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';
import Logo from '../../../../primitives/logo';

interface WelcomeNotificationProps {
  fullname: string;
}

const WelcomeNotification = ({
  fullname = 'Runner',
}: WelcomeNotificationProps) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://usestrive.run';

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
              <Text className="text-gray-900 text-xl font-bold leading-tight tracking-tight m-0">
                <Logo
                  className="bg-primary rounded-lg mr-2 inline-block align-middle"
                  style={{ width: '32px', height: '32px' }}
                  cutoutClassName="text-white"
                />
                Strive
              </Text>
            </Section>

            {/* Content Section */}
            <Section className="px-8 py-12" style={{ width: '100%' }}>
              {/* Pill */}
              <Section className="text-center mb-6">
                <Text className="inline-block bg-orange-100 text-primary text-[10px] m-0 py-1 px-4 rounded-full font-bold uppercase tracking-wider">
                  Welcome to Strive
                </Text>
              </Section>

              <Heading className="text-gray-900 tracking-tight text-3xl font-extrabold leading-tight mb-2 mt-0 text-center">
                Great to have you, {fullname}!
              </Heading>

              <Text className="text-gray-600 text-lg font-normal mb-8 max-w-sm mx-auto leading-relaxed text-center">
                You&apos;re officially part of the community. Get ready to track
                your progress, join clubs, and hit new personal bests.
              </Text>

              {/* Visualizer */}
              <Section className="mb-10 mx-auto" style={{ width: '280px' }}>
                <div
                  className="h-[280px] w-[280px] rounded-full border-8 border-solid border-white bg-amber-500"
                  style={{
                    background:
                      'linear-gradient(135deg, #fcd34d 0%, #f59e0b 50%, #d97706 100%)',
                    margin: '0 auto',
                    display: 'block',
                  }}
                >
                  <Text className="m-0 text-6xl text-center mt-[70px] text-white">
                    👋
                  </Text>
                  <Text className="m-0 font-black text-3xl uppercase tracking-[0.1em] text-center text-white mt-4">
                    HELLO
                  </Text>
                </div>
              </Section>

              {/* CTA */}
              <Section className="text-center" style={{ width: '100%' }}>
                <Button
                  className="bg-primary text-white text-base font-bold tracking-wide rounded-xl py-4 px-8 text-center"
                  style={{ backgroundColor: '#f97316' }}
                  href={`${baseUrl}/home`}
                >
                  Let&apos;s Get Started
                </Button>
                <Text className="text-gray-500 text-sm font-medium mt-6 text-center">
                  <Link
                    href={`${baseUrl}/explore`}
                    className="text-gray-500 hover:text-primary transition-colors no-underline"
                  >
                    Explore the App
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
                We&apos;re excited to see what you achieve. Remember, every step
                counts towards your goals. Let&apos;s make it happen!
              </Text>
              <Text className="text-gray-400 m-0 mt-6 text-center text-lg">
                🏠 &nbsp;&bull;&nbsp; 🏃 &nbsp;&bull;&nbsp; 🚀
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

export default WelcomeNotification;
