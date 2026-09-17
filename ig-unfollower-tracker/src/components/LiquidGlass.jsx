import { motion } from 'framer-motion';

/**
 * LiquidGlass Component
 * Inspired by Suraj Gaud (@suraj-xd) on 21st.dev
 * Implements modern fluid glassmorphism with specular light reflection,
 * deep backdrop-blur refraction, and dark aesthetic border lighting.
 */
export default function LiquidGlass({
  children,
  className = '',
  hoverEffect = true,
  onClick,
  ...props
}) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={hoverEffect ? { y: -2, transition: { duration: 0.2 } } : undefined}
      className={`relative overflow-hidden rounded-3xl transition-all duration-300 backdrop-blur-2xl bg-zinc-950/65 border border-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.12),0_20px_50px_rgba(0,0,0,0.6)] hover:border-white/[0.18] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.22),0_25px_60px_rgba(0,0,0,0.75)] ${className}`}
      {...props}
    >
      {/* Specular Liquid Light Shimmer along top edge */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[1px] opacity-75"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%)'
        }}
      />

      {/* Fluid ambient tint reflection */}
      <div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'radial-gradient(600px circle at 50% 50%, rgba(225,48,108,0.06), transparent 40%)'
        }}
      />

      {children}
    </motion.div>
  );
}
