import React, { useState } from 'react';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import PredictPage from './pages/PredictPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AboutPage from './pages/AboutPage';

export default function App() {
  const [page, setPage] = useState('home');

  const navigate = (p) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar current={page} navigate={navigate} />
      <main style={{ flex: 1 }}>
        {page === 'home' && <HomePage navigate={navigate} />}
        {page === 'predict' && <PredictPage />}
        {page === 'analytics' && <AnalyticsPage />}
        {page === 'about' && <AboutPage />}
      </main>
      <footer style={{
        textAlign: 'center',
        padding: '24px',
        borderTop: '1px solid var(--border-subtle)',
        color: 'var(--text-muted)',
        fontSize: '13px',
        fontFamily: 'var(--font-body)'
      }}>
        © 2026 PropForecast PH · Technological Institute of the Philippines · Team 3 Capstone Project
        <br />
        <span style={{ fontSize: '11px', marginTop: 4, display: 'block' }}>
          Price estimates are model-generated and should not replace professional appraisal services.
        </span>
      </footer>
    </div>
  );
}
