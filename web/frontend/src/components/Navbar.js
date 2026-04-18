import React, { useState, useEffect } from 'react';

const links = [
  { id: 'home', label: 'Home' },
  { id: 'predict', label: 'Forecast' },
];

export default function Navbar({ current, navigate }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: scrolled ? 'rgba(10,22,40,0.97)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--border-subtle)' : '1px solid transparent',
      transition: 'all 0.3s ease',
      padding: '0 32px',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 64,
      }}>
        {/* Logo */}
        <button onClick={() => navigate('home')} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'linear-gradient(135deg, var(--gold), var(--teal))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16,
            color: 'var(--navy)',
          }}>P</div>
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18,
            color: 'var(--text-primary)',
          }}>
            Prop<span style={{ color: 'var(--gold)' }}>Forecast</span>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}> PH</span>
          </span>
        </button>

        {/* Desktop links */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {links.map(l => (
            <button key={l.id} onClick={() => navigate(l.id)} style={{
              background: current === l.id ? 'var(--gold-dim)' : 'transparent',
              border: current === l.id ? '1px solid var(--border)' : '1px solid transparent',
              borderRadius: 8,
              color: current === l.id ? 'var(--gold)' : 'var(--text-secondary)',
              padding: '7px 18px',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              fontWeight: current === l.id ? 500 : 400,
              fontSize: 14,
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { if (current !== l.id) e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { if (current !== l.id) e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              {l.label}
            </button>
          ))}
          <button onClick={() => navigate('predict')} style={{
            marginLeft: 8,
            background: 'linear-gradient(135deg, var(--gold), #b8943e)',
            border: 'none', borderRadius: 8,
            color: 'var(--navy)', padding: '8px 20px',
            cursor: 'pointer', fontFamily: 'var(--font-display)',
            fontWeight: 700, fontSize: 14,
            transition: 'opacity 0.2s',
            animation: 'pulse-gold 3s infinite',
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            Get Estimate →
          </button>
        </div>
      </div>
    </nav>
  );
}
