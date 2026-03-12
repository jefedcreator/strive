import { ImageResponse } from 'next/og';

export const runtime = 'edge';

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
            {/* Outer ring */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '720px',
                height: '720px',
                borderRadius: '360px',
                background: design.gradient,
                border: `4px solid ${design.accent}44`,
              }}
            >
              {/* Inner badge */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '560px',
                  height: '560px',
                  borderRadius: '280px',
                  background: `${design.gradient}`,
                  border: `3px solid ${design.accent}66`,
                }}
              >
                {/* Tier emoji */}
                <div style={{ fontSize: '150px', display: 'flex', marginBottom: '10px' }}>
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
              </div>
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
                }}
              >
                <svg width="16" height="16" viewBox="0 0 1024 1024">
                  <path
                    d="M 535.775 251.750 C 534.931 252.713, 526.624 264.525, 517.316 278 C 508.008 291.475, 493.705 312.175, 485.532 324 C 477.358 335.825, 464.141 354.950, 456.159 366.500 C 448.178 378.050, 438.206 392.450, 433.999 398.500 C 429.792 404.550, 418.316 421.200, 408.498 435.500 C 398.679 449.800, 386.072 468.025, 380.483 476 C 374.893 483.975, 362.738 501.525, 353.472 515 C 344.205 528.475, 334.586 542.425, 332.095 546 C 329.605 549.575, 322.727 559.475, 316.812 568 L 306.056 583.500 368.778 583.749 C 403.275 583.886, 432 584.185, 432.612 584.415 C 433.382 584.703, 433.468 586.468, 432.890 590.166 C 431.930 596.307, 429.163 617.344, 421.533 676.500 C 418.554 699.600, 414.725 729.049, 413.025 741.942 C 411.325 754.835, 410.153 765.957, 410.422 766.657 C 410.799 767.640, 416.604 767.928, 435.957 767.925 L 461.004 767.920 466.947 760.710 C 478.073 747.211, 505.482 713.755, 510.854 707.116 C 513.799 703.477, 517.184 699.375, 518.377 698 C 519.569 696.625, 527.713 686.725, 536.475 676 C 545.236 665.275, 558.726 648.818, 566.452 639.428 C 574.178 630.039, 586.559 614.964, 593.964 605.928 C 601.369 596.893, 613.942 581.625, 621.904 572 C 639.016 551.312, 648.500 539.830, 676 506.500 C 687.275 492.834, 701.184 475.994, 706.908 469.077 L 717.316 456.500 640.908 456 L 564.500 455.500 564.738 452.500 C 564.950 449.824, 566.232 438.986, 573.965 374.500 C 575.086 365.150, 576.877 350.525, 577.944 342 C 579.012 333.475, 581.532 313.225, 583.545 297 C 585.558 280.775, 587.594 264.575, 588.070 261 C 588.545 257.425, 588.949 253.488, 588.967 252.250 L 589 250 563.155 250 C 539.792 250, 537.163 250.168, 535.775 251.750"
                    fill="white"
                    fillRule="evenodd"
                  />
                </svg>
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
