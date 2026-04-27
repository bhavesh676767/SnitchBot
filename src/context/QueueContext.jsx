import React, { createContext, useState, useContext, useCallback } from 'react';

const QueueContext = createContext();

export const useQueue = () => {
  const context = useContext(QueueContext);
  if (!context) {
    throw new Error('useQueue must be used within a QueueProvider');
  }
  return context;
};

export const QueueProvider = ({ children }) => {
  const [queue, setQueue] = useState([]);
  const [activeRepo, setActiveRepo] = useState(null);

  const addToQueue = useCallback((repo) => {
    const newRepo = {
      ...repo,
      id: Date.now().toString() + Math.random().toString(36).substring(7),
      status: 'queued',
      score: 0,
    };
    setQueue((prev) => [...prev, newRepo]);
  }, []);

  const removeFromQueue = useCallback((id) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const startAnalysis = useCallback(() => {
    setQueue((prevQueue) => {
      const nextRepo = prevQueue.find((item) => item.status === 'queued');
      if (nextRepo) {
        setActiveRepo({ ...nextRepo, status: 'analyzing' });
        return prevQueue.map((item) =>
          item.id === nextRepo.id ? { ...item, status: 'analyzing' } : item
        );
      }
      return prevQueue;
    });
  }, []);

  const completeAnalysis = useCallback((id, finalScore) => {
    setQueue((prevQueue) =>
      prevQueue.map((item) =>
        item.id === id ? { ...item, status: 'completed', score: finalScore } : item
      )
    );
    setActiveRepo(null);
  }, []);

  const value = {
    queue,
    activeRepo,
    addToQueue,
    removeFromQueue,
    startAnalysis,
    completeAnalysis,
    setActiveRepo,
  };

  return (
    <QueueContext.Provider value={value}>
      {children}
    </QueueContext.Provider>
  );
};
