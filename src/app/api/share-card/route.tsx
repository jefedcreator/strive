import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const leaderboardName = searchParams.get('leaderboardName') || 'Challenge';
    const name = searchParams.get('name') || 'Athlete';
    const score = searchParams.get('score') || '0';
    const rank = searchParams.get('rank') || '-';
    const distance = searchParams.get('distance') || '0';
    const pace = searchParams.get('pace') || '0:00';
    const duration = searchParams.get('duration') || '0';
    const avatar = searchParams.get('avatar');

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
            backgroundColor: '#050505',
            backgroundImage:
              'radial-gradient(circle at 50% 50%, #1a1a1a 0%, #050505 100%)',
            padding: '60px',
            color: 'white',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          {/* Decorative background glow */}
          <div
            style={{
              position: 'absolute',
              top: '-100px',
              right: '-100px',
              width: '400px',
              height: '400px',
              borderRadius: '200px',
              background: 'rgba(59, 130, 246, 0.15)',
              filter: 'blur(100px)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-100px',
              left: '-100px',
              width: '400px',
              height: '400px',
              borderRadius: '200px',
              background: 'rgba(139, 92, 246, 0.15)',
              filter: 'blur(100px)',
            }}
          />

          {/* Header with Logo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              marginBottom: '60px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#3b82f6',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '16px',
                }}
              >
                <svg width="32" height="32" viewBox="0 0 1024 1024">
                  <path
                    d="M 535.775 251.750 C 534.931 252.713, 526.624 264.525, 517.316 278 C 508.008 291.475, 493.705 312.175, 485.532 324 C 477.358 335.825, 464.141 354.950, 456.159 366.500 C 448.178 378.050, 438.206 392.450, 433.999 398.500 C 429.792 404.550, 418.316 421.200, 408.498 435.500 C 398.679 449.800, 386.072 468.025, 380.483 476 C 374.893 483.975, 362.738 501.525, 353.472 515 C 344.205 528.475, 334.586 542.425, 332.095 546 C 329.605 549.575, 322.727 559.475, 316.812 568 L 306.056 583.500 368.778 583.749 C 403.275 583.886, 432 584.185, 432.612 584.415 C 433.382 584.703, 433.468 586.468, 432.890 590.166 C 431.930 596.307, 429.163 617.344, 421.533 676.500 C 418.554 699.600, 414.725 729.049, 413.025 741.942 C 411.325 754.835, 410.153 765.957, 410.422 766.657 C 410.799 767.640, 416.604 767.928, 435.957 767.925 L 461.004 767.920 466.947 760.710 C 478.073 747.211, 505.482 713.755, 510.854 707.116 C 513.799 703.477, 517.184 699.375, 518.377 698 C 519.569 696.625, 527.713 686.725, 536.475 676 C 545.236 665.275, 558.726 648.818, 566.452 639.428 C 574.178 630.039, 586.559 614.964, 593.964 605.928 C 601.369 596.893, 613.942 581.625, 621.904 572 C 639.016 551.312, 648.500 539.830, 676 506.500 C 687.275 492.834, 701.184 475.994, 706.908 469.077 L 717.316 456.500 640.908 456 L 564.500 455.500 564.738 452.500 C 564.950 449.824, 566.232 438.986, 573.965 374.500 C 575.086 365.150, 576.877 350.525, 577.944 342 C 579.012 333.475, 581.532 313.225, 583.545 297 C 585.558 280.775, 587.594 264.575, 588.070 261 C 588.545 257.425, 588.949 253.488, 588.967 252.250 L 589 250 563.155 250 C 539.792 250, 537.163 250.168, 535.775 251.750"
                    fill="white"
                    fillRule="evenodd"
                  />
                </svg>
              </div>
              <span
                style={{
                  fontSize: '32px',
                  fontWeight: '900',
                  letterSpacing: '-1px',
                }}
              >
                Strive
              </span>
            </div>
            <div
              style={{
                fontSize: '14px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                color: 'rgba(255, 255, 255, 0.4)',
              }}
            >
              Challenge Completed
            </div>
          </div>

          {/* Main Card Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '32px',
              padding: '60px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Inner glow */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '1px',
                background:
                  'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
              }}
            />

            {/* User Info */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '40px',
              }}
            >
              {avatar ? (
                <img
                  src={avatar}
                  width="80"
                  height="80"
                  style={{
                    borderRadius: '40px',
                    marginRight: '24px',
                    border: '4px solid rgba(255, 255, 255, 0.1)',
                  }}
                  alt=""
                />
              ) : (
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '40px',
                    backgroundColor: '#3b82f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '24px',
                    fontSize: '32px',
                    fontWeight: 'bold',
                    color: 'white',
                  }}
                >
                  {name[0]}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '32px', fontWeight: '800' }}>
                  {name}
                </span>
                <span
                  style={{
                    fontSize: '18px',
                    color: 'rgba(255, 255, 255, 0.5)',
                  }}
                >
                  Finished &quot;{leaderboardName}&quot;
                </span>
              </div>
            </div>

            {/* Rank and Score */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                marginBottom: '60px',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    color: '#3b82f6',
                    marginBottom: '8px',
                  }}
                >
                  Leaderboard Rank
                </span>
                <span
                  style={{
                    fontSize: '120px',
                    fontWeight: '900',
                    lineHeight: '1',
                    letterSpacing: '-4px',
                  }}
                >
                  #{rank}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                }}
              >
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    color: 'rgba(255, 255, 255, 0.4)',
                    marginBottom: '8px',
                  }}
                >
                  Total Score
                </span>
                <span style={{ fontSize: '64px', fontWeight: '800' }}>
                  {score}
                </span>
              </div>
            </div>

            {/* Stats Grid */}
            <div
              style={{
                display: 'flex',
                gap: '24px',
                width: '100%',
              }}
            >
              {[
                { label: 'Distance', value: `${distance}km` },
                { label: 'Avg Pace', value: `${pace}/km` },
                { label: 'Total Time', value: `${duration}m` },
              ].map((stat, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '24px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '20px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      color: 'rgba(255, 255, 255, 0.4)',
                      marginBottom: '8px',
                    }}
                  >
                    {stat.label}
                  </span>
                  <span style={{ fontSize: '24px', fontWeight: '800' }}>
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Tagline */}
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.3)',
              fontWeight: '500',
            }}
          >
            Together we strive.
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 1200,
        headers: {
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      }
    );
  } catch (e: any) {
    console.error(e);
    return new Response('Failed to generate image', { status: 500 });
  }
}
