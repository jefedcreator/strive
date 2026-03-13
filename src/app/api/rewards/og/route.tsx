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
    const username = searchParams.get('username') || 'Runner';
    const milestone = searchParams.get('milestone') || '';
    const context = (searchParams.get('context') || 'leaderboard') as
      | 'leaderboard'
      | 'challenge';

    const isChallenge = context === 'challenge';

    const colors: Record<
      string,
      { primary: string; secondary: string; icon: string; label: string }
    > = {
      gold: {
        primary: '#FFD700',
        secondary: '#FFA500',
        icon: '🥇',
        label: '1ST PLACE',
      },
      silver: {
        primary: '#C0C0C0',
        secondary: '#A0A0A0',
        icon: '🥈',
        label: '2ND PLACE',
      },
      bronze: {
        primary: '#CD7F32',
        secondary: '#A0522D',
        icon: '🥉',
        label: '3RD PLACE',
      },
      club: {
        primary: '#3b82f6',
        secondary: '#8b5cf6',
        icon: '🛡️',
        label: 'MILESTONE',
      },
    };

    const c = colors[type] || colors.gold!;

    // Context-specific visuals
    const contextAccent = isChallenge ? '#F97316' : '#14B8A6';
    const contextLabel = isChallenge ? '⚔️ CHALLENGE' : '🏆 LEADERBOARD';
    const contextTagline = isChallenge
      ? 'Challenge conquered on Strive'
      : 'Leaderboard finish on Strive';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center', // Center everything vertically in the square
            fontFamily: 'system-ui, -apple-system, sans-serif',
            position: 'relative',
            overflow: 'hidden',
            background: isChallenge ? '#0C0A09' : '#09090B',
          }}
        >
          {/* Backgrounds */}
          {isChallenge ? (
            <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  backgroundImage:
                    'repeating-linear-gradient(135deg, rgba(249,115,22,0.03) 0px, rgba(249,115,22,0.03) 1px, transparent 1px, transparent 40px)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '-100px',
                  right: '-100px',
                  width: '500px',
                  height: '500px',
                  borderRadius: '250px',
                  background:
                    'radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)',
                  display: 'flex',
                }}
              />
            </div>
          ) : (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  backgroundImage:
                    'radial-gradient(circle, rgba(20,184,166,0.04) 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
              />
              <div
                style={{
                  width: '800px',
                  height: '800px',
                  borderRadius: '400px',
                  background:
                    'radial-gradient(circle, rgba(20,184,166,0.06) 0%, transparent 60%)',
                  display: 'flex',
                }}
              />
            </div>
          )}

          {/* Center Column Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              paddingBottom: '40px', // Offset for the bottom bar
            }}
          >
            {/* Top: Context label */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: 18,
                fontWeight: '800',
                color: contextAccent,
                letterSpacing: '3px',
                textTransform: 'uppercase',
                border: `1.5px solid ${contextAccent}44`,
                borderRadius: '8px',
                padding: '6px 16px',
                background: `${contextAccent}0A`,
                marginBottom: 40,
              }}
            >
              {contextLabel}
            </div>

            {/* Middle: Badge shape */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '320px', // Slightly larger for the square layout
                height: '320px',
                borderRadius: isChallenge ? '40px' : '160px',
                background: `${c.primary}0D`,
                border: `3px solid ${c.primary}33`,
                boxShadow: `0 0 100px ${c.primary}12`,
                marginBottom: 40,
              }}
            >
              <span style={{ fontSize: 110, display: 'flex' }}>{c.icon}</span>
              <span
                style={{
                  fontSize: 18,
                  fontWeight: '900',
                  color: c.primary,
                  letterSpacing: '4px',
                  marginTop: 16,
                  display: 'flex',
                  textTransform: 'uppercase',
                }}
              >
                {milestone ? `${milestone}km` : c.label}
              </span>
            </div>

            {/* Bottom: Typography Section */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                maxWidth: '700px',
              }}
            >
              {/* Badge title */}
              <div
                style={{
                  fontSize: 64,
                  fontWeight: '900',
                  color: '#ffffff',
                  lineHeight: 1.1,
                  letterSpacing: '-2px',
                  marginBottom: 16,
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                {title.length > 35 ? title.substring(0, 35) + '…' : title}
              </div>

              {/* Subtitle */}
              {subtitle && (
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: '600',
                    color: 'rgba(161,161,170,0.95)',
                    marginBottom: 24,
                    display: 'flex',
                    justifyContent: 'center',
                    lineHeight: 1.4,
                  }}
                >
                  {subtitle.length > 70
                    ? subtitle.substring(0, 70) + '…'
                    : subtitle}
                </div>
              )}

              {/* Earned by Username */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '20px',
                    background: `${contextAccent}1A`,
                    border: `2px solid ${contextAccent}33`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 24,
                    fontWeight: '800',
                    color: contextAccent,
                  }}
                >
                  {username[0]?.toUpperCase() ?? 'R'}
                </div>
                <span
                  style={{
                    fontSize: 28,
                    fontWeight: '700',
                    color: 'rgba(255,255,255,0.95)',
                    display: 'flex',
                  }}
                >
                  {username}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom bar with Strive logo */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '56px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 40px',
              borderTop: `1px solid rgba(255,255,255,0.05)`,
              background: 'rgba(0,0,0,0.4)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                  background: contextAccent,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                <Logo width={24} height={24} fill="white" />
              </div>
              <span
                style={{
                  fontSize: 18,
                  fontWeight: '900',
                  color: 'rgba(255,255,255,0.8)',
                  letterSpacing: '1px',
                  display: 'flex',
                }}
              >
                STRIVE
              </span>
            </div>
            <span
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: 'rgba(161,161,170,0.6)',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                display: 'flex',
              }}
            >
              usestrive.run
            </span>
          </div>
        </div>
      ),
      {
        width: 1080,
            // Standard social square
        height: 1080, 
        headers: {
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      }
    );
  } catch (e: unknown) {
    console.error(e);
    return new Response('Failed to generate badge OG image', { status: 500 });
  }
}