import { variantStyles } from '@/components/badge';
import { getFontSize } from '@/utils';
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = (searchParams.get('type') || 'gold') as keyof typeof variantStyles;    
    const title = searchParams.get('title') || 'Reward';
    const subtitle = searchParams.get('subtitle') || '';
    const milestone = searchParams.get('milestone') || '';

    const theme = variantStyles[type] || variantStyles.gold;
    const label = milestone ? `${milestone}K` : theme.label;
    const Icon = theme.Icon;

    const titleFontSize = getFontSize(title, 72, 32);
    const subtitleFontSize = getFontSize(subtitle, 36, 24);

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent',
          }}
        >
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 800,
              height: 800,
            }}
          >
            {/* Background Glow */}
            <div
              style={{
                position: 'absolute',
                width: 900,
                height: 900,
                borderRadius: 450,
                background: `radial-gradient(circle, ${theme.satoriGlow} 0%, transparent 70%)`,
                display: 'flex',
              }}
            />

            {/* Main Badge Body */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                borderRadius: 400,
                background: theme.satoriGradient,
                border: '24px solid rgba(255, 255, 255, 0.9)',
                boxShadow: '0 40px 80px rgba(0,0,0,0.4)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  marginTop: -40,
                }}
              >
                <Icon width="320" height="320" color="white" />
                <div
                  style={{
                    display: 'flex',
                    fontSize: 80,
                    fontWeight: 900,
                    color: 'white',
                    letterSpacing: 10,
                    marginTop: 20,
                    textAlign: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {label}
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 60,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              width: '100%',
            }}
          >
            <div
              style={{
                display: 'flex',
                fontSize: titleFontSize,
                fontWeight: 800,
                color: 'white',
                textAlign: 'center',
                justifyContent: 'center',
                maxWidth: '90%',
              }}
            >
              {title}
            </div>
            {subtitle && (
              <div
                style={{
                  display: 'flex',
                  fontSize: subtitleFontSize,
                  color: 'rgba(255, 255, 255, 0.5)',
                  marginTop: 10,
                  textAlign: 'center',
                  justifyContent: 'center',
                  maxWidth: '90%',
                }}
              >
                {subtitle}
              </div>
            )}
          </div>
        </div>
      ),
      { width: 1080, height: 1080 }
    );
  } catch (e) {
    console.error(e);
    return new Response('Failed to generate image', { status: 500 });
  }
}