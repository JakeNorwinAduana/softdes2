import React, { useState } from 'react';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import PredictPage from './pages/PredictPage';

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
      </main>
    </div>
  );
}