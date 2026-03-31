import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';
import Logo from '../../../../primitives/logo';

interface ReAuthNotificationProps {
  provider: string;
  fullname: string;
}

const ReAuthNotification = ({
  provider = 'your running app',
  fullname = 'Runner',
}: ReAuthNotificationProps) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://usestrive.run';

  return (
    <Html>
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                primary: '#f97316',
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
            <Section className="border-b border-solid border-gray-100 px-8 py-6" style={{ width: '100%' }}>
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
                <Text className="inline-block bg-red-100 text-red-600 text-[10px] m-0 py-1 px-4 rounded-full font-bold uppercase tracking-wider">
                  Action Required
                </Text>
              </Section>

              <Heading className="text-gray-900 tracking-tight text-3xl font-extrabold leading-tight mb-2 mt-0 text-center">
                Re-connect {provider}
              </Heading>

              <Text className="text-gray-600 text-lg font-normal mb-8 max-w-sm mx-auto leading-relaxed text-center">
                Hey {fullname}, your {provider} connection has expired. 
                Log in to Strive to keep your runs and leaderboards up to date.
              </Text>

              {/* Visualizer */}
              <Section className="mb-10 mx-auto" style={{ width: '280px' }}>
                <div
                  className="h-[280px] w-[280px] rounded-full border-8 border-solid border-white bg-red-500"
                  style={{ background: 'linear-gradient(135deg, #fca5a5 0%, #ef4444 50%, #b91c1c 100%)', margin: '0 auto', display: 'block' }}
                >
                  <Text className="m-0 text-6xl text-center mt-[70px] text-white">
                    🔄
                  </Text>
                  <Text className="m-0 font-black text-2xl uppercase tracking-[0.1em] text-center text-white mt-4">
                    RECONNECT
                  </Text>
                </div>
              </Section>

              {/* CTA */}
              <Section className="text-center" style={{ width: '100%' }}>
                <Button
                  className="bg-primary text-white text-base font-bold tracking-wide rounded-xl py-4 px-8 text-center"
                  style={{ backgroundColor: '#f97316' }}
                  href={`${baseUrl}/login`}
                >
                  Log In to Strive
                </Button>
                <Text className="text-gray-500 text-sm font-medium mt-6 text-center">
                  This only takes a moment — just sign in with {provider}.
                </Text>
              </Section>
            </Section>

            {/* Footer Message */}
            <Section className="bg-gray-50 px-8 py-8 border-t border-solid border-gray-100 text-center" style={{ width: '100%' }}>
              <Text className="text-gray-500 text-xs leading-relaxed m-0 text-center">
                We automatically sync your runs so your leaderboards stay fresh. 
                When your connection expires, we need you to log in again so we can keep things running smoothly.
              </Text>
              <Text className="text-gray-400 m-0 mt-6 text-center text-lg">
                🔗 &nbsp;&bull;&nbsp; 🏃 &nbsp;&bull;&nbsp; 🔄
              </Text>
            </Section>
          </Container>

          {/* Unsubscribe / Compliance */}
          {/* <Section className="py-10 text-center max-w-[600px] mx-auto" style={{ width: '100%' }}>
            <Text className="text-gray-400 text-xs mb-2 m-0 text-center">
              Sent with ❤️ from the Strive Team
            </Text>
            <Text className="text-gray-400 text-[10px] uppercase tracking-widest m-0 text-center">
              <Link className="underline text-gray-400">Unsubscribe</Link>
              &nbsp;&bull;&nbsp;
              <Link className="underline text-gray-400">Privacy Policy</Link>
            </Text>
          </Section> */}
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ReAuthNotification;
