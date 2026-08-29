import React from 'react';
const Card = ({ children, className = '', hoverEffect = true, ...props }) => {
  return (
    <div className={`relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md shadow-lg transition-all duration-300 ${hoverEffect ? 'hover:border-emerald-500/30 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] hover:-translate-y-1' : ''} ${className}`} {...props}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      <div className="relative z-10 p-6">{children}</div>
    </div>
  );
};
export default Card;
