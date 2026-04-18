import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import axios from 'axios';

const COLORS = ['#c9a84c', '#2ec4b6', '#a78bfa', '#f97316', '#ec4899', '#22d3ee', '#a3e635', '#fb923c'];

const formatM = (val) => `₱${(val / 1_000_000).toFixed(1)}M`;

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--navy-mid)', border: '1px solid var(--border)',
      borderRadius: 10, padding: '10px 16px', fontSize: 13,
    }}>
      <div style={{ fontWeight: 600, marginBottom: 4, fontFamily: 'var(--font-display)' }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' && p.value > 10000 ? formatM(p.value) : p.value}
        </div>
      ))}
    </div>
  );
};

function StatCard({ label, value, sub, color }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius)', padding: '24px 28px',
      borderLeft: `3px solid ${color || 'var(--gold)'}`,
    }}>
      <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 28, fontFamily: 'var(--font-display)', fontWeight: 800, color: color || 'var(--gold)' }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('/api/analytics')
      .then(r => setData(r.data))
      .catch(() => setError('Could not load analytics. Is the Flask backend running?'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '120px 24px', color: 'var(--text-muted)' }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>📊</div>
      <p>Loading market data...</p>
    </div>
  );

  if (error) return (
    <div style={{ textAlign: 'center', padding: '120px 24px', color: 'var(--error)' }}>
      <p>⚠ {error}</p>
    </div>
  );

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 48, animation: 'fadeUp 0.5s ease' }}>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, marginBottom: 12 }}>
          Market <span style={{ color: 'var(--teal)' }}>Analytics</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>
          Insights from {data.total_listings.toLocaleString()} Philippine residential property listings (2024 dataset).
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 20, marginBottom: 48, animation: 'fadeUp 0.5s ease 0.1s both',
      }}>
        <StatCard label="Total Listings" value={data.total_listings.toLocaleString()} sub="Usable records after cleaning" color="var(--gold)" />
        <StatCard label="Model MAPE" value={`${data.model_mape}%`} sub="Mean Absolute % Error" color="var(--teal)" />
        <StatCard label="Model CV" value={`${data.model_cv}%`} sub="Cross-validation stability" color="#a78bfa" />
        <StatCard label="Model Size" value={`${data.model_size_kb} KB`} sub="Gradient Boosting (deployed)" color="#f97316" />
      </div>

      {/* Regional Average Prices */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)', padding: 32, marginBottom: 28,
        animation: 'fadeUp 0.5s ease 0.15s both',
      }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6, fontFamily: 'var(--font-display)' }}>
          Average Price by Region
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 28 }}>
          Mean residential property price across Philippine regions
        </p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data.regional_data} margin={{ top: 0, right: 0, left: 10, bottom: 20 }}>
            <XAxis dataKey="region" tick={{ fill: '#8da9c4', fontSize: 12 }} angle={-30} textAnchor="end" interval={0} />
            <YAxis tickFormatter={v => `₱${(v / 1_000_000).toFixed(1)}M`} tick={{ fill: '#8da9c4', fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="avg_price" name="Avg Price" fill="var(--gold)" radius={[6, 6, 0, 0]} />
            <Bar dataKey="median_price" name="Median Price" fill="var(--teal)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, marginBottom: 28 }}>
        {/* Price Distribution Pie */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)', padding: 32,
          animation: 'fadeUp 0.5s ease 0.2s both',
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6, fontFamily: 'var(--font-display)' }}>
            Price Distribution
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
            Property listings by price bracket
          </p>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={data.price_distribution} dataKey="count" nameKey="range"
                cx="50%" cy="50%" outerRadius={90} label={({ range, percent }) => `${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {data.price_distribution.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Legend formatter={(v) => <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{v}</span>} />
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Listings per Region */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)', padding: 32,
          animation: 'fadeUp 0.5s ease 0.25s both',
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6, fontFamily: 'var(--font-display)' }}>
            Listings per Region
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
            Dataset coverage across regions
          </p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.regional_data} layout="vertical" margin={{ left: 60 }}>
              <XAxis type="number" tick={{ fill: '#8da9c4', fontSize: 11 }} />
              <YAxis type="category" dataKey="region" tick={{ fill: '#8da9c4', fontSize: 12 }} width={60} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="listings" name="Listings" fill="#a78bfa" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Cities Table */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)', padding: 32,
        animation: 'fadeUp 0.5s ease 0.3s both',
      }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6, fontFamily: 'var(--font-display)' }}>
          Top Cities by Average Price
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
          Highest average residential prices across Philippine cities
        </p>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              {['#', 'City', 'Avg. Price', 'Price per sqm'].map(h => (
                <th key={h} style={{
                  textAlign: 'left', padding: '10px 14px',
                  fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em',
                  color: 'var(--text-muted)', fontWeight: 600,
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.top_cities.map((city, i) => (
              <tr key={city.city} style={{
                borderBottom: '1px solid var(--border-subtle)',
                transition: 'background 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-raised)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '14px', color: 'var(--text-muted)', fontSize: 13 }}>{i + 1}</td>
                <td style={{ padding: '14px', fontWeight: 500 }}>{city.city}</td>
                <td style={{ padding: '14px', color: 'var(--gold)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                  {formatM(city.avg_price)}
                </td>
                <td style={{ padding: '14px', color: 'var(--teal)' }}>
                  ₱{city.avg_sqm_price.toLocaleString()}/sqm
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
