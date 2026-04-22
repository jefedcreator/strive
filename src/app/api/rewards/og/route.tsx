import { BadgeIcons, variantStyles } from '@/components/badge';
import { getFontSize } from '@/utils';
import Logo from '@/primitives/logo';
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const type = (searchParams.get('type') ||
      'gold') as keyof typeof variantStyles;
    const title = searchParams.get('title') || 'Reward';
    const subtitle = searchParams.get('subtitle') || '';
    const username = searchParams.get('username') || 'Runner';
    const milestone = searchParams.get('milestone') || '';
    const context = (searchParams.get('context') || 'leaderboard') as
      | 'leaderboard'
      | 'challenge'
      | 'club';
    const image = searchParams.get('image');

    const isChallenge = context === 'challenge';
    const isClub = context === 'club';
    const theme = variantStyles[type] || variantStyles.gold;
    const label = milestone ? `${milestone}K` : theme.label;
    const MainIcon = theme.Icon;

    // Context-specific visuals
    const contextAccent = isClub
      ? '#F59E0B'
      : isChallenge
        ? '#F97316'
        : '#14B8A6';
    const contextTagline = isClub
      ? 'Club milestone achieved on Strive'
      : isChallenge
        ? 'Challenge conquered on Strive'
        : 'Leaderboard finish on Strive';
    const ContextIcon = isClub
      ? BadgeIcons.Shield
      : isChallenge
        ? BadgeIcons.Sword
        : BadgeIcons.Trophy;
    const contextName = isClub
      ? 'CLUB MILESTONE'
      : isChallenge
        ? 'CHALLENGE'
        : 'LEADERBOARD';

    const titleFontSize = getFontSize(title, 64, 32);
    const subtitleFontSize = getFontSize(subtitle, 26, 18);

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
            fontFamily: 'system-ui, -apple-system, sans-serif',
            position: 'relative',
            overflow: 'hidden',
            background: isChallenge ? '#0C0A09' : '#09090B',
          }}
        >
          {/* Backgrounds */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
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
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
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
          </div>

          {/* Center Column Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              paddingBottom: '40px',
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
                padding: '10px 20px',
                background: `${contextAccent}0A`,
                marginBottom: 40,
                gap: '8px',
              }}
            >
              <ContextIcon width="20" height="20" stroke={contextAccent} />
              <div style={{ display: 'flex' }}>{contextName}</div>
            </div>

            {/* Middle: Unified Badge Section */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                width: '400px',
                height: '400px',
                marginBottom: 40,
              }}
            >
              {/* Glow */}
              <div
                style={{
                  position: 'absolute',
                  width: '500px',
                  height: '500px',
                  borderRadius: '250px',
                  background: `radial-gradient(circle, ${theme.satoriGlow} 0%, transparent 70%)`,
                  display: 'flex',
                }}
              />

              {/* Main Badge */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '320px',
                  height: '320px',
                  borderRadius: '160px',
                  background: theme.satoriGradient,
                  border: '12px solid white',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                  }}
                >
                  <MainIcon width="160" height="160" color="white" />
                </div>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: '900',
                    color: 'white',
                    letterSpacing: '6px',
                    marginTop: 8,
                    display: 'flex',
                    textTransform: 'uppercase',
                  }}
                >
                  {label}
                </div>
              </div>

              {/* Decorations */}
              <div
                style={{
                  position: 'absolute',
                  top: '0px',
                  right: '30px',
                  display: 'flex',
                }}
              >
                <BadgeIcons.Star width="48" height="48" color={theme.accent} />
              </div>
              <div
                style={{
                  position: 'absolute',
                  bottom: '30px',
                  left: '0px',
                  display: 'flex',
                }}
              >
                <BadgeIcons.Sparkles
                  width="64"
                  height="64"
                  color={theme.accent}
                />
              </div>
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
                  fontSize: titleFontSize,
                  fontWeight: '900',
                  color: '#ffffff',
                  lineHeight: 1.1,
                  letterSpacing: '-2px',
                  marginBottom: 16,
                  display: 'flex',
                  justifyContent: 'center',
                  textAlign: 'center',
                }}
              >
                {title}
              </div>

              {/* Subtitle */}
              {subtitle && (
                <div
                  style={{
                    fontSize: subtitleFontSize,
                    fontWeight: '600',
                    color: 'rgba(161,161,170,0.95)',
                    marginBottom: 24,
                    display: 'flex',
                    justifyContent: 'center',
                    lineHeight: 1.4,
                    textAlign: 'center',
                  }}
                >
                  {subtitle}
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
                    overflow: 'hidden',
                  }}
                >
                  {image ? (
                    <img
                      src={image}
                      width="40"
                      height="40"
                      style={{
                        width: '40px',
                        height: '40px',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    (username[0]?.toUpperCase() ?? 'R')
                  )}
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
