import Logo from '@/primitives/logo';
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

/**
 * OG image for shared badge pages (1200×630, social-optimized).
 * Params: type, title, subtitle, username, milestone, context (leaderboard|challenge)
 */
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
            fontFamily: 'system-ui, -apple-system, sans-serif',
            position: 'relative',
            overflow: 'hidden',
            background: isChallenge ? '#0C0A09' : '#09090B',
          }}
        >
          {/* Background — different per context */}
          {isChallenge ? (
            <>
              {/* Challenge: warm diagonal streaks */}
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
              <div
                style={{
                  position: 'absolute',
                  bottom: '-80px',
                  left: '-80px',
                  width: '400px',
                  height: '400px',
                  borderRadius: '200px',
                  background:
                    'radial-gradient(circle, rgba(239,68,68,0.06) 0%, transparent 70%)',
                  display: 'flex',
                }}
              />
            </>
          ) : (
            <>
              {/* Leaderboard: cool structured dots */}
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
                  position: 'absolute',
                  top: '50%',
                  left: '25%',
                  width: '600px',
                  height: '600px',
                  borderRadius: '300px',
                  background:
                    'radial-gradient(circle, rgba(20,184,166,0.06) 0%, transparent 60%)',
                  transform: 'translate(-50%, -50%)',
                  display: 'flex',
                }}
              />
            </>
          )}

          {/* Left: Badge preview */}
          <div
            style={{
              width: '42%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            {/* Badge shape — challenge uses a hexagonal feel, leaderboard uses circle */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: isChallenge ? '260px' : '280px',
                height: isChallenge ? '260px' : '280px',
                borderRadius: isChallenge ? '32px' : '140px',
                background: `${c.primary}0D`,
                border: `3px solid ${c.primary}33`,
                boxShadow: `0 0 80px ${c.primary}12`,
                position: 'relative',
                transform: isChallenge ? 'rotate(0deg)' : 'none',
              }}
            >
              <span style={{ fontSize: 90, display: 'flex' }}>{c.icon}</span>
              <span
                style={{
                  fontSize: 16,
                  fontWeight: '900',
                  color: c.primary,
                  letterSpacing: '4px',
                  marginTop: 10,
                  display: 'flex',
                }}
              >
                {milestone ? `${milestone}km` : c.label}
              </span>
            </div>
          </div>

          {/* Right: Info */}
          <div
            style={{
              width: '58%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '0 56px 0 16px',
            }}
          >
            {/* Context label */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: 13,
                  fontWeight: '800',
                  color: contextAccent,
                  letterSpacing: '3px',
                  textTransform: 'uppercase',
                  border: `1.5px solid ${contextAccent}44`,
                  borderRadius: '8px',
                  padding: '5px 14px',
                  background: `${contextAccent}0A`,
                }}
              >
                {contextLabel}
              </div>
            </div>

            {/* Badge title */}
            <div
              style={{
                fontSize: 42,
                fontWeight: '800',
                color: '#ffffff',
                lineHeight: 1.1,
                letterSpacing: '-2px',
                marginBottom: 10,
                display: 'flex',
                maxWidth: '500px',
              }}
            >
              {title.length > 30 ? title.substring(0, 30) + '…' : title}
            </div>

            {/* Subtitle */}
            {subtitle && (
              <div
                style={{
                  fontSize: 16,
                  fontWeight: '500',
                  color: 'rgba(161,161,170,0.7)',
                  marginBottom: 16,
                  display: 'flex',
                  maxWidth: '440px',
                  lineHeight: 1.4,
                }}
              >
                {subtitle.length > 70
                  ? subtitle.substring(0, 70) + '…'
                  : subtitle}
              </div>
            )}

            {/* Tagline */}
            <div
              style={{
                fontSize: 13,
                fontWeight: '600',
                color: 'rgba(161,161,170,0.5)',
                marginBottom: 16,
                display: 'flex',
                letterSpacing: '0.5px',
              }}
            >
              {contextTagline}
            </div>

            {/* Earned by */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '17px',
                  background: `${contextAccent}1A`,
                  border: `2px solid ${contextAccent}33`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 15,
                  fontWeight: '700',
                  color: contextAccent,
                }}
              >
                {username[0]?.toUpperCase() ?? 'R'}
              </div>
              <span
                style={{
                  fontSize: 17,
                  fontWeight: '600',
                  color: 'rgba(255,255,255,0.7)',
                  display: 'flex',
                }}
              >
                {username}
              </span>
            </div>
          </div>

          {/* Bottom bar with Strive logo */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 56px',
              borderTop: `1px solid rgba(255,255,255,0.05)`,
              background: 'rgba(0,0,0,0.25)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <div
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '4px',
                  background: contextAccent,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                <Logo width={18} height={18} fill="white" />
              </div>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: '800',
                  color: 'rgba(255,255,255,0.35)',
                  letterSpacing: '-0.3px',
                  display: 'flex',
                }}
              >
                STRIVE
              </span>
            </div>
            <span
              style={{
                fontSize: 11,
                fontWeight: '600',
                color: 'rgba(161,161,170,0.3)',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                display: 'flex',
              }}
            >
              strive.run
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
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
