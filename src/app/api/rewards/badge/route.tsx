import Logo from '@/primitives/logo';
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const type = (searchParams.get('type') || 'gold') as
      | 'gold'
      | 'silver'
      | 'bronze'
      | 'club';
    const title = searchParams.get('title') || 'Reward';
    const subtitle = searchParams.get('subtitle') || '';
    const milestone = searchParams.get('milestone') || '';

    // Color schemes per reward type
    const colors: Record<
      string,
      { primary: string; secondary: string; glow: string; icon: string }
    > = {
      gold: {
        primary: '#FFD700',
        secondary: '#FFA500',
        glow: 'rgba(255, 215, 0, 0.3)',
        icon: '🥇',
      },
      silver: {
        primary: '#C0C0C0',
        secondary: '#A0A0A0',
        glow: 'rgba(192, 192, 192, 0.3)',
        icon: '🥈',
      },
      bronze: {
        primary: '#CD7F32',
        secondary: '#A0522D',
        glow: 'rgba(205, 127, 50, 0.3)',
        icon: '🥉',
      },
      club: {
        primary: '#3b82f6',
        secondary: '#8b5cf6',
        glow: 'rgba(59, 130, 246, 0.3)',
        icon: '🛡️',
      },
    };

    const c = colors[type] || colors.gold!;
    const isClub = type === 'club';

    const rankLabel =
      type === 'gold'
        ? '1ST'
        : type === 'silver'
          ? '2ND'
          : type === 'bronze'
            ? '3RD'
            : '';

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            backgroundColor: 'transparent',
          }}
        >
          {/* Outer glow ring */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '900px',
              height: '900px',
              borderRadius: '450px',
              background: `radial-gradient(circle, ${c.glow} 0%, transparent 70%)`,
              position: 'relative',
            }}
          >
            {/* Icon */}
            <div
              style={{
                fontSize: '160px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              {c.icon}
            </div>

            {/* Rank label (for podium types) */}
            {rankLabel && (
              <div
                style={{
                  fontSize: '48px',
                  fontWeight: '900',
                  color: c.primary,
                  letterSpacing: '8px',
                  marginBottom: '8px',
                  display: 'flex',
                  justifyContent: 'center',
                  textAlign: 'center',
                }}
              >
                {rankLabel} PLACE
              </div>
            )}

            {/* Club milestone value */}
            {isClub && milestone && (
              <div
                style={{
                  fontSize: '64px',
                  fontWeight: '900',
                  color: c.primary,
                  letterSpacing: '-2px',
                  marginBottom: '8px',
                  display: 'flex',
                  justifyContent: 'center',
                  textAlign: 'center',
                }}
              >
                {milestone}km
              </div>
            )}

            {/* Title */}
            <div
              style={{
                fontSize: '28px',
                fontWeight: '700',
                color: 'white',
                textAlign: 'center',
                maxWidth: '400px',
                lineHeight: '1.3',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              {title}
            </div>

            {/* Subtitle */}
            {subtitle && (
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: '500',
                  color: 'rgba(255, 255, 255, 0.6)',
                  marginTop: '8px',
                  display: 'flex',
                  justifyContent: 'center',
                  textAlign: 'center',
                }}
              >
                {subtitle}
              </div>
            )}

            {/* Standardized Strive watermark at bottom */}
            <div
              style={{
                position: 'absolute',
                bottom: '60px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  backgroundColor: '#F97316', 
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden', // Ensures the SVG doesn't bleed out of the rounded corners
                }}
              >
                <Logo width={28} height={28} fill="#FFFFFF" /> {/* Solid white outer box */}
              </div>
              <span
                style={{
                  fontSize: '20px',
                  fontWeight: '800',
                  color: '#FFFFFF',
                  letterSpacing: '-0.5px',
                }}
              >
                Strive
              </span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1080,
        height: 1080,
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      }
    );
  } catch (e: unknown) {
    console.error(e);
    return new Response('Failed to generate badge', { status: 500 });
  }
}