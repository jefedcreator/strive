import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const name = searchParams.get('name');
    const type = (searchParams.get('type') || 'leaderboard') as
      | 'club'
      | 'leaderboard'
      | 'challenge';

    const text = name
      ? name.length > 32
        ? name.substring(0, 32) + '…'
        : name
      : type === 'club'
        ? 'Club'
        : type === 'challenge'
          ? 'Challenge'
          : 'Leaderboard';

    // ── Per-type visual identity (no gradients) ──────────────────────────
    const themes = {
      club: {
        bg: '#0A0F0D',
        accent: '#34D399',
        accentDim: '#34D39922',
        accentBorder: '#34D39933',
        emoji: '👥',
        label: 'CLUB',
        tagline: 'Run together. Rise together.',
        // Dots pattern
        patternType: 'dots' as const,
      },
      leaderboard: {
        bg: '#09090B',
        accent: '#14B8A6',
        accentDim: '#14B8A622',
        accentBorder: '#14B8A633',
        emoji: '🏆',
        label: 'LEADERBOARD',
        tagline: 'Compete. Climb. Conquer.',
        // Grid lines pattern
        patternType: 'grid' as const,
      },
      challenge: {
        bg: '#0C0A09',
        accent: '#F97316',
        accentDim: '#F9731622',
        accentBorder: '#F9731633',
        emoji: '⚔️',
        label: 'CHALLENGE',
        tagline: 'Accept the challenge. Prove yourself.',
        // Diagonal streaks pattern
        patternType: 'diagonals' as const,
      },
    };

    const t = themes[type] || themes.leaderboard;

    // Build pattern background based on type
    let patternStyle: React.CSSProperties = {};
    if (t.patternType === 'dots') {
      patternStyle = {
        backgroundImage: `radial-gradient(circle, ${t.accent}0A 1.5px, transparent 1.5px)`,
        backgroundSize: '28px 28px',
      };
    } else if (t.patternType === 'grid') {
      patternStyle = {
        backgroundImage: `linear-gradient(${t.accent}08 1px, transparent 1px), linear-gradient(90deg, ${t.accent}08 1px, transparent 1px)`,
        backgroundSize: '48px 48px',
      };
    } else {
      patternStyle = {
        backgroundImage: `repeating-linear-gradient(135deg, ${t.accent}06 0px, ${t.accent}06 1px, transparent 1px, transparent 36px)`,
      };
    }

    // Icon container shape varies: club = circle, leaderboard = rounded-square, challenge = rotated square (diamond)
    const iconSize = 120;
    const iconRadius =
      type === 'club' ? '60px' : type === 'challenge' ? '24px' : '32px';
    const iconTransform =
      type === 'challenge' ? 'rotate(45deg)' : 'none';
    const emojiTransform =
      type === 'challenge' ? 'rotate(-45deg)' : 'none';

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
            background: t.bg,
          }}
        >
          {/* ── Background pattern layer ──────────────── */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              ...patternStyle,
            }}
          />

          {/* ── Accent shape (large, behind content) ──── */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '520px',
              height: '520px',
              borderRadius: type === 'club' ? '260px' : type === 'challenge' ? '60px' : '80px',
              border: `1px solid ${t.accent}11`,
              background: `${t.accent}05`,
              transform: type === 'challenge'
                ? 'translate(-50%, -50%) rotate(45deg)'
                : 'translate(-50%, -50%)',
              display: 'flex',
            }}
          />
          {/* Inner accent shape for depth */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '320px',
              height: '320px',
              borderRadius: type === 'club' ? '160px' : type === 'challenge' ? '40px' : '50px',
              border: `1px solid ${t.accent}0D`,
              background: `${t.accent}03`,
              transform: type === 'challenge'
                ? 'translate(-50%, -50%) rotate(45deg)'
                : 'translate(-50%, -50%)',
              display: 'flex',
            }}
          />

          {/* ── Top bar ───────────────────────────────── */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '76px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 52px',
            }}
          >
            {/* Logo mark + wordmark */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: t.accent,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 1024 1024">
                  <path
                    d="M 535.775 251.750 C 534.931 252.713, 526.624 264.525, 517.316 278 C 508.008 291.475, 493.705 312.175, 485.532 324 C 477.358 335.825, 464.141 354.950, 456.159 366.500 C 448.178 378.050, 438.206 392.450, 433.999 398.500 C 429.792 404.550, 418.316 421.200, 408.498 435.500 C 398.679 449.800, 386.072 468.025, 380.483 476 C 374.893 483.975, 362.738 501.525, 353.472 515 C 344.205 528.475, 334.586 542.425, 332.095 546 C 329.605 549.575, 322.727 559.475, 316.812 568 L 306.056 583.500 368.778 583.749 C 403.275 583.886, 432 584.185, 432.612 584.415 C 433.382 584.703, 433.468 586.468, 432.890 590.166 C 431.930 596.307, 429.163 617.344, 421.533 676.500 C 418.554 699.600, 414.725 729.049, 413.025 741.942 C 411.325 754.835, 410.153 765.957, 410.422 766.657 C 410.799 767.640, 416.604 767.928, 435.957 767.925 L 461.004 767.920 466.947 760.710 C 478.073 747.211, 505.482 713.755, 510.854 707.116 C 513.799 703.477, 517.184 699.375, 518.377 698 C 519.569 696.625, 527.713 686.725, 536.475 676 C 545.236 665.275, 558.726 648.818, 566.452 639.428 C 574.178 630.039, 586.559 614.964, 593.964 605.928 C 601.369 596.893, 613.942 581.625, 621.904 572 C 639.016 551.312, 648.500 539.830, 676 506.500 C 687.275 492.834, 701.184 475.994, 706.908 469.077 L 717.316 456.500 640.908 456 L 564.500 455.500 564.738 452.500 C 564.950 449.824, 566.232 438.986, 573.965 374.500 C 575.086 365.150, 576.877 350.525, 577.944 342 C 579.012 333.475, 581.532 313.225, 583.545 297 C 585.558 280.775, 587.594 264.575, 588.070 261 C 588.545 257.425, 588.949 253.488, 588.967 252.250 L 589 250 563.155 250 C 539.792 250, 537.163 250.168, 535.775 251.750"
                    fill="white"
                    fillRule="evenodd"
                  />
                </svg>
              </div>
              <span
                style={{
                  fontSize: 26,
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
                fontSize: 12,
                fontWeight: '800',
                color: t.accent,
                textTransform: 'uppercase',
                letterSpacing: '4px',
                border: `1.5px solid ${t.accentBorder}`,
                borderRadius: type === 'challenge' ? '8px' : '100px',
                padding: '7px 20px',
                background: `${t.accent}08`,
              }}
            >
              <span style={{ fontSize: 14, display: 'flex' }}>{t.emoji}</span>
              {t.label}
            </div>
          </div>

          {/* ── Center content ─────────────────────────── */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              padding: '96px 80px 76px',
            }}
          >
            {/* Icon container */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: iconSize,
                height: iconSize,
                borderRadius: iconRadius,
                border: `2px solid ${t.accentBorder}`,
                background: t.accentDim,
                marginBottom: 28,
                transform: iconTransform,
              }}
            >
              <span
                style={{
                  fontSize: 56,
                  display: 'flex',
                  transform: emojiTransform,
                }}
              >
                {t.emoji}
              </span>
            </div>

            {/* Decorative separator — simple line + dot */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '1px',
                  background: t.accentBorder,
                  display: 'flex',
                }}
              />
              <div
                style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: type === 'challenge' ? '1px' : '3px',
                  background: t.accent,
                  display: 'flex',
                  transform: type === 'challenge' ? 'rotate(45deg)' : 'none',
                }}
              />
              <div
                style={{
                  width: '48px',
                  height: '1px',
                  background: t.accentBorder,
                  display: 'flex',
                }}
              />
            </div>

            {/* Title */}
            <div
              style={{
                fontSize: 64,
                fontWeight: '800',
                color: '#ffffff',
                textAlign: 'center',
                lineHeight: 1.05,
                letterSpacing: '-3px',
                maxWidth: '860px',
                display: 'flex',
              }}
            >
              {text}
            </div>

            {/* Tagline */}
            <div
              style={{
                fontSize: 16,
                fontWeight: '500',
                color: '#71717A',
                marginTop: 18,
                letterSpacing: '1.5px',
                display: 'flex',
              }}
            >
              {t.tagline}
            </div>
          </div>

          {/* ── Bottom bar ─────────────────────────────── */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderTop: `1px solid ${t.accent}0D`,
              background: `${t.accent}05`,
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: '700',
                color: '#52525B',
                letterSpacing: '5px',
                textTransform: 'uppercase',
                display: 'flex',
              }}
            >
              strive.run
            </span>
          </div>

          {/* ── Corner accents (solid lines) ────────────── */}
          <div
            style={{
              position: 'absolute',
              top: '76px',
              left: '52px',
              width: '32px',
              height: '1px',
              background: t.accentBorder,
              display: 'flex',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '76px',
              left: '52px',
              width: '1px',
              height: '32px',
              background: t.accentBorder,
              display: 'flex',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '48px',
              right: '52px',
              width: '32px',
              height: '1px',
              background: t.accentBorder,
              display: 'flex',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '48px',
              right: '52px',
              width: '1px',
              height: '32px',
              background: t.accentBorder,
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