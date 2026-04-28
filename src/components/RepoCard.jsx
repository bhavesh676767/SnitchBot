import React from 'react';
import { useQueue } from '../context/QueueContext';
import { Trash2, FolderGit2, Activity, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const RepoCard = ({ item, readonly }) => {
  const { removeFromQueue } = useQueue();

  const getStatusIcon = () => {
    switch(item.status) {
      case 'analyzing': return <Activity size={18} className="text-accent animate-pulse" style={{ color: 'var(--accent-primary)' }} />;
      case 'completed': return <CheckCircle size={18} style={{ color: 'var(--success-color)' }} />;
      default: return <FolderGit2 size={18} style={{ color: 'var(--text-secondary)' }} />;
    }
  };

  const getStatusBadge = () => {
    const baseStyle = {
      padding: '0.35rem 0.75rem',
      borderRadius: 'var(--radius-md)',
      fontSize: '0.75rem',
      fontWeight: 600,
      textTransform: 'capitalize',
      letterSpacing: '0.01em'
    };

    switch(item.status) {
      case 'analyzing':
        return <span style={{ ...baseStyle, backgroundColor: 'rgba(79, 70, 229, 0.15)', color: 'var(--accent-primary)' }}>Analyzing</span>;
      case 'completed':
        return <span style={{ ...baseStyle, backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--success-color)' }}>Done ({item.score}%)</span>;
      default:
        return <span style={{ ...baseStyle, backgroundColor: 'rgba(100, 116, 139, 0.1)', color: 'var(--text-secondary)' }}>Queued</span>;
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ duration: 0.2 }}
      className="card"
      style={{ 
        padding: '1rem', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        borderLeft: item.status === 'analyzing' ? '3px solid var(--accent-primary)' : 'none',
        background: item.status === 'analyzing' ? 'var(--bg-secondary)' : 'var(--bg-card)'
      }}
    >
      <div className="flex items-center gap-3 flex-1" style={{ overflow: 'hidden', minWidth: 0 }}>
        <div style={{ padding: '0.5rem', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {getStatusIcon()}
        </div>
        
        <div style={{ overflow: 'hidden', minWidth: 0 }}>
          <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>{item.teamName}</h4>
          <a 
            href={item.repoLink} 
            target="_blank" 
            rel="noreferrer"
            style={{ fontSize: '0.8125rem', textDecoration: 'none', color: 'var(--text-tertiary)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            {item.repoLink.replace('https://github.com/', '')}
          </a>
        </div>
      </div>

      <div className="flex items-center gap-3" style={{ flexShrink: 0 }}>
        {getStatusBadge()}
        
        {!readonly && item.status === 'queued' && (
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => removeFromQueue(item.id)}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              cursor: 'pointer',
              padding: '0.4rem',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            title="Remove from queue"
          >
            <Trash2 size={16} style={{ color: 'var(--danger-color)', opacity: 0.6, transition: 'all 0.2s ease' }} 
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
            />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default RepoCard;
