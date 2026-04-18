import React from 'react';

const models = [
  {
    name: 'Linear Regression',
    tag: 'Design 1',
    tagColor: '#ef4444',
    mape: '60.55%',
    cv: '6.40%',
    time: '0.04s',
    size: '12.31 KB',
    robustness: '105.31%',
    score: '4.375',
    verdict: 'Disqualified — high MAPE and catastrophic robustness failure under noise.',
    selected: false,
  },
  {
    name: 'Random Forest',
    tag: 'Design 2',
    tagColor: '#f97316',
    mape: '12.09%',
    cv: '1.86%',
    time: '0.25s',
    size: '11,553.85 KB',
    robustness: '10.60%',
    score: '7.164',
    verdict: 'Good accuracy but impractical model size (11MB) for web deployment.',
    selected: false,
  },
  {
    name: 'Gradient Boosting',
    tag: 'Design 3 ✓ Selected',
    tagColor: '#2ec4b6',
    mape: '29.84%',
    cv: '2.09%',
    time: '0.35s',
    size: '143.92 KB',
    robustness: '7.21%',
    score: '7.256',
    verdict: 'Best overall balance — top robustness, strong stability, lightweight for deployment.',
    selected: true,
  },
];

const team = [
  { name: 'Aduana, Jake Norwin V.', role: 'ML Engineer & Full-Stack Dev' },
  { name: 'Amo, Ralph Christian', role: 'Data Processing & Backend' },
  { name: 'Estabillo, Andrei Migui', role: 'Frontend & UI Design' },
  { name: 'Gaspar, Aaron Rowen', role: 'Model Evaluation & Analytics' },
];

const standards = [
  { code: 'ISO/IEC 27001', desc: 'Information Security Management' },
  { code: 'ISO/IEC 12207', desc: 'Software Life Cycle Processes' },
  { code: 'GDPR / RA 10173', desc: 'Data Privacy Compliance' },
  { code: 'IEEE 829', desc: 'Software Test Documentation' },
];

export default function AboutPage() {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 24px' }}>
      <div style={{ marginBottom: 56, animation: 'fadeUp 0.5s ease' }}>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, marginBottom: 12 }}>
          About <span style={{ color: 'var(--gold)' }}>PropForecast PH</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16, maxWidth: 620, lineHeight: 1.7 }}>
          A machine learning-based housing price forecasting tool for Philippine residential properties, developed as a Major Capstone Design Experience at the Technological Institute of the Philippines – Quezon City (April 2026).
        </p>
      </div>

      {/* Model comparison */}
      <section style={{ marginBottom: 56 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, fontFamily: 'var(--font-display)' }}>Design Tradeoff Analysis</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28 }}>
          Three models were evaluated using a Pareto MCDM framework across five engineering constraints.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {models.map((m, i) => (
            <div key={m.name} style={{
              background: m.selected ? 'linear-gradient(135deg, rgba(46,196,182,0.08), rgba(201,168,76,0.05))' : 'var(--surface)',
              border: `1px solid ${m.selected ? 'var(--border)' : 'var(--border-subtle)'}`,
              borderRadius: 'var(--radius-lg)', padding: 28,
              animation: `fadeUp 0.5s ease ${i * 0.1}s both`,
              position: 'relative',
            }}>
              {m.selected && (
                <div style={{
                  position: 'absolute', top: 16, right: 16,
                  background: 'var(--teal)', color: 'var(--navy)',
                  fontSize: 10, fontWeight: 700, padding: '3px 10px',
                  borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.08em',
                }}>Deployed</div>
              )}
              <div style={{ fontSize: 11, color: m.tagColor, fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{m.tag}</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20, fontFamily: 'var(--font-display)' }}>{m.name}</h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                {[
                  ['MAPE', m.mape],
                  ['CV', m.cv],
                  ['Training Time', m.time],
                  ['Model Size', m.size],
                  ['Robustness', m.robustness],
                  ['MCDM Score', m.score],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{k}</div>
                    <div style={{ fontSize: 15, fontFamily: 'var(--font-display)', fontWeight: 700, color: k === 'MCDM Score' ? 'var(--gold)' : 'var(--text-primary)' }}>{v}</div>
                  </div>
                ))}
              </div>

              <div style={{
                padding: '10px 14px',
                background: m.selected ? 'rgba(46,196,182,0.08)' : 'rgba(255,255,255,0.03)',
                borderRadius: 8, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6,
                borderLeft: `3px solid ${m.tagColor}`,
              }}>
                {m.verdict}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sensitivity analysis note */}
      <section style={{
        background: 'var(--surface)', border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)', padding: 28, marginBottom: 48,
        animation: 'fadeUp 0.5s ease 0.3s both',
      }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, fontFamily: 'var(--font-display)' }}>Sensitivity Analysis</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7, maxWidth: 720 }}>
          All 120 permutations of constraint weightings (5! combinations) were tested. Gradient Boosting won 100% of combinations
          with an average score of 7.788, confirming the selection is robust and not dependent on any single weighting scheme.
          Random Forest and Linear Regression recorded 0 wins across all combinations.
        </p>
        <div style={{ display: 'flex', gap: 24, marginTop: 20 }}>
          {[
            { label: 'Gradient Boosting', wins: '120 / 120', color: 'var(--teal)' },
            { label: 'Random Forest', wins: '0 / 120', color: 'var(--text-muted)' },
            { label: 'Linear Regression', wins: '0 / 120', color: 'var(--text-muted)' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontFamily: 'var(--font-display)', fontWeight: 800, color: s.color }}>{s.wins}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, marginBottom: 48 }}>
        {/* Team */}
        <section style={{
          background: 'var(--surface)', border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)', padding: 28,
          animation: 'fadeUp 0.5s ease 0.35s both',
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, fontFamily: 'var(--font-display)' }}>Team 3</h2>
          {team.map(t => (
            <div key={t.name} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '12px 0', borderBottom: '1px solid var(--border-subtle)',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--gold), var(--teal))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 14, color: 'var(--navy)',
                flexShrink: 0,
              }}>
                {t.name[0]}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{t.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.role}</div>
              </div>
            </div>
          ))}
          <div style={{ marginTop: 16, fontSize: 12, color: 'var(--text-muted)' }}>
            Technological Institute of the Philippines – Quezon City · April 2026
          </div>
        </section>

        {/* Standards */}
        <section style={{
          background: 'var(--surface)', border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)', padding: 28,
          animation: 'fadeUp 0.5s ease 0.4s both',
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, fontFamily: 'var(--font-display)' }}>Engineering Standards</h2>
          {standards.map((s, i) => (
            <div key={s.code} style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '14px 0', borderBottom: i < standards.length - 1 ? '1px solid var(--border-subtle)' : 'none',
            }}>
              <div style={{
                background: 'var(--gold-dim)', border: '1px solid var(--border)',
                borderRadius: 8, padding: '4px 10px',
                fontSize: 11, fontWeight: 700, color: 'var(--gold)',
                fontFamily: 'var(--font-display)', whiteSpace: 'nowrap',
              }}>{s.code}</div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{s.desc}</div>
            </div>
          ))}

          <div style={{ marginTop: 24, padding: '14px 18px', background: 'rgba(255,255,255,0.03)', borderRadius: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Dataset</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Philippines Housing Market Dataset by Klekzee (Kaggle, 2024). 1,500 raw rows → 1,451 usable after cleaning.
            </div>
          </div>
        </section>
      </div>

      {/* Client */}
      <section style={{
        background: `linear-gradient(135deg, rgba(10,22,40,0.9), rgba(26,58,92,0.5))`,
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: 36,
        animation: 'fadeUp 0.5s ease 0.45s both',
      }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, fontFamily: 'var(--font-display)' }}>Project Client</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7, maxWidth: 680 }}>
          The <strong style={{ color: 'var(--text-primary)' }}>Department of Human Settlements and Urban Development (DHSUD)</strong> is the intended client agency. The system is designed to help DHSUD promote market transparency, standardize property valuation, and support equitable access to housing across the Philippines — directly addressing SDG 11 (Sustainable Cities) and SDG 10 (Reduced Inequalities).
        </p>
      </section>
    </div>
  );
}
