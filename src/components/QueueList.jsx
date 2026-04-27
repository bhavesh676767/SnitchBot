import React from 'react';
import { useQueue } from '../context/QueueContext';
import RepoCard from './RepoCard';
import { AnimatePresence } from 'framer-motion';

const QueueList = ({ readonly = false }) => {
  const { queue } = useQueue();

  if (queue.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 0' }} className="text-secondary">
        <p>No repositories in queue.</p>
        {!readonly && <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Add one using the form.</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <AnimatePresence>
        {queue.map((item) => (
          <RepoCard key={item.id} item={item} readonly={readonly} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default QueueList;
