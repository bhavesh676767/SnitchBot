import React from 'react';
import { useQueue } from '../context/QueueContext';
import { Trash2, Github, Activity, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const RepoCard = ({ item, readonly }) => {
  const { removeFromQueue } = useQueue();

  const getStatusIcon = () => {
    switch(item.status) {
      case 'analyzing': return <Activity size={18} className="text-accent animate-pulse" />;
      case 'completed': return <CheckCircle size={18} className="text-success" style={{ color: 'var(--success-color)' }} />;
      default: return <Github size={18} className="text-secondary" />;
    }
  };

  const getStatusBadge = () => {
    const baseStyle = {
      padding: '0.25rem 0.5rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: 500,
      textTransform: 'capitalize'
    };

    switch(item.status) {
      case 'analyzing':
        return <span style={{ ...baseStyle, backgroundColor: 'rgba(79, 70, 229, 0.1)', color: 'var(--accent-primary)' }}>Analyzing</span>;
      case 'completed':
        return <span style={{ ...baseStyle, backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success-color)' }}>Done ({item.score}%)</span>;
      default:
        return <span style={{ ...baseStyle, backgroundColor: 'rgba(100, 116, 139, 0.1)', color: 'var(--text-secondary)' }}>Queued</span>;
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="card flex items-center justify-between gap-4"
      style={{ padding: '1rem', borderLeft: item.status === 'analyzing' ? '4px solid var(--accent-primary)' : '' }}
    >
      <div className="flex items-center gap-4 flex-1" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)' }}>
          {getStatusIcon()}
        </div>
        
        <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
          <h4 style={{ margin: 0, fontSize: '1rem' }}>{item.teamName}</h4>
          <a 
            href={item.repoLink} 
            target="_blank" 
            rel="noreferrer"
            className="text-secondary"
            style={{ fontSize: '0.875rem', textDecoration: 'none' }}
          >
            {item.repoLink.replace('https://github.com/', '')}
          </a>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {getStatusBadge()}
        
        {!readonly && item.status === 'queued' && (
          <button 
            onClick={() => removeFromQueue(item.id)}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: 'var(--radius-md)',
              display: 'flex'
            }}
            className="text-secondary"
            title="Remove from queue"
          >
            <Trash2 size={18} className="text-danger" style={{ opacity: 0.7, transition: 'opacity 0.2s' }} 
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
            />
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default RepoCard;
