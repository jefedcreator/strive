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

    const rankLabel = type === 'gold' ? '1ST' : type === 'silver' ? '2ND' : type === 'bronze' ? '3RD' : '';

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
            // Transparent background
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
            {/* Badge body */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '700px',
                height: '700px',
                borderRadius: '350px',
                background: `linear-gradient(145deg, ${c.primary}22, ${c.secondary}11)`,
                border: `4px solid ${c.primary}44`,
                position: 'relative',
              }}
            >
              {/* Inner circle */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '550px',
                  height: '550px',
                  borderRadius: '275px',
                  background: `linear-gradient(145deg, ${c.primary}33, ${c.secondary}22)`,
                  border: `3px solid ${c.primary}66`,
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
                    }}
                  >
                    {subtitle}
                  </div>
                )}
              </div>
            </div>

            {/* Strive watermark at bottom */}
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
                  backgroundColor: c.primary,
                  borderRadius: '6px',
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
                  fontSize: '20px',
                  fontWeight: '800',
                  color: 'rgba(255, 255, 255, 0.5)',
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
