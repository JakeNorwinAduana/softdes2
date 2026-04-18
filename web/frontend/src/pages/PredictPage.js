import React, { useState } from 'react';
import axios from 'axios';

function formatPHP(num) {
  if (num >= 1_000_000) return `₱${(num / 1_000_000).toFixed(2)}M`;
  return `₱${num.toLocaleString()}`;
}

export default function PredictPage() {
  const [form, setForm] = useState({
    floor_area: '', land_area: '', bedrooms: '', bathrooms: ''
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const handleSubmit = async () => {
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await axios.post('/api/predict', {
        floor_area: Number(form.floor_area),
        land_area:  form.land_area ? Number(form.land_area) : null,
        bedrooms:   Number(form.bedrooms),
        bathrooms:  Number(form.bathrooms),
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Server error');
    } finally {
      setLoading(false);
    }
  };

  const field = (label, key, placeholder, required = true) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label} {required && <span style={{ color: 'var(--gold)' }}>*</span>}
      </label>
      <input
        type="number" placeholder={placeholder} value={form[key]}
        onChange={e => update(key, e.target.value)}
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 10, color: 'var(--text-primary)',
          padding: '12px 16px', fontSize: 15, outline: 'none', width: '100%',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--gold)'}
        onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'}
      />
    </div>
  );

  return (
    <div style={{ maxWidth: 600, margin: '60px auto', padding: '0 24px' }}>
      <h1 style={{ fontSize: 40, fontWeight: 800, marginBottom: 8 }}>
        Price <span style={{ color: 'var(--gold)' }}>Estimator</span>
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 36 }}>
        Enter your property details to get an AI-generated price estimate.
      </p>

      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border-subtle)',
        borderRadius: 20, padding: 32, display: 'flex', flexDirection: 'column', gap: 20
      }}>
        {field('Floor Area (sqm)', 'floor_area', 'e.g. 75')}
        {field('Land Area (sqm)', 'land_area', 'Optional', false)}
        {field('Bedrooms', 'bedrooms', 'e.g. 3')}
        {field('Bathrooms', 'bathrooms', 'e.g. 2')}

        <button onClick={handleSubmit} disabled={loading} style={{
          background: 'linear-gradient(135deg, var(--gold), #b8943e)',
          border: 'none', borderRadius: 10, color: 'var(--navy)',
          padding: '14px', fontSize: 16, fontWeight: 700,
          fontFamily: 'var(--font-display)', cursor: 'pointer', marginTop: 8,
        }}>
          {loading ? 'Analyzing...' : '🔍 Generate Forecast'}
        </button>

        {error && (
          <div style={{ color: 'var(--error)', fontSize: 14, padding: '12px 16px', background: 'rgba(255,107,107,0.08)', borderRadius: 8 }}>
            ⚠ {error}
          </div>
        )}

        {result && (
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 24, textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>ESTIMATED MARKET PRICE</div>
            <div style={{ fontSize: 48, fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--gold)' }}>
              {formatPHP(result.predicted_price)}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 6 }}>
              Range: {formatPHP(result.price_low)} – {formatPHP(result.price_high)}
            </div>
          </div>
        )}
      </div>

      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 16, textAlign: 'center' }}>
        Estimates are for reference only and should not replace professional appraisal.
      </p>
    </div>
  );
}