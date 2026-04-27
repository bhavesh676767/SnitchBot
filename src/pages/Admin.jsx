import React, { useState, useEffect } from 'react';
import { useQueue } from '../context/QueueContext';
import Preloader from '../components/Preloader';
import QueueList from '../components/QueueList';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const Admin = () => {
  const [loading, setLoading] = useState(true);
  const { addToQueue } = useQueue();
  
  const [repoLink, setRepoLink] = useState('');
  const [teamName, setTeamName] = useState('');

  useEffect(() => {
    // Simulate initial loading
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="admin-layout"
    >
      <div className="card" style={{ height: 'fit-content' }}>
        <h1 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Admin Control Panel</h1>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }} className="text-secondary">
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
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }} className="text-secondary">
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
          
          <button type="submit" className="btn btn-primary flex items-center justify-center gap-2" style={{ marginTop: '1rem' }}>
            <Plus size={18} />
            Add to Queue
          </button>
        </form>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Current Queue</h2>
        <QueueList />
      </div>
    </motion.div>
  );
};

export default Admin;
