import React from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Preloader = () => {
  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="preloader-overlay"
    >
      <div className="flex flex-col items-center gap-4">
        <Loader2 size={48} className="text-accent animate-spin" />
        <p className="text-secondary" style={{ fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.875rem' }}>
          Loading...
        </p>
      </div>
    </motion.div>
  );
};

export default Preloader;
