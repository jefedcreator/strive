'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/primitives/Button';
import React from 'react';

const Icon: React.FC<{ name: string; className?: string }> = ({ name, className = '' }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center -mt-16">
      <motion.div 
        className="relative z-10 flex flex-col items-center text-center max-w-md px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <motion.div
          initial={{ scale: 0.8, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 200,
            damping: 10,
            delay: 0.1 
          }}
          className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-8 shadow-inner"
        >
          <Icon name="explore_off" className="text-5xl text-gray-400 dark:text-gray-500" />
        </motion.div>

        <h1 className="text-8xl font-black tracking-tighter text-gray-900 dark:text-white mb-4">
          404
        </h1>
        
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">
          Lost in the wilderness
        </h2>
        
        <p className="text-gray-500 dark:text-gray-400 mb-10 text-lg leading-relaxed">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        <Button 
          size="lg" 
          onClick={() => router.push('/home')}
          className="group shadow-lg hover:shadow-xl transition-all w-full sm:w-auto overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-white/20 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
          <Icon name="home" className="mr-2 text-lg group-hover:scale-110 transition-transform relative z-10" />
          <span className="relative z-10">Go Home</span>
        </Button>
      </motion.div>
    </div>
  );
}
