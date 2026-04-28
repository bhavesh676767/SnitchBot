import React, { useState, useEffect } from 'react';
import Preloader from '../components/Preloader';
import LiveAnalyzer from '../components/LiveAnalyzer';
import QueueList from '../components/QueueList';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

const Arena = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
      {/* Arena Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ 
          padding: '1.5rem 2rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          background: 'var(--bg-card)',
          borderBottom: '1px solid var(--border-color)',
          marginTop: '0'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', padding: '0.5rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap color="white" size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.125rem', margin: 0, letterSpacing: '-0.02em', fontWeight: 700 }}>Live Analysis</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
              Real-time Heuristic Detection
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="status-badge online">
            <div className="status-dot online" />
            <span>System Online</span>
          </div>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', gap: '0' }}>
        
        {/* Left Side: Live Analyzer */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{ flex: 1, display: 'flex', position: 'relative' }}
        >
          <LiveAnalyzer />
        </motion.div>

        {/* Right Side: Queue Strip */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{ 
            width: '380px', 
            background: 'var(--bg-card)', 
            borderLeft: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '-4px 0 15px rgba(0,0,0,0.05)'
          }}
        >
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)' }} />
              Execution Queue
            </h3>
          </div>
          <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
            <QueueList readonly={true} />
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Arena;
