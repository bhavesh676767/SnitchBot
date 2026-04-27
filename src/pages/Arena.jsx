import React, { useState, useEffect } from 'react';
import Preloader from '../components/Preloader';
import LiveAnalyzer from '../components/LiveAnalyzer';
import QueueList from '../components/QueueList';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

const Arena = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading to establish vibe
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <Preloader />;
  }

  return (
    <div className="arena-layout">
      {/* Top Header */}
      <header style={{ 
        padding: '1.5rem 2rem', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.5)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'var(--accent-primary)', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
            <Activity color="white" size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', margin: 0, letterSpacing: '-0.02em' }}>SNITCHBOT</h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
              Live Heuristic Detection
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="flex items-center gap-2 text-success" style={{ color: 'var(--success-color)' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'currentColor' }} className="animate-pulse" />
            <span style={{ fontSize: '0.875rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>System Online</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* Left Side: Live Analyzer */}
        <div style={{ flex: 1, display: 'flex', position: 'relative' }}>
          <LiveAnalyzer />
        </div>

        {/* Right Side: Queue Strip */}
        <div style={{ 
          width: '350px', 
          background: 'var(--bg-card)', 
          borderLeft: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-4px 0 15px rgba(0,0,0,0.02)'
        }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
            <h3 style={{ margin: 0, fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Execution Queue
            </h3>
          </div>
          <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
            <QueueList readonly={true} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default Arena;
