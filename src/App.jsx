import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { QueueProvider } from './context/QueueContext';
import Admin from './pages/Admin';
import Arena from './pages/Arena';
import DarkModeToggle from './components/DarkModeToggle';
import './index.css';

function App() {
  return (
    <QueueProvider>
      <Router>
        <>
          {/* Global Header */}
          <header className="app-header">
            <div className="app-header-content">
              <Link to="/" className="app-logo">
                <img src="/SnitchBot_logo.png" alt="SnitchBot Logo" />
                <span className="app-logo-text">SnitchBot</span>
              </Link>
              <DarkModeToggle />
            </div>
          </header>

          <Routes>
            <Route path="/admin" element={<Admin />} />
            <Route path="/arena" element={<Arena />} />
            {/* Landing Page */}
            <Route path="/" element={
              <div className="landing-container">
                <div className="landing-hero">
                  <h1>SNITCHBOT</h1>
                  <p style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>
                    Intelligent GitHub Repository Analyzer for Hackathons
                  </p>
                </div>
                <div className="landing-buttons">
                  <Link to="/admin" className="btn btn-primary">
                    Admin Panel
                  </Link>
                  <Link to="/arena" className="btn btn-secondary">
                    Live Arena
                  </Link>
                </div>
              </div>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </>
      </Router>
    </QueueProvider>
  );
}

export default App;
