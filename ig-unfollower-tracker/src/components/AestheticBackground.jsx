import React from 'react';
import { motion } from 'framer-motion';

export default function AestheticBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-[#fafafa]">
      {/* Geometric Ambient Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.45]"
        style={{
          backgroundImage: `radial-gradient(rgba(100, 116, 139, 0.18) 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Moving Ambient Blob 1 */}
      <motion.div
        animate={{
          x: [0, 80, -40, 0],
          y: [0, -60, 40, 0],
          scale: [1, 1.15, 0.95, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-tr from-indigo-200/50 via-purple-200/40 to-pink-100/30 rounded-full blur-3xl"
      />

      {/* Moving Ambient Blob 2 */}
      <motion.div
        animate={{
          x: [0, -90, 50, 0],
          y: [0, 70, -50, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-1/2 -right-32 w-[28rem] h-[28rem] bg-gradient-to-bl from-sky-200/50 via-teal-100/40 to-indigo-100/30 rounded-full blur-3xl"
      />

      {/* Moving Ambient Blob 3 */}
      <motion.div
        animate={{
          x: [0, 40, -60, 0],
          y: [0, -40, 30, 0],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute -bottom-40 left-1/3 w-[32rem] h-[32rem] bg-gradient-to-t from-rose-100/40 via-purple-100/30 to-transparent rounded-full blur-3xl"
      />
    </div>
  );
}