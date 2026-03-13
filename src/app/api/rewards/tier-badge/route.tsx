import Logo from '@/primitives/logo';
import { ImageResponse } from 'next/og';

const tierDesigns: Record<
  string,
  { emoji: string; gradient: string; glow: string; accent: string }
> = {
  pacer: {
    emoji: '🥉',
    gradient: 'linear-gradient(145deg, #CD7F3222, #A0522D11)',
    glow: 'rgba(205, 127, 50, 0.25)',
    accent: '#CD7F32',
  },
  racer: {
    emoji: '🥈',
    gradient: 'linear-gradient(145deg, #C0C0C022, #A0A0A011)',
    glow: 'rgba(192, 192, 192, 0.25)',
    accent: '#C0C0C0',
  },
  contender: {
    emoji: '🥇',
    gradient: 'linear-gradient(145deg, #F59E0B22, #D9770611)',
    glow: 'rgba(245, 158, 11, 0.25)',
    accent: '#F59E0B',
  },
  elite: {
    emoji: '💎',
    gradient: 'linear-gradient(145deg, #60A5FA22, #3B82F611)',
    glow: 'rgba(96, 165, 250, 0.25)',
    accent: '#60A5FA',
  },
  legend: {
    emoji: '👑',
    gradient: 'linear-gradient(145deg, #FFD70033, #FFA50022)',
    glow: 'rgba(255, 215, 0, 0.3)',
    accent: '#FFD700',
  },
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const tier = (searchParams.get('tier') || 'pacer').toLowerCase();
    const username = searchParams.get('username') || 'Runner';
    const xp = searchParams.get('xp') || '0';

    const design = tierDesigns[tier] || tierDesigns.pacer!;
    const tierName = tier.charAt(0).toUpperCase() + tier.slice(1);

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
          {/* Glow ring */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '900px',
              height: '900px',
              borderRadius: '450px',
              background: `radial-gradient(circle, ${design.glow} 0%, transparent 70%)`,
              position: 'relative',
            }}
          >
            {/* Tier emoji */}
            <div
              style={{
                fontSize: '150px',
                display: 'flex',
                marginBottom: '10px',
              }}
            >
              {design.emoji}
            </div>

            {/* Tier name */}
            <div
              style={{
                fontSize: '52px',
                fontWeight: '900',
                color: design.accent,
                letterSpacing: '6px',
                textTransform: 'uppercase',
                display: 'flex',
                marginBottom: '6px',
              }}
            >
              {tierName}
            </div>

            {/* Username */}
            <div
              style={{
                fontSize: '26px',
                fontWeight: '600',
                color: 'rgba(255, 255, 255, 0.8)',
                display: 'flex',
                marginBottom: '12px',
              }}
            >
              {username}
            </div>

            {/* XP */}
            <div
              style={{
                fontSize: '22px',
                fontWeight: '700',
                color: 'rgba(255, 255, 255, 0.5)',
                display: 'flex',
                letterSpacing: '2px',
              }}
            >
              {Number(xp).toLocaleString()} XP
            </div>

            {/* Strive watermark */}
            <div
              style={{
                position: 'absolute',
                bottom: '55px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  backgroundColor: design.accent,
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                <Logo width={26} height={26} fill="white" />
              </div>
              <span
                style={{
                  fontSize: '18px',
                  fontWeight: '800',
                  color: 'rgba(255, 255, 255, 0.5)',
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
    return new Response('Failed to generate tier badge', { status: 500 });
  }
}
