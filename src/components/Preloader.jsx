import React from 'react';
import { motion } from 'framer-motion';

const Preloader = () => {
  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="preloader-overlay"
    >
      <div className="flex flex-col items-center gap-6">
        <div className="preloader-spinner" />
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}
        >
          Initializing...
        </motion.p>
      </div>
    </motion.div>
  );
};

export default Preloader;
