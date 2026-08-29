import React from 'react';
const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = { default: 'bg-slate-800 text-slate-300 border-slate-700', success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]', warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20', danger: 'bg-red-500/10 text-red-400 border-red-500/20', info: 'bg-blue-500/10 text-blue-400 border-blue-500/20', purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20' };
  return (<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variants[variant]} ${className}`}>{children}</span>);
};
export default Badge;
