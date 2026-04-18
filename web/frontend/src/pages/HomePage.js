import React from 'react';

const stats = [
  { value: '1,451', label: 'Properties Analyzed' },
  { value: '29.84%', label: 'MAPE Score' },
  { value: '2.09%', label: 'CV Stability' },
  { value: '143 KB', label: 'Model Size' },
];

const features = [
  {
    icon: '⚡',
    title: 'Instant Predictions',
    desc: 'Get AI-powered price estimates in seconds using our Gradient Boosting model trained on Philippine real estate data.',
  },
  {
    icon: '📊',
    title: 'Market Analytics',
    desc: 'Explore regional pricing trends, price distributions, and per-sqm rates across major Philippine cities.',
  },
  {
    icon: '🛡️',
    title: 'Robust & Reliable',
    desc: 'Only 7.21% accuracy degradation under noisy input — the most resilient model tested across all alternatives.',
  },
  {
    icon: '🏡',
    title: 'Residential Focus',
    desc: 'Purpose-built for Philippine residential properties: condominiums, houses, townhouses across all regions.',
  },
];

export default function HomePage({ navigate }) {
  return (
    <div>
      {/* Hero */}
      <section style={{
        minHeight: '88vh', display: 'flex', alignItems: 'center',
        padding: '60px 32px',
        background: `
          radial-gradient(ellipse 80% 60% at 20% 40%, rgba(46,196,182,0.06) 0%, transparent 60%),
          radial-gradient(ellipse 60% 50% at 80% 60%, rgba(201,168,76,0.08) 0%, transparent 55%)
        `,
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
          <div style={{ maxWidth: 720, animation: 'fadeUp 0.7s ease' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'var(--gold-dim)', border: '1px solid var(--border)',
              borderRadius: 100, padding: '6px 16px', marginBottom: 32,
            }}>
              <span style={{ color: 'var(--gold)', fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Machine Learning · Capstone 2026
              </span>
            </div>

            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(42px, 7vw, 84px)',
              fontWeight: 800, lineHeight: 1.0,
              marginBottom: 24,
              letterSpacing: '-0.03em',
            }}>
              Forecast
              <br />
              <span style={{
                background: 'linear-gradient(135deg, var(--gold) 0%, var(--teal) 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                Housing Prices
              </span>
              <br />
              Intelligently.
            </h1>

            <p style={{
              fontSize: 18, color: 'var(--text-secondary)', lineHeight: 1.7,
              marginBottom: 40, maxWidth: 560, fontWeight: 300,
            }}>
              PropForecast PH uses a Gradient Boosting model trained on 1,451 Philippine property listings to deliver instant, data-driven residential price estimates — no broker required.
            </p>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <button onClick={() => navigate('predict')} style={{
                background: 'linear-gradient(135deg, var(--gold), #b8943e)',
                border: 'none', borderRadius: 12, color: 'var(--navy)',
                padding: '16px 36px', fontSize: 16,
                fontFamily: 'var(--font-display)', fontWeight: 700, cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 4px 24px rgba(201,168,76,0.3)',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(201,168,76,0.45)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(201,168,76,0.3)'; }}
              >
                Get Free Estimate →
              </button>
              <button onClick={() => navigate('analytics')} style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: 12, color: 'var(--text-secondary)',
                padding: '16px 36px', fontSize: 16,
                fontFamily: 'var(--font-body)', fontWeight: 400, cursor: 'pointer',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--gold)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                View Market Analytics
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section style={{
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '40px 32px',
        background: 'var(--surface)',
        backdropFilter: 'blur(10px)',
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 40, textAlign: 'center',
        }}>
          {stats.map((s, i) => (
            <div key={i} style={{ animation: `fadeUp 0.5s ease ${i * 0.1}s both` }}>
              <div style={{ fontSize: 36, fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--gold)', letterSpacing: '-0.02em' }}>{s.value}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '100px 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, marginBottom: 16 }}>
              Built for the Philippine<br />
              <span style={{ color: 'var(--teal)' }}>Real Estate Market</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 17, maxWidth: 500, margin: '0 auto' }}>
              Every feature designed to bridge the information gap between buyers, sellers, and the market.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 24,
          }}>
            {features.map((f, i) => (
              <div key={i} style={{
                background: 'var(--surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: 32,
                transition: 'all 0.3s',
                animation: `fadeUp 0.5s ease ${i * 0.12}s both`,
                cursor: 'default',
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.background = 'var(--surface-raised)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.background = 'var(--surface)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{ fontSize: 19, fontWeight: 700, marginBottom: 12, fontFamily: 'var(--font-display)' }}>{f.title}</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, fontSize: 14 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: '80px 32px',
        background: `radial-gradient(ellipse 70% 80% at 50% 50%, rgba(201,168,76,0.07) 0%, transparent 70%)`,
        borderTop: '1px solid var(--border-subtle)',
      }}>
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16 }}>
            Ready to know your property's worth?
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 16 }}>
            Free for everyone. No sign-up required. Instant AI-generated price estimate.
          </p>
          <button onClick={() => navigate('predict')} style={{
            background: 'linear-gradient(135deg, var(--gold), #b8943e)',
            border: 'none', borderRadius: 12, color: 'var(--navy)',
            padding: '18px 48px', fontSize: 17,
            fontFamily: 'var(--font-display)', fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 4px 24px rgba(201,168,76,0.3)',
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
          >
            Start Forecasting →
          </button>
        </div>
      </section>
    </div>
  );
}
