import { ImageResponse } from 'next/og';

export const runtime = 'edge';

// Image metadata
export const alt = 'DeGree Academic Vault';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      // Image HTML/CSS layout
      <div
        style={{
          background: 'linear-gradient(to bottom right, #9061CB, #E2D1F9)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            background: 'white',
            borderRadius: '40px',
            padding: '40px 80px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
          }}
        >
          <h1
            style={{
              fontSize: '100px',
              fontWeight: '900',
              color: '#333',
              margin: 0,
              letterSpacing: '-5px',
            }}
          >
            DeGree
          </h1>
          <p
            style={{
              fontSize: '30px',
              fontWeight: 'bold',
              color: '#9061CB',
              margin: '10px 0 0 0',
              textTransform: 'uppercase',
              letterSpacing: '5px',
            }}
          >
            Academic Vault
          </p>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}