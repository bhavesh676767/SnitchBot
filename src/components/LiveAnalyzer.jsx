import React, { useEffect, useState } from 'react';
import { useQueue } from '../context/QueueContext';
import { ShieldAlert, Activity, CheckCircle, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LiveAnalyzer = () => {
  const { activeRepo, completeAnalysis, startAnalysis, queue } = useQueue();
  const [progress, setProgress] = useState(0);
  const [currentScore, setCurrentScore] = useState(0);

  useEffect(() => {
    // If no active repo, but there are queued items, start next
    if (!activeRepo) {
      const hasQueued = queue.some(item => item.status === 'queued');
      if (hasQueued) {
        const timer = setTimeout(() => {
          startAnalysis();
        }, 2000);
        return () => clearTimeout(timer);
      }
      return;
    }

    // Start mock analysis simulation
    setProgress(0);
    setCurrentScore(0);
    
    // Simulate progression
    const duration = 8000; // 8 seconds per repo
    const interval = 100;
    const steps = duration / interval;
    let currentStep = 0;
    
    // Target score between 50 and 95
    const targetScore = Math.floor(Math.random() * (95 - 50 + 1) + 50);

    const timer = setInterval(() => {
      currentStep++;
      const currentProgress = (currentStep / steps) * 100;
      setProgress(currentProgress);
      
      // Update score somewhat logarithmically towards target
      if (currentProgress < 90) {
        const scoreVal = Math.floor(targetScore * (currentProgress / 100));
        setCurrentScore(scoreVal);
      } else {
        setCurrentScore(targetScore);
      }

      if (currentStep >= steps) {
        clearInterval(timer);
        completeAnalysis(activeRepo.id, targetScore);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [activeRepo, startAnalysis, completeAnalysis, queue]);

  if (!activeRepo) {
    return (
      <div className="fullscreen-center text-secondary">
        <ShieldAlert size={64} style={{ opacity: 0.2, marginBottom: '2rem' }} />
        <h2 style={{ fontSize: '2rem', fontWeight: 300 }}>Awaiting targets...</h2>
        <p style={{ marginTop: '1rem', opacity: 0.7 }}>Add repositories to the queue to begin real-time analysis.</p>
      </div>
    );
  }

  return (
    <div className="fullscreen-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeRepo.id}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.1, y: -20 }}
          transition={{ duration: 0.5, type: 'spring' }}
          style={{ width: '100%', maxWidth: '800px' }}
        >
          <div className="card" style={{ padding: '3rem', textAlign: 'center', background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                style={{ 
                  width: '80px', 
                  height: '80px', 
                  borderRadius: '50%', 
                  background: 'conic-gradient(var(--accent-primary) 0%, transparent 70%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '2px'
                }}
              >
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Activity size={32} className="text-accent" />
                </div>
              </motion.div>
            </div>

            <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>{activeRepo.teamName}</h1>
            <p className="text-secondary" style={{ fontSize: '1.25rem', marginBottom: '3rem', fontFamily: 'monospace' }}>
              {activeRepo.repoLink}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem', textAlign: 'left' }}>
              <div style={{ background: 'var(--bg-primary)', padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                  <Database size={18} />
                  <span style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Analysis Progress</span>
                </div>
                <div style={{ height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                  <motion.div 
                    style={{ height: '100%', background: 'var(--accent-primary)' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: "linear", duration: 0.1 }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.875rem' }}>
                  <span className="text-secondary">Scanning heuristics...</span>
                  <span style={{ fontWeight: 600 }}>{Math.round(progress)}%</span>
                </div>
              </div>

              <div style={{ background: 'var(--bg-primary)', padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                  <ShieldAlert size={18} />
                  <span style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Threat Score</span>
                </div>
                <div style={{ fontSize: '3rem', fontWeight: 700, color: currentScore > 80 ? 'var(--danger-color)' : currentScore > 60 ? '#f59e0b' : 'var(--success-color)', lineHeight: 1 }}>
                  {currentScore}<span style={{ fontSize: '1.5rem', color: 'var(--text-secondary)', marginLeft: '4px' }}>/ 100</span>
                </div>
              </div>
            </div>

            <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--accent-primary)', fontWeight: 500 }} className="animate-pulse">
              <Activity size={18} /> Running active detection layers...
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default LiveAnalyzer;
