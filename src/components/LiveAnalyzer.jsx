import React, { useEffect, useState } from 'react';
import { useQueue } from '../context/QueueContext';
import { ShieldAlert, Activity, Zap, TrendingUp } from 'lucide-react';
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
      <div className="fullscreen-center" style={{ textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <ShieldAlert size={64} style={{ opacity: 0.2, marginBottom: '2rem', color: 'var(--text-secondary)' }} />
          <h2 style={{ fontSize: '1.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>Awaiting targets...</h2>
          <p style={{ marginTop: '1rem', opacity: 0.7, color: 'var(--text-secondary)', maxWidth: '400px', lineHeight: 1.6 }}>Add repositories to the queue to begin real-time analysis and threat detection.</p>
        </motion.div>
      </div>
    );
  }

  const getScoreColor = () => {
    if (currentScore > 80) return 'var(--danger-color)';
    if (currentScore > 60) return 'var(--warning-color)';
    return 'var(--success-color)';
  };

  return (
    <div className="fullscreen-center" style={{ padding: '2rem' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeRepo.id}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.1, y: -20 }}
          transition={{ duration: 0.5, type: 'spring' }}
          style={{ width: '100%', maxWidth: '900px' }}
        >
          <div className="card-elevated" style={{ padding: '2.5rem', textAlign: 'center' }}>
            {/* Animated Spinner */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                style={{ 
                  width: '100px', 
                  height: '100px', 
                  borderRadius: '50%', 
                  background: 'conic-gradient(var(--accent-primary) 0%, var(--accent-secondary) 50%, transparent 70%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '2px',
                  boxShadow: '0 0 30px rgba(79, 70, 229, 0.2)'
                }}
              >
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Zap size={40} style={{ color: 'var(--accent-primary)' }} />
                </div>
              </motion.div>
            </div>

            {/* Repository Info */}
            <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>{activeRepo.teamName}</h1>
            <p style={{ fontSize: '1rem', marginBottom: '2.5rem', fontFamily: 'monospace', color: 'var(--text-secondary)', wordBreak: 'break-all' }}>
              {activeRepo.repoLink}
            </p>

            {/* Analysis Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem', textAlign: 'left' }}>
              {/* Progress Section */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{ background: 'var(--bg-secondary)', padding: '1.75rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', color: 'var(--text-secondary)' }}>
                  <Activity size={18} />
                  <span style={{ fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Analysis Progress</span>
                </div>
                <div style={{ height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.75rem' }}>
                  <motion.div 
                    style={{ height: '100%', background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))', borderRadius: '4px' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: "linear", duration: 0.1 }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Scanning heuristics...</span>
                  <span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{Math.round(progress)}%</span>
                </div>
              </motion.div>

              {/* Threat Score Section */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                style={{ background: 'var(--bg-secondary)', padding: '1.75rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', color: 'var(--text-secondary)' }}>
                  <TrendingUp size={18} />
                  <span style={{ fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Threat Score</span>
                </div>
                <div style={{ fontSize: '3.5rem', fontWeight: 700, color: getScoreColor(), lineHeight: 1, marginBottom: '0.5rem' }}>
                  {currentScore}<span style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginLeft: '6px' }}>/ 100</span>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', margin: 0 }}>
                  {currentScore > 80 ? 'Critical' : currentScore > 60 ? 'High' : 'Moderate'} threat level
                </p>
              </motion.div>
            </div>

            {/* Status Message */}
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600, margin: 0 }}
            >
              <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }}>
                <Activity size={18} />
              </motion.div>
              Running active detection layers...
            </motion.p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default LiveAnalyzer;
