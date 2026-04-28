import React, { useState, useEffect } from 'react';
import { useQueue } from '../context/QueueContext';
import Preloader from '../components/Preloader';
import QueueList from '../components/QueueList';
import { Plus, GitBranch } from 'lucide-react';
import { motion } from 'framer-motion';

const Admin = () => {
  const [loading, setLoading] = useState(true);
  const { addToQueue } = useQueue();
  
  const [repoLink, setRepoLink] = useState('');
  const [teamName, setTeamName] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (repoLink && teamName) {
      addToQueue({ repoLink, teamName });
      setRepoLink('');
      setTeamName('');
    }
  };

  if (loading) {
    return <Preloader />;
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="admin-layout"
    >
      {/* Form Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="card-elevated"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
          <div style={{ background: 'var(--accent-primary)', padding: '0.75rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GitBranch color="white" size={20} />
          </div>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Admin Control Panel</h1>
        </div>
        
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.75rem', fontSize: '0.9375rem' }}>
          Add new repositories to the analysis queue
        </p>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label style={{ display: 'block', marginBottom: '0.625rem', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
              Team Name
            </label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="e.g. ByteMe"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.625rem', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
              GitHub Repository Link
            </label>
            <input 
              type="url" 
              className="input-field" 
              placeholder="https://github.com/user/repo"
              value={repoLink}
              onChange={(e) => setRepoLink(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="btn btn-primary flex items-center justify-center gap-2" style={{ marginTop: '0.75rem' }}>
            <Plus size={18} />
            Add to Queue
          </button>
        </form>
      </motion.div>

      {/* Queue Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="card-elevated"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
          <div style={{ background: 'var(--accent-secondary)', padding: '0.75rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'white', opacity: 0.3 }} />
          </div>
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Current Queue</h2>
        </div>
        <div style={{ minHeight: '300px' }}>
          <QueueList />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Admin;
