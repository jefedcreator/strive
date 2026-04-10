import Logo from '@/primitives/logo';
import { db } from '@/server/db';
import { ImageResponse } from 'next/og';
import { type Prisma } from '@prisma/client';

export const runtime = 'nodejs';

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    console.log('id', id);

    if (!id) {
      return new Response('Missing leaderboard id', { status: 400 });
    }

    const url = new URL(request.url);
    const sortByParam = url.searchParams.get('sortBy');
    const sortOrderParam = url.searchParams.get('sortOrder');
    const allowedSortBy = new Set([
      'score',
      'fullname',
      'createdAt',
      'distance',
      'pace',
    ]);
    const allowedSortOrder = new Set(['asc', 'desc']);
    const sortByField =
      sortByParam && allowedSortBy.has(sortByParam) ? sortByParam : 'score';
    const sortOrder =
      sortOrderParam && allowedSortOrder.has(sortOrderParam)
        ? (sortOrderParam as Prisma.SortOrder)
        : ((sortByField === 'pace' ? 'asc' : 'desc') as Prisma.SortOrder);

    const orderBy: Prisma.UserLeaderboardOrderByWithRelationInput = {};

    if (sortByField === 'fullname') {
      orderBy.user = {
        fullname: sortOrder,
      };
    } else if (sortByField === 'distance') {
      orderBy.runDistance = sortOrder;
    } else if (sortByField === 'pace') {
      orderBy.runPace = sortOrder;
    } else {
      orderBy[
        sortByField as keyof Prisma.UserLeaderboardOrderByWithRelationInput
      ] = sortOrder;
    }

    const leaderboard = await db.leaderboard.findUnique({
      where: { id },
      include: {
        entries: {
          orderBy,
          include: {
            user: {
              select: {
                id: true,
                fullname: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
        club: {
          select: {
            name: true,
          },
        },
        _count: {
          select: { entries: true },
        },
      },
    });

    if (!leaderboard) {
      return new Response('Leaderboard not found', { status: 404 });
    }

    const isChallenge = !leaderboard.clubId;
    const typeLabel = isChallenge ? 'CHALLENGE' : 'LEADERBOARD';
    const participantCount = leaderboard._count.entries;
    let entries = leaderboard.entries;

    if (sortByField === 'pace') {
      const isZeroPace = (pace: string | null) =>
        !pace || pace === '0' || pace === '0:00' || pace === '00:00';
      const validEntries = entries.filter(
        (entry) => !isZeroPace(entry.runPace)
      );
      const zeroEntries = entries.filter((entry) => isZeroPace(entry.runPace));
      entries = [...validEntries, ...zeroEntries];
    }

    entries = entries.slice(0, 5);

    const activeSortKey =
      sortByField === 'fullname'
        ? 'athlete'
        : sortByField === 'distance'
          ? 'distance'
          : sortByField === 'pace'
            ? 'pace'
            : 'rank';

    const headerLabelStyle = (active: boolean) => ({
      fontSize: 16,
      fontWeight: 700,
      letterSpacing: '4px',
      textTransform: 'uppercase' as const,
      color: active ? '#F97316' : 'rgba(255,255,255,0.3)',
      background: active ? 'rgba(249,115,22,0.12)' : 'transparent',
      border: active
        ? '1px solid rgba(249,115,22,0.35)'
        : '1px solid transparent',
      padding: active ? '6px 10px' : '0px',
      borderRadius: '10px',
      display: 'flex',
      boxSizing: 'border-box' as const,
    });

    const getRankColors = (rank: number) => {
      if (rank === 1)
        return {
          bg: 'rgba(250, 204, 21, 0.15)',
          border: 'rgba(250, 204, 21, 0.4)',
          text: '#FBBF24',
          badge: 'linear-gradient(135deg, #F59E0B, #EAB308)',
          badgeText: '#78350F',
        };
      if (rank === 2)
        return {
          bg: 'rgba(148, 163, 184, 0.1)',
          border: 'rgba(148, 163, 184, 0.3)',
          text: '#94A3B8',
          badge: 'linear-gradient(135deg, #CBD5E1, #94A3B8)',
          badgeText: '#1E293B',
        };
      if (rank === 3)
        return {
          bg: 'rgba(251, 146, 60, 0.1)',
          border: 'rgba(251, 146, 60, 0.3)',
          text: '#FB923C',
          badge: 'linear-gradient(135deg, #FB923C, #EA580C)',
          badgeText: '#431407',
        };
      return {
        bg: 'transparent',
        border: 'rgba(255,255,255,0.05)',
        text: 'rgba(255,255,255,0.4)',
        badge: 'transparent',
        badgeText: 'rgba(255,255,255,0.4)',
      };
    };

    const getInitials = (name: string | null) => {
      if (!name) return '?';
      const parts = name.split(' ');
      if (parts.length >= 2) {
        const first = parts[0]?.[0] ?? '';
        const second = parts[1]?.[0] ?? '';
        return `${first}${second}`.toUpperCase();
      }
      return (name[0] ?? '?').toUpperCase();
    };

    const avatarColors = [
      '#6366F1', // indigo
      '#EC4899', // pink
      '#14B8A6', // teal
      '#A855F7', // purple
      '#F97316', // orange
    ];

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#09090B',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle gradient orbs - scaled up */}
          <div
            style={{
              position: 'absolute',
              top: '-180px',
              right: '-120px',
              width: '600px',
              height: '600px',
              borderRadius: '50%',
              background:
                'radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)',
              display: 'flex',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-150px',
              left: '-90px',
              width: '550px',
              height: '550px',
              borderRadius: '50%',
              background:
                'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)',
              display: 'flex',
            }}
          />

          {/* Header - scaled padding */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '64px 72px 0 72px',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                maxWidth: '850px',
              }}
            >
              {/* Type badge - scaled texts and padding */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                }}
              >
                <span
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    letterSpacing: '5px',
                    textTransform: 'uppercase',
                    color: '#F97316',
                    display: 'flex',
                  }}
                >
                  STRIVE {typeLabel}
                </span>
                {leaderboard.club && (
                  <span
                    style={{
                      fontSize: 20,
                      fontWeight: 600,
                      color: 'rgba(255,255,255,0.35)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    •{'  '}
                    {leaderboard.club.name}
                  </span>
                )}
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    letterSpacing: '3px',
                    textTransform: 'uppercase',
                    color:
                      leaderboard.type === 'PACE'
                        ? '#F59E0B'
                        : leaderboard.type === 'COMBINED'
                          ? '#A78BFA'
                          : '#2DD4BF',
                    background:
                      leaderboard.type === 'PACE'
                        ? 'rgba(245,158,11,0.12)'
                        : leaderboard.type === 'COMBINED'
                          ? 'rgba(167,139,250,0.12)'
                          : 'rgba(45,212,191,0.12)',
                    padding: '8px 16px',
                    borderRadius: '12px',
                    display: 'flex',
                  }}
                >
                  {leaderboard.type === 'PACE'
                    ? 'PACE'
                    : leaderboard.type === 'COMBINED'
                      ? 'COMBINED'
                      : 'DISTANCE'}
                </span>
              </div>

              {/* Leaderboard name - scaled font */}
              <h1
                style={{
                  fontSize: leaderboard.name.length > 30 ? 48 : 64,
                  fontWeight: 900,
                  color: '#FFFFFF',
                  letterSpacing: '-1.5px',
                  lineHeight: 1.1,
                  display: 'flex',
                  margin: 0,
                }}
              >
                {leaderboard.name}
              </h1>
            </div>

            {/* Participant count - scaled text and padding */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                padding: '24px 36px',
                borderRadius: '24px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <span
                style={{
                  fontSize: 56,
                  fontWeight: 900,
                  color: '#FFFFFF',
                  display: 'flex',
                  lineHeight: 1,
                }}
              >
                {participantCount}
              </span>
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  letterSpacing: '3px',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.35)',
                  display: 'flex',
                }}
              >
                ATHLETES
              </span>
            </div>
          </div>

          {/* Rankings Table - scaled margin and width portions */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              margin: '40px 72px 0 72px',
              borderRadius: '24px',
              border: '1px solid rgba(255,255,255,0.08)',
              overflow: 'hidden',
              flex: 1,
            }}
          >
            {/* Table header - scaled columns */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '24px 36px',
                background: 'rgba(255,255,255,0.03)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <span
                style={{
                  width: '100px',
                  display: 'flex',
                }}
              >
                <span style={headerLabelStyle(activeSortKey === 'rank')}>
                  RANK
                </span>
              </span>
              <span
                style={{
                  flex: 1,
                  display: 'flex',
                }}
              >
                <span style={headerLabelStyle(activeSortKey === 'athlete')}>
                  ATHLETE
                </span>
              </span>
              <span
                style={{
                  width: '220px',
                  textAlign: 'right',
                  display: 'flex',
                  justifyContent: 'flex-end',
                }}
              >
                <span style={headerLabelStyle(activeSortKey === 'distance')}>
                  DISTANCE
                </span>
              </span>
              <span
                style={{
                  width: '200px',
                  textAlign: 'right',
                  display: 'flex',
                  justifyContent: 'flex-end',
                }}
              >
                <span style={headerLabelStyle(activeSortKey === 'pace')}>
                  AVG PACE
                </span>
              </span>
            </div>

            {/* Entries */}
            {entries.length > 0 ? (
              entries.map((entry, index) => {
                const rank = index + 1;
                const colors = getRankColors(rank);
                const name =
                  entry.user.fullname ?? entry.user.username ?? 'Guest';
                const initials = getInitials(
                  entry.user.fullname ?? entry.user.username
                );
                const avatarBg = avatarColors[index % avatarColors.length];

                return (
                  <div
                    key={entry.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '24px 36px',
                      background: colors.bg,
                      borderBottom: `1px solid ${colors.border}`,
                    }}
                  >
                    {/* Rank badge */}
                    <div
                      style={{
                        width: '100px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <div
                        style={{
                          width: '54px',
                          height: '54px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 24,
                          fontWeight: 800,
                          background: rank <= 3 ? colors.badge : 'transparent',
                          color: rank <= 3 ? colors.badgeText : colors.text,
                        }}
                      >
                        {rank}
                      </div>
                    </div>

                    {/* Athlete */}
                    <div
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '24px',
                      }}
                    >
                      {/* Avatar */}
                      <div
                        style={{
                          width: '64px',
                          height: '64px',
                          borderRadius: '50%',
                          background: avatarBg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 24,
                          fontWeight: 700,
                          color: '#FFFFFF',
                          flexShrink: 0,
                        }}
                      >
                        {initials}
                      </div>
                      <span
                        style={{
                          fontSize: 28,
                          fontWeight: 700,
                          color:
                            rank <= 3 ? '#FFFFFF' : 'rgba(255,255,255,0.7)',
                          display: 'flex',
                        }}
                      >
                        {name.length > 24 ? name.slice(0, 24) + '…' : name}
                      </span>
                    </div>

                    {/* Distance */}
                    <div
                      style={{
                        width: '220px',
                        display: 'flex',
                        justifyContent: 'flex-end',
                      }}
                    >
                      <span
                        style={{
                          fontSize: 24,
                          fontWeight: 800,
                          color: '#F97316',
                          background: 'rgba(249,115,22,0.1)',
                          padding: '10px 20px',
                          borderRadius: '16px',
                          border: '1px solid rgba(249,115,22,0.15)',
                          display: 'flex',
                        }}
                      >
                        {entry.runDistance != null
                          ? `${entry.runDistance.toFixed(1)} km`
                          : '—'}
                      </span>
                    </div>

                    {/* Pace */}
                    <div
                      style={{
                        width: '200px',
                        display: 'flex',
                        justifyContent: 'flex-end',
                      }}
                    >
                      <span
                        style={{
                          fontSize: 24,
                          fontWeight: 600,
                          color: 'rgba(255,255,255,0.5)',
                          display: 'flex',
                        }}
                      >
                        {entry.runPace ?? '—'}
                        {entry.runPace && (
                          <span
                            style={{
                              fontSize: 16,
                              color: 'rgba(255,255,255,0.3)',
                              marginLeft: '6px',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            /km
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '64px',
                  color: 'rgba(255,255,255,0.3)',
                  fontSize: 24,
                }}
              >
                No athletes have joined yet
              </div>
            )}

            {/* More indicator */}
            {participantCount > 5 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '24px',
                  background: 'rgba(255,255,255,0.02)',
                }}
              >
                <span
                  style={{
                    fontSize: 20,
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.25)',
                    display: 'flex',
                  }}
                >
                  +{participantCount - 5} more athletes
                </span>
              </div>
            )}
          </div>

          {/* Footer - scaled paddings and texts */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '32px 72px 48px 72px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: '#F97316',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                <Logo width={36} height={36} fill="#FFFFFF" />
              </div>
              <span
                style={{
                  fontSize: 28,
                  fontWeight: 900,
                  color: 'rgba(255,255,255,0.8)',
                  letterSpacing: '1.5px',
                  display: 'flex',
                }}
              >
                STRIVE
              </span>
            </div>
            <span
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: 'rgba(161,161,170,0.5)',
                letterSpacing: '4px',
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
        width: 1200,
        height: 1200,
        headers: {
          'Cache-Control':
            'public, max-age=300, s-maxage=600, stale-while-revalidate=3600',
        },
      }
    );
  } catch (e: unknown) {
    console.error('OG leaderboard error:', e);
    return new Response('Failed to generate image', { status: 500 });
  }
}
