import { ImageResponse } from 'next/og';

export const runtime = 'edge';


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const name = searchParams.get('name');
    const type = searchParams.get('type');

    const text = name
      ? name.length > 35
        ? name.substring(0, 35) + '…'
        : name
      : type === 'club'
        ? 'Club'
        : 'Leaderboard';

    const isClub = type === 'club';
    const emoji = isClub ? '👥' : '🏆';
    const accentColor = isClub ? '#34D399' : '#F59E0B';
    const accentGlow = isClub
      ? 'rgba(52, 211, 153, 0.15)'
      : 'rgba(245, 158, 11, 0.15)';

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
            background: '#09090B',
          }}
        >
          {/* ── Multi-layer background ───────────────── */}
          {/* Base mesh gradient */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              backgroundImage:
                'radial-gradient(ellipse 80% 60% at 20% 100%, rgba(99,102,241,0.12) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 0%, rgba(244,63,94,0.08) 0%, transparent 50%)',
            }}
          />

          {/* Subtle grid */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />

          {/* Accent radial glow behind content */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '700px',
              height: '700px',
              display: 'flex',
              borderRadius: '350px',
              background: `radial-gradient(circle, ${accentGlow} 0%, transparent 70%)`,
              transform: 'translate(-50%, -50%)',
            }}
          />

          {/* ── Top bar ───────────────────────────────── */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 56px',
            }}
          >
            {/* Logo */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              {/* Strive "S" mark */}
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: accentColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 1024 1024">
                  <path
                    d="M 535.775 251.750 C 534.931 252.713, 526.624 264.525, 517.316 278 C 508.008 291.475, 493.705 312.175, 485.532 324 C 477.358 335.825, 464.141 354.950, 456.159 366.500 C 448.178 378.050, 438.206 392.450, 433.999 398.500 C 429.792 404.550, 418.316 421.200, 408.498 435.500 C 398.679 449.800, 386.072 468.025, 380.483 476 C 374.893 483.975, 362.738 501.525, 353.472 515 C 344.205 528.475, 334.586 542.425, 332.095 546 C 329.605 549.575, 322.727 559.475, 316.812 568 L 306.056 583.500 368.778 583.749 C 403.275 583.886, 432 584.185, 432.612 584.415 C 433.382 584.703, 433.468 586.468, 432.890 590.166 C 431.930 596.307, 429.163 617.344, 421.533 676.500 C 418.554 699.600, 414.725 729.049, 413.025 741.942 C 411.325 754.835, 410.153 765.957, 410.422 766.657 C 410.799 767.640, 416.604 767.928, 435.957 767.925 L 461.004 767.920 466.947 760.710 C 478.073 747.211, 505.482 713.755, 510.854 707.116 C 513.799 703.477, 517.184 699.375, 518.377 698 C 519.569 696.625, 527.713 686.725, 536.475 676 C 545.236 665.275, 558.726 648.818, 566.452 639.428 C 574.178 630.039, 586.559 614.964, 593.964 605.928 C 601.369 596.893, 613.942 581.625, 621.904 572 C 639.016 551.312, 648.500 539.830, 676 506.500 C 687.275 492.834, 701.184 475.994, 706.908 469.077 L 717.316 456.500 640.908 456 L 564.500 455.500 564.738 452.500 C 564.950 449.824, 566.232 438.986, 573.965 374.500 C 575.086 365.150, 576.877 350.525, 577.944 342 C 579.012 333.475, 581.532 313.225, 583.545 297 C 585.558 280.775, 587.594 264.575, 588.070 261 C 588.545 257.425, 588.949 253.488, 588.967 252.250 L 589 250 563.155 250 C 539.792 250, 537.163 250.168, 535.775 251.750"
                    fill="white"
                    fillRule="evenodd"
                  />
                </svg>
              </div>
              <span
                style={{
                  fontSize: 28,
                  fontWeight: '900',
                  color: '#ffffff',
                  letterSpacing: '-0.5px',
                }}
              >
                STRIVE
              </span>
            </div>

            {/* Type pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: 14,
                fontWeight: '700',
                color: accentColor,
                textTransform: 'uppercase',
                letterSpacing: '3px',
                border: `1.5px solid ${accentColor}44`,
                borderRadius: '100px',
                padding: '8px 24px',
                background: `${accentColor}08`,
              }}
            >
              <span style={{ fontSize: 16 }}>{emoji}</span>
              {isClub ? 'Club' : 'Leaderboard'}
            </div>
          </div>

          {/* ── Main content ──────────────────────────── */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              padding: '100px 80px 80px',
            }}
          >
            {/* Icon container with ring */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 140,
                height: 140,
                borderRadius: '36px',
                border: `2px solid ${accentColor}33`,
                background: `linear-gradient(145deg, ${accentColor}11, ${accentColor}05)`,
                boxShadow: `0 0 60px ${accentColor}15, 0 20px 40px rgba(0,0,0,0.3)`,
                marginBottom: 32,
              }}
            >
              <span style={{ fontSize: 72, display: 'flex' }}>{emoji}</span>
            </div>

            {/* Decorative divider */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: 28,
              }}
            >
              <div
                style={{
                  width: '60px',
                  height: '1px',
                  background: `linear-gradient(90deg, transparent, ${accentColor}66)`,
                  display: 'flex',
                }}
              />
              <div
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '3px',
                  background: accentColor,
                  display: 'flex',
                }}
              />
              <div
                style={{
                  width: '60px',
                  height: '1px',
                  background: `linear-gradient(90deg, ${accentColor}66, transparent)`,
                  display: 'flex',
                }}
              />
            </div>

            {/* Title */}
            <div
              style={{
                fontSize: 68,
                fontWeight: '800',
                color: '#ffffff',
                textAlign: 'center',
                lineHeight: 1.05,
                letterSpacing: '-3px',
                maxWidth: '900px',
                display: 'flex',
              }}
            >
              {text}
            </div>

            {/* Subtitle tagline */}
            <div
              style={{
                fontSize: 18,
                fontWeight: '500',
                color: 'rgba(161, 161, 170, 0.8)',
                marginTop: 20,
                letterSpacing: '1px',
                display: 'flex',
              }}
            >
              {isClub
                ? 'Run together. Rise together.'
                : 'Compete. Climb. Conquer.'}
            </div>
          </div>

          {/* ── Bottom bar ─────────────────────────────── */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '56px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(0,0,0,0.3)',
            }}
          >
            <span
              style={{
                fontSize: 13,
                fontWeight: '700',
                color: 'rgba(161,161,170,0.5)',
                letterSpacing: '4px',
                textTransform: 'uppercase',
                display: 'flex',
              }}
            >
              strive.run
            </span>
          </div>

          {/* ── Corner accents ─────────────────────────── */}
          {/* Top-left corner line */}
          <div
            style={{
              position: 'absolute',
              top: '80px',
              left: '56px',
              width: '40px',
              height: '1px',
              background: `linear-gradient(90deg, ${accentColor}44, transparent)`,
              display: 'flex',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '80px',
              left: '56px',
              width: '1px',
              height: '40px',
              background: `linear-gradient(180deg, ${accentColor}44, transparent)`,
              display: 'flex',
            }}
          />
          {/* Bottom-right corner line */}
          <div
            style={{
              position: 'absolute',
              bottom: '56px',
              right: '56px',
              width: '40px',
              height: '1px',
              background: `linear-gradient(270deg, ${accentColor}44, transparent)`,
              display: 'flex',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '56px',
              right: '56px',
              width: '1px',
              height: '40px',
              background: `linear-gradient(0deg, ${accentColor}44, transparent)`,
              display: 'flex',
            }}
          />
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
    return new Response('Failed to generate image', { status: 500 });
  }
}