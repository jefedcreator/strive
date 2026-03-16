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
        icon: '🔥',
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

    const badgeColors = {
      gold: 'linear-gradient(135deg, #FFD02D 0%, #E39D00 50%, #B86B00 100%)',
      silver: 'linear-gradient(135deg, #CBD5E1 0%, #94A3B8 50%, #475569 100%)',
      bronze: 'linear-gradient(135deg, #FB923C 0%, #F97316 50%, #C2410C 100%)',
      club: 'linear-gradient(135deg, #6EE7B7 0%, #10B981 50%, #047857 100%)'
    };

    const gradient = badgeColors[type] || badgeColors.gold!;

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
            position: 'relative',
          }}
        >
          {/* Main Badge Container */}
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '800px',
              height: '800px',
            }}
          >
            {/* Glow effect */}
            <div
              style={{
                position: 'absolute',
                width: '900px',
                height: '900px',
                borderRadius: '450px',
                background: `radial-gradient(circle, ${c.glow} 0%, transparent 70%)`,
                opacity: 0.6,
              }}
            />

            {/* Shield/Circle Base */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                borderRadius: '400px',
                background: gradient,
                border: '32px solid white',
                boxShadow: '0 50px 100px -20px rgba(0,0,0,0.5)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textShadow: '0 4px 12px rgba(0,0,0,0.3)',
                }}
              >
                <div style={{ fontSize: '320px', marginBottom: '20px' }}>{c.icon}</div>
                <div
                  style={{
                    fontSize: '80px',
                    fontWeight: '900',
                    color: 'white',
                    letterSpacing: '12px',
                    textTransform: 'uppercase',
                  }}
                >
                  {isClub && milestone ? `${milestone}K` : type}
                </div>
              </div>
            </div>

            {/* Decorations */}
            <div
              style={{
                position: 'absolute',
                top: '40px',
                right: '120px',
                fontSize: '120px',
                color: '#FACC15',
              }}
            >
              ⭐
            </div>
            <div
              style={{
                position: 'absolute',
                bottom: '80px',
                left: '80px',
                fontSize: '140px',
              }}
            >
              ✨
            </div>
          </div>

          {/* Title/Label Overlay */}
          <div
            style={{
              marginTop: '60px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                fontSize: '64px',
                fontWeight: '800',
                color: 'white',
                textAlign: 'center',
                letterSpacing: '-1px',
                marginBottom: '16px',
              }}
            >
              {title}
            </div>
            {subtitle && (
              <div
                style={{
                  fontSize: '32px',
                  fontWeight: '500',
                  color: 'rgba(255, 255, 255, 0.6)',
                  textAlign: 'center',
                }}
              >
                {subtitle}
              </div>
            )}
          </div>

          {/* Strive Watermark */}
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'rgba(0,0,0,0.5)',
              padding: '12px 24px',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#F97316',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Logo width={32} height={32} fill="#FFFFFF" />
            </div>
            <span style={{ fontSize: '24px', fontWeight: '800', color: 'white' }}>Strive</span>
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