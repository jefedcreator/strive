import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const name = searchParams.get('name');
    
    const text = name 
      ? (name.length > 18 ? name.substring(0, 18) + '...' : name)
      : 'Leaderboard';

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
            backgroundColor: '#000000',
            // background: 'linear-gradient(to bottom right, #1e293b, #0f172a)',
            color: 'rgba(255, 255, 255, 0.9)',
          }}
        >
          <div
            style={{
              fontSize: 160,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
            }}
          >
            🏆
          </div>
          <div
            style={{
              fontSize: 36,
              fontWeight: 'bold',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {text}
          </div>
        </div>
      ),
      {
        width: 400,
        height: 400,
      }
    );
  } catch (e: any) {
    console.error(e);
    return new Response('Failed to generate image', { status: 500 });
  }
}
