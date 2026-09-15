import { motion } from 'framer-motion';

export default function AestheticBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-slate-50">
      {/* Subtle dot matrix grid */}
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: 'radial-gradient(#6366f1 1.2px, transparent 1.2px)',
          backgroundSize: '32px 32px'
        }}
      />

      {/* Vibrant Moving Blob 1 - Indigo/Purple */}
      <motion.div
        animate={{
          x: [0, 90, -50, 0],
          y: [0, -80, 50, 0],
          scale: [1, 1.25, 0.9, 1],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute -top-20 -left-20 w-[34rem] h-[34rem] bg-gradient-to-tr from-indigo-500/30 via-purple-500/25 to-pink-500/20 rounded-full blur-[90px]"
      />

      {/* Vibrant Moving Blob 2 - Cyan/Sky */}
      <motion.div
        animate={{
          x: [0, -100, 60, 0],
          y: [0, 90, -60, 0],
          scale: [1, 1.3, 0.85, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-1/3 -right-20 w-[36rem] h-[36rem] bg-gradient-to-bl from-cyan-400/30 via-sky-400/25 to-indigo-400/20 rounded-full blur-[100px]"
      />

      {/* Vibrant Moving Blob 3 - Rose/Fuchsia */}
      <motion.div
        animate={{
          x: [0, 70, -80, 0],
          y: [0, -50, 40, 0],
          scale: [0.9, 1.2, 1, 0.9],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute -bottom-24 left-1/4 w-[38rem] h-[38rem] bg-gradient-to-t from-pink-500/25 via-rose-400/20 to-purple-400/15 rounded-full blur-[110px]"
      />
    </div>
  );
}