'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark">
      <body style={{ 
        fontFamily: 'system-ui, sans-serif',
        margin: 0,
        padding: 0,
        backgroundColor: 'oklch(0.145 0 0)',
        color: 'oklch(0.985 0 0)'
      }}>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            maxWidth: '42rem',
            width: '100%',
            textAlign: 'center'
          }}>
            {/* Error Icon */}
            <div style={{
              fontSize: '4rem',
              marginBottom: '2rem'
            }}>
              ⚠️
            </div>

            {/* Error Message */}
            <h1 style={{
              fontSize: '3rem',
              fontWeight: 'bold',
              marginBottom: '1rem'
            }}>
              Something went wrong
            </h1>
            <p style={{
              fontSize: '1.125rem',
              color: 'oklch(0.708 0 0)',
              marginBottom: '2rem'
            }}>
              We encountered an unexpected error. This has been logged and we&apos;ll look into it.
            </p>
            
            {process.env.NODE_ENV === 'development' && error?.message && (
              <div style={{
                marginTop: '2rem',
                padding: '1rem',
                borderRadius: '0.5rem',
                backgroundColor: 'oklch(0.704 0.191 22.216 / 0.1)',
                border: '1px solid oklch(0.704 0.191 22.216 / 0.2)',
                marginBottom: '2rem'
              }}>
                <p style={{
                  fontSize: '0.875rem',
                  fontFamily: 'monospace',
                  textAlign: 'left',
                  color: 'oklch(0.704 0.191 22.216)',
                  wordBreak: 'break-all'
                }}>
                  {error.message}
                </p>
                {error.digest && (
                  <p style={{
                    fontSize: '0.75rem',
                    color: 'oklch(0.708 0 0)',
                    marginTop: '0.5rem'
                  }}>
                    Error ID: {error.digest}
                  </p>
                )}
              </div>
            )}

            {/* Actions */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '2rem'
            }}>
              <button
                onClick={reset}
                style={{
                  padding: '0.75rem 2rem',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  backgroundColor: 'oklch(0.985 0 0)',
                  color: 'oklch(0 0 0)',
                  border: 'none',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                  width: '100%',
                  maxWidth: '200px'
                }}
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                style={{
                  padding: '0.75rem 2rem',
                  fontSize: '1rem',
                  backgroundColor: 'transparent',
                  color: 'oklch(0.985 0 0)',
                  border: '1px solid oklch(1 0 0 / 10%)',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                  width: '100%',
                  maxWidth: '200px'
                }}
              >
                Go Home
              </button>
            </div>

            {/* Support Info */}
            <div style={{
              paddingTop: '2rem',
              borderTop: '1px solid oklch(1 0 0 / 10%)'
            }}>
              <p style={{
                fontSize: '0.875rem',
                color: 'oklch(0.708 0 0)'
              }}>
                If this problem persists, please contact support.
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

