import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { QueueProvider } from './context/QueueContext';
import Admin from './pages/Admin';
import Arena from './pages/Arena';
import './index.css';

function App() {
  return (
    <QueueProvider>
      <Router>
        <Routes>
          <Route path="/admin" element={<Admin />} />
          <Route path="/arena" element={<Arena />} />
          {/* Simple landing/redirect to Admin */}
          <Route path="/" element={
            <div className="fullscreen-center text-center">
              <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>SNITCHBOT</h1>
              <p className="text-secondary" style={{ marginBottom: '2rem' }}>Hackathon GitHub Repository Analyzer</p>
              <div className="flex gap-4">
                <Link to="/admin" className="btn btn-primary" style={{ textDecoration: 'none' }}>Admin Panel</Link>
                <Link to="/arena" className="btn" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', textDecoration: 'none' }}>Live Arena</Link>
              </div>
            </div>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </QueueProvider>
  );
}

export default App;
