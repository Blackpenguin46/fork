import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title') || 'Cybernex Academy';
    const description = searchParams.get('description') || 'Premier Cybersecurity Learning Platform';
    const type = searchParams.get('type') || 'article';

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
            backgroundColor: '#0A192F',
            backgroundImage: 'linear-gradient(45deg, #0A192F 0%, #1A365D 100%)',
            fontSize: 32,
            fontWeight: 600,
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              padding: '40px 60px',
              position: 'absolute',
              top: 0,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                color: '#00FFFF',
                fontSize: 28,
                fontWeight: 700,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  backgroundColor: '#00FFFF',
                  borderRadius: '8px',
                  marginRight: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    color: '#0A192F',
                    fontSize: 20,
                    fontWeight: 900,
                  }}
                >
                  C
                </div>
              </div>
              Cybernex Academy
            </div>
            
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                color: '#64FFDA',
                fontSize: 18,
                textTransform: 'uppercase',
                letterSpacing: '2px',
              }}
            >
              {type === 'course' ? '🎓 Course' : 
               type === 'article' ? '📚 Article' : 
               type === 'community' ? '👥 Community' : 
               '🔍 Insights'}
            </div>
          </div>

          {/* Main Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '0 60px',
              maxWidth: '80%',
            }}
          >
            <h1
              style={{
                fontSize: title.length > 50 ? 48 : 64,
                fontWeight: 800,
                color: '#FFFFFF',
                marginBottom: 24,
                lineHeight: 1.2,
                textAlign: 'center',
              }}
            >
              {title}
            </h1>
            
            {description && (
              <p
                style={{
                  fontSize: 24,
                  color: '#94A3B8',
                  marginBottom: 40,
                  lineHeight: 1.4,
                  textAlign: 'center',
                  maxWidth: '90%',
                }}
              >
                {description.length > 120 ? description.substring(0, 120) + '...' : description}
              </p>
            )}

            {/* Features Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 40,
                color: '#64FFDA',
                fontSize: 18,
                fontWeight: 500,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: 8 }}>🔒</span>
                Expert Content
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: 8 }}>⚡</span>
                Hands-on Learning
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: 8 }}>🎯</span>
                Career Focused
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              padding: '40px 60px',
              position: 'absolute',
              bottom: 0,
            }}
          >
            <div
              style={{
                color: '#64FFDA',
                fontSize: 20,
                fontWeight: 600,
              }}
            >
              cybernexacademy.com
            </div>
          </div>

          {/* Decorative Elements */}
          <div
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              width: 100,
              height: 100,
              backgroundColor: '#00FFFF',
              opacity: 0.1,
              borderRadius: '50%',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 20,
              left: 20,
              width: 60,
              height: 60,
              backgroundColor: '#FF00FF',
              opacity: 0.1,
              borderRadius: '50%',
            }}
          />
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('Error generating OG image:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}